---
title: java asm 深入浅出
date: 2024-07-03 22:29:00+8
tags:
    - java
    - asm
    - 字节码
---
没看上一篇[java字节码](./java字节码.md)，建议先看上一篇。没有字节码背景知识，本文基本不可能看懂。

在项目中引入，一起过一下各个实例。
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
# 1 asm的基础概念
`asm`有两个主要的库`asm-core`或者就叫`asm`库，这个是基础的能力。`asm-tree`基于`core`，更加结构化和面向对象。

`asm`整体设计基于`visitor`模式，就是扫描(visit)字节码的过程中，不同的阶段和不同的操作都会调用一些`hook`函数，类似`react`生命周期函数，这些函数默认是空操作，我们可以利用这些`hook`，执行一些逻辑，最终完成我们想要的效果。

`ClassReader`是读取字节码的类，使用这个类读取了字节码才能进行后续操作，他可以接收`类名`也可以接收`byte[]`作为参数。

## 1.1 ClassVisitor
一般而言，通过`ClassReader`读取一个类的字节码，然后需要用一个`ClassVisitor`来遍历字节码。下图是`visit`的顺序，这些visit函数都是在遍历过程中的`hook`钩子函数，比如刚开始遍历的时候就会触发钩子函数`visit(int,int,String,String,String,String[])`，这里的参数就是类的一些信息，

