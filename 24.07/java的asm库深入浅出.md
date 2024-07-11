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


# 下面还没整理好-----
# 3 面对更复杂的场景
## 3.1 完善函数监控
上面有个打印函数耗时的例子，那么现在我们来完善这个功能，除了打印耗时之外，还需要
- 打印入参和返回值。
- 抛异常也要打印异常。

这里涉及到一个很复杂的场景，就是`try-catch`来嵌套原来的代码，并在`finally`中完成打印，我们先按照下图操作，

![img](https://i.imgur.com/tXFx3Yh.png)

发现`finally`太长了，有160行代码，我们简化成只有`try-catch`，这样的字节码会只有一个`tryCatchBlock`，分支会少一些，字节码更容易看懂，也少了10行。

![img](https://i.imgur.com/w2iJpo0.png)

那么接下来我们实现这个功能，我们可以使用`asm-tree`也可直接使用`core`的`visitor`，逻辑都是类似的，这里对于入参的处理`AdviceAdapter`中提供了方便的函数，所以我们选择用`core` + `AdviceAdapter`，这样代码会更精简一些。

我们拆开讲解三个部分，首先在函数进入的时候定义四个变量，`startTime` `params` `resultStr` `exceptionStr`，然后定义了几个`Label`，使用`visitTryCatchBlock`将`label`进行编排，成为`try-catch`代码块。需要注意的点：
- 变量一定记得初始化，即使是没有值，也要初始化一个NULL
- `loadArgArray`是`AdviceAdapter`内置的方法，可以点进去看一下实现，他会将参数包装成数组放在栈顶。
- `try-catch`的tryStart直接在这里开始，代表了`try {`这段代码。
- `visitTryCatchBlock`最后一个参数是异常类型，他会在`catchStart`这个`label`开始的时候，在栈顶塞入一个异常的对象，要记得处理。
```java
ClassReader cr = new ClassReader("com.example.demo.MyRunnable");
ClassWriter cw = new ClassWriter(ClassWriter.COMPUTE_FRAMES | ClassWriter.COMPUTE_MAXS);

cr.accept(new ClassVisitor(ASM9, cw) {
    @Override
    public MethodVisitor visitMethod(int access, String name, String descriptor, String signature, String[exceptions) {
        MethodVisitor mv = super.visitMethod(access, name, descriptor, signature, exceptions);
        if (name.equals("a")) {
            return new AdviceAdapter(ASM9, mv, access, name, descriptor) {
                int startTimeIndex;
                int paramsIndex;
                int resultStrIndex;
                int exceptionStrIndex;

                Label tryStart;
                Label tryEnd;
                Label catchStart;
                Label catchEnd;
                @Override
                protected void onMethodEnter() {
                    // 添加四个参数的初始化
                    startTimeIndex = newLocal(Type.LONG_TYPE);
                    mv.visitMethodInsn(INVOKESTATIC, "java/lang/System", "currentTimeMillis", "()J", false);
                    mv.visitVarInsn(LSTORE, startTimeIndex);

                    paramsIndex = newLocal(Type.getType("[java/lang/Object"));
                    loadArgArray();
                    mv.visitVarInsn(ASTORE, paramsIndex);

                    resultStrIndex = newLocal(Type.getType(String.class));
                    mv.visitInsn(ACONST_NULL);
                    mv.visitVarInsn(ASTORE, resultStrIndex);

                    exceptionStrIndex = newLocal(Type.getType(String.class));
                    mv.visitInsn(ACONST_NULL);
                    mv.visitVarInsn(ASTORE, exceptionStrIndex);

                    // 添加trycatch代码块，将原方法包裹到try，try-catch块可以提前定义，也可以最后定义，效果同
                    tryStart = new Label();
                    tryEnd = new Label();
                    catchStart = new Label();
                    catchEnd = new Label();
                    mv.visitTryCatchBlock(tryStart, tryEnd, catchStart, "java/lang/Throwable");

                    // try {
                    mv.visitLabel(tryStart);
                    super.onMethodEnter();
                }

                @Override
                protected void onMethodExit(int opcode) {
                    // 后面展开
                }

                @Override
                public void visitMaxs(final int maxStack, final int maxLocals) {
                    // 后面展开
                }
            };
        } else {
            return mv;
        }
    }
}, ClassReader.EXPAND_FRAMES);
```

接下来是第二部分`onMethodExit`函数退出时候的处理，注意`catch`的代码不是放到这里，之前我们说过`methodEnter`是只有一个进入的点，但是`methodExit`是可能有多个退出点的，不同的判断分支都可能`return`或`throw`，所以函数退出这里的主要逻辑，是记录正常`return`数据时候的返回值，我们采用`toString`方法来记录，这里需要注意的就是基础类型作为返回值的时候，是没法调用`toString`，须分别进行`box`装箱处理。
```java
@Override
protected void onMethodExit(int opcode) {
    if (opcode == ATHROW) {
        super.onMethodExit(opcode);
        return;
    }

    // 根据当前函数的描述符，解析返回值类型
    Type returnType = Type.getReturnType(descriptor);
    // 如果是基础类型，则box成对象类型，
    switch (returnType.getSort()) {
        // LONG/DOUBLE要dup2，因为占2帧
        case Type.DOUBLE:
        case Type.LONG:
            mv.visitInsn(DUP2);
            box(returnType);
            break;
        // 其他基础类型
        case Type.BOOLEAN:
        case Type.CHAR:
        case Type.INT:
        case Type.FLOAT:
        case Type.SHORT:
        case Type.BYTE:
            mv.visitInsn(DUP);
            box(returnType);
            break;
        // 除了基础类型就是void/对象类型了
        case Type.VOID:
            mv.visitInsn(Opcodes.ACONST_NULL);
        default:
            mv.visitInsn(DUP);
    }
    mv.visitMethodInsn(INVOKESTATIC, "java/lang/String", "valueOf", "(Ljava/lang/Object;)Ljava/lang/String;", false);
    mv.visitVarInsn(ASTORE, resultStrIndex);
    super.onMethodExit(opcode);
}
```
在`return/throw`函数退出之后，下一步的生命周期是到了`visitMaxs`，所以我们把`catch`的代码块放到这个钩子里。
```java
@Override
public void visitMaxs(final int maxStack, final int maxLocals) {
    mv.visitLabel(tryEnd);
    // } catch (Throwable e) {
    mv.visitLabel(catchStart);
    mv.visitInsn(DUP); //也可以直接dup(), 是adapter提供的简化版本
    mv.visitMethodInsn(INVOKESTATIC, "java/lang/String", "valueOf", "(Ljava/lang/Object;)Ljava/lang/String;", false);
    mv.visitVarInsn(ASTORE, exceptionStrIndex);
    //   System.out.printf
    mv.visitFieldInsn(GETSTATIC, "java/lang/System", "out", "Ljava/io/PrintStream;");
    //   第一个参数
    mv.visitLdcInsn("cost: %d, req: %s, res: %s, exp: %s%n");
    //   第二个参数 其实是个数组，需要挨着赋值，这段代码比较长；
    // new Object[4]
    push(4); // 这是ldc简化版函数封装
    mv.visitTypeInsn(ANEWARRAY, "java/lang/Object");

    // arr[0] = System.currentTimeMillis() - startTime
    dup();
    push(0);
    mv.visitMethodInsn(INVOKESTATIC, "java/lang/System", "currentTimeMillis", "()J", false);
    mv.visitVarInsn(LLOAD, startTimeIndex);
    mv.visitInsn(LSUB);
    mv.visitMethodInsn(INVOKESTATIC, "java/lang/Long", "valueOf", "(J)Ljava/lang/Long;", false);
    mv.visitInsn(AASTORE);
    // arr[1] = Arrays.toString(params)
    dup();
    push(1);
    mv.visitVarInsn(ALOAD, paramsIndex);
    mv.visitMethodInsn(INVOKESTATIC, "java/util/Arrays", "toString", "([Ljava/lang/Object;)Ljava/lang/String;", false);
    mv.visitInsn(AASTORE);
    // arr[2] = resultStr
    dup();
    push(2);
    mv.visitVarInsn(ALOAD, resultStrIndex);
    mv.visitInsn(AASTORE);

    // arr[3] = expStr
    dup();
    push(3);
    mv.visitVarInsn(ALOAD, exceptionStrIndex);
    mv.visitInsn(AASTORE);

    mv.visitMethodInsn(INVOKEVIRTUAL, "java/io/PrintStream", "printf", "(Ljava/lang/String;[Ljava/lang/Object;)Ljava/io/PrintStream;", false);
    pop();

    // 栈顶还剩一个exception，给他throw出去
    mv.visitInsn(ATHROW);
    mv.visitLabel(catchEnd);
    //}

    super.visitMaxs(maxStack, maxLocals);

}
```
![img](https://i.imgur.com/SHfXVcG.png)

生成代码没有问题，加载和运行也没有报错。

## 3.2 加密返回结果
现在有这样一个需求，是对某个返回值为`String`的函数进行增强，将返回结果进行加密后返回，加密函数是已经提供好的，假设是下面一段函数，当然实际可能是对称加密，这里只是一个demo.
```java
public class Demo {
    // 这是要增强的方法
    public String getSecret() {
        return UUID.randomUUID().toString();
        // 期望代码被改成
        // return encrypt(UUID.randomUUID().toString());
    }

    // 这是加密的函数
    public static String encrypt(String str) {
        for (int i = 0; i < 10; i++) {
            str = Base64.getEncoder().encodeToString(str.getBytes());
        }
        return str;
    }
}
```
同样使用`core` + `Adapter`，只需要在`Exit`的地方插入这个函数即可，以为该函数消耗掉栈顶原来的返回值，又把自己的返回值放到栈顶
```java
ClassReader cr = new ClassReader("com.example.demo.Demo");
ClassWriter cw = new ClassWriter(ClassWriter.COMPUTE_FRAMES | ClassWriter.COMPUTE_MAXS);

cr.accept(new ClassVisitor(ASM9, cw) {
    @Override
    public MethodVisitor visitMethod(int access, String name, String descriptor, String signature, String[] exceptions) {
        MethodVisitor mv = super.visitMethod(access, name, descriptor, signature, exceptions);
        if (name.equals("getSecret")) {
            return new AdviceAdapter(ASM9, mv, access, name, descriptor) {
                @Override
                protected void onMethodExit(int opcode) {
                    if (opcode == ATHROW) {
                        super.onMethodExit(opcode);
                        return;
                    }
                    mv.visitMethodInsn(INVOKESTATIC, "com/example/demo/Demo", "encrypt", "(Ljava/lang/String;)Ljava/lang/String;", false);
                    super.onMethodExit(opcode);
                }
            };
        } else {
            return mv;
        }
    }
}, ClassReader.EXPAND_FRAMES);
```
## 3.3 高阶！内连
现在我们想要修改一下3.2需求，我们想要实现内连，即把`encrypt`这个函数的内容，直接插入到`getSecret`方法中，而不是通过函数调用的方式。这就需要读取整个`encrypt`方法的所有指令，然后把这些指令搬到`getSecret`的`return`之前。此时需要将大片的指令进行复制，这种情况下用`core`直接实现的代码会比较复杂，可以想象一下如果还用上述代码方式，其结构大概如下，嵌套的`accept`，这样代码晦涩难懂，并且注释部分的代码会非常复杂。
```java
cr.accept(new ClassVisitor(ASM9, cw) {
    @Override
    public MethodVisitor visitMethod(int access, String name, String descriptor, String signature, String[] exceptions) {
        MethodVisitor outerMv = super.visitMethod(access, name, descriptor, signature, exceptions);
        if (name.equals("getSecret")) {
            return new AdviceAdapter(ASM9, outerMv, access, name, descriptor) {
                        
                @Override
                protected void onMethodExit(int opcode) {
                    if (opcode == ATHROW) {
                        super.onMethodExit(opcode);
                        return;
                    }
                    cr.accept(new ClassVisitor(ASM9){
                        @Override
                        public MethodVisitor visitMethod(int access, String name, String descriptor, String signature, String[] exceptions) {
                            if (name.equals("encrypt")) {
                                return new MethodVisitor(ASM9) {
                                    // 这里要重写所有的xxxInsn指令的hook 还有其他一些必须的hook try-catch等等
                                    // hook中运行，outerMv.xxxInsn() 
                                }
                            }
                            
                            return super.visitMethod(access, name, descriptor, signature, exceptions);
                        }
                    }, ClassReader.EXPAND_FRAMES);
                    super.onMethodExit(opcode);
                }
            };
        } else {
            return outerMv;
        }
    }
}, ClassReader.EXPAND_FRAMES);
```
要用到批量的搬家，那么用`tree`提供的`Node`就可以简化很多，因为他会把`method`的内容打包成`MethodNode`，我们只需要面向对象的操作`Node`，但是不得不提醒一下的是，内连操作可不是一个简单的操作。下面代码实现了当前这个函数的内连。主要思路是，用两个`ClassNode`把目标函数和加密函数所在的类读取出来，这里是同一个类；然后找到这俩方法`MethodNode`。

之后的主要想法就是把加密函数的指令`instructions`直接塞到目标函数的`ARETURN`指令前面，但是内连最大的问题是解决局部变量索引的冲突。即两个函数各自的局部变量都是从0开始的，我们要把加密函数自己的局部变量下标，排到目标函数的最后一个局部变量下标之后，有两类指令涉及到了局部变量的操作`Load/Store`存取相关的`VarInsn`指令，和`Int++`相关的`IincInsn`(注意long/short等，没有专门的++指令)。

处理好了变量索引之后，就需要把原函数返回值，映射成加密函数的第一个入参。这里的操作是，原函数返回值存到`maxLocals`也就是新增的一个局部变量上，而这个下标正好对应加密函数的入参，于是完成传递。
```java
ClassReader cr = new ClassReader("com.example.demo.Demo");
ClassWriter cw = new ClassWriter(ClassWriter.COMPUTE_FRAMES | ClassWriter.COMPUTE_MAXS);
ClassNode node1 = new ClassNode();
ClassNode node2 = new ClassNode();
cr.accept(node1, ClassReader.EXPAND_FRAMES);
cr.accept(node2, ClassReader.EXPAND_FRAMES);

// 找到这俩方法Node
MethodNode getSecretMethod = node1.methods.stream().filter(it->it.name.equals("getSecret")).findFirst().get();
MethodNode encryptMethod = node2.methods.stream().filter(it->it.name.equals("encrypt")).findFirst().get();

// getSecretMethod中变量序号 var_0（this） var_1 var_2 ... var_maxLocals-1
// encryptMethod中变量序号，因为static所以 0是入参var_0(params[0]) var1 var2...
// 需要对encrypt做映射 var_0 -> var_maxLocals, var_1 -> var_maxLocals+1 ....即增加一个偏移量
for (AbstractInsnNode instruction : encryptMethod.instructions) {
    if (instruction instanceof VarInsnNode) {
        ((VarInsnNode) instruction).var += getSecretMethod.maxLocals;
    } else if (instruction instanceof IincInsnNode) {
        ((IincInsnNode) instruction).var += getSecretMethod.maxLocals;
    }
}

// getSecretMethod中，需要把原来的返回值存到maxLocals这个变量中，对应上面代码，会成为内连代码的入参。
InsnList list = new InsnList();
for (AbstractInsnNode instruction : getSecretMethod.instructions) {
    if (instruction instanceof InsnNode && instruction.getOpcode() == ARETURN) {
        list.add(new VarInsnNode(ASTORE, getSecretMethod.maxLocals));
        list.add(encryptMethod.instructions);
    } else {
        list.add(instruction);
    }
}
// getSecretMethod.tryCatchBlocks.addAll(encryptMethod.tryCatchBlocks);
node1.accept(cw);
```
![img](https://i.imgur.com/IAKja9z.png)

内连最麻烦的就是局部变量和参数传递，上面代码已经把这部分处理好了，但是还不够完善，因为函数体中`Insn`虽说是最主要的，但是还有一个很重要的东西不能忽略，那就是`try-catch`，上面没有用到`try-catch`所以没有什么问题。

如果将`encrypt`函数修改如下，就会发现生成的代码有问题，这就是因为在复制方法内容的时候除了`insn`一定记得还要复制`tryCatch`

![img](https://i.imgur.com/R66evSx.png)

上面代码，增加如下这3行即可。
```java
if (encryptMethod.tryCatchBlocks != null) {
    getSecretMethod.tryCatchBlocks.addAll(encryptMethod.tryCatchBlocks);
}
```
![img](https://i.imgur.com/ds9ZwJF.png)

这里会有读者展开思考，`insn`和`trycatch`之外，`methodNode`中还有其他的诸多元素，不需要拷贝过来吗？

答案是不需要，其他的内容大部分是方法签名里的，想注解、入参信息，这些复制过来反而会导致目标方法损坏。另外有个局部变量的表，很多同学任务需要复制过来，但是实际上他只和`debug`调试相关，不影响代码运行，复制过来后如果有和目标函数刚好同名的局部变量的话，反而会带来一些困扰，干脆也不要复制过来。

## 3.4 子函数内连
现在重新准备`batchEncrypt`函数和`encrypt`函数如下，并且希望把加密函数内连到`batchEncrypt`目标函数，注意此时不再是返回值处进行内连，而是子函数调用的内连，这个内连就需要更深一步理解`asm`框架了。

![img](https://i.imgur.com/PP6mdyl.png)

与之前一样我们需要找到这两个`MethodNode`;因为这里可能要拷贝多次，并且`InsnNode`都是引用类型，并且是双向链表，直接拷贝过程中是可能会出现问题的，尤其是死循环问题，上面的内连的例子中我们直接用俩个`ClassNode`避开了这个问题，这里我们直面一下这个问题，即需要每个节点进行深拷贝。

`Node`深拷贝的步骤是调用`clone(Map<LabelNode,LabelNode>)`方法，这里就需要先提供一份`srcToTarget`的克隆前后的`Label`的map，所以我封装了函数`cloneLabels(encryptMethod.instructions);`先进行`label`的克隆，以辅助后续操作，注意这一步一定要提前执行，而不能运行时执行，因为有的`label`声明可能顺序靠后，导致某些`node.clone`出现空指针，总之按照我的代码步骤是没错的。

同时这里还需要注意，每个内连结束之后`curMaxLocals`都要进行一次`+= encryptMethod.maxLocals;`，这样下次内连的变量index就继续后移。
```java
ClassReader cr = new ClassReader("com.example.demo.Demo");
ClassWriter cw = new ClassWriter(ClassWriter.COMPUTE_FRAMES |ClassWriter.COMPUTE_MAXS);
ClassNode classNode = new ClassNode();
cr.accept(classNode, ClassReader.EXPAND_FRAMES);

// 找到这俩方法Node
MethodNode batchEncryptMethod = classNode.methods.stream().filter(it->it.name.equals("batchEncrypt")).findFirst().get();
MethodNode encryptMethod = classNode.methods.stream().filter(it->it.name.equals("encrypt")).findFirst().get();

InsnList list = new InsnList();
// 内连变量下标从maxLocals开始
int curMaxLocals = batchEncryptMethod.maxLocals;
for (AbstractInsnNode instruction : batchEncryptMethod.instructions) {
    if (instruction instanceof MethodInsnNode) {
        MethodInsnNode methodInsnNode = (MethodInsnNode) instruction;
        if (methodInsnNode.getOpcode() == INVOKESTATIC && methodInsnNode.name.equals("encrypt")) {
            // 要插入的encrypt的指令列表
            InsnList enList = new InsnList();
            // 先把栈顶的操作数，转换为局部变量，因为encrypt函数里是局部变量访问参数的
            transArgsToVars(methodInsnNode.desc, curMaxLocals, list);
            // 指令可能拷贝多份，所以需要用深拷贝，深拷贝的第一步是把label先拷贝一份。
            Map<LabelNode, LabelNode> labels = cloneLabels(encryptMethod.instructions);

            // 先存个null值作为结果
            enList.add(new InsnNode(ACONST_NULL));
            enList.add(new VarInsnNode(ASTORE, curMaxLocals + encryptMethod.maxLocals));
            // 这是主要的 拷贝逻辑
            for (AbstractInsnNode enInsn : encryptMethod.instructions) {
                // 对于return相关的指令直接删除，因为内连return会导致目标函数直接返回，只需要删除将return的值放到栈顶即可。
                if (enInsn instanceof InsnNode && enInsn.getOpcode() >= IRETURN && enInsn.getOpcode() <= RETURN) {
                    enList.add(new VarInsnNode(ASTORE, curMaxLocals + encryptMethod.maxLocals));
                    continue;
                }
                // 因为返回值要放到栈顶，抛出异常就打破结构了，只能吞了异常，放个默认值
                if (enInsn instanceof InsnNode && enInsn.getOpcode() == ATHROW) {
                    enList.add(new InsnNode(POP));
                    continue;
                }
                // 行号是不准的，有干扰，应该删掉
                if (enInsn instanceof LineNumberNode) {
                    continue;
                }
                if (enInsn instanceof LabelNode) {
                    LabelNode t = labels.get(enInsn);
                    enList.add(t);
                    continue;
                }
                // 变量序号的问题，需要将VarInsnNode IincInsnNode两类指令的，VarIndex修改
                if (enInsn instanceof VarInsnNode) {
                    VarInsnNode newInsn = (VarInsnNode)enInsn.clone(labels);
                    newInsn.var += curMaxLocals;
                    enList.add(newInsn);
                    continue;
                }
                if (enInsn instanceof IincInsnNode) {
                    IincInsnNode newInsn = (IincInsnNode)enInsn.clone(labels);
                    newInsn.var += curMaxLocals;
                    enList.add(newInsn);
                    continue;
                }
                // 其他直接添加深拷贝的节点。
                enList.add(enInsn.clone(labels));
            }
            enList.add(new VarInsnNode(ALOAD, curMaxLocals + encryptMethod.maxLocals));
            // 将enList加到目标list中
            list.add(enList);

            // 修改最大局部变量的数量，以备下次再次内连的时候
            curMaxLocals += encryptMethod.maxLocals + 1;
            if (encryptMethod.tryCatchBlocks != null) {
                batchEncryptMethod.tryCatchBlocks.addAll(encryptMethod.tryCatchBlocks.stream()
                        .map(b -> new TryCatchBlockNode(labels.get(b.start),
                                labels.get(b.end), labels.get(b.handler),
                                b.type))
                        .collect(Collectors.toList()));
            }
            continue;
        }
    }
    list.add(instruction);
}
batchEncryptMethod.instructions.clear();
batchEncryptMethod.instructions.add(list);

classNode.accept(cw);
```
上面代码依赖的两个函数实现，提一句`transArgsToVars`中变量的加载顺序是反的，因为栈顶是最后一个参数，依次往前的。
```java
private static void transArgsToVars(String desc, int curMaxLocals, InsnList enList) {
    Type[] argumentTypes = Type.getArgumentTypes(desc);
    // 栈是先入后出，把操作数栈上的入参赋值到局部变量
    for (int i = argumentTypes.length - 1; i >= 0; i--) {
        Type t = argumentTypes[i];
        switch (t.getSort()) {
            case Type.INT:
            case Type.SHORT:
            case Type.BYTE:
            case Type.BOOLEAN:
            case Type.CHAR:
                enList.add(new VarInsnNode(ISTORE, curMaxLocals + i));
                break;
            case Type.FLOAT:
                enList.add(new VarInsnNode(FSTORE, curMaxLocals + i));
                break;
            case Type.DOUBLE:
                enList.add(new VarInsnNode(DSTORE, curMaxLocals + i));
                break;
            case Type.LONG:
                enList.add(new VarInsnNode(LSTORE, curMaxLocals + i));
            break;
            case Type.ARRAY:
            case Type.OBJECT:
                enList.add(new VarInsnNode(ASTORE, curMaxLocals + i));
                break;
            default:
                throw new RuntimeException("Unsupport type");
        }
    }
}

private static Map<LabelNode, LabelNode> cloneLabels(InsnList instructions) {
    Map<LabelNode, LabelNode> labels = new HashMap<>();
    for (AbstractInsnNode enInsn : instructions) {
        if (enInsn instanceof LabelNode) {
            LabelNode cloned = new LabelNode();
            labels.put((LabelNode) enInsn, cloned);
        }
    }
    return labels;
}
```
![img](https://i.imgur.com/KP95mN4.png)

但是这里一定要注意，如果内连的函数有多个分支有返回值，或者有`try-catch`都会导致结构不合法。以最简单的`if`判断分支为例。通过上述代码增强后发现`if-else`会有问题，主要体现在在判断分支中进行`return`，因为我们把`return`的指令干掉了，`return`有立即停止代码后续运行的作用，直接删掉会导致分支`return`的逻辑错误，就像下面的，字节码本来是在`if(){}`中return的，因为我们把return干掉了，所以会继续往下运行。

![img](https://i.imgur.com/vto5gaK.png)

所以干掉`return`实现内连一定是有一些限制的，比如不能有多个返回的出口，不能有`try-catch`。

# 4 热替换字节码
我们学会了生成，修改字节码，他最大的作用是运行时热替换字节码，这要配合`Java Instrumentation`技术。就可以热修改字节码了，这部分在之前的文章中已经讲过。不在赘述。