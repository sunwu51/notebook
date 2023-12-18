# 1 javaassist
javaassist是jvm字节码操作的库，通过以下方式引入maven依赖
```xml
<!-- https://mvnrepository.com/artifact/org.javassist/javassist -->
<dependency>
    <groupId>org.javassist</groupId>
    <artifactId>javassist</artifactId>
    <version>3.29.2-GA</version>
</dependency>
```
通过下面代码即可读取某个类的字节码。
```java
ClassPool pool = ClassPool.getDefault();
CtClass cc = pool.get("org.example.A");
byte[] bytes = cc.toBytecode();
```
## 1.1 概念介绍
上面代码中我们看到了`ClassPool`和`CtClass`，`ClassPool`本质是一个Map用来存储类的字符串名例如"org.example.A"和这个类型本身`CtClass`的相关信息。

`ClassPool`可以通过`getDefault`方法获取，此时是以当前的`classpath`进行创建的，当创建完成后我们可以debug查看pool中只有8个基础类型和一个void类型。

![image](https://i.imgur.com/qla0WRC.png)

当运行`pool.get("org.example.A")`时，会从当前的classpath下去寻找A的class文件，将其信息处理封装成`CtClass`，同时把相关的`CtClassType`存到pool中。

![image](https://i.imgur.com/NJqAkom.png)

pool存储太多会占用一些内存，如果不是频繁使用可以在get之后通过`cc.detach()`方法，将其从pool中删除。

`CtClass`对应的就是javaassist中对于一个类的描述，与java的`Class`有点像，但是也不是完全的对应关系，可以理解为一个`CtClass`可能对应多个`Class`，因为`CtClass`本质就是字节码`byte[]`，而jvm的`Class`除了字节码，还有`ClassLoader`，同一组字节码，被不同的加载器加载的`Class`是不同的。

除了加载已有的类，pool还可以直接创建新的类，用`makeClass`方法，也可以给新的类添加列和方法如下，实现无中生有。
```java
// 创建一个新的类，如果pool中已经有这个类，则会替换成新的
CtClass cc = pool.makeClass("org.example.A");

// 追加一个field
CtField cf = CtField.make("public String name;", cc);
cc.addField(cf);

// 追加一个方法
CtMethod cm = CtMethod.make("public String getName() { return this.name; }", cc);
cc.addMethod(cm);

// 追加一个构造函数，这里用了setBody，CtMethod也有该方法
CtConstructor ccs = new CtConstructor(null, cc);
ccs.setBody("{this.name =\"佚名\";}");
cc.addConstructor(ccs);

// 将字节码写入class文件
cc.writeFile();
```
查看当前目录下多出了`./org/example/A.class`文件，用idea反编译后能看到代码如下，构造方法里的name=佚名，直接在字段上复制了，这是反编译的结果，效果和上面一样。
```java
//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package org.example;

public class A {
    public String name = "佚名";

    public String getName() {
        return this.name;
    }

    public A() {
    }
}
```
## 1.2 展开说下CtMethod的功能
与java的class类似，CtClass也能通过`getDeclaredMethod`和`getField`来获取类中的`CtMethod`和`CtField`，这样我们就能够对已有的类的方法进行修改。
```java
ClassPool pool = ClassPool.getDefault();
CtClass cc = pool.get("org.example.A");

CtMethod cm = c.getDeclaredMethod("sayHi");

// setBody方法直接修改整个方法体内容
cm.setBody("{ System.out.println(\"HiHiHi\"); }");

// insertBefore在方法第一行插入代码块
cm.insertBefore("System.out.println(\"start\");");
// insertAfter在方法最后插入代码块，不会影响return的结果
cm.insertAfter("System.out.println(\"after\");");
// insertAt在方法指定的第几行插入
cm.insertAt(10, "System.out.println(\"line10\");");

// instrument是当前方法中，运行到某些时间点的时候的修改，例如MethodCall就是调用其他函数时候的修改
// NewExpr是创建异常的时候，最常用的是MethodCall其他的简单看一下即可。
cm.instrument(new ExprEditor() {
            public void edit(NewExpr e) throws CannotCompileException {}
            public void edit(NewArray a) throws CannotCompileException {}
            public void edit(MethodCall m) throws CannotCompileException {}
            public void edit(ConstructorCall c) throws CannotCompileException {}
            public void edit(FieldAccess f) throws CannotCompileException {}
            public void edit(Instanceof i) throws CannotCompileException {}
            public void edit(Cast c) throws CannotCompileException {}
            public void edit(Handler h) throws CannotCompileException {}
        });
```

一些关键字，在上面的方法中，因为无法获取到当前的入参和返回值等，所以提供了一些内定的变量，下面是一部分。

![image](https://i.imgur.com/Cd8mUS6.png)

还有`$proceed`，用法是
```java
//修改第一个入参的值，然后运行
$1 = 0;
$_ = $proceed($$);
```
注意这些预留变量并不是每个方法中都能使用的，例如`$proceed`就只有在`instrument`方法中才能使用，而`$_`也不能在`setBody`中使用，详情参考https://www.javassist.org/tutorial/tutorial2.html，基本准则就是入参的`$args $0 $1`等，类型的`$w $r`等，返回值`$_`的除了`setBody`是都可以使用。
## 1.3 retransform
javaassist本质是创建或修改类的字节码，有了字节码，其实还没法生效，字节码要通过ClassLoader加载成`Class`才能被拿来使用。

通过`toClass`方法可以用当前类加载器加载该字节码，但是如果这个类已经被加载过了，那么就会报错。`duplicate class definition for name: "xxxx"`。

此时可以用javaassist提供的Loader来加载该字节码，这样就不会报错了，但是问题就是下面的c1的类加载器是一个专门的，因而不会影响该类已经加载到内存的运行的部分，这样的作用就变小了。
```java
Class c = cc.toClass();

Class c1 = cc.toClass(new Loader());
```

如果想要替换已经在内存中的类的字节码，就需要借助`java Instrumentation API`的retransform方法，我们在之前的java agent中已经有相关介绍，这里就不展开了，除了agent/attach，想要快速验证也可以用`ByteBuddyAgent`这个库可以直接在当前进程中拿到`Instrumentation`,但是一般用于测试，千万不要在prod代码用byte-buddy-agent。
```xml
<dependency>
    <groupId>net.bytebuddy</groupId>
    <artifactId>byte-buddy-agent</artifactId>
    <version>1.14.10</version>
</dependency>
```

例如修改一个已有的A类。
```java
// 这是A类
public class A {
    public void sayHi() {
        System.out.println("hi");
    }
}

// 这是主类
public class Main {
    public static void main(String[] args) throws Exception {
        A a = new A();
        ClassPool pool = ClassPool.getDefault();
        CtClass cc = pool.get("org.example.A");
        cc.getDeclaredMethod("sayHi").setBody("{System.out.println(\"No hi\");}");
        byte[] bytes = cc.toBytecode();
        Instrumentation inst = ByteBuddyAgent.install();
        inst.addTransformer(new ClassFileTransformer() {
            @Override
            public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined, ProtectionDomain protectionDomain, byte[] classfileBuffer) throws IllegalClassFormatException {
                return bytes;
            }
        }, true);
        a.sayHi(); // 打印hi
        inst.retransformClasses(A.class);
        a.sayHi(); // retransform后打印No hi
    }
}
```
# 2 ognl
`ognl`是一种表达式或者叫dsl，可以用ognl引擎去运行表达式的内容，该表达式依赖反射去执行，也依赖了javaassist库，例如我们要运行`a.sayHi()`
```java
// #root.sayHi是表达式内容，是说要运行根节点的sayHi方法
// 第二个参数就是根节点
A a = new A();
Object result = Ognl.getValue("#root.sayHi", a); // 打印hi，并返回null，因为没有返回值void
System.out.println(result); // null
```

ognl用`#xx`表示变量，一个表达式如果运行多段功能需要用`,`隔开，如下
```java
Point point = new Point(1, 2);
Object result = Ognl.getValue("#root.x=100, #root.y=200, #root.toString()", point);
System.out.println(result); // 打印java.awt.Point[x=100,y=200]
```
ognl可以用`new `语句来创建新对象，对于对象的方法就用普通的`a.sayHi()`就可以调用像之前看到的，但是对于静态方法，则需要用`@`
```java
Object result = Ognl.getValue("@java.util.UUID@randomUUID()", null);
System.out.println(result); //打印一个uuid
```