![img](https://i.imgur.com/SudwOP5.png)

遍历过程中返回`FieldVisitor` `MethodVisitor`等的，会用返回值进行递归遍历，整个流程如下：

![img](https://i.imgur.com/qNbQskt.png)


我们以`visit` `visitField` `visitMethod`和`visitEnd`为例，使用这四个hook在特定时间点打印一行日志。
```java
ClassReader cr = new ClassReader("com.example.demo.MyRunnable"); //使用ClassReader读取字节码
cr.accept(new ClassVisitor(ASM9) {
    @Override
    public void visit(int version, int access, String name, String signature, String superName, String[] interfaces) {
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
![img](https://i.imgur.com/1q715wO.png)
## 1.2 FieldVisitor
`FieldVisitor`他提供的钩子函数如下

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
## 1.3 MethodVisitor
最后我们来看一下`MethodVisitor`也是最重要的一个`visitor`，这个`visitor`中的`hook`非常多，大体可以拆成参数元数据相关，和代码相关的两部分，如下：

![img](https://i.imgur.com/yA4Zpfi.png)

使用如下代码：
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
## 1.4 Delegate
上面介绍了三种主要的`Visitor`会发现，他们除了有很多`visitXXX`的hook函数，还有个公共特点都有`getDelegate`函数，是返回另一个和自己同样类型的`Visitor`，这就是委托的设计理念。

当我定义`hook`函数的时候，默认的实现如下，`cv`就是委托者，即每个`VisitorA`里会嵌套另一个`VisitorB`。如果没有重写hook方法，默认的实现是会交给这个B，如果也没有B，就是啥也不干了。这个B，一般都是通过Visitor的构造方法的第二个参数传入的。
这种设计就是用组合的方式实现继承的效果了。

![img](https://i.imgur.com/Wz5CaFQ.png)

# 2 ClassWriter
`ClassWriter`是一个继承`ClassVisitor`的内置的类，这个`visitor`有些特殊，他会在`visit`的过程中，把所有visit的内容记录到内存中，最后通过`toByteArray`方法，可以把所以记录下来的信息转换成一个类的字节码。一个简单的例子，是直接用`cw`作为`visitor`就会记录下所有的字节码到内存，然后`write`到文件中，内容与原`class`文件是一致的。
```java
ClassReader cr = new ClassReader("com.example.demo.MyRunnable");
ClassWriter cw = new ClassWriter(0);
cr.accept(cw, 0);

OutputStream o = new FileOutputStream("XXX.class");
o.write(cw.toByteArray());
o.close();
```
![img](https://i.imgur.com/wgReKwV.png)

这是简单的复刻所有类的细节，因为类的所有信息都会被`visitxx`给捕捉，而所有的`visit`在`cw`中都是记录下来，最后转成`byte[]`字节码。那我们就可以基于这个稍微做一些字节码改造了。
## 2.1 删除方法
下面的各种修改我们都需要new一个`ClassVisitor`构造参数第二个把`cw(ClassWriter)`塞进来，上面提到过第二个构造参数是兜底用的，如果没有定义`visitXX`的实现，就会调用这个参数对应的方法，我们把`cw`塞进来，就可以实现我们没有操作的部分，都直接被`cw`记录下来。

下面删除方法`a`，我们只需要重写`visitMethod`，判断是`a`的返回空，其他所有情况不需要管，都会默认由`cw`兜底记录下来，最后生成字节码。
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
## 2.2 新增方法
新增方法，可以放到`visitEnd`中去实现，因为从前面流程图中，会发现`visitMethod`之后是`visitEnd`，所以可以在`visitEnd`的实现中，执行一次额外的`cw.visitMethod`，这样就保持了原来的`visit`顺序，并且成功增加了一个方法，例如我们新增一个`public void b() {System.out.println("b");}`，代码如下

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
我们来理解一下这段代码，在整个类结束之前，插入了这样一段代码，第一步`MethodVisitor mv = cw.visitMethod(ACC_PUBLIC, "b", "()V", null, null)`，`visitMethod`本来是由遍历过程中的特定时机下被动触发的，这里我们直接主动触发了。这是因为我们要新增这样一个方法，而触发`visitXXX`会被`cw`记录下来用于最终生成字节码。下面的`visitCode`等是一样的，本来是被动触发的，因为要主动write，所以改为了主动调用。

从`mv.visitCode`到`mv.visitEnd`是函数的代码部分，他跟上一篇讲的字节码指令完全对应，看过上一篇的很容易就理解这里的作用了。解释下为什么是`visitMaxs(2,1)`。
- 第一个参数是最大的操作数栈，因为最多的时候栈上有`System.out`和`"b"`两个操作数，所以这里设置2即可，当然设置3不报错，但是设置1就会校验不通过。
- 第二个参数1代表最大局部变量数，这里虽然没有设置过局部变量但是`this` `args`都会占用，虽然也没有入参但是this占1个。

最后的`super.visitEnd`是调用原来的，遍历结束，到此就结束了

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

因而如果不是极限的追求性能，可以交给`ASM`帮我们自动计算`maxs`和`frame`，如下图，此时`maxs`传0也不会报错，会自动计算，**但是不能删除这行代码**。
```java
ClassWriter cw = new ClassWriter(ClassWriter.COMPUTE_FRAMES | ClassWriter.COMPUTE_MAXS);
```
![img](https://i.imgur.com/NPzewgv.png)

我们接下来的代码都会使用`ClassWriter.COMPUTE_FRAMES | ClassWriter.COMPUTE_MAXS`这种write方式来避免一些验证性的问题。
## 2.3 修改（增强）方法
举一个常见的功能，在方法前后打印时间，然后相减计算方法的耗时。因为要引入新的局部变量，所以不能用默认的`压缩帧(compressed frame)`格式，而需要指定为`展开帧(expaned frame)`格式，前者字节码大小更紧凑，是基于前一帧的变化来维护的diff，后者则是每一个栈帧都是独立的描述自身内容，感兴趣的自行了解，这里只需要知道前者效率更高，但是没法添加局部变量，后者更适合我们去做字节码改动用。

我们接下来的代码也都会用这种read方式来避免一些验证性的问题，注意与上面write的位置是不一样的。
```java
cr.accept(xxx, ClassReader.EXPAND_FRAMES);
```
前后打印时间，然后相减得到函数运行时间。这是当前的思路，回顾`method`的浏览顺序，我们可以在`visitCode`的时候，植入计算当前时间存到变量`start`中。然后在`visitMax`之前植入再次计算当前时间，并减去`start`得到运行时长，最后打印。

下面的`visitMethodInsn`=`this.visitMethodInsn`=`mv.visitMethodInsn`=`originalMV.visitMethodInsn`，最后会委托给`originalMV`这个`MethodWriter`进行写入的。
```java
cr.accept(new ClassVisitor(ASM9, cw) {
    @Override
    public MethodVisitor visitMethod(int access, String name, String descriptor, String signature, String[] exceptions) {
        MethodVisitor originalMV = super.visitMethod(access, name, descriptor, signature, exceptions);
        if (name.equals("a")) { // 简单判断
            return new MethodVisitor(ASM9, originalMV) {
                // 变量序号，暂定100，不能和已有的冲突
                int startTimeVarIndex = 100;
                @Override
                public void visitCode() {
                    super.visitCode();
                    // 开始之后插入一段代码记录局部变量
                    visitMethodInsn(INVOKESTATIC, "java/lang/System", "currentTimeMillis", "()J", false);
                    visitVarInsn(LSTORE, startTimeVarIndex);
                }
                @Override
                public void visitInsn(int opcode) {
                    if (opcode == IRETURN) {
                        visitFieldInsn(GETSTATIC, "java/lang/System", "out", "Ljava/io/PrintStream;");
                        // return之前插入一段代码计算耗时
                        visitMethodInsn(INVOKESTATIC, "java/lang/System", "currentTimeMillis", "()J", false);
                        visitVarInsn(LLOAD, startTimeVarIndex);
                        visitInsn(LSUB);
                        visitMethodInsn(INVOKEVIRTUAL, "java/io/PrintStream", "println", "(J)V", false);
                    }
                    super.visitInsn(opcode);
                }
            };
        } else {
            return originalMV;
        }
    }
}, ClassReader.EXPAND_FRAMES);
```
这里代码结构很清晰，就是在进入的时候，和返回之前插入相应代码，得到的代码如下
```java
    public int a() {
        long var100 = System.currentTimeMillis();
        if (Math.random() > 0.5) {
            System.out.println(System.currentTimeMillis() - var100);
            return 1;
        } else if (Math.random() == 0.5) {
            System.out.println(System.currentTimeMillis() - var100);
            return 0;
        } else {
            System.out.println(System.currentTimeMillis() - var100);
            return -1;
        }
    }
```
这里需要解释几点：
- 1 `start`变量的下标是随便编的`100`，如果函数中已经有100，会出现问题，所以这个实现不好，我们下面会说别的。
- 2 为什么不在`vistMaxs`插入代码而要在`visitInsn`中判断是否是return，因为`visitMaxs`插入的代码已经是`return`之后，就走不到了。
## 2.4 借助Adapter
上面例子中，变量的下标100是有隐患的，为了解决这种代码增强的场景，在`asm-common`包中提供了几个`Adapter`尤其是`AdviceAdapter`可以简化我们的代码，帮我们处理一些细节，`AdviceAdapter`有多层继承关系，我们只需要知道他继承了`MethodVisitor`，如下。并且提供了额外的方法前和方法后的两个`hook`，其实就和前面我们的代码实现的能力一样。但`AdviceAdapter`中提供了非常多的便利的方法。

![img](https://i.imgur.com/t9OCOAi.png)

![img](https://i.imgur.com/q3rH3vD.png)

实现相同的打印函数耗时的功能，就改为这样↓，可以关注一下不同的地方。
```java {5}
public MethodVisitor visitMethod(int access, String name,
                                    String descriptor, String signature, String[] exceptions) {
    if (name.equals("a")) {
        MethodVisitor mv = cw.visitMethod(access, name, descriptor, signature, exceptions);
        return new AdviceAdapter(ASM9, mv, access, name, descriptor) {
            private int startTimeVarIndex;
            // 函数进入的时候，添加一行 long startTime = System.currentTimeMillis();
            @Override
            protected void onMethodEnter() {
                visitMethodInsn(INVOKESTATIC, "java/lang/System", "currentTimeMillis", "()J", false);
                startTimeVarIndex = newLocal(Type.LONG_TYPE);
                storeLocal(startTimeVarIndex); // 等价于 mv.visitVarInsn(LSTORE, startTimeVarIndex);
            }
            // 函数退出的时候，添加一行 System.out.println(System.currentTimeMillis() - startTime);
            @Override
            protected void onMethodExit(int opcode) {
                visitFieldInsn(GETSTATIC, "java/lang/System", "out", "Ljava/io/PrintStream;");
                visitMethodInsn(INVOKESTATIC, "java/lang/System", "currentTimeMillis", "()J", false);
                loadLocal(startTimeVarIndex);
                visitInsn(LSUB);
                visitMethodInsn(INVOKEVIRTUAL, "java/io/PrintStream", "println", "(J)V", false);
            }
        };
    }
    return super.visitMethod(access, name, descriptor, signature, exceptions);
}
```
这段代码与之前效果完全一样，但是我们注意到`startTimeVarIndex`不需要猜一个值，而是用`newLocal`内置方法，他会自动计算当前的变量的个数给一个新的值。此外对于一些变量加载和存储也提供了更简洁的写法`storeLocal/loadLocal`，当然了你也可以用原来的写法，毕竟这是继承`MethodVisitor`类的。我们也不需要像原来一样运行`super.end()`这个很容易漏掉的代码，这里可以省略了。而且也不需要判断`IRETURN`了。

编译后结果如下`var100`成了`var1`，因为`newLocal`发现只有下标可以直接用1.
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
`onMethodExit`代表方法退出，一般有两种退出形式`return/athrow`，多个退出的出口，如上代码有多个判断分支都可以退出。可以看出不同的条件分支的`return`之前都会被插入这段代码，他其实是每次调用`ireturn`或者`athrow`之前都会调用的。

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

## 2.5 从0创建一个类
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
# 3 asm-tree
上面的`visitor`是`asm`包或者叫`asm-core`包提供的核心能力，他为一切的解析重写提供了最基础的支持。`asm-tree`包也在上面`asm-common`中接引用了，他基于核心 `asm` 包，提供了一种结构化的、基于树的字节码表示方法。`core`中是以`visitor`模式作为主心骨，对于拆分的较细，`tree`则是以`Node`为组织方式，更加面向对象。

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

如果把所有的代码指令都抽象成一个对象，整个method就是一个指令的`List`，那我们只需要找到要修改的指令，在他的前后进行插入和修改即可。这就是`tree`给我们提供的`Node`，下面是实现相同功能的代码，下面代码中我们直接使用`ClassNode`这个`ClassVisitor`来获取类中的所有信息，并且结构化，他与`ClassWriter`有点像，都是遍历所有信息记录下来，只不过记录的是结构化信息，而`ClassWriter`记录下来是为了之后转`byte[]`。

在`ClassNode`中包含了这个类的所有信息，基础信息、列信息、方法信息等等，方法信息是存到`MethodNode`中，而`MethodNode`又有`instructions`属性是一个链表存储了`AbstractInsnNode`，即所有的指令信息，可以看出层层封装，确实是包揽了整个类的所有信息。

![img](https://i.imgur.com/tJTXbMK.png)

```java
// 用tree提供的MethodNode，可以记录整个method的信息，面向对象的处理问题
ClassNode classNode = new ClassNode();
cr.accept(classNode, ClassReader.EXPAND_FRAMES);
MethodNode methodNode = classNode.methods.stream().filter(it -> it.name.equals("a")).findAny().get();

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
                // methodNode.maxLocals是当前局部变量数量，那么下一个的下标就是他
                newInsnList.add(new VarInsnNode(DSTORE, methodNode.maxLocals));
            } else {
                // 之后运行的话，就读取局部变量的值
                newInsnList.add(new VarInsnNode(DLOAD, methodNode.maxLocals));
            }
            continue;
        }
    }
    newInsnList.add(instruction);
}
methodNode.instructions.clear();  
methodNode.instructions.add(newInsnList);
ClassWriter cw = new ClassWriter(ClassWriter.COMPUTE_FRAMES | ClassWriter.COMPUTE_MAXS);
classNode.accept(cw);
```
这种编程方式，逻辑和代码量差不多，但是面向对象的方式，会更容易理解，这里可以动手自己用`tree`的写法，重写一下前面打印耗时的函数。
## 3.1 面向对象解决复杂场景
这里介绍一个高阶场景，函数内连。
### 3.1.1 简单内连
例如`ByteBuddy`，允许我们使用注解`@Advice.OnMethodEnter`将一段静态函数的内容插入到函数运行之前。这里函数必须是静态的，不能有`this`的上下文依赖，是一个无状态函数。这个函数的代码会被内连到原函数的开头。
```java
public static class ExampleAdvice {
    @Advice.OnMethodEnter
    public static void onEnter() {
        System.out.println("Enter");
    }
}
```
内连的意思是原函数`target()`第一行是`System.out.println("Enter");`而不是`ExampleAdvice.onEnter`，即把代码插入进去了。这种静态的无入参无返回值的函数内敛，是最简单的，思考一下，使用`ASM`只需要第一步把`onEnter`函数的字节码中`RETURN`指令删掉，第二步处理好局部变量下标，然后指令塞到函数开头即可。这里注意与之前直接插入指令不同的是，这里插入的是另一个函数的全部指令。
```java
// 准备这样一个要插入的代码
public class Demo {
    public static void enter() {
        int a = 100;
        System.out.println("method inter a = " + a);
    }
}
```
接下来我们把上面这段代码插入到`a`方法的开始，分别用`tree`和`core`的写法：
```java
// tree写法

