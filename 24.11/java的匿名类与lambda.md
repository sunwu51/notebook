---
title: java的匿名类与lambda
date: 2024-11-09 13:23:03+8
tages:
    - java
    - 匿名类
    - lambda
---
在学习java字节码的时候，会发现两个神奇的现象：
- 1 java匿名类，会在编译期创建一个类似`宿主类名$1.class`这样的文件，并且如果要用`instrumentation`去替换原始类的时候，会发现如果新加了匿名类是不允许的。
- 2 lambda的代码是不会在编译期生成匿名类的文件的，它使用的是`invokeDynamic`字节码指令。

![image](https://i.imgur.com/v1DyHHv.png)

匿名类比较简单，从字节码来看他就是个内部类。

![image](https://i.imgur.com/zAZlTWw.png)

但lambda就复杂了，在字节码中会发现3个不同，首先是多了一个`private static`的`lambda$宿主方法名$0`这样的方法，这个方法的返回值类型就是`lambda`返回值类型。第二就是也有一个`innerClass`但是这个内部类并不是`宿主类名$1`后面会讲。第三个就是`BootstrapMethods`引导方法，他的主要作用就是配合`invokeDynamic`来找到动态调用点。

![image](https://i.imgur.com/piZ0ozw.png)

# 匿名类
下面我们详细看一下匿名类，下面是一个会从上下文中捕捉变量的匿名类，他更具有代表性。
```java :Anonymous.java
public class Anonymous {
    private static int field = 10;
    public static void main(String[] args) {
        int i = 1;
        Runnable r = new Runnable() {
            @Override
            public void run() {
                System.out.println(i + field);
            }
        };
        r.run(); // 打印11
    }
}
```
上面已经初步介绍了匿名类是编译期生成`class`文件的，我们看一下上面这段代码对应的字节码
```bytecode
public class test/Anonymous {

  // compiled from: Anonymous.java
  // access flags 0x8
  static INNERCLASS test/Anonymous$1 null null

  // access flags 0xA
  private static I field

  // access flags 0x1
  public <init>()V
   L0
    LINENUMBER 3 L0
    ALOAD 0
    INVOKESPECIAL java/lang/Object.<init> ()V
    RETURN
   L1
    LOCALVARIABLE this Ltest/Anonymous; L0 L1 0
    MAXSTACK = 1
    MAXLOCALS = 1

  // access flags 0x9
  public static main([Ljava/lang/String;)V
   L0
    LINENUMBER 6 L0
    ICONST_1
    ISTORE 1
   L1
    LINENUMBER 7 L1
    NEW test/Anonymous$1
    DUP
    ILOAD 1
    INVOKESPECIAL test/Anonymous$1.<init> (I)V
    ASTORE 2
   L2
    LINENUMBER 13 L2
    ALOAD 2
    INVOKEINTERFACE java/lang/Runnable.run ()V (itf)
   L3
    LINENUMBER 14 L3
    RETURN
   L4
    LOCALVARIABLE args [Ljava/lang/String; L0 L4 0
    LOCALVARIABLE i I L1 L4 1
    LOCALVARIABLE r Ljava/lang/Runnable; L2 L4 2
    MAXSTACK = 3
    MAXLOCALS = 3

  // access flags 0x1008
  static synthetic access$000()I
   L0
    LINENUMBER 3 L0
    GETSTATIC test/Anonymous.field : I
    IRETURN
    MAXSTACK = 1
    MAXLOCALS = 0

  // access flags 0x8
  static <clinit>()V
   L0
    LINENUMBER 4 L0
    BIPUSH 10
    PUTSTATIC test/Anonymous.field : I
    RETURN
    MAXSTACK = 1
    MAXLOCALS = 0
}
```

上面字节码有点长，我们主要关注以下几个点：
- `static INNERCLASS test/Anonymous$1 null null`上来有一段声明内部类的地方声明了有个匿名的内部类`test/Anonymous$1`
- 在main函数中直接调用了`test/Anonymous$1.<init>`来new了一个匿名内部类，并且注意这个匿名类的构造方法调用的时候传入了一个参数`ILOAD 1`，也就是前面的局部变量`i`，然后就调用run方法了。
- 合成方法`access$000`把当前类的`field`这个静态字段返回。

接下来我们来看最重要的匿名类的`class`文件的内容，在构造方法中接受一个`int`也就是上文中的`i`，然后把`i`set到`val$i`这个字段中了。

![image](https://i.imgur.com/9QgKSMx.png)

![image](https://i.imgur.com/1O3gRJU.png)

![image](https://i.imgur.com/xRZZF4F.png)

最后在`run`方法中我们看到，会将`val$i`和`access$000()`相加。

![image](https://i.imgur.com/eEC4RDR.png)

我们把上面字节码重新调整一下，大概就是这样，这样是不是就更容易理解内部类的工作方式了呢，我们需要注意3点关于变量捕捉。
- 1 外部类的局部变量是通过构造方法传入的，多个局部变量，构造方法入参就会有多个，没有捕捉局部变量就是空参数构造方法。
- 2 如果匿名类捕捉的是一个对象的属性，如`obj.field`，传入的是`obj`这个对象。
- 3 如果匿名类捕捉的是一个其他类的`public`静态属性，如`Claz.staticField`，可以直接在内部类代码中访问，所以不需要额外传入。
- 4 如果匿名类捕捉的是一个外部类`private`静态属性，如上面例子，是通过合成方法传入的，例如`access$000`。
```java :Anonymous.java
public class Anonymous {
    private static int field = 10;
    public static void main(String[] args) {
        int i = 1;
        Runnable r = new Anonymous$1(i);
        r.run();
    }
    static access$000(){
        return field;
    }
}
class Anonymous$1 implements Runnable {
    Anonymous$1(int i) {
        this.val$i = i;
    }
    @Override
    public void run() {
        System.out.println(this.val$i + Anonymous.access$000());
    }
}
```
匿名类中传入的变量，例如上面的`i`必须是`final`即不能再被修改的，原因就是防止产生歧义。
# lambda
我们用一段类似的代码来对比分析`lambda`
```java:LambdaTest.java
public class LambdaTest {
    private static int field = 10;
    public static void main(String[] args) {
        int i = 1;
        Runnable r = () -> System.out.println(i + field);
        r.run();
    }
}
```
对应的字节码如下，
```bytecode
// class version 52.0 (52)
// access flags 0x21
public class test/LambdaTest {

  // compiled from: LambdaTest.java
  // access flags 0x19
  public final static INNERCLASS java/lang/invoke/MethodHandles$Lookup java/lang/invoke/MethodHandles Lookup

  // access flags 0xA
  private static I field

  // access flags 0x1
  public <init>()V
   L0
    LINENUMBER 5 L0
    ALOAD 0
    INVOKESPECIAL java/lang/Object.<init> ()V
    RETURN
   L1
    LOCALVARIABLE this Ltest/LambdaTest; L0 L1 0
    MAXSTACK = 1
    MAXLOCALS = 1

  // access flags 0x9
  public static main([Ljava/lang/String;)V
   L0
    LINENUMBER 8 L0
    ICONST_1
    ISTORE 1
   L1
    LINENUMBER 9 L1
    ILOAD 1
    INVOKEDYNAMIC run(I)Ljava/lang/Runnable; [
      // handle kind 0x6 : INVOKESTATIC
      java/lang/invoke/LambdaMetafactory.metafactory(Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invoke/MethodType;)Ljava/lang/invoke/CallSite;
      // arguments:
      ()V, 
      // handle kind 0x6 : INVOKESTATIC
      test/LambdaTest.lambda$main$0(I)V, 
      ()V
    ]
    ASTORE 2
   L2
    LINENUMBER 10 L2
    ALOAD 2
    INVOKEINTERFACE java/lang/Runnable.run ()V (itf)
   L3
    LINENUMBER 11 L3
    RETURN
   L4
    LOCALVARIABLE args [Ljava/lang/String; L0 L4 0
    LOCALVARIABLE i I L1 L4 1
    LOCALVARIABLE r Ljava/lang/Runnable; L2 L4 2
    MAXSTACK = 1
    MAXLOCALS = 3

  // access flags 0x100A
  private static synthetic lambda$main$0(I)V
   L0
    LINENUMBER 9 L0
    GETSTATIC java/lang/System.out : Ljava/io/PrintStream;
    ILOAD 0
    GETSTATIC test/LambdaTest.field : I
    IADD
    INVOKEVIRTUAL java/io/PrintStream.println (I)V
    RETURN
   L1
    LOCALVARIABLE i I L0 L1 0
    MAXSTACK = 3
    MAXLOCALS = 1

  // access flags 0x8
  static <clinit>()V
   L0
    LINENUMBER 6 L0
    BIPUSH 10
    PUTSTATIC test/LambdaTest.field : I
    RETURN
    MAXSTACK = 1
    MAXLOCALS = 0
}

```
同样有点长，我们只关注部分重点
- 1 同样有个内部类的声明`static INNERCLASS java/lang/invoke/MethodHandles$Lookup java/lang/invoke/MethodHandles Lookup`，但是类型是`MethodHandles$Lookup`
- 2 `INVOKEDYNAMIC`这一部分，他有很多行，`run(I)Ljava/lang/Runnable;`指要实现的方法名是`run`，调用点的签名是入参`int`返回一个`Runnable`类型，这里简单理解调用点就是产生我们想要的`Runnable`匿名类的一个入口点。
- 3 接下来`java/lang/invoke/LambdaMetafactory.metafactory(Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invoke/MethodType;)Ljava/lang/invoke/CallSite;`这一段非常长，其实就是调用`LambdaMetafactory`类的`metafactory`方法，这个方法有6个入参`Lookup`当前调用上下文，由`jvm`自行填充；`String`是方法名，这里就是`run`；第一个`MethodType`是接入点的方法签名，即入参int返回Runnable；第二个`MethodType`是接口中方法签名，这里就是run的`()void`；`MethodHandle`则是真正承载接口实现的一个方法，这个函数是编译器合成的方法，这里是下面的`lambda$main$0`方法；第三个`MethodType`是要实现的方法的签名，这里与第二个`MethodType`一致都是`()void`。最后返回值是`CallSite`类型，一个调用的接入点，这个对象调用`getTarget().invoke(xx)`就可以返回一个目标类型，即`Runnable`。
- 4 再往后`()V, test/LambdaTest.lambda$main$0(I)V, ()V`这三个对应的就是上面提到的方法入参，前面3个入参由jvm填充，这是对应后面3个入参。
- 5 `lambda$main$0(I)V`，这个`private static`的合成方法就是真正实现接口的函数，注意这里有个`int`的入参，引入从上下文中捕捉了变量int。

上面简单的`lambda`去糖后，与下面的java代码是等价的。
```java :LambdaTest.java
import java.lang.invoke.*;

public class LambdaTest {
    private static int field = 10;
    public static void main(String[] args) throws Throwable {
        MethodHandles.Lookup lookup = MethodHandles.lookup();
        // 调用点，传入int返回一个Runnable
        MethodType invokedType = MethodType.methodType(Runnable.class, int.class);
        // 要实现的run方法签名，无入参无返回值
        MethodType interfaceMethodType =  MethodType.methodType(void.class);

        MethodHandle targetMethod = lookup.findStatic(LambdaTest.class, "lambda$main$0", MethodType.methodType(void.class, int.class));

        CallSite site = LambdaMetafactory.metafactory(lookup, "run",
                invokedType, interfaceMethodType, targetMethod, interfaceMethodType
        );

        MethodHandle factory = site.getTarget();

        int i = 1;
        Runnable r = (Runnable) factory.invoke(i);
        r.run();
    }

    private static void lambda$main$0(int i) {
        System.out.println(i + field);
    }
}
```
以上就有`Runnbale`的lambda，并且有变量捕捉的场景去糖后的代码，也是可以java直接运行的，此外为了加深理解，可以尝试把`Runnable`替换成`Function`接口的`R apply(T t)`方法，这个有入参有返回值，会是更复杂的场景。这里不再赘述了。

同样的`lambda`中传入的变量也需要是`final`的不能再被修改的，也是为了防止歧义。与匿名类部分一样，`lambda`如果捕捉的是`obj.field`，实际传入的是`obj`对象，而不是直接传入`filed`；如果捕捉的是当前类的静态属性，则直接可以在合成方法中获取，因为都是当前类的静态属性，就不需要像匿名类那样有额外的`access$000`方法。