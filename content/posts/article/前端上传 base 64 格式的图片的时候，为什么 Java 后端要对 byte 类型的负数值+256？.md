---
created: 2023-12-24 T00:12:04 (UTC +08:00)
tags:
  - base64
source: https://www.v2ex.com/t/1002933#reply0
Author:
---


> ## Excerpt
> 程序员 - @wuyiccc - 这几天看了好几个关于前端上传 base 64 格式的图片到 java 后端，后端需要 for 循环 byte 类型的数据，对于小于 0 的 byte 值要加 256 ，这一点没看懂，java byte

---
这几天看了好几个关于前端上传 base 64 格式的图片到 java 后端，后端需要 for 循环 byte 类型的数据，对于小于 0 的 byte 值要加 256 ，这一点没看懂，java byte 值的范围不是-128~127 么，负数值的 byte 数据+256 也是原值，感觉好像没变化~~~，这一点处理代码没看懂，是有啥隐藏知识么，有没有大佬指点一下？

> 代码如下

```java
byte[] b = new byte[0]; 
b = decoder.decodeBuffer(baseStrs[1]); 
for (int i = 0; i < b.length; ++i) { 
	if (b[i] < 0) { b[i] += 256; }
 }
```

> 资料来源 csdn [https://blog.csdn.net/ShuSheng0007/article/details/118230374?spm=1001.2101.3001.6650.1&utm\_medium=distribute.pc\_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-1-118230374-blog-119354309.235%5Ev39%5Epc\_relevant\_3m\_sort\_dl\_base4&depth\_1-utm\_source=distribute.pc\_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-1-118230374-blog-119354309.235%5Ev39%5Epc\_relevant\_3m\_sort\_dl\_base4&utm\_relevant\_index=2](https://blog.csdn.net/ShuSheng0007/article/details/118230374?spm=1001.2101.3001.6650.1&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-1-118230374-blog-119354309.235%5Ev39%5Epc_relevant_3m_sort_dl_base4&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-1-118230374-blog-119354309.235%5Ev39%5Epc_relevant_3m_sort_dl_base4&utm_relevant_index=2)

___

> Chatgpt 的回答: 在 Java 中，对于负数进行 Base 64 编码时，通常需要加上 256 ，这是因为 Java 中的 byte 类型是有符号的，其取值范围是-128 到 127 。而 Base 64 编码是基于字节的，它期望输入的字节是无符号的。

> 在进行 Base 64 编码时，负数的二进制表示形式和正数不同。如果不进行处理，可能导致 Base 64 编码输出的结果与预期不符。

> 假设有一个负数 x ，其在二进制中表示为 b 1 b 2 b 3 b 4 b 5 b 6 b 7 b 8 。由于 Java 中的 byte 是有符号的，b 8 表示符号位，如果直接对其进行 Base 64 编码，可能会导致编码器处理符号位的问题。因此，为了确保正确的 Base 64 编码，可以将负数加上 256 ，将其转换为一个正数，然后再进行 Base 64 编码。

> 以下是一个简单的例子，演示了对负数进行 Base 64 编码的问题和解决方法：

```java
public class Base64Example {  
    public static void main(String[] args) {  
        int negativeNumber = -42;  
  
        // 直接对负数进行 Base64 编码，可能导致意外结果  
        String base64Direct = Base64.getEncoder().encodeToString(new byte[]{(byte) negativeNumber});  
        System.out.println("Base64 Direct: " + base64Direct);  
  
        // 将负数加上 256 ，然后进行 Base64 编码  
        int adjustedNumber = negativeNumber + 256;  
        String base64Adjusted = Base64.getEncoder().encodeToString(new byte[]{(byte) adjustedNumber});  
        System.out.println("Base64 Adjusted: " + base64Adjusted);  
    }  
}

```

有大佬指点一下么~~~ 感谢！