// 先封装一个获取ClassNode的函数
public static ClassNode getMethod(String className) throws IOException {
    ClassReader cr = new ClassReader(className);
    ClassNode classNode = new ClassNode();
    cr.accept(classNode, ClassReader.EXPAND_FRAMES);
    return classNode;
}

public static void main(String[] args) {
    ClassNode demo = getMethod("com.example.demo.Demo");
    ClassNode myRunnable = getMethod("com.example.demo.MyRunnable");

    MethodNode enterMethod = demo.methods.stream().filter(m -> m.name.equals("enter")).findFirst().get();
    MethodNode aMethod = myRunnable.methods.stream().filter(m -> m.name.equals("a")).findFirst().get();

    InsnList list = new InsnList();
    LabelNode insertFinish = new LabelNode();
    for (AbstractInsnNode instruction : enterMethod.instructions) {
        // 细节1：行号是demo函数的对目标函数没有用
        if (instruction instanceof LineNumberNode) continue;
        // 细节2：return会导致目标函数提前返回，需要删掉换成GOTO指令
        if (instruction.getOpcode()==RETURN) {
            list.add(new JumpInsnNode(GOTO, insertFinish));
            continue;
        }
        // 细节3：局部变量的下标在demo和a中都是从0开始就冲突了，demo中改为从a.maxLocals开始
        if (instruction instanceof VarInsnNode) {
            VarInsnNode varInsnNode = (VarInsnNode) instruction;
            varInsnNode.var += aMethod.maxLocals;
        }
        // 细节4：除了VarInsnNode还有个指令也会访问局部变量下标
        if (instruction instanceof IincInsnNode) {
            IincInsnNode insnNode = (IincInsnNode) instruction;
            insnNode.var += aMethod.maxLocals;
        }
        list.add(instruction);
    }
    // 细节5：插入结束的label
    list.add(insertFinish);
    // 细节6：把这些指令放到原来的a方法指令之前
    aMethod.instructions.insertBefore(aMethod.instructions.getFirst(), list);
    // 细节7：tryCatch代码块不是指令，需要专门添加过来
    aMethod.tryCatchBlocks.addAll(enterMethod.tryCatchBlocks);
    ClassWriter cw = new ClassWriter(ClassWriter.COMPUTE_FRAMES | ClassWriter.COMPUTE_MAXS);
    myRunnable.accept(cw);
}
```
上面7个细节每一个都非常重要，必不可少，尤其是for循环中的四个，需要对这四种指令加工。`MethodNode`中code相关的除了`insn`和`trycatch`其实还有一项是`localVariable`，这个不需要复制过来，他跟行号类似，都是debug的，复制过来反而导致混乱或冲突。

接下来用`core`写法复刻相同的效果，同样要注意这7个细节，但是代码多了很多，因为要对指定的多种`visit`都进行处理，这个例子就充分展现出了，如果是批量替换代码块场景下，`tree`的面向对象写法更加简洁的优势了。
```java
ClassReader demoCr = new ClassReader("com.example.demo.Demo");
ClassReader runnableCr = new ClassReader("com.example.demo.MyRunnable");
ClassWriter cw = new ClassWriter(ClassWriter.COMPUTE_FRAMES|ClassWriter.COMPUTE_MAXS);
runnableCr.accept(new ClassVisitor(ASM9, cw) {
    @Override
    public MethodVisitor visitMethod(int access, String name, String descriptor, String signature, String[] exceptions) {
        MethodVisitor methodVisitor = super.visitMethod(access, name, descriptor, signature, exceptions);
        if (!name.equals("a")) return methodVisitor;
        return new AdviceAdapter(ASM9, methodVisitor, access, name, descriptor) {
            // 找到a方法，在方法进入的时候插入demo方法代码
            @Override
            protected void onMethodEnter() {
                // 这时候再去找enter方法
                demoCr.accept(new ClassVisitor(ASM9) {
                    // 同样关注7个细节
                    @Override
                    public MethodVisitor visitMethod(int access, String name, String descriptor, String signature, String[] exceptions) {
                        MethodVisitor _t = super.visitMethod(access, name, descriptor, signature, exceptions);
                        if (!name.equals("enter")) return _t;

                        Label finishInject = new Label();
                        MethodVisitor innerMv =  new MethodVisitor(ASM9) {
                            // 细节1：行号是demo函数的对目标函数没有用，所以不去管visitLineNumber方法。
                            @Override
                            public void visitFrame(int type, int numLocal, Object[] local, int numStack, Object[] stack) {methodVisitor.visitFrame(type, numLocal, local, numStack, stack);}
                            @Override
                            public void visitInsn(int opcode) {
                                // 细节2：return会导致目标函数提前返回，需要删掉换成GOTO指令
                                if (opcode == RETURN) methodVisitor.visitJumpInsn(GOTO, finishInject);
                                else methodVisitor.visitInsn(opcode);}

                            @Override
                            public void visitIntInsn(int opcode, int operand) {
                                methodVisitor.visitIntInsn(opcode, operand);
                            }

                            // 细节3：局部变量的下标在demo和a中都是从0开始就冲突了，demo中改为从a.maxLocals开始，上一级的nextLocal就是maxLocals
                            @Override
                            public void visitVarInsn(int opcode, int varIndex) {
                                methodVisitor.visitVarInsn(opcode, varIndex + nextLocal);
                            }

                            @Override
                            public void visitTypeInsn(int opcode, String type) {
                                methodVisitor.visitTypeInsn(opcode, type);
                            }

                            @Override
                            public void visitFieldInsn(int opcode, String owner, String name, String descriptor) {
                                methodVisitor.visitFieldInsn(opcode, owner, name, descriptor);
                            }

                            @Override
                            public void visitMethodInsn(int opcode, String owner, String name, String descriptor) {
                                methodVisitor.visitMethodInsn(opcode, owner, name, descriptor);
                            }

                            @Override
                            public void visitMethodInsn(int opcode, String owner, String name, String descriptorboolean isInterface) {
                                        methodVisitor.visitMethodInsn(opcode, owner, name, descriptor, isInterface);
                            }

                            @Override
                            public void visitInvokeDynamicInsn(String name, String descriptor, HandlbootstrapMethodHandle, Object... bootstrapMethodArguments) {
                                methodVisitor.visitInvokeDynamicInsn(name, descriptor, bootstrapMethodHandle, bootstrapMethodArguments);
                            }

                            @Override
                            public void visitJumpInsn(int opcode, Label label) {
                                methodVisitor.visitJumpInsn(opcode, label);
                            }

                            @Override
                            public void visitLabel(Label label) {
                                methodVisitor.visitLabel(label);
                            }

                            @Override
                            public void visitLdcInsn(Object value) {
                                methodVisitor.visitLdcInsn(value);
                            }
                            // 细节4：除了VarInsn还有IincInsn指令也会访问局部变量下标
                            @Override
                            public void visitIincInsn(int varIndex, int increment) {
                                methodVisitor.visitIincInsn(varIndex + nextLocal, increment);
                            }

                            @Override
                            public void visitTableSwitchInsn(int min, int max, Label dflt, Label... labels) {
                                methodVisitor.visitTableSwitchInsn(min, max, dflt, labels);
                            }

                            @Override
                            public void visitLookupSwitchInsn(Label dflt, int[] keys, Label[] labels) {
                                methodVisitor.visitLookupSwitchInsn(dflt, keys, labels);
                            }

                            @Override
                            public void visitMultiANewArrayInsn(String descriptor, int numDimensions) {
                                methodVisitor.visitMultiANewArrayInsn(descriptor, numDimensions);
                            }

                            @Override
                            public AnnotationVisitor visitInsnAnnotation(int typeRef, TypePath typePath, Strindescriptor, boolean visible) {
                                return methodVisitor.visitInsnAnnotation(typeRef, typePath, descriptor, visible);
                            }
                            // 细节7：tryCatch
                            @Override
                            public void visitTryCatchBlock(Label start, Label end, Label handler, String type) {
                                methodVisitor.visitTryCatchBlock(start, end, handler, type);
                            }
                            // 细节7：tryCatch
                            @Override
                            public AnnotationVisitor visitTryCatchAnnotation(int typeRef, TypePath typePath, Strindescriptor, boolean visible) {
                                return methodVisitor.visitTryCatchAnnotation(typeRef, typePath, descriptor, visible);
                            }

                            @Override
                            public void visitMaxs(int maxStack, int maxLocals) {
                                super.visitMaxs(maxStack, maxLocals);
                                // 细节5：插入结束的label
                                methodVisitor.visitLabel(finishInject);
                            }
                        };
                        return innerMv;
                    }
                }, ClassReader.EXPAND_FRAMES);
                // 细节6：把这些指令放到原来的a方法指令之前，因为当前在onMethodEnter中，所以就是在其他指令之前。
            }
        };
    }
}, ClassReader.EXPAND_FRAMES);

