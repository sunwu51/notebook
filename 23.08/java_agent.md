# javaagent
agent有两种运行方式：
- 1 通过启动指令中`-javaagent:xx.jar`指定
- 2 已经启动的jvm进程，通过`attach`的方式侵入原程序。
# 0 准备一个类
A.java
```java
public class A {
    public static void  main(String[] args) throws Exception {
        int i = 0;
        while (true) {
            print(i++);
            Thread.sleep(1000L);
        }
    }
    private static void print(int i) {
        System.out.println(i);
    }
}
```
编译得到`A.class`文件
```shell
$ javac A.java
```
# 1 premain
方式1创建一个maven项目，引入`javassist`和`shade`打包插件，下面是`pom.xml`配置
```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>org.agent</groupId>
  <artifactId>demo-agent</artifactId>
  <version>1.0-SNAPSHOT</version>
  <name>Archetype - demo-agent</name>
  <url>http://maven.apache.org</url>

  <dependencies>
    <dependency>
      <groupId>org.javassist</groupId>
      <artifactId>javassist</artifactId>
      <version>3.27.0-GA</version>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-shade-plugin</artifactId>
        <version>2.4.3</version>
        <configuration>
          <transformers>
            <transformer implementation="org.apache.maven.plugins.shade.resource.DontIncludeResourceTransformer">
              <resource>MANIFEST.MF</resource>
            </transformer>
            <transformer implementation="org.apache.maven.plugins.shade.resource.IncludeResourceTransformer">
              <resource>META-INF/MANIFEST.MF</resource>
              <file>src/main/resources/META-INF/MANIFEST.MF</file>
            </transformer>
          </transformers>
        </configuration>
        <executions>
          <execution>
            <phase>package</phase>
            <goals>
              <goal>shade</goal>
            </goals>
          </execution>
        </executions>
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <configuration>
          <source>11</source>
          <target>11</target>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```
创建一个类例如叫`MyAgent`，这个类中需要有`premain(String)`或`premain(String,Instrumentation)`方法，该方法会在主类的`main`方法之前运行，而`instrumentation`这个参数很重要，他可以通过`addTransformer`方法，将所有的类加载前的字节码进行一次转换。

