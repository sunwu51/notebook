# maven

# 综述
以一个spring boot项目生成的pom.xml为例来简述maven配置文件的各项。
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.1</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.example</groupId>
    <artifactId>reactor</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>reactor</name>
    <description>Demo project for Spring Boot</description>
    <packaging>jar</packaging>
    <properties>
        <java.version>11</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>2.0.12.graal</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```
先说不重要的部分，最外面`xml`还有根标签`project`，第一项`modelVersion`4.0.0指的是maven模型的版本和maven版本无关。`GAV`、`name`、`description`是对当前项目的重要描述，其中name和description是非必要的。

`properties`配置属性的，自定义的属性可以在后面用`${spring.version}`这种方式再次使用，当然这里定义的是内置的`java.version`属性。

`packaging`指定打包的类型主要有`pom`/`jar`/`war`三种类型，其中pom类型主要作为parent来使用，是不产生任何打包输出的意思，即通过mvn package不会产出jar或者war包，除了这三种还有其他形式如下图，只是用的不多。

![image](https://i.imgur.com/NWrqch3.png)

`parent`是指继承自这个坐标，这里继承自`spring-boot-starter-parent`这么个坐标，这个坐标点进去会发现是`packaging`为pom类型的，而`spring-boot-starter-parent`这个又有个parent是`spring-boot-dependencies`,后者内部定义了`dependencyManagement`里面有非常多的`dependencies.dependency`。

![image](https://i.imgur.com/Tt5e4eF.png)

`dependencyManagement`一般是作为parent的坐标，别人把自己当parent的时候，如果用到了`dependencyManagement`里面的依赖，那么就不需要写版本，只写groupId和artifactId即可。IDEA中通过左边的箭头可以找到parent中定义的版本，而如果自己写了版本则会用自己写的。这里面定义的依赖并不会直接引入，只有当前项目使用的才会真正引入。

![image](https://i.imgur.com/3TKalpQ.png)

`optional`注意上面lombok包的引入的时候用到了optional=true，默认值是false，这个关键字主要作用是不会传递依赖，也就是说如果我当前包使用lombok，且optional=true，而一个项目引了我这个包，那么理论上lombok是项目的间接依赖，但是这里用了optional=true，那么就不会作为项目的间接依赖了。这个特别适合lombok这种包，因为lombok只是源码中使用`@Data`这种注解，在编译打jar包后，其实已经生成了对应的getset方法，这个包就已经没用了，所以别人依赖我这个jar的时候，是不需要让他们知道我用了lombok这个包的，也不需要给别人增加这个额外的依赖了。

![image](https://i.imgur.com/cBuFTac.png)

`scope`作用范围。
- 默认是`compile`也就是全范围的；
- `provided`是编译测试阶段可以用，但是不会打包到`jar`包，一般是服务器的容器中提供的例如`servlet`、`spark`等；
- `runtime`运行时才用不参与编译，常见于jdbc的driver包，是不需要参与编译的过程的，当然用默认compile也没问题。
- `system`和`<systemPath>${basedir}/lib/xxxxx.jar</systemPath>`一起使用，指定本地的jar包

![image](https://i.imgur.com/G4b7EdR.png)

`build->plugins->plugin`插件，上面例子中只有一个插件就是`spring-boot-maven-plugin`，用法和dependency类似需要指定坐标，这里没有指定版本也是因为在parent中的`pluginsManagement`中指定了，parent能看到默认有repackage的goal，而repackage这个goal在spring插件中单独进行了定义，他是在常规的mvn package阶段的最后执行，需要用正常打包出来的jar包作为输入，并整合其他依赖进入打包成一个shade的包，并把原来的jar包重命名。注意这个goal声明文件中还声明了像run、stop等goal，只不过这些不是默认的goal，不会再正常的mvn package等生命周期中执行。repackage过程是为了把依赖都打进jar包，如果正常package是只打包项目代码的，依赖代码不会进入jar包，这样jar包无法直接运行，所以才有了repackage。

![image](https://i.imgur.com/Qx1gVNc.png)

![image](https://i.imgur.com/0J12KKg.png)
# 依赖冲突
常见的依赖冲突是项目依赖的A库1.0版本和B库2.0版本，B库2.0又依赖了A库2.0，那么实际生效的A库的版本只能有一个，是1.0还是2.0呢？

maven版本生效的原则是nearest就近原则，如果依赖的层级比较靠上，那么就优先，如果同一层级，先出现的优先。这样也比较好理解，不过有个特例，就是如果同一个pom文件中出现了一个库两个版本，此时并不是前面的生效，而是后面生效，因为这是xml文件读取的时候，后者把前者覆盖了，当然一般情况下也不会写出这种duplicate的配置，maven也会给个警告的提示的。

例如我们写如下依赖，httpclient本身是有依赖httpcore的，而我们又自己单独引入了httpcore。
```xml
<dependency>
    <groupId>org.apache.httpcomponents</groupId>
    <artifactId>httpclient</artifactId>
    <version>4.5.13</version>
