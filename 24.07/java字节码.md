---
title: java字节码
date: 2024-07-09 23:38:00+8
tags:
    - java
    - 字节码
    - classFile
---
# 1 什么是字节码
`.class`文件的内容就是字节码，`jvm`定制了一套`class`文件规范，只要按照这个规范的文件就可以在`jvm`中被加载成`类`。

![img](https://i.imgur.com/SNQQFzw.png)

`class`文件与`elf`这种可执行文件一样，也是一种数据结构，或者说是一个结构体，只不过相比于`elf`来说，`class`文件要简单太多了，简单讲就是把我们的`java`代码给压缩了。通过`xxd`指令可以简单的看一下，`class`文件中的内容，这些字节数组就是字节码，整个文件满足`ClassFile`的结构规范。

![img](https://i.imgur.com/zxdXgW4.png)
# 2 类文件规范
`class file specification`类文件规范就是字节码规范，可以从`oracle Java SE Specifications`的文档中找到第四章，[链接](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html)，这部分是class文件的规范，url中`se21`是java21版本的规范，可以改成其他比如`se7`，你会发现class文件的整体结构变化不大，并且java有着非常变态的向前兼容性，java21能够兼容java1.0版本的class文件。

官网上来就贴出来了一张图，这张图至少从java7到21都没有变过，更早的文档不在这里维护了，不过可能也没变过，就是下面这张`ClassFile`的结构。

![img](https://i.imgur.com/N5Hn7Sy.png)

每个class文件都是满足这个结构体的。我们可以下载[jclasslib](https://github.com/ingokegel/jclasslib/releases)小工具或idea插件，打开后会发现在通用信息中，其实涵盖了`ClassFile`结构体的大部分字段，这些字段都是单层深度，没有嵌套。

![img](https://i.imgur.com/iBEIbvT.png)

插件的用法是，先`compile`之后，通过`view->Show Bytecode With Jclasslib`

![img](https://i.imgur.com/lqQ6x4Y.png)

一般信息中，涵盖了一个类的基础信息，对应了上面图片中单层结构的字段，即非数组的部分。这部分比较简单，有一些内定的值，比如
- 大版本号52对应java8,53是java9...
- 访问标识指类是`public/pravite`等。
- `this`和`parent`的类名，是用`/`分割的，而不是`.`。

剩下的部分在左侧栏，依次是`常量池` `实现的接口列表` `字段列表` `方法列表` `属性列表`
## 2.1 常量池
常量池一般是`ClassFile`结构体中最大的部分之一(方法也很大)，`cp_info`是每一种常量类型的结构体，如下，第一个字节是类型，后面是数据，每一种类型或者叫`tag`，对应的`info[]`的内容是不一样的。
```
cp_info {
    u1 tag;
    u1 info[];
}
```
主要的`tag`类型如下(这个其实不重要所有这些信息都可以从官方文档看到，只是简单列举一下)

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

这些类型中很多都是定长的，很容易定位，比如`Long` `Integer` `Float`等等，甚至`Class`这些基本也是定长的，虽然类名长度是不确定的，但是`Class_info`是定长3个字节，后面2个是个下标指向类名字符串的位置，最终会指向一个`CONSTANT_Utf8`。

![img](https://i.imgur.com/k2cY9P2.png)

![image](https://i.imgur.com/8lG0eIw.png)

`CONSTANT_Utf8`中有2个字节记录长度，如下，所以这样就能分割出每种结构了，要么是定长，变长的会有字段记录长度。

![img](https://i.imgur.com/ow9n3qJ.png)
## 2.2 接口
这部分是当前`class`实现的接口列表，`interfaces`部分的定义是个`u2[]`而不是字符串，每个`u2`是`cp_info`的一个下标指，即接口名也是作为字符串常量存储到常量池的。

如下，实现了`java.lang.Runnable`，这里存储的是下标4，指向的是常量池字符串`java/lang/Runnable`

![img](https://i.imgur.com/5HxZJNf.png)

## 2.3 字段
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

`attribute_info`是属性列表，这个暂时跳过，最后会简单提一下，属性非常多，每个java版本基本都会新增一些属性。
## 2.4 方法
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

与`field_info`的描述符格式不一致，函数的描述符是由`(入参)返回值`组成的，入参如果有多个，是并排的列出的并不需要任何符号隔开，例如`String test(int a, long b, String c)`的描述符就是`(IJLjava/lang/String;)Ljava/lang/String;`。而返回值部分除了正常的返回值类型的描述符，还增加了一种`V`是对`void`返回类型的描述。同时还需要注意有两个方法名是比较特殊的，一个是`<init>`指的是构造方法的方法名，还有一个是`<clinit>`是静态代码块组成的类初始化时候运行的方法。

此外，方法中都会有`code`这个属性，该属性中放置了方法的代码字节码，我们也放到属性部分再说。
## 2.5 属性
在`ClassFile`级别最后的部分是由属性`attributes`的，而上面的`field_info`和`class_info`中也是有`attributes`信息的，属性信息会有较大可扩展性，很多java新版本的特性想要扩展，那属性是一个很好的放置位置，以便于不改变整体的结构。属性部分是最复杂，在jdk21的规范中已经支持了30种属性结构了。

![img](https://i.imgur.com/pIQ1bYp.png)

这里我们不再对每一种属性都单独讲解了，官方文档有较为细致的解释，这里挑几个比较常见的。

### 2.5.1 ConstantValue
`ConstantValue`类型，只针对常量`static final`的`基础类型或字符串`的属性，在编译器赋值，而不是运行时，提高效率。

![img](https://i.imgur.com/ZNph83v.png)

### 2.5.2 Code
`Code`类型，函数体的内容，这个是非常重要的，尤其是后面学习`ASM`指令，一个类主要承载的功能，都反应在了`method`的`code`里，code类型的结构体非常复杂，我们可以直接看`jclasslib`给我们图形化展示之后的，以构造方法`<init>`为例，这段代码中，我们虽然没有写构造方法，但是默认也会有构造方法，默认的实现就是`super()`也就是调用父类的构造方法；此外我们还对字段进行了赋值所以有如下代码。

![img](https://i.imgur.com/fvyZVCe.png)

我们在下一节会详细展开介绍code中的不同指令。

### 2.5.3 Exception
`Exception`类型，函数中声明的抛出的异常，可以有多个。注意这里是声明的抛出的异常，不包含一些运行时的异常。

![img](https://i.imgur.com/W3ZETMA.png)

![img](https://i.imgur.com/ccMe6SI.png)

区分`Code异常表`和`Exception`属性：通过`try-catch`的异常会出现在`code异常表`。

![image](https://i.imgur.com/MF9D9cf.png)

### 2.5.4 LineNumberTable
`Code`属性中的一个属性，记录行号的，方便debug

### 2.5.5 LocalVariableTable
局部变量或者叫本地变量表，也是`Code`中的属性，记录本地变量的名字，比如方法中`int a = 100;`，`a`这个变量名字和变量索引的对应关系就会记录在局部变量表，这个也是debug方便的，与`LineNumberTable`一样，他俩即使删了，也不影响字节码运行。因为学`asm`的时候会看到这俩所以提一下。

![img](https://i.imgur.com/7eB2f6b.png)

### 2.5.6 Signature
`Signature`与泛型密切相关，虽然java的泛型在执行的时候会被擦除，但是这是为了兼容老版本的`java`，泛型信息其实还是被记录了下来，会被放置到这个属性中，例如`names`是个`List<String>`，他的字段信息中只有`List`没有泛型信息，但是`Signature`属性中，是有记录泛型信息的。

![img](https://i.imgur.com/b401ydy.png)

![img](https://i.imgur.com/H8aTpsZ.png)

# 3 函数Code中的指令
`ClassFile`的结构介绍完毕了，其中最最核心的部分其实没有展开，那就是函数的code部分的字节码。这里我们需要了解，操作数和操作数栈的概念：

`操作数`就是常见的变量例如基础类型和对象引用，我们的函数就是在操作这些操作数，如果想要操作他们，那么必须先进行`load`加载，加载会将操作数加载到一个栈的数据结构上，这个栈就是`操作数栈`。例如我们想要完成`a + b`这个操作，需要把a加载到栈，再把b加载到栈，然后运行加法操作。

我们看一下对应的字节码：

![image](https://i.imgur.com/YOGrKU6.png)

通过这个图，我们有了一个大概的概念，就是我们想要执行一个操作或者说一个行为，不管是加法操作还是函数调用操作还是其他操作，都需要先准备好要操作的数，比如这里的`a`和`b`要先load到栈上，然后执行`iadd`进行加法操作，操作会消耗掉栈顶特定个数的操作数，比如`iadd`是消耗两个，如果操作有返回，也会放置到栈顶。

接下来我们就需要了解一些常用的指令了，比如操作数需要`load`才能放置到栈顶，那么有哪些`load`指令呢？
## 3.1 load/push
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

## 3.2 store
上面`iload_1`是把本地变量1加载到栈顶，但是一开始没有存储本地变量1呢？所以是会先有一个存储的过程，这就是`store`指令了。
- `istore_{y}`把栈顶的`int`或`byte`或`char`或`boolean`或`short`类型消耗掉，存到本地变量y，y是数字。
- `lstore_{y}`把栈顶的`long`消耗，存到本地变量y。!!注意long占用两个栈帧，消耗掉两个栈顶的位置。
- `fstore_{y}`把栈顶的`float`消耗，存到本地变量y。
- `dstore_{y}`把栈顶的`double`消耗，存到本地变量y。!!注意double占用两个栈帧，消耗掉两个栈顶的位置。
- `astore_{y}`把栈顶的对象地址消耗，存到本地变量y。

## 3.3 return
`return`之后需要保证栈是空的，不然编译会验证不通过。
- `return`等于代码return，不消耗栈顶
- `ireturn`消耗栈顶一帧，返回一个`int`或`byte`或`char`或`boolean`或`short`类型
- `freturn`消耗栈顶一帧返回一个float
- `lreturn`消耗栈顶2帧返回一个long
- `dreturn`消耗栈顶2帧返回一个double
- `areturn`消耗栈顶一帧返回一个地址，即返回一个对象类型的内存地址

注意：`return`不一定是代码结束的地方，可能有判断分支有多个`return`语句，而且还有可能是`athrow`抛出异常。

## 3.4 pop/dup/new
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

`dup`还有一些变种，例如`dup_x1`效果是`[top-A-B]` => `[top-A-B-A]`，复制栈顶，但复制的位置是跳过一个。`dup_x2`同理还有什么`dup2_x1` `dup2_x2`，当然这几个指令都可以用`dup` `pop` `store` `load`实现，只不过这个效率更高。

此外`new`不能创建数组对象，数组比较特殊，有专门`newarray`基础类型数组，`anewarray`创建对象类型数组，`multianewarray`创建数组类型数组（多维）。

## 3.5 invoke
`invoke`是函数调用的指令，他主要有5种，
- `invokevirtual`普通的可访问的方法，需要依次把`对象`，`参数从左到右`放到栈顶。
- `invokestatic`静态方法，需要依次把`参数从左到右`放到栈顶。
- `invokespecial`特殊方法，构造方法，私有方法，父类中的方法，接口的default实现等，根据情况参考上面的操作数顺序。
- `invokeinterface`接口方法，栈顶操作数顺序参考上面。
- `invokedynamic`动态方法，一般是lambda表达式，栈顶操作数顺序参考上面。

## 3.6 基础运算
基础运算是加减乘除位运算等，`[iflda]`是代表类型，下面用`{t}`表示
- `{t}add` `{t}sub` `{t}mul` `{t}div` 栈顶俩数，加减乘除四则运算
- `{t}and` `{t}or`  `{t}xor` 栈顶俩数，与 或 异或，注意没有非门，非是通过和全1的值异或得到。
- `{t}shl` `{t}shr` `{t}shur` 左右移 无符号右移`<< >> >>>`，没有无符号左移，左移与符号本就无关。
- `{t}rem` 栈顶一个数，取余`%`
- `{t}neg` 栈顶一个数，取反`-a`
- `{t}2{t}` 基础类型转换
- `iinc` int特有的`++`操作符，其他类型没有

## 3.7 跳转相关
当出现流程控制的时候，字节码会变得复杂。例如`if(a>b) print("a>b"); else print("a<=b");`最基本的判断分支，单次执行只能走到一个分支，那就需要跳转。还是用`{t}`表示类型，用`{cond}`表示条件：`eq`等，`ne`不等，`lt` `le` `gt` `ge`小于、小于等于、大于、大于等于、
- `if_{t}cmp{cond} num` 比较栈顶两个数，是否满足`cond`，如果是则跳转到`num`指令。
- `if{cond} num` 直接判断栈顶一个数，是否满足`cond`，例如`ifeq`代表栈顶为0则跳转，`ifnq`是栈顶不为0跳转
- `goto num` 无脑跳转

这是条件分支的代码，满足`a<=b`跳转16行，否则继续往下执行，执行到`goto`直接跳转到24行`return`指令。

![img](https://i.imgur.com/Z9tsWLg.png)

这里不得不提一些`try-catch`，例如对上述代码套一层，看字节码会发现两个判断分支都会走到`24`指令，原来的24是`return`现在是`goto 36`，而后者其实就是`return`，所以看上去根本执行不到`24-36`之间的`catch`处理。

![img](https://i.imgur.com/YxjfQat.png)

其实`try-catch`是专门记录到`code`的异常表中的，上面提到过异常表和异常属性的区别。

![imag](https://i.imgur.com/GeRbzt2.png)

注意只需要记录`tryStart` `tryEnd` 和 `catchStart`，不需要记录`catchEnd`，因为`catch`中可以自己`goto`跳走，或`return/athrow`结束。

感兴趣的可以自己看下，如果是`try-catch-finally`会是怎样的字节码，要复杂很多。