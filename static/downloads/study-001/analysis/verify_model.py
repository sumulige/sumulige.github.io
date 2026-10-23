#!/usr/bin/env python3
"""Enumerate this study's ordinary workflow net and two declared counterexamples."""

import argparse
from collections import defaultdict, deque
from copy import deepcopy
from datetime import datetime, timezone
import json
from pathlib import Path


def closure(starts, adjacency):
    seen = set(starts)
    pending = deque(starts)
    while pending:
        for node in adjacency.get(pending.popleft(), ()):
            if node not in seen:
                seen.add(node)
                pending.append(node)
    return seen


def validate(net):
    places = net["places"]
    names = [t["id"] for t in net["transitions"]]
    if len(set(places)) != len(places) or len(set(names)) != len(names):
        raise ValueError("Place and transition identifiers must be unique")
    if set(places) & set(names):
        raise ValueError("Place and transition identifiers must be disjoint")
    if net["start"] not in places or net["finish"] not in places:
        raise ValueError("Start and finish must name places")
    if net["start"] == net["finish"]:
        raise ValueError("This study requires distinct start and finish places")
    if len(net["invariant_weights"]) != len(places):
        raise ValueError("Invariant weight count must match place count")
    for transition in net["transitions"]:
        for side in ("inputs", "outputs"):
            members = transition[side]
            if not members or len(set(members)) != len(members):
                raise ValueError("Only nonempty, ordinary unweighted arcs are supported")
            if not set(members) <= set(places):
                raise ValueError("Every arc must refer to a declared place")


def structure(net):
    forward, reverse = defaultdict(list), defaultdict(list)
    nodes = set(net["places"])
    for t in net["transitions"]:
        nodes.add(t["id"])
        for source, target in (
            [(p, t["id"]) for p in t["inputs"]]
            + [(t["id"], p) for p in t["outputs"]]
        ):
            forward[source].append(target)
            reverse[target].append(source)
    on_paths = closure([net["start"]], forward) & closure([net["finish"]], reverse)
    result = {
        "start_has_no_incoming_arcs": not reverse[net["start"]],
        "finish_has_no_outgoing_arcs": not forward[net["finish"]],
        "nodes_outside_start_finish_paths": sorted(nodes - on_paths),
    }
    result["is_workflow_net"] = all((
        result["start_has_no_incoming_arcs"],
        result["finish_has_no_outgoing_arcs"],
        not result["nodes_outside_start_finish_paths"],
    ))
    return result


def cycle_witness(states, edges, finish):
    adjacency = defaultdict(list)
    for source, action, target in edges:
        if source != finish and target != finish:
            adjacency[source].append((target, action))
    color = {}
    for start in states:
        if color.get(start) or start == finish:
            continue
        path, actions = [start], []
        active, iterators = {start: 0}, [iter(adjacency[start])]
        color[start] = 1
        while path:
            try:
                target, action = next(iterators[-1])
            except StopIteration:
                color[path[-1]] = 2
                del active[path.pop()]
                iterators.pop()
                if actions:
                    actions.pop()
                continue
            if color.get(target) == 1:
                at = active[target]
                return {"states": path[at:] + [target], "actions": actions[at:] + [action]}
            if not color.get(target):
                color[target] = 1
                active[target] = len(path)
                path.append(target)
                actions.append(action)
                iterators.append(iter(adjacency[target]))
    return None