</dependency>
<dependency>
    <groupId>org.apache.httpcomponents</groupId>
    <artifactId>httpcore</artifactId>
    <version>4.4.10</version>
</dependency>
```
![image](https://i.imgur.com/UAbZl4Q.png)

可以看出core`4.0.10`最终生效，而httpclient间接依赖的`4.4.15`是冲突并且被忽略了，因为4.4.10我们是直接配置在当前层级的，相比间接依赖的4.4.15层级少一级，优先级也就更高。

因而如果想要强制使用一个指定的版本最好的方式就是在自己的项目pom中指定这个特定的版本。
# 打包插件
spring boot提供了可以把各种依赖也打包进一个jar的插件，但是对于普通项目有时候也有这样的需求，这时候我们需要借助类似的插件，例如shade插件，用法如下，注意shade和springboot的插件有依赖关系，不要再springboot项目用shade。
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <version>3.3.0</version>
    <!-- 这个configuration也可以配置到execution里，放到外面是全局生效 -->
    <configuration>
         <filters>
            <filter>
                <artifact>*:*</artifact>
                <excludes>
                    <exclude>META-INF/*.SF</exclude>
                    <exclude>META-INF/*.DSA</exclude>
                    <exclude>META-INF/*.RSA</exclude>
                </excludes>
            </filter>
        </filters>
    </configuration>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>shade</goal>
            </goals>
            <configuration>
                <transformers>
                    <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                        <mainClass>org.example.App</mainClass>
                    </transformer>
                </transformers>
            </configuration>
        </execution>
    </executions>
</plugin>
```
上述配置是比较建议的配置方式，可以对其进行简化，去掉filter不进行过滤都打包到jar，然后去掉mainClass，不配置主类，运行时用`java -cp shaded-1.0-SNAPSHOT.jar org.example.App`指定主类。
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <version>3.3.0</version>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>shade</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```
过滤的使用，上面配置中，是对`*:*`也就是所有group所有artifact都过滤掉了`META-INF/*.SF`等文件，也可以单独配置过滤某个依赖中的某些文件。
```xml
<configuration>
    <filters>
        <filter>
            <artifact>junit:junit</artifact>
            <excludes>
                <exclude>org/junit/experimental/**</exclude>
                <exclude>org/junit/runners/**</exclude>
            </excludes>
        </filter>
        <!-- **就是全都不引入 -->
        <filter>
            <artifact>org.apache.httpcomponents.client5:httpclient5</artifact>
            <excludes>
                 <exclude>**</exclude>
            </excludes>
        </filter>
    <filters>
</configuration>
```
重命名报名，在打包的时候jar包里的文件名可以重新命名，例如下面就把org.apache.hc.core5这个包名为前缀的，全都改成shade.org.apache.hc.core5
```xml
<execution>
    <phase>package</phase>
    <goals>
    <goal>shade</goal>
    </goals>
    <configuration>
        <relocations>
            <relocation>
                <pattern>org.apache.hc.core5</pattern>
                <shadedPattern>shade.org.apache.hc.core5</shadedPattern>
            </relocation>
        </relocations>
    </configuration>
</execution>
```
如此一来打包的jar包里就成了shade/org/apache/core5目录了，同时shade会扫描源代码把`import org.apache.hc.core5xxx`也替换成shade这个包名下。

![image](https://i.imgur.com/NVzs6dj.png)

这样做有什么意义呢？

间接的解决依赖冲突，例如项目有2个依赖A和B，他们分别依赖C1.0和C2.0，并且A用C2.0会报错，B用C1.0也会报错。此时可以通过对A或B进行改造，比如对A改造，可以建立一个新的包AA，AA中只引入A依赖不需要做其他事情，并且在AA中配置shade修改C1.0的报名，例如改成shade.C。最后在项目中引入AA.jar和B，此时AA依赖的是shade.CC1.0，而B依赖的是C2.0，这样坐标就不冲突了，两者就可以共存了。不过这种方式可能会有问题，比如有不是通过import引入的，而是通过字节码等其他方式引入，就会无法识别导致真正运行时报错。