byte[] codes = cw.toByteArray();
```
### 3.1.2 高阶内连
上面的内连较为简单，使用`tree`注意好细节，代码总体并不复杂，代码行数也不多。接下来介绍我认为最麻烦的一种场景，任意子函数内连/替换。上面的例子是一种简单的内连，因为他有很多限制，内连插入的函数是`static`的，入参是`()`，返回值是`V`，并且只插入一次，这无形中都简化了内连的操作。

假如现在有一个类`A`如下，有静态方法`mul`乘法功能，还有普通方法`add`加法功能，现在想要把这两个函数内连到`main`中。
```java :A.java
public class A {
    public static void main(String[] args) {
        long a = 100L;
        double b = 100.0;
        System.out.println("a + b = " + new A().add((int) a, (int)b));
        System.out.println("a + b = " + new A().add((int) a, (int)b));
        System.out.println("a x b = " + A.mul(a, b));
        System.out.println("a x b = " + A.mul(a, b));
    }

    public int add(int a, int b) {
        return a + b;
    }

    public static double mul(double a, double b) {
        return a * b;
    }
}
```
说一下思路，这里只用`tree`形式，因为`core`形式代码太长了。

首先还是将`A`读成`ClassNode`从这里面可以过滤出`main` `add` `mul`三个methodNode。
```java
ClassReader cr = new ClassReader("com.example.demo.A");
ClassNode classNode = new ClassNode();
cr.accept(classNode, ClassReader.EXPAND_FRAMES);