def analyze(net, max_states):
    validate(net)
    places = net["places"]
    index = {p: i for i, p in enumerate(places)}
    start = tuple(int(p == net["start"]) for p in places)
    finish = tuple(int(p == net["finish"]) for p in places)
    transitions = [
        (t["id"], [index[p] for p in t["inputs"]], [index[p] for p in t["outputs"]])
        for t in net["transitions"]
    ]
    parents, edges = {start: None}, []
    pending, complete = deque([start]), True
    while pending and complete:
        state = pending.popleft()
        for action, inputs, outputs in transitions:
            if any(state[i] < 1 for i in inputs):
                continue
            next_state = list(state)
            for i in inputs:
                next_state[i] -= 1
            for i in outputs:
                next_state[i] += 1
            target = tuple(next_state)
            if target not in parents:
                if len(parents) >= max_states:
                    complete = False
                    break
                parents[target] = (state, action)
                pending.append(target)
            edges.append((state, action, target))

    ids = {state: f"m{i}" for i, state in enumerate(parents)}

    def path_to(state):
        if state not in parents:
            return None
        nodes, actions = [ids[state]], []
        while parents[state] is not None:
            state, action = parents[state]
            nodes.append(ids[state])
            actions.append(action)
        return {"states": nodes[::-1], "actions": actions[::-1]}

    reverse = defaultdict(list)
    for source, _, target in edges:
        reverse[target].append(source)
    can_finish = closure([finish], reverse) if finish in parents else set()
    bad_completion = [s for s in parents if s[index[net["finish"]]] and s != finish]
    dead = sorted({t[0] for t in transitions} - {e[1] for e in edges})
    graph_structure = structure(net)
    checks = {
        "option_to_complete": len(can_finish) == len(parents) if complete else None,
        "proper_completion": not bad_completion if complete else None,
        "no_dead_transitions": not dead if complete else None,
    }
    cycle = cycle_witness(parents, edges, finish)
    if cycle:
        cycle["states"] = [ids[s] for s in cycle["states"]]
    weights = net["invariant_weights"]
    invariant = all(
        sum(weights[i] for i in inputs) == sum(weights[i] for i in outputs)
        for _, inputs, outputs in transitions
    )
    status = "INCOMPLETE"
    if complete:
        status = "PASS" if graph_structure["is_workflow_net"] and all(checks.values()) else "FAIL"
    return {
        "status": status,
        "complete_enumeration": complete,
        "state_limit": max_states,
        "state_count": len(parents),
        "edge_count": len(edges),
        "structure": graph_structure,
        "checks": checks,
        "dead_transitions": dead if complete else None,
        "final_reachable": finish in parents,
        "cannot_finish_states": [ids[s] for s in parents if s not in can_finish] if complete else None,
        "proper_completion_counterexample": path_to(bad_completion[0]) if bad_completion else None,
        "completion_path": path_to(finish),
        "nonterminating_cycle": cycle,
        "declared_invariant_preserved_by_each_transition": invariant,
        "observed_max_tokens_per_place": {p: max(s[i] for s in parents) for i, p in enumerate(places)},
        "states": [{"id": ids[s], "tokens": {p: s[i] for i, p in enumerate(places) if s[i]}} for s in parents],
        "edges": [{"from": ids[s], "action": a, "to": ids[t]} for s, a, t in edges],
    }


def variants(net):
    yield "candidate", "PASS", net
    for change in net["predeclared_counterexamples"]:
        altered = deepcopy(net)
        if change["mutation"] == "retain_p4_after_t3":
            target = next(t for t in altered["transitions"] if t["id"] == "t3")
            target["outputs"].append("p4")
        elif change["mutation"] == "remove_t6":
            altered["transitions"] = [t for t in altered["transitions"] if t["id"] != "t6"]
        else:
            raise ValueError("Unrecognized predeclared counterexample")
        yield f"counterexample_{change['id']}", change["expected"], altered


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--max-states", type=int, default=10000)
    args = parser.parse_args()
    if args.max_states < 1:
        parser.error("--max-states must be positive")
    net = json.loads(args.model.read_text())
    cases = []
    for name, expected, model in variants(net):
        result = analyze(model, args.max_states)
        cases.append({"case": name, "expected": expected, "matches_expectation": result["status"] == expected, **result})
    report = {
        "format": "coach-workflow-formal-check/v1",
        "created_utc": datetime.now(timezone.utc).isoformat(),
        "model_file": str(args.model.resolve()),
        "method": "Exhaustive marking enumeration and reverse reachability; Definition 7 properties",
        "scope": "Formal properties of a declared research abstraction, not coaching validity",
        "cases": cases,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"output": str(args.output.resolve()), "cases": [
        {key: case[key] for key in ("case", "status", "state_count", "edge_count", "matches_expectation")}
        for case in cases
    ]}, ensure_ascii=False, indent=2))
    return 0 if all(c["matches_expectation"] for c in cases) else 1


if __name__ == "__main__":
    raise SystemExit(main())
