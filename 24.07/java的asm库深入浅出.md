---
title: java asm 深入浅出
date: 2024-07-03 22:29:00+8
tags:
    - java
    - asm
    - 字节码
---
`asm`库是用来查看(分析)、创建和修改`jvm`字节码的，所以学习`asm`之前我们要先学习`jvm`字节码，然后再了解是如何分析、创建和修改字节码的。

# 1 jvm的字节码
`.class`文件的内容就是字节码，`jvm`定制了一套`class`文件规范，只要按照这个规范的文件就可以在`jvm`中被加载成`类`。

![img](https://i.imgur.com/SNQQFzw.png)

`class`文件与`elf`这种可执行文件一样，也是一种数据结构，或者说是一个结构体，只不过相比于`elf`来说，`class`文件要简单太多了，简单讲就是把我们的`java`代码给压缩了。
## 1.1 class file specification
可以从`oracle Java SE Specifications`的文档中找到第四章，[链接](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html)，这部分是class文件的规范，url中`se21`是java21版本的规范，可以改成其他比如`se7`，你会发现class文件的整体结构变化不大，并且java有着非常变态的向前兼容性，java21能够兼容java1.0版本的class文件。

官网上来就贴出来了一张图，这张图至少从java7到21都没有变过，更早的文档不在这里维护了，不过可能也没变过，就是下面这张`class`文件的结构。

![img](https://i.imgur.com/N5Hn7Sy.png)

每个class文件都是满足这个结构体的。我们可以下载[jclasslib](https://github.com/ingokegel/jclasslib/releases)小工具或idea插件，打开后会发现在通用信息中，其实涵盖了`ClassFile`结构体的大部分字段，这些字段都是单层深度，没有嵌套。

![img](https://i.imgur.com/iBEIbvT.png)

插件的用法是，先`compile`之后，通过`view->Show Bytecode With Jclasslib`

![img](https://i.imgur.com/lqQ6x4Y.png)

一般信息中，涵盖了一个类的基础信息，对应了上面图片中单层结构的字段，即非数组的部分。这部分比较简单，有一些内定的值，比如
- 大版本号52对应java8,53是java9...
- 访问标识0x0001是ACC_PUBLIC，当然这里是0x0021其实是`ACC_PUBLIC|ACC_SUPER`后者与`invokespecial`指令有关，具体可以参考官网的诸多枚举定义。
- `this`和`parent`的类名，是用`/`分割的，而不是`.`。

剩下的部分在左侧栏，依次是`常量池` `实现的接口列表` `字段列表` `方法列表` `属性列表`
### 1.1.1 常量池
常量池一般是`ClassFile`结构体中最大的部分，`cp_info`结构体的基本类型是第一个字节代表是那种类型的常量，从第二个字节开始就是一个数组了。
```
cp_info {
    u1 tag;
    u1 info[];
}
```
这只是一个基础的结构对于不同的`tag`下`info[]`的长度是有规律的，这样才知道怎么截断，主要的`tag`类型如下(这个其实不重要所有这些信息都可以从官方文档看到，只是简单列举一下)

|Constant Type|Value|
|---|---|
|CONSTANT_Class|7|
CONSTANT_Fieldref|9
CONSTANT_Methodref|10
CONSTANT_InterfaceMethodref|11
CONSTANT_String|8
CONSTANT_Integer|3
CONSTANT_Float|4
CONSTANT_Long|5
CONSTANT_Double|6
CONSTANT_NameAndType|12
CONSTANT_Utf8|1
CONSTANT_MethodHandle|15
CONSTANT_MethodType|16
CONSTANT_InvokeDynamic|18

这些类型中很多都是定长的，很容易定位，比如`Long` `Integer` `Float`等等，甚至`Class`这些基本也是定长的，虽然类名长度是不确定的，但是`Class_info`是定长3个字节，后面2个是个下标指向类名字符串的位置。

![img](https://i.imgur.com/k2cY9P2.png)

![image](https://i.imgur.com/8lG0eIw.png)

而变长的字符串类型则是有记录长度的，如下，所以这样能分割出每种结构。

![img](https://i.imgur.com/ow9n3qJ.png)
### 1.1.2 接口
这部分是当前`class`实现的接口列表，`interfaces`部分的定义是个`u2[]`而不是字符串，每个`u2`是`cp_info`的一个下标指，即接口名也是作为字符串常量存储到常量池的。

如下，实现了`java.lang.Runnable`，这里存储的是下标4，指向的是常量池字符串`java/lang/Runnable`

![img](https://i.imgur.com/5HxZJNf.png)

### 1.1.3 字段
`fields`部分是如下结构体的数组，
```c
field_info {
    u2             access_flags;
    u2             name_index;
    u2             descriptor_index;
    u2             attributes_count;
    attribute_info attributes[attributes_count];
}
```
![image](https://i.imgur.com/e50f2Eo.png)

`access_flags`与之前类的是类似的，`name_index`记录字段名在常量池的下标，所以是`u2`类型，`descriptor_index`是类似的，表示当前字段的类型描述。这里需要专门解释下`discriptor`的形式，后面方法中也会看到类似的。基础类型都是用一个字母表示，而对象类型是用`Ljava/lang/String;`表示，注意前面有个`L`，后面有个`;`，这是一个`discriptor`写法规范。基础类型的描述符如下，基本都是首字母的大写：
- int I
- long J （因为L给长类型用作前缀了，所以换J）
- short S
- byte B
- float F
- double D
- boolean Z （因为B给byte了，所以换Z）
- char C

`attribute_info`最后会说是属性列表。
### 1.1.4 方法
方法是`method_info`数组如下，也是访问级别，名称，描述和属性，与`field_info`是一模一样的。
```
method_info {
    u2             access_flags;
    u2             name_index;
    u2             descriptor_index;
    u2             attributes_count;
    attribute_info attributes[attributes_count];
}
```
![img](https://i.imgur.com/fQKmcQD.png)

与`field_info`对比之下，会发现有两处不同。

一个就是描述符格式不一致，函数的描述符是由`(入参)返回值`组成的，入参如果有多个，是并排的列出的并不需要任何符号隔开，例如`String test(int a, long b, String c)`的描述符就是`(IJLjava/lang/String;)Ljava/lang/String;`。而返回值部分除了正常的返回值类型的描述符，还增加了一种`V`是对`void`返回类型的描述。同时还需要注意有两个方法名是比较特殊的，一个是`<init>`指的是构造方法的方法名，还有一个是`<clinit>`是静态代码块组成的类初始化时候运行的方法。

另一个不太一样的事，下面有`Code`属性，这是`attribute`的一种，我们同样放到属性去说，这里简单提一下，`Code`类型的属性，就是记录了方法体的指令内容。
### 1.1.5 属性
在`ClassFile`级别最后的部分是由属性`attributes`的，而上面的`field_info`和`class_info`中也是有`attributes`信息的，属性信息会有较大可扩展性，很多java新版本的特性想要扩展，那属性是一个很好的放置位置，以便于不改变整体的结构。属性部分是最复杂，在jdk21的规范中已经支持了30种属性结构了。

![img](https://i.imgur.com/pIQ1bYp.png)

这里我们不再对每一种属性都单独讲解了，官方文档有较为细致的解释，这里挑几个比较常见的。

一、`ConstantValue`类型，只针对常量`static final`的`基础类型或字符串`的属性，这些可以在编译器赋值，而不是运行时，提高效率。

![img](https://i.imgur.com/ZNph83v.png)

二、`Code`类型，函数体的内容，这个是非常重要的，尤其是后面学习`ASM`指令，一个类主要承载的功能，都反应在了`method`的`code`里，code类型的结构体非常复杂，我们可以直接看`jclasslib`给我们图形化展示之后的，以构造方法`<init>`为例，这段代码中，我们虽然没有写构造方法，但是默认也会有构造方法，默认的实现就是`super()`也就是调用父类的构造方法；此外我们还对字段进行了赋值所以有如下代码。

![img](https://i.imgur.com/fvyZVCe.png)

我们在下一节会详细展开介绍code中的不同指令。

三、`Exception`类型，函数中声明的抛出的异常，可以有多个。注意这里是声明的抛出的异常，不包含一些运行时的异常。尤其要区分好，`Exception`类型的属性和`Code`类型的属性中的"异常表"，"异常表"指的是方法的`try-catch`的

![img](https://i.imgur.com/W3ZETMA.png)

![img](https://i.imgur.com/ccMe6SI.png)

只有通过`try-catch`的异常会出现在`code异常表`。

![image](https://i.imgur.com/MF9D9cf.png)

四、`LineNumberTable`与`LocalVariableTable`

![img](https://i.imgur.com/7eB2f6b.png)

五、`Signature`与泛型密切相关，虽然java的泛型在执行的时候会被擦除，但是这是为了兼容老版本的`java`，泛型信息其实还是被记录了下来，会被放置到这个属性中，例如`names`是个`List<String>`，他的字段信息中只有`List`没有泛型信息，但是`Signature`属性中，是有记录泛型信息的。

![img](https://i.imgur.com/b401ydy.png)

![img](https://i.imgur.com/H8aTpsZ.png)

## 1.2 函数Code中的指令
`ClassFile`的结构介绍完毕了，其中最最核心的部分其实没有展开，那就是函数的code部分的字节码。这里我们需要了解，操作数和操作数栈的概念：

`操作数`就是常见的变量例如基础类型和对象引用，我们的函数就是在操作这些操作数，如果想要操作他们，那么必须先进行`load`加载，加载会将操作数加载到一个栈的数据结构上，这个栈就是`操作数栈`。例如我们想要完成`a + b`这个操作，需要把a加载到栈，再把b加载到栈，然后运行加法操作。

我们看一下对应的字节码：

![image](https://i.imgur.com/YOGrKU6.png)

通过这个图，我们有了一个大概的概念，就是我们想要执行一个操作或者说一个行为，不管是加法操作还是函数调用操作还是其他操作，都需要先准备好要操作的数，比如这里的`a`和`b`要先load到栈上，然后执行`iadd`进行加法操作，操作会消耗掉栈顶特定个数的操作数，比如`iadd`是消耗两个，如果操作有返回，也会放置到栈顶。

接下来我们就需要了解一些常用的指令了，比如操作数需要`load`才能放置到栈顶，那么有哪些`load`指令呢？
### 1.2.1 load/push
`load`的形式有很多种，比如我们可以把`本地变量load`到栈顶
- `iload_{y}`按照`int`或`byte`或`char`或`boolean`或`short`类型，加载第y个变量。
- `lload_{y}`按照`long`类型加载第y个变量。
- `fload_{y}`按照`float`类型加载第y个变量。
- `dload_{y}`按照`double`类型加载第y个变量。
- `aload_{y}`按照对象类型加载第y个变量，`aload_0`加载this，默认第0个位置是`this`

或者`常量load`到栈顶
- `ldc` load contant 加载常量(`int`或`byte`或`char`或`boolean`或`short`或`float`类型或字符串常量)
- `ldc_w` 如果上面几种类型，因为一些不可抗力存到了宽索引，即2个栈帧中，则需要用这个指令，较少使用。
- `ldc2_w` 加载`long` 或 `double`类型常量

但是`ldc`对于一些小数字类型的性能稍差（但也可以用），于是为了性能有一些专门的指令
- `iconst_<n>`如果是0-5可以优化性能
- `iconst_m1`同上专门针对-1的load
- `bipush`针对byte范围的int值的load
- `sipush`针对short范围的int值的load
- 上面只是`int`的其他类型也有专门的指令，这里不再列出。

### 1.2.2 store
上面`iload_1`是把本地变量1加载到栈顶，但是一开始没有存储本地变量1呢？所以是会先有一个存储的过程，这就是`store`指令了。
- `istore_{y}`把栈顶的`int`或`byte`或`char`或`boolean`或`short`类型消耗掉，存到本地变量y，y是数字。
- `lstore_{y}`把栈顶的`long`消耗，存到本地变量y。!!注意long占用两个栈帧，消耗掉两个栈顶的位置。
- `fstore_{y}`把栈顶的`float`消耗，存到本地变量y。
- `dstore_{y}`把栈顶的`double`消耗，存到本地变量y。!!注意double占用两个栈帧，消耗掉两个栈顶的位置。
- `astore_{y}`把栈顶的对象地址消耗，存到本地变量y。

### 1.2.3 return
`return`之后需要保证栈是空的，不然编译会验证不通过。
- `return`等于代码return，不消耗栈顶
- `ireturn`消耗栈顶一帧，返回一个`int`或`byte`或`char`或`boolean`或`short`类型
- `freturn`消耗栈顶一帧返回一个float
- `lreturn`消耗栈顶2帧返回一个long
- `dreturn`消耗栈顶2帧返回一个double
- `areturn`消耗栈顶一帧返回一个地址，即返回一个对象类型的内存地址

注意：`return`不一定是代码结束的地方，可能有判断分支有多个`return`语句，而且还有可能是`athrow`抛出异常。

### 1.2.4 pop/dup/new
如果一个栈上的操作数，想要直接消耗掉，则直接用`pop`指令消耗一个栈帧，比如运行了一个函数操作后，直接忽略函数的返回值就可以`pop`消耗掉，如果返回值是`long/double`可以`pop`两次，或者`pop2`指令消耗。

如果想要复制一份操作数栈顶的数，即栈顶连续两个相同操作数则使用`dup` `dup2`这样的指令，这经常用于`new`一个对象。
```java
Object obj = new Object();
```
对应字节码，如下`new`指令作用是，创建一个对象会在堆上分配内存，并将内存的地址放到操作数栈上；注意这里有个`dup`把地址复制了一份，这是`new`对象的一个固定操作，因为`invokespecial #1 <java/lang/Object.<init> : ()V>`这个构造方法与普通非静态方法一样，会消耗掉一个操作数作为`this`。所以需要提前把地址备份一下，不然`new`完地址就丢了，下面会说`invoke`相关指令。
```
new #4 <java/lang/Object>
dup
invokespecial #1 <java/lang/Object.<init> : ()V>
```
![img](https://i.imgur.com/0bqdThZ.png)

### 1.2.5 invoke
`invoke`是函数调用的指令，他主要有5种，
- `invokevirtual`普通的可访问的方法，需要依次把`对象`，`参数从左到右`放到栈顶。
- `invokestatic`静态方法，需要依次把`参数从左到右`放到栈顶。
- `invokespecial`特殊方法，构造方法，私有方法，父类中的方法，接口的default实现等，根据情况参考上面的操作数顺序。
- `invokeinterface`接口方法，栈顶操作数顺序参考上面。
- `invokedynamic`动态方法，一般是lambda表达式，栈顶操作数顺序参考上面。

### 1.2.6 指令小结
上面我们对基本的指令有了一些了解，虽然还有很多指令没有讲到，但是有了这些知识，已经可以看懂字节码的逻辑了。感兴趣的话，最好自行去写一写，然后看下以下情况的字节码：
- 基本的加减乘除位运算等，字节码
- `if` `for`判断与循环，分支逻辑的字节码
- `try-catch` `athrow`抛出异常时候的字节码

# 2 asm的基础概念
`asm`库的介绍，我有点不知道从何说起，好像好多知识都是关联的，找不到一个入口点。那干脆我们就从基础的一些概念讲起，在介绍概念的过程中，去拓展这些概念的使用场景，并举一些代码示例，这样更容易入门。那么完整的看完这第二章，我想应该对`asm`就有了大概得了解，是什么，能做什么，擅长做什么，起码这些就会清楚了。而真正落到更细的场景下的扩展，我们会在第三章实战。

首先就是`visitor`的概念，asm使用这个模式将对一个类的操作进行了拆解。
```xml
<!-- 注意common这个包中已经间接引入了core和tree包 -->
<dependency>
	<groupId>org.ow2.asm</groupId>
	<artifactId>asm-commons</artifactId>
	<version>9.7</version>
</dependency>
```
下面处理的类，源码是这样，可以对照来看
```java
package com.example.demo;

import java.util.List;

/**
 * @author Frank
 * @date 2024/7/4 12:36
 */
public class MyRunnable implements Runnable {
    String name = "name";
    static String test = "test";

    List<String> names;

    static final String constString = "hello world";
    @Override
    public void run() {
    }

    public int a() {
        if (Math.random() > 0.5) {
            return 1;
        } else if (Math.random() == 0.5) {
            return 0;
        }
        return -1;
    }
}

```
## 2.1 ClassVisitor
根visitor就是`ClassVisitor`，来对整个类的内容进行遍历操作，下图是`visit`的顺序，这些visit函数都是在遍历过程中的`hook`钩子函数，比如刚开始遍历的时候就会触发钩子函数`visit(int,int,String,String,String,String[])`，这里的参数就是类的一些信息，我们以`visit` `visitField` `visitMethod`和`visitEnd`为例，使用这四个hook在特定时间点打印一行日志。

![img](https://i.imgur.com/SudwOP5.png)

```java
ClassReader cr = new ClassReader("com.example.demo.MyRunnable");
cr.accept(new ClassVisitor(ASM9) {
    @Override
    public void visit(int version, int access, String name, String signature, String superName, String[] interfaces) {
//      33 =  Opcodes.ACC_PUBLIC |Opcodes.ACC_SUPER,代表public并且非接口非抽象类
        System.out.printf("Now visit class start, classFileVersion: %s, access:%s, className: %s, signature:%s, superClass:%s, interfaces:%s%n",
                version, access, name, signature, superName, Arrays.toString(interfaces));
    }
    @Override
    public FieldVisitor visitField(int access, String name, String descriptor, String signature, Object value) {
        System.out.printf("Now visit field, access:%s, name:%s, descriptor:%s, signature:%s, value:%s%n",
                access, name, descriptor, signature, value);
        return null;
    }
    @Override
    public MethodVisitor visitMethod(int access, String name, String descriptor, String signature, String[] exceptions) {
        System.out.printf("Now visit method, access:%s, name:%s, descriptor:%s, signature:%s, exceptions:%s%n",
                        access, name, descriptor, signature, Arrays.toString(exceptions));
        return null;
    }
    @Override
    public void visitEnd() {
        System.out.println("Now visit class finished");
    }
}, 0);
```
![img](https://i.imgur.com/acg3m4P.png)

对于简单的位置的钩子，返回值是`void`，就是通知一个简单的信息，而对于复杂位置的钩子，比如`visitMethod`，这里的入参是函数的基础信息，想要在函数代码中进行每行指令的解析，就需要对每一种类型的指令设置钩子，比如每一个`ldc`指令设置一个钩子，这样把这些钩子都放到`ClassVisitor`中，结构就太乱了。所以`visitMethod`方法的返回值是`MethodVisitor`。由这个新的`visitor`来定义方法内部的一些钩子函数，这样实现递归遍历。即下图中其他`xxxVisitor`作为返回值的方法，都是会拿到返回值后，再用返回值进行`visitor`递归遍历。因为`field`和`method`是最重要的，其他的都类似，所以这里只对这俩展开。

## 2.2 FieldVisitor
那接下来介绍`FieldVisitor`，他提供的钩子函数如下

![img](https://i.imgur.com/Mhnr8HE.png)

修改代码如下，创建一个`FieldVisitor`重写了属性和结束的钩子。
```java
@Override
public FieldVisitor visitField(int access, String name, String descriptor, String signature, Object value) {
    System.out.printf("Now visit field, access:%s, name:%s, descriptor:%s, signature:%s, value:%s%n",
        access, name, descriptor, signature, value);
    return new FieldVisitor(ASM9) {
        @Override
        public void visitAttribute(Attribute attribute) {
            System.out.println("- Attribute: " + attribute);
        }
        @Override
        public void visitEnd() {
            System.out.printf("- Now visit field %s finished%n", name);
        }
    };
}
```
打印日志如下，可以看出是`ClassVisitor`遍历到`Field`之后，会拿返回值`FieldVisitor`进行递归遍历。此外会发现`- Attribute`的日志是没有的，因为所有字段都没有属性列，不会运行到这个函数内。
```log {2-9}
Now visit class start, classFileVersion: 52, access:33, className: com/example/demo/MyRunnable, signature:null, superClass:java/lang/Object, interfaces:[java/lang/Runnable]
Now visit field, access:0, name:name, descriptor:Ljava/lang/String;, signature:null, value:null
- Now visit field name finished
Now visit field, access:8, name:test, descriptor:Ljava/lang/String;, signature:null, value:null
- Now visit field test finished
Now visit field, access:0, name:names, descriptor:Ljava/util/List;, signature:Ljava/util/List<Ljava/lang/String;>;, value:null
- Now visit field names finished
Now visit field, access:24, name:constString, descriptor:Ljava/lang/String;, signature:null, value:hello world
- Now visit field constString finished
Now visit method, access:1, name:<init>, descriptor:()V, signature:null, exceptions:null
Now visit method, access:1, name:run, descriptor:()V, signature:null, exceptions:null
Now visit method, access:1, name:a, descriptor:()I, signature:null, exceptions:null
Now visit method, access:8, name:<clinit>, descriptor:()V, signature:null, exceptions:null
Now visit class finished
```
## 2.3 MethodVisitor
最后我们来看一下`MethodVisitor`也是最重要的一个`visitor`，这个`visitor`中的`hook`非常多，大体可以拆成参数元数据相关，和代码相关的两部分，如下：

![img](https://i.imgur.com/yA4Zpfi.png)

钩子很多，我们选取几个有代表性的，代码如下：
```java
@Override
public MethodVisitor visitMethod(int access, String name, String descriptor, String signature, String[] exceptions) {
    System.out.printf("Now visit method, access:%s, name:%s, descriptor:%s, signature:%s, exceptions:%s%n",
            access, name, descriptor, signature, Arrays.toString(exceptions));
    return new MethodVisitor(ASM9) {
        @Override
        public void visitParameter(String pname, int access) {
            System.out.printf("- Method:%s Parameter:%s%n", name, pname);
        }
        @Override
        public void visitCode() {
            System.out.printf("- Method:%s code start%n", name);
        }
        @Override
        public void visitMethodInsn(int opcode, String owner, String mname, String descriptor, boolean isInterface) {
            System.out.printf("- Method:%s, invoke other method %s%s%n", name, owner, mname);
        }
        @Override
        public void visitLineNumber(int line, Label start) {
            System.out.printf("- Method:%s, current line number %s%n", name, line);
        }
        @Override
        public void visitMaxs(int maxStack, int maxLocals) {
            System.out.printf("- Method:%s, maxStack:%s, maxLocals:%s%n", name, maxStack, maxLocals);
        }
        @Override
        public void visitEnd() {
            System.out.printf("- Method:%s, visit finished%n", name);
        }
    };
}
```
打印日志如下.
```log
...
Now visit method, access:1, name:<init>, descriptor:()V, signature:null, exceptions:null
- Method:<init> code start
- Method:<init>, current line number 9
- Method:<init>, invoke other method java/lang/Object<init>
- Method:<init>, current line number 10
- Method:<init>, maxStack:2, maxLocals:1
- Method:<init>, visit finished
Now visit method, access:1, name:run, descriptor:()V, signature:null, exceptions:null
- Method:run code start
- Method:run, current line number 18
- Method:run, maxStack:0, maxLocals:1
- Method:run, visit finished
Now visit method, access:1, name:a, descriptor:()I, signature:null, exceptions:null
- Method:a code start
- Method:a, current line number 21
- Method:a, invoke other method java/lang/Mathrandom
- Method:a, current line number 22
- Method:a, current line number 23
- Method:a, invoke other method java/lang/Mathrandom
- Method:a, current line number 24
- Method:a, current line number 26
- Method:a, maxStack:4, maxLocals:1
- Method:a, visit finished
Now visit method, access:8, name:<clinit>, descriptor:()V, signature:null, exceptions:null
- Method:<clinit> code start
- Method:<clinit>, current line number 11
- Method:<clinit>, maxStack:1, maxLocals:0
- Method:<clinit>, visit finished
...
```
## 2.4 ClassWriter
上面的`visitor`都是用`ClassReader`读取字节码，然后`accept`一个`ClassVisitor`进行字节码的读取的，说到底就是只读的操作。`ClassWriter`是一个实现了`ClassVisitor`的内置的类，这个`visitor`有些特殊，他会在`visit`的过程中，把所有visit的内容记录到内存中，最后通过`toByteArray`方法，可以把所以记录下来的信息转换成一个类的字节码。一个简单的例子，是直接用`cw`作为`visitor`就会记录下所有的字节码到内存，然后`write`到文件中，内容与原`class`文件是一致的。
```java
ClassReader cr = new ClassReader("com.example.demo.MyRunnable");
ClassWriter cw = new ClassWriter(0);
cr.accept(cw, 0);

OutputStream o = new FileOutputStream("XXX.class");
o.write(cw.toByteArray());
o.close();
```
![img](https://i.imgur.com/wgReKwV.png)

这是简单的复刻所有类的细节，因为类的所有信息都会被`visitxx`给捕捉，而所有的`visit`在`cw`中都是记录下来，最后转成`byte[]`字节码。那我们就可以基于这个稍微做一些字节码改造了，比如下面几种：
### 2.4.1 删除方法
下面的各种修改我们都需要new一个`ClassVisitor`构造参数第二个把`cw`塞进来，原因是`asm`的设计方式中，第二个构造参数是`delegator`也就是委托者，他的作用是如果我们没有在当前实现中定义`visitxxx`方法的实现，就会委托给`cw`。

例如下面删除方法`a`，我们只需要重写`visitMethod`，判断是`a`的返回空，其他所有情况都会按照`super.XXX`，而`super`中的实现都是调用委托者对应的方法，而委托者就是`cw`会把所有的内容记录下来，最后生成`byte[]`。
```java
ClassReader cr = new ClassReader("com.example.demo.MyRunnable");
ClassWriter cw = new ClassWriter(0);
        
// 注意cw作为第二个参数
cr.accept(new ClassVisitor(ASM9, cw) {
    @Override
    public MethodVisitor visitMethod(int access, String name, 
        String descriptor, String signature, String[] exceptions) {
        if (name.equals("a")) return null;
        return super.visitMethod(access, name, descriptor, signature, exceptions);
    }
}, 0);

OutputStream o = new FileOutputStream("XXX.class");
o.write(cw.toByteArray());
o.close();
```
此时生成的`class`文件反编译，就没有了`a()`这个方法

![img](https://i.imgur.com/cxYSezF.png)

从删除方法的这个例子中，我们其实学到的不只是删除方法，字段、注解、设置是方法中的某一行指令，都可以根据这个方式进行剔除。
### 2.4.2 新增方法
新增方法，可以放到`visitEnd`中去实现，因为从`2.1`的图中，会发现`visitMethod`之后是`visitEnd`，所以可以在visitEnd的实现中，先执行一次额外的`cw.visitMethod`，这样就保持了原来的`visit`顺序，并且成功增加了一个方法，例如我们新增一个`public void b() {System.out.println("b");}`，代码如下

```java
ClassReader cr = new ClassReader("com.example.demo.MyRunnable");
ClassWriter cw = new ClassWriter(0);

cr.accept(new ClassVisitor(ASM9, cw) {
    @Override
    public void visitEnd() {
        MethodVisitor mv = cw.visitMethod(ACC_PUBLIC, "b", "()V", null, null);
        // 下面这段直接对应代码System.out.println("b");
        mv.visitCode();
        mv.visitFieldInsn(GETSTATIC, "java/lang/System", "out", "Ljava/io/PrintStream;");
        mv.visitLdcInsn("b");
        mv.visitMethodInsn(INVOKEVIRTUAL, "java/io/PrintStream", "println", "(Ljava/lang/Object;)V", false);
        mv.visitInsn(RETURN);

        // 然后是Maxs和End
        mv.visitMaxs(2, 1);
        mv.visitEnd();
        super.visitEnd();
    }
}, 0);
```
这段代码多出了一些新的知识，一个是`ClassWriter.visitMethod`方法会在内存中创建一个方法，并且返回一个`MethodWriter`类型，后者也是一个`MethodVisitor`的实现，我们用这个新返回的`mv`运行`visitXX`的时候，就会在`cw`的内存中进行写方法体的操作了；注意这里`mv`返回之后，我们依次运行了`visitCode`和其他一些方法内部的操作。并且在结束之前运行了`mv.visitMaxs(2, 0)`和`mv.visitEnd()`。在这之后还需要运行`super.visitEnd()`因为这里是`ClassVisitor`的`visitEnd`方法，不能给人直接删了。

解释下为什么是`visitMaxs(2,1)`，2是最大的操作数栈，因为最多的时候栈上有`System.out`和`"b"`两个操作数，所以这里设置2即可，当然设置3不报错，但是设置1就会校验不通过，第二个参数1代表最大局部变量数，这里虽然没有设置过局部变量但是`this` `args`都会占用，虽然也没有入参但是this占1个。

`visitMaxs`和`visitFrame`(上面没有用到Frame)是非常容易算错的，例如我们将`visitMaxs`的值故意改错或删除，来看一下效果，会发现生成字节码是成功的，但是真正在使用这个类或这个方法的时候，就会报错。

增加以下代码来实际加载并使用这个类。
```java
 byte[] codes = cw.toByteArray();

ClassLoader cl = VisitorTest.class.getClassLoader();
Method define = ClassLoader.class.getDeclaredMethod("defineClass",
                byte[].class, int.class, int.class);

define.setAccessible(true);
Class<?> c = (Class<?>) define.invoke(cl, codes, 0, codes.length);
System.out.println(Arrays.toString(c.getDeclaredMethods()));
```
![img](https://i.imgur.com/CXAqIsq.gif)

因而如果不是极限的追求性能，可以交给`ASM`帮我们自动计算`maxs`和`frame`，如下图，此时`maxs`传0也不会报错，会自动计算，但是不能删除这行代码。
```java
ClassWriter cw = new ClassWriter(ClassWriter.COMPUTE_FRAMES | ClassWriter.COMPUTE_MAXS);
```
![img](https://i.imgur.com/NPzewgv.png)

我们接下来的代码都会使用`ClassWriter.COMPUTE_FRAMES | ClassWriter.COMPUTE_MAXS`来避免一些验证性的问题。
### 2.4.3 修改（增强）方法
举一个常见的功能，在方法前后打印时间，然后相减计算方法的耗时。那就需要对方法进行修改，前后都增加一些代码，那这里就需要用到`common`库里的一个类`AdviceAdapter`了，这个类也实现了`MethodVisitor`，代码的注释说了他就是专门为了对方法进行环绕增强的一个内置`MethodVisitor`

![img](https://i.imgur.com/t9OCOAi.png)

![img](https://i.imgur.com/q3rH3vD.png)

这里因为要引入新的局部变量，所以不能用默认的`压缩帧(compressed frame)`格式，而需要指定为`展开帧(expaned frame)`格式，前者字节码大小更紧凑，是基于前一帧的变化来维护的diff，后者则是每一个栈帧都是独立的描述自身内容，感兴趣的自行了解，这里只需要知道前者效率更高，但是没法添加局部变量，后者更适合我们去做字节码改动用。

```java {30}
ClassReader cr = new ClassReader("com.example.demo.MyRunnable");
ClassWriter cw = new ClassWriter(ClassWriter.COMPUTE_FRAMES | ClassWriter.COMPUTE_MAXS);

cr.accept(new ClassVisitor(ASM9, cw) {
    @Override
    public MethodVisitor visitMethod(int access, String name,
                                        String descriptor, String signature, String[] exceptions) {
        if (name.equals("a")) {
            MethodVisitor mv = cw.visitMethod(access, name, descriptor, signature, exceptions);
            return new AdviceAdapter(ASM9, mv, access, name, descriptor) {
                private int startTimeVarIndex;
                // 函数进入的时候，添加一行 long startTime = System.currentTimeMillis();
                @Override
                protected void onMethodEnter() {
                    mv.visitMethodInsn(INVOKESTATIC, "java/lang/System", "currentTimeMillis", "()J", false);
                    startTimeVarIndex = newLocal(Type.LONG_TYPE);
                    mv.visitVarInsn(LSTORE, startTimeVarIndex);
                }

                // 函数退出的时候，添加一行 System.out.println(System.currentTimeMillis() - startTime);
                @Override
                protected void onMethodExit(int opcode) {
                    mv.visitFieldInsn(GETSTATIC, "java/lang/System", "out", "Ljava/io/PrintStream;");
                    mv.visitMethodInsn(INVOKESTATIC, "java/lang/System", "currentTimeMillis", "()J", false);
                    mv.visitVarInsn(LLOAD, startTimeVarIndex);
                    mv.visitInsn(LSUB);
                    mv.visitMethodInsn(INVOKEVIRTUAL, "java/io/PrintStream", "println", "(J)V", false);
                }
            };
        }
        return super.visitMethod(access, name, descriptor, signature, exceptions);
    }
}, ClassReader.EXPAND_FRAMES);

byte[] codes = cw.toByteArray();
ClassLoader cl = VisitorTest.class.getClassLoader();
Method define = ClassLoader.class.getDeclaredMethod("defineClass",
        byte[].class, int.class, int.class);
define.setAccessible(true);
Class<?> c = (Class<?>) define.invoke(cl, codes, 0, codes.length);

// 调用方法，看是否打印了耗时
c.getDeclaredMethod("a").invoke(c.newInstance());
```
打印

![img](https://i.imgur.com/Baz8nmF.png)

一定要注意的是`methodEnter`只有一个进入的点，但是`methodExit`则会有多个退出的点，参数中`opcode`也可能有多种取值，比如正常的`return`，比如条件分支可能就有多个`return`。而且还有可能不是`return`而是抛出异常，他们都对应了不同的`opcode`。上面代码修改后，a方法的字节码反编译得到:
```java
public int a() {
    long var1 = System.currentTimeMillis();
    if (Math.random() > 0.5) {
        System.out.println(System.currentTimeMillis() - var1);
        return 1;
    } else if (Math.random() == 0.5) {
        System.out.println(System.currentTimeMillis() - var1);
        return 0;
    } else {
        System.out.println(System.currentTimeMillis() - var1);
        return -1;
    }
}   
```
可以看出不同的条件分支的`return`之前都会被插入这段代码，其实就是因为`methodExit`这个hook会在多个地方都会进入，他其实是每次调用`ireturn`或者`athrow`之前都会调用的。

我们修改一下我们的`a`来抛出一个异常。
```java {7}
public int a() {
    if (Math.random() > 0.5) {
        return 1;
    } else if (Math.random() == 0.5) {
        return 0;
    }
    throw new IllegalStateException();
}
```
重新插入字节码，会发现正如我们之前所说`athrow`之前也会插入这段代码，结果如下。
```java {11}
public int a() {
    long var1 = System.currentTimeMillis();
    if (Math.random() > 0.5) {
        System.out.println(System.currentTimeMillis() - var1);
        return 1;
    } else if (Math.random() == 0.5) {
        System.out.println(System.currentTimeMillis() - var1);
        return 0;
    } else {
        IllegalStateException var10000 = new IllegalStateException();
        System.out.println(System.currentTimeMillis() - var1);
        throw var10000;
    }
}
```
`athrow`就是对应的代码中显式的`throw`关键字，如果是某个子方法内部抛出运行时异常，则不会认为是`methodExit`，虽然好像也是一种方法退出的形式了，但是他是运行时的退出，字节码中这不是一种`methodExit`形式，这一点要注意。

### 2.4.4 从0创建一个类
先安装如下两个插件，两个功能是类似的，选一个就行

![img](https://i.imgur.com/iJyboeH.png)

![img](https://i.imgur.com/vI9MzfZ.png)

利用这个工具我们就可以生成一个`dump`函数，这个函数返回值是`byte[]`，其实就是字节码，也就是`MyRunnable`这个类的字节码，也就是说利用`asm`库可以不通过`compiler`编译器，就直接创建字节码。

他这个代码我们简单的看一下结构，其实就是直接利用`ClassWriter`的各种`visit`方法，白手起家，创建完整的一个类。我们可以先写好一些代码，利用这个工具就可以很容易的知道不同的形式的代码，用`asm`该怎么实现。
```java
public class VisitorTest implements Opcodes {
    public static byte[] dump() throws Exception {
        ClassWriter classWriter = new ClassWriter(0);
        FieldVisitor fieldVisitor;
        RecordComponentVisitor recordComponentVisitor;
        MethodVisitor methodVisitor;
        AnnotationVisitor annotationVisitor0;

        classWriter.visit(V1_8, ACC_PUBLIC | ACC_SUPER, "com/example/demo/MyRunnable", 
            null, "java/lang/Object", new String[]{"java/lang/Runnable"});

        classWriter.visitSource("MyRunnable.java", null);
        // 这里省略中间代码了。。。
        classWriter.visitEnd();

        return classWriter.toByteArray();
    }
}
```
## 2.5 asm-tree
上面的`visitor`是`asm`包或者叫`asm-core`包提供的核心能力，他为一切的解析重写提供了最基础的支持。`asm-tree`包也在上面`asm-common`中间接引用了，他基于核心 `asm` 包，提供了一种结构化的、基于树的字节码表示方法。`core`中是以`visitor`模式作为主心骨，对于拆分的较细，`tree`则是以`Node`为组织方式。

以一个具体的场景为例，之前的a方法，我们想要修改代码，把第一个`Math.random()`的值存到一个局部变量中，然后第二次直接用变量中的值
```java
public int a() {
    if (Math.random() > 0.5) {
        return 1;
    } else if (Math.random() == 0.5) {
        return 0;
    }
    throw new IllegalStateException();
}

// 想要修改字节码，让代码变为
public int a() {
    double d = Math.random();
    if ( d > 0.5) {
        return 1;
    } else if (d == 0.5) {
        return 0;
    }
    throw new IllegalStateException();
}
```
这个需求如何实现呢？首先最暴力的办法，就是直接把`a`方法删掉，然后再最后追加一个新的`a`方法，把这一套代码全部重写，当然这不是一种好的实现。缺乏动态性和普适性。其次我们可以想到的一个方法是用`visitMethod`的钩子，来判断是第一次运行`Math.random`，那么就把这个结果塞到一个局部变量。然后后续再捕捉到`Math.random`调用的时候，就把指令删掉，并直接把局部变量拿过来。我们看一下如何实现：
```java
cr.accept(new ClassVisitor(ASM9, cw) {
    @Override
    public MethodVisitor visitMethod(int access, String name,
                            String descriptor, String signature, String[] exceptions) {
        // 对a()处理
        if (name.equals("a")) {
            MethodVisitor mv = cw.visitMethod(access, name, descriptor, signature, exceptions);
            return new AdviceAdapter(ASM9, mv, access, name, descriptor) {
                private int dIndex = -1;

                // 针对a方法中调用的Math.random方法的hook
                @Override
                public void visitMethodInsn(
                        final int opcodeAndSource,
                        final String owner,
                        final String name,
                        final String descriptor,
                        final boolean isInterface) {
                    if (owner.equals("java/lang/Math") && name.equals("random")) {
                        // 如果变量d没有赋值默认给了个-1
                        if (dIndex < 0) {
                            // 执行原函数，然后栈顶dup一份
                            super.visitMethodInsn(opcodeAndSource, owner, name, descriptor, isInterface);
                            dup2();
                            // dup的这一份用来赋值给局部变量d
                            dIndex = newLocal(Type.DOUBLE_TYPE);
                            storeLocal(dIndex);
                        } else {
                            // 如果已经赋值过了，直接加载变量，而不是运行random函数
                            loadLocal(dIndex);
                        }
                        return;
                    }
                    // 非random方法还是按照原来的不作改动
                    super.visitMethodInsn(opcodeAndSource, owner, name, descriptor, isInterface);
                }
            };
        }
        return super.visitMethod(access, name, descriptor, signature, exceptions);
    }
}, ClassReader.EXPAND_FRAMES);
```
这样生成的代码反编译如下，与我们期待的相同

![img](https://i.imgur.com/5oARXHU.png)

但是这个写法的抽象程度较高，我们只是在`hook`中作局部的处理，没有一个全局的列表，比如没有提供所有的`insn`的列表，如果把所有的代码指令都抽象成一个对象，整个method就是一个指令的`List`，那我们只需要找到要修改的指令，在他的前后进行插入和修改即可。这就是`tree`给我们提供的`Node`，下面是实现相同功能的代码。
```java
// 用tree提供的MethodNode，可以记录整个method的信息，面向对象的处理问题
ClassNode classNode = new ClassNode();
cr.accept(classNode, ClassReader.EXPAND_FRAMES);
MethodNode methodNode = classNode.methods.stream().filter(it -> it.name.equals("a")).findAny().get();

// 这两行是新增变量，同时加到变量表，但是不建议，因为变量表只用来调试，加入有可能有重名风险
LocalVariableNode newLocalVar = new LocalVariableNode("d", "D", null, new LabelNode(), new LabelNode(), methodNode.maxLocals);
methodNode.localVariables.add(newLocalVar);

InsnList newInsnList = new InsnList();
boolean first = true;
for (AbstractInsnNode instruction : methodNode.instructions) {
    if (instruction instanceof MethodInsnNode) {
        MethodInsnNode methodInsnNode = (MethodInsnNode) instruction;
        // 在方法的所有指令中，找到random函数调用的指令
        if (methodInsnNode.name.equals("random") &&methodInsnNode.owner.equals("java/lang/Math")) {
            if (first) {
                // 第一次运行的话，就添加到局部变量
                first = false;
                newInsnList.add(instruction);
                newInsnList.add(new InsnNode(DUP2));
                // 如果没有加入局部变量表的话，这里index直接取methodNode.maxLocals，加入多个依次+1 +2....
                newInsnList.add(new VarInsnNode(DSTORE, newLocalVar.index));
            } else {
                // 之后运行的话，就读取局部变量的值
                newInsnList.add(new VarInsnNode(DLOAD, newLocalVar.index));
            }
            continue;
        }
    }
    newInsnList.add(instruction);
}
// 这两行非必须，因为InsnNode是链表结构,只要第一个节点塞到newInsnList了，后面的都带过去了。
// random方法不可能是第一个节点，所以可以省略。否则记得加上这两行。
// methodNode.instructions.clear();  
// methodNode.instructions.add(newInsnList);
ClassWriter cw = new ClassWriter(ClassWriter.COMPUTE_FRAMES | ClassWriter.COMPUTE_MAXS);
classNode.accept(cw);
```
我们会发现`tree`提供了`ClassNode`类型，这也是一个`ClassVisitor`，他的作用和`ClassWriter`有点像，都是将所有的操作记录下来，只不过他的记录形式是一种面向对象的，树状的记录形式。在`ClassNode`中以对象的形式记录了当前类的各种信息，所以一般而言`asm-tree`的使用姿势，都是直接用一个空的`ClassNode`去遍历一个类（上面代码前三行），然后这个node中就有了当前类的所有信息；接下来对他进行一些处理；最后将修改完成的`classNode.accept(cw)`就写入`cw`了。

![img](https://i.imgur.com/tJTXbMK.png)

# 3 面对更复杂的场景
## 3.1 完善函数监控
上面有个打印函数耗时的例子，那么现在我们来完善这个功能，除了打印耗时之外，还需要
- 打印入参和返回值。
- 抛异常也要打印异常。

这里涉及到一个很复杂的场景，就是`try-catch`来嵌套原来的代码，并在`finally`中完成打印，我们先按照下图操作，

![img](https://i.imgur.com/tXFx3Yh.png)

发现`finally`太长了，有160行代码，我们简化成只有`try-catch`，这样的字节码会只有一个`tryCatchBlock`，分支会少一些，字节码更容易看懂，也少了10行。

![img](https://i.imgur.com/w2iJpo0.png)

那么接下来我们实现这个功能，