MethodNode mainMethod = classNode.methods.stream().filter(it -> it.name.equals("main")).findFirst().get();
MethodNode addMethod = classNode.methods.stream().filter(it -> it.name.equals("add")).findFirst().get();
MethodNode mulMethod = classNode.methods.stream().filter(it -> it.name.equals("mul")).findFirst().get();
```
然后在`mainMehod`的指令中找到调用`add` `mul`的`MethodInsnNode`指令，需要把这个指令替换成`add/mul`中的代码。
```java
InsnList finalList = new InsnList();
int curMaxLocals = mainMethod.maxLocals;
for (AbstractInsnNode instruction : mainMethod.instructions) {
    MethodInsnNode mnode = null;
    // 不是add mul的函数调用就保持原样
    if (! (instruction instanceof MethodInsnNode) || (!(mnode = (MethodInsnNode) instruction).name.equals("add")
            && !mnode.name.equals("mul"))) {
        finalList.add(instruction);
        continue;
    }
    boolean isStatic = mnode.getOpcode() == INVOKESTATIC;
    if (mnode.name.equals("add")) {
        // ------------然后添加方法的指令，与之前不同的是这次需要深拷贝，需要先复制Label
        Map<LabelNode, LabelNode> labelMap = cloneLabels(addMethod.instructions);
        finalList.add(generateInsnList(addMethod, isStatic, curMaxLocals, labelMap));
        curMaxLocals += addMethod.maxLocals;
        addMethod.tryCatchBlocks.forEach(it-> mainMethod.tryCatchBlocks.add(
                new TryCatchBlockNode(labelMap.get(it.start),
                    labelMap.get(it.end), labelMap.get(it.handler), it.type)));
    }  else if (mnode.name.equals("mul")) {
        Map<LabelNode, LabelNode> labelMap = cloneLabels(mulMethod.instructions);
        finalList.add(generateInsnList(mulMethod, isStatic, curMaxLocals, labelMap));
        curMaxLocals += mulMethod.maxLocals;
        mulMethod.tryCatchBlocks.forEach(it-> mainMethod.tryCatchBlocks.add(
                new TryCatchBlockNode(labelMap.get(it.start),
                        labelMap.get(it.end), labelMap.get(it.handler), it.type)));
    }
}
```
在`generateInsnList`中，除了要插入的方法节点`MethodNode`，我们还需要3个信息`isStatic`和`curMaxLocals`和`labelMap`，是因为静态方法的参数是从下标0开始的，而非静态是下标1，是有区别的。而当前局部变量最大个数，会是要插入的方法中的局部变量下标需要增加的便宜量。

除了之前提到的细节，这里额外还要注意两个非常重要的细节。一个是不能直接把`addMethod`中的节点添加过来了，因为`InsnNode`是链表结构的，如果添加两次，如这里有两次`add`函数调用，第二次添加就会把第一次的直接从原来的位置摘下来，放到当前位置，所以需要`clone`一份节点来插入，而`clone`就需要先把`Label`克隆一遍，因为有的节点如`JumpXX` `TryCatchBlock`等，都有`Label`属性，得先把基础的`Label`节点复制一份，才能复制别的节点。这是原来只插入一次不需要考虑的。

另一个细节就是，入参和返回值问题。函数调用时候，如果是静态函数此时操作数栈是放每个入参，非静态的话则还多一个`this`对象，但是函数的代码本身进入函数的时候，栈是空的，变量是通过`var0=this` `var1=第一个入参`（如果是静态方法则`var0=第一个入参`） ...这种方式来读取的，所以要插入函数代码之前，还需要把栈上的操作数，赋值到局部变量中来，并且局部变量不能从0开始了，这是之前说过的细节。
```java
private static Map<LabelNode, LabelNode> cloneLabels(InsnList instructions) {
    Map<LabelNode, LabelNode> labels = new HashMap<>();
    for (AbstractInsnNode enInsn : instructions) {
        if (enInsn instanceof LabelNode) {
            LabelNode cloned = new LabelNode();
            labels.putIfAbsent((LabelNode) enInsn, cloned);
        }
    }
    return labels;
}