下面的代码，对A类中所有方法进行增强，打印每个方法的运行时长。
```java
package com.agent;

import java.io.ByteArrayInputStream;
import java.lang.instrument.ClassFileTransformer;
import java.lang.instrument.IllegalClassFormatException;
import java.lang.instrument.Instrumentation;
import java.lang.instrument.UnmodifiableClassException;
import java.security.ProtectionDomain;
import javassist.*;

public class MyAgent {
    public static void premain(String agentArgs, Instrumentation instrumentation) {
        System.out.println(agentArgs);
        MyTransformer transformer = new MyTransformer();
        instrumentation.addTransformer(transformer);
    }
}
class MyTransformer implements ClassFileTransformer {
    public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined,
                            ProtectionDomain protectionDomain, byte[] classfileBuffer) throws IllegalClassFormatException {
        // 只对指定的类进行增强，这里就增强一下自己写的A这个类
        if (className.endsWith("A")) {
            try {
                // 使用Javassist获取类定义
                ClassPool classPool = ClassPool.getDefault();
                classPool.insertClassPath(new LoaderClassPath(loader));
                CtClass ctClass = classPool.makeClass(new ByteArrayInputStream(classfileBuffer));
                // 遍历类的所有方法，进行增强
                for (CtMethod ctMethod : ctClass.getDeclaredMethods()) {
                    // 如果添加不是基础类型的变量：ctMethod.addLocalVariable("str", classPool.get("java.lang.String"));
                    ctMethod.addLocalVariable("startTime", CtClass.longType);
                    ctMethod.addLocalVariable("endTime", CtClass.longType);
                    ctMethod.addLocalVariable("duration", CtClass.longType);
                    // 在方法的开头插入计时逻辑
                    ctMethod.insertBefore("startTime = System.currentTimeMillis();");
                    // 在方法的结尾插入计时逻辑
                    ctMethod.insertAfter("endTime = System.currentTimeMillis();");
                    ctMethod.insertAfter("duration = endTime - startTime;");
                    ctMethod.insertAfter("System.out.println(\"Method execution time: \" + duration + \"ms\");");
                }
                // 返回增强后的类字节码
                return ctClass.toBytecode();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // 对于其他类，不进行增强，直接返回原始的类字节码
        return classfileBuffer;
    }
}
```
添加`META-INF/MANIFEST.MF`文件来指定`Premain-Class`
```MF
Manifest-Version: 1.0
Premain-Class: com.agent.MyAgent
```
然后通过`mvn package`打包得到`xxx-shade.jar`这个jar包。回到一开始准备的`A.class`目录，运行指令，得到效果如下。
```shell
java -javaagent:"/path/to/xxx-shaded.jar" A
```
![image](https://i.imgur.com/97SEb3u.png)

`print`方法运行会打印运行的时长，说明我们代码注入成功。

注意上面我们打印了`agentArg`是null，那如何向`premain`传递`agentArg`参数呢，是通过`=`

![image](https://i.imgur.com/QlzHlKI.png)

# 2 agentmain
`premain`是在启动前先运行，`agentmain`则是已经启动动态attach，这个方法和`premain`的入参一致，我们将上面的项目进行简单的改造即可。

在`MyAgent`类中添加`agentmain`的定义，`premain`与`agentmain`负责不同场景的内容，他们可以单独存在。
```java
....
public class MyAgent {
    // 通过javaagent指定当前jar包，则在main函数之前会先运行premain函数
    public static void premain(String agentArgs, Instrumentation instrumentation) {
        System.out.println(agentArgs);
        MyTransformer transformer = new MyTransformer();
        instrumentation.addTransformer(transformer);
    }
    // 通过动态attach方法指定当前jar包，则在attach的时候会立即运行agentmain函数
    public static void agentmain(String agentArgs, Instrumentation instrumentation) throws Exception {
        System.out.println(agentArgs);
        MyTransformer transformer = new MyTransformer();
        instrumentation.addTransformer(transformer);
        // 注意：因为A在attach的时候可能是已经加载的，所以需要retransform进行重新加载
        instrumentation.retransformClasses(Class.forName("A"));
    }
}
```
`MANIFEST.MF`中也要增加`Agent-Main`的配置，同时增加能`retransformClasses`和`redefineClasses`的权限。
```MF
Manifest-Version: 1.0
Premain-Class: com.agent.MyAgent
Agent-Class: com.agent.MyAgent
Can-Redefine-Classes: true
Can-Retransform-Classes: true
```
注意：`Can-Redefine-Classes: true`这个其实我们没有用到redefine，其实可以不配置。

重新打包得到`xxx-shade.jar`。

此时我们得到了可以attach jvm的一个jar包了，但是我们如何`attach`呢，还需要用代码来`attach`，可以新建一个项目或者java文件来执行简单的`attach`操作。
```java
package com.agent;

import com.sun.tools.attach.VirtualMachine;

public class MyAttach {
     public static void main(String[] args) throws Exception {
        Scanner scanner = new Scanner(System.in);
        String pid = scanner.nextLine().trim();

        // 连接到目标Java进程
        VirtualMachine vm = VirtualMachine.attach(pid);

        // 加载Java Agent
        String agentJarPath = "C:\\Users\\sunwu\\Desktop\\code\\demo-agent\\target\\demo-agent-1.0-SNAPSHOT-shaded.jar";
        String agentArgs = "hello";
        vm.loadAgent(agentJarPath, agentArgs);

        // 也可以执行其他操作，如获取目标进程的信息等
        // 断开与目标进程的连接
        vm.detach();
    }
}
```
效果如下，先启动`A`是正常打印数字，然后查看`A`的pid，启动`MyAttach`把`pid`输入，然后A进程也能打印作用时间。

![image](https://i.imgur.com/pl2vxmS.gif)
# 用途
典型用途：
- 阿尔萨斯监控各种指标，函数运行入参，profile等；
- datadog将指标通过agent传到datadog这种apm服务端进行统计和展示；
- 非侵入式的函数增强，