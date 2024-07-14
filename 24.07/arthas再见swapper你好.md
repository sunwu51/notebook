---
title: arthas再见swapper你好
tags:
    - arthas
    - asm
    - 字节码
    - java
    - swapper
---
# arthas
`arthas`是阿里开源的非常强大的java进程分析工具，它有着非常丰富的功能，从查看堆内存信息、线程信息、增强字节码等等。这个工具其实应该叫一个工具库，或者工具箱，tool kit更贴切。因为`arthas`其实是整合了网上很多开源的工具，给他们缝合到了一个系统中。

例如：`profiler`火焰图是直接用的[async-profiler](https://github.com/async-profiler/async-profiler)；`ognl`直接就是[apache commons-ognl](https://commons.apache.org/dormant/commons-ognl/)；`mc`内存编译器使用的是[SkaETL/compiler](https://github.com/skalogs/SkaETL/tree/master/compiler)；`jad`反编译器使用的是[cfr](https://github.com/leibnitz27/cfr)等等。这么多功能集合在一起，确实也不容易，况且`arthas`中还有很多功能是基于阿里的`bytekit`实现的字节码增强实现的，这几个功能反倒是我使用最多的功能：
- `watch`监控方法，被调用时打印出入参。最好用的debug工具。
- `trace`监控方法中所有子方法的耗时。最好用的性能分析工具。
## arthas缺点
现阶段我感觉arthas已经非常好了，但是在使用中还有觉得有些操作太麻烦：
- `watch`等功能都是阻塞窗口的，多个函数的watch需要新开窗口。
- 没有一个UI页面，都是shell运行，长时间不用就忘了指令语法了。
- 想要热替换整个类，或整个方法体，需要非常复杂的，编译，替换等流程，且经常无缘无故失败。
- `ognl`主动触发的表达式，在spring项目不符合预期，因为用了默认类加载器；需要用`vmtool`配合一堆复杂的语法，spring项目非常受限。

# swapper
[JVMByteSwapTool](https://github.com/sunwu51/JVMByteSwapTool)或者简称swapper，是我自己写的一个工具，实现了个人比较常用的功能，和`arthas`有一部分功能重叠，也有一些是`arthas`不具有的功能，总体而言更加容易上手。

下载`demo.jar`和`swapper.jar`，这里使用的是`v0.0.5`版本。
```bash
$ wget https://github.com/sunwu51/jbs-demo/releases/download/1.0.0/demo.jar

$ wget https://github.com/sunwu51/JVMByteSwapTool/releases/download/v0.0.5/swapper.jar
```

接下来启动`demo`服务，这是个`spring boot`的简单项目，源码可以参考[sunwu51/jbs-demo](https://github.com/sunwu51/jbs-demo/)。

<div style={{width: "65vw"}}>
<AsciinemaPlayer src="https://asciinema.org/a/667972.cast" options = {{
        theme: 'tango',
        autoplay: true,
      }}/>
</div>

然后启动`swapper`，选择attach刚才的`demo`进程。

<div style={{width: "65vw"}}>
<AsciinemaPlayer src="https://asciinema.org/a/667973.cast" options = {{
        theme: 'tango',
        autoplay: true,
      }}/>
</div>
此时访问`8000`(如果已经占用会自动切换8001)端口可以得到这样一个页面：

![img](https://i.imgur.com/h8x4CPj.png)

默认会连接同域名的`18000`端口的Websocket服务，因为这里使用的`gitpod`服务，端口在域名中，这里修改域名重新点击连接，如果你是本地应该直接右侧状态是绿色正常链接成功了。

![img](https://i.imgur.com/GpssKQE.png)

## Decompile
先介绍这个功能，可以方便理解其他功能。输入类名进行反编译得到源码。

![img](https://i.imgur.com/xueJRY3.gif)

绿色按钮`clear log`可以清理日志区域，`effected classes`按钮可以展示当前被影响的类列表，`reset`按钮则是把所有的影响都删除。

## Watch
刚才的`/base64`对应[com.example.demo.DemoApplication#base64](https://github.com/sunwu51/jbs-demo/blob/master/src/main/java/com/example/demo/DemoApplication.java#L25)方法。输入`类名#方法名`即可对方法进行增强，监听并打印方法的出入参和耗时，如下：

![img](https://i.imgur.com/yT3oOcj.gif)

此时effected列表有这个被增强的类。

![img](https://i.imgur.com/CkrfJZr.gif)

可以通过反编译查看增强后的代码。

![img](https://i.imgur.com/CkrfJZr.gif)

默认情况下会监听100次，100次之后，自动注销监听功能。可以修改系统属性来修改这个次数，后面`Exec`介绍。

这里为了避免干扰其他功能测试，先`reset`

## OuterWatch
监听方法中子方法的调用，子方法支持`*`匹配任意类。

![img](https://i.imgur.com/54kdLJs.gif)

## ChangeBody
修改某个方法的body，要和原方法有一样的返回值，在方法中`$1` `$2` ... 分别代表第1、第二..个方法的入参。

这里提供了`javassist`和`asm`两种底层实现，后者是对前者的逆向实现，两者都支持`$1 $2 ..`这种参数的表达。但是`javassist`可能在`java17`以上有兼容性问题，所以提供了`asm`作为备选方案，此外`asm`引擎是使用`janino`作为编译器支持较多的语法，而`javassist`使用内置编译器仅支持java4之前的语法，并且不支持`int`等基础类型的自动装箱。

![img](https://i.imgur.com/duKilwT.gif)

## ChangeResult
修改某个方法中调用子方法的返回内容，相比`ChangeBody`来说，`ChangeResult`影响面更小，用法也更灵活。与`OuterWatch`类似，这里的子方法也支持`*`匹配所有类，但是当`InnerMethod`匹配到多个有不同签名的方法时，就会check报错提醒。

这里支持`$_`作为当前子方法的返回值，直接`$_=xx;`即可跳过原函数执行，返回一个指定值。

![img](https://i.imgur.com/QY95RcH.gif)

同样也提供了javassist和ASM两种底层引擎，他们都支持`$_`是子函数返回值，`$1` `$2..`是子函数入参，还支持`$proceed`是调用原方法，这里两个引擎稍有区别。
- javassist引擎，`$proceed($$)`是调用原方法。
- ASM引擎，`$proceed()`是调用原方法。

以`encodeToString`为例，我们调用原方法编码之后，在追后加一个`0.0`，如下：

![img](https://i.imgur.com/ehmrCxS.gif)

再举个例子`encodeToString`的入参是`byte[]`，字符1的ASCII是49，入参123对应的byte[]就是49,50,51。我们把第三个位置改成固定的52，然后运行base64，此时我们入参传入`12x`，第三位任意传什么字符，都会被换成52也就是4。

![img](https://i.imgur.com/ICPm6OI.gif)

> 为什么两个引擎共存
当前`ASM`的功能已经完成可以替代`javassist`为什么还保留了两个引擎选项，主要是没有做充分的测试，如果有一些边界情况ASM不好使的话，可以切回`javassist`，如果一段时间使用后，没有发现`ASM`有问题，就会只保留`ASM`引擎了。

## Exec
主动触发一段函数执行，替代`arthas`的`ognl`功能，但是后者只能写`ognl`表达式，`swapper`这里可以用java代码编辑一个方法，并且内置了丰富的辅助功能：
- 模板代码中的`ctx`变量，是获取当前spring的上下文，`ctx.getBean(name|class)`可以获取bean，这样就可以触发bean中的方法了。
- `Global`类内置了一些辅助方法：
    - `info(obj)` `error(obj, e)`打印并传递到页面日志
    - `ognl(str)`执行ognl表达式，与arthas类似，但是这是在`spring`类加载器下执行，可以访问项目中的类
    - `beanTarget(bean)`获取spring增强的代理对象的原始对象
    - `readFile(str)`读取文本文件，返回行列表`List<String>`

`demo.jar`中有`/user/{id}`路径是读取h2中的mock的5条数据，假如我们把id=1的数据的name改为`faker`，如下直接通过`ctx`获取bean然后修改数据库。

![img](https://i.imgur.com/zPwVgjn.gif)

> maxHit
上面提到的`watch`只能监听100次上限，也包括`outerwatch`和`trace`，这个限制其实是存到了`System.getProperty("maxHit")`中，可以通过两种方法修改这个限制。一种就是直接在`Exec`中执行`System.setProperty("maxHit", "200")`，另一种方法是在启动`swapper.jar`的时候，传递`-Dw_maxHit=200`，`swapper.jar`的`w_`开头的属性，都会被去掉`w_`，剩下的部分作为属性设置到目标jvm进程中。


## ReplaceClass
上传class文件替换整个类，本地修改代码编译后，找到生成的`class`文件上传，并指定类名，即可完成替换。

但是注意，匿名类等，可能会生成一个`XXX$1.class`，如果修改的是这部分内容，尽量就不要使用这个功能了。

![img](https://i.imgur.com/RJTUVS4.gif)