private static InsnList generateInsnList(MethodNode methodNode, boolean isStatic, 
        int offset, Map<LabelNode, LabelNode> labelMap) {
    InsnList insnList = new InsnList();
    Type[] paramTypes = Type.getArgumentTypes(methodNode.desc);
    Type returnType = Type.getReturnType(methodNode.desc);
    // ------------把栈上的操作数==>局部变量，且下标有offset偏移量-------------
    stackToLocalVariable(isStatic, paramTypes, offset, insnList);
    LabelNode finishInject = new LabelNode();
    // 然后指令添加的时候，要使用clone之后的节点，不要用原节点
    for (AbstractInsnNode instruction : methodNode.instructions) {
        // 行号不要，return的直接跳转到结束
        if (instruction instanceof LineNumberNode) continue;
        if (instruction.getOpcode() >= IRETURN && instruction.getOpcode() <= RETURN) {
            insnList.add(new JumpInsnNode(GOTO, finishInject));
            continue;
        }
        // 变量相关的序号增加偏移量
        if (instruction instanceof VarInsnNode) {
            VarInsnNode newNode = (VarInsnNode) instruction.clone(labelMap);
            newNode.var += offset;
            insnList.add(newNode);
            continue;
        }
        if (instruction instanceof IincInsnNode) {
            IincInsnNode newNode = (IincInsnNode) instruction.clone(labelMap);
            newNode.var += offset;
            insnList.add(newNode);
            continue;
        }
        insnList.add(instruction.clone(labelMap));
    }
    insnList.add(finishInject);
    return insnList;
}
```
`stackToLocalVariable`这个方法很重要，他把栈顶的操作数放到局部变量中，伪装成方法开始时候的样子，对于静态和非静态方法也有不同的处理，如下。
```java
private static void stackToLocalVariable(boolean isStatic, Type[] paramTypes, int offset, InsnList targetList) {
    // 先计算每个变量的新的index，long/double会占用两个变量下标
    int[] indexes = new int[paramTypes.length];
    // 静态方法的话就从offset开始，否则this是offset，arg1是offset+1
    indexes[0] = offset + (isStatic ? 0 : 1);
    int preSize = paramTypes[0].getSize();
    for (int i = 1; i < indexes.length; i++) {
        indexes[i] = indexes[i - 1] + preSize;
    }
    // 把栈挨着弹出来赋值到局部变量，注意栈是倒叙的弹出
    for (int i = indexes.length - 1; i >= 0; i--) {
        Type t = paramTypes[i];
        switch (t.getSort()) {
            case Type.BOOLEAN: case Type.CHAR: case Type.BYTE: case Type.SHORT:
            case Type.INT:
                targetList.add(new VarInsnNode(ISTORE, indexes[i]));break;
            case Type.FLOAT:
                targetList.add(new VarInsnNode(FSTORE, indexes[i]));break;
            case Type.DOUBLE:
                targetList.add(new VarInsnNode(DSTORE, indexes[i])); break;
            case Type.LONG:
                targetList.add(new VarInsnNode(LSTORE, indexes[i])); break;
            case Type.ARRAY:
            case Type.OBJECT:
                targetList.add(new VarInsnNode(ASTORE, indexes[i])); break;
            default:
                throw new IllegalArgumentException("error arg type");
        }
    }
    // 还要把this弹出
    if (!isStatic) {
        targetList.add(new VarInsnNode(ASTORE, offset));
    }
}
```
加载并运行`main`函数
```java
ClassLoader cl = getClass().getClassLoader();
Method define = ClassLoader.class.getDeclaredMethod("defineClass",
        byte[].class, int.class, int.class);

define.setAccessible(true);
Class<?> c = (Class<?>) define.invoke(cl, codes, 0, codes.length);
c.getDeclaredMethod("main", String[].class).invoke(null, (Object) new String[0]);
/*
a + b = 200
a + b = 200
a x b = 10000.0
a x b = 10000.0
*/
```
将这个字节码保存到文件，反编译后与源码进行对比如下，确实实现了想要的功能。

![image](https://i.imgur.com/FCjGKsZ.png)

到此我们还可以再往前一步，替换方法内容进行内连，例如`add`方法，我直接改成另一个函数`int myAdd(int a, int b) {return a * 20 + b * 10;}`。我们需要做的就是，将上面代码`addMethod`改成获取`myAdd`这个方法就行了，只要是有相同的入参返回值，我们就可以直接替换掉。

# 4 小结
`ASM`写的过程中经常出现，某个简单场景下测试通过没问题了，但是另一个场景下就不好使了的情况，就是因为没有覆盖到各种情况。列出一些可能一开始没考虑到的情况。
- `double/long`占两个栈帧，作为入参的话会占用两个局部变量空间，`pop`和`dup`都是专门的`pop2` `dup2`。
- `ARRAY`是一种专门的类型，虽然本质是对象类型，但是因为比较特殊所以数组有专门的指令和类型。
- `String...`这种变长入参，字节码层面是当做`String[]`，不要真当变长入参了。
- `if`判断分支都有可能`return`，这也就是上面判断是return，不能直接跳过这个指令，而是要加`JUMP`跳转到结束。
- `try-catch-block`不是insn所以经常忘记复制，如果一开始测试刚好没测`catch`，后面遇到了就会发现不对劲。