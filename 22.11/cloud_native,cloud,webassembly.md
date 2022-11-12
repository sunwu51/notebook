# 1 跨平台
一切的故事要从跨平台说起。现在我们较少的听到程序去强调跨平台了，但是在早些年跨平台绝对是老生常谈的话题。因为那时候没有docker这么方便的工具。而java能火起来也正是因为早年间的一句响亮的口号`Write Once, Run EveryWhere`。为什么跨平台这么重要呢？我们写一个程序，最终运行在机器上，但是真正的运行机器环境可能是不同的，而且可能跟我们写代码的开发机也是不同的。即使是相同的操作系统，但是内核版本的不同也可能导致不兼容。因而早些年我们需要交叉编译，例如在`mac`电脑上写的程序需要借助交叉编译得到能运行在某个`linux`版本上的二进制文件，然后传到服务器上再运行。
# 1.1 VM
此时服务器上一般会运行其上多个虚拟机，程序实际上是在虚拟机里面运行，这也是多方考量，因为宿主机的规格非常高，单个应用占用一台宿主机，资源浪费严重，多进程的运行多个应用在宿主机，隔离性又得不到保障。所以虚拟机VM是一种最佳实践。然而交叉编译并不能解决所有问题，例如代码中使用的一些系统调用函数，在不同OS上是完全不同的，在`mac`上写的代码有时根本无法编译出linux版本的二进制文件，往往我们需要开发机和服务器是相同的操作系统，相同的内核版本，来避免跨平台的错误。本质上来说，做不到相同代码在不同OS上运行，大部分时候都需要进行代码调整。

VM这个重量级实现还存在镜像体积巨大，构建和部署流程繁琐且缓慢等问题，因为启动过程较慢，很多时候宿主机上会启动一部分VM来待命，等待发程序过来执行。
# 1.2 JVM
而java提出了一种更小代价的VM，不需要虚拟出整个操作系统，`jvm`只虚拟出`java`程序的`runtime`环境，`jvm`向上对开发者来说实现功能的函数一致，而向下兼容了多个操作系统，屏蔽了实现细节，实现相同功能可能底层调用的操作系统函数并不相同，但用户无需关心。真正意义上做到了相同代码，可以在不同的平台运行。于是在VM上运行`JVM`，`JVM`中运行java程序，成为一种主流的开发方式，用户可以用`windows`可以用`mac`可以用`ubuntu`，几乎可以用任何想用的开发机来开发程序，都可以成功的发布到服务器上。

`JAVA`是`C++`写的，`C++`部分的代码又叫`native`代码，`native`这个词基本也就定了个跟OS紧密相关的基调，即实现同一功能的`native`的代码是会和OS不同而不同的。`JVM`定义了的`java runtime`是一个完整的“世界”，在里面有自己的内存堆、栈，有自己的线程，开发者只需要了解这个“世界”（jvm）的规则即可，基本不太需要关注OS对应的发生的事情。当然这也有一定的代价，就是我们需要在我们要运行程序的机器上去安装这个运行时`JRE`，此外JVM执行相同的功能需要的内存也远高于native的程序，因为vm本身的维护就需要较大内存。
# 1.3 Docker
`VM`是一种很重的实现，启动和扩容都很慢。而`Docker`的出现彻底改变的VM的发展。`Docker`是一种轻量级的虚拟化，本质上docker容器里的程序还是运行在当前宿主机上，是通过借助`cgroup`等工具链把linux上的资源进行了切分，进程级别去瓜分操作系统的资源，只不过`docker`的抽象让用户看起来像是运行在了`vm`里，`docker`启动非常迅速，扩容和销毁非常快，但是因为是假的“VM”，docker的隔离性没有`VM`那样彻底。即使这样，`docker`的轻量、快速和高效还是颠覆了虚拟化和云计算行业。

“如果Docker出现的早一些，可能就不会有jvm了”。这是网上的一种激进的言论，这是因为`docker`的轻量性，使得我们可以在任何机器上使用一个发行版的linux镜像来进行开发，然后最终将开发好的程序连同linux基础镜像build成app镜像，部署到服务器上即可。有了这么轻量的`docker`的加持，好像所有语言都可以实现`Write Once, Run EveryWhere`。但是其实还是做不到`java`这么丝滑。
# 1.4 native
我们上面jvm中提到了`native`是指`c++`部分的代码，他可能因OS不同而有着不同的实现方式。`native`就是操作系统本地化的，这似乎是个贬义词，因为差异化意味着不灵活。但同时这种量身定做也意味着高效，不可能有任何运行方式的效率能超过`native`。于是我们知道最高效的运行方式就是在宿主机运行`native`代码；稍差一些可以加一层抽象：在VM中运行`native`代码，或者在`jvm`中运行`java`代码，或者在`Docker`中运行`native`代码；也可以有两层抽象在`VM/Docker`中运行`JVM`中运行java代码。虽然在很多公司`Docker`+`jvm`的方式也是一种主流，但是肯定是运行效率低于`Docker`+`native`（比如docker中运行c++）。只是因为损失的这点效率，在灵活可扩展，应用场景，语言生态，开发者生态等等的权衡下，变得不值一提（某些公司，不代表全部公司和全部业务场景），才选择了`Docker`+`jvm`这种套娃形式。
# 2 cloud native
云原生这个名字有点迷惑，如果去查该术语的定义会发现，不同的网站给出的定义并不完全相同，只不过他们的都有个共同点，就是看懂了好像又没看懂是在说什么。

![image](https://i.imgur.com/gYIVXH7.png)

![image](https://i.imgur.com/VFZjM5n.png)

![image](https://i.imgur.com/4IXkLMY.png)

![image](https://i.imgur.com/8YeEUGG.png)

`native`就是本地运行的，`cloud native`是在云上就像本地运行程序一样，即把cloud提供的工具做个高度集成就是`cloud native`了（我自己的一种理解方式，不是官方说法）。这里的native是一种比喻的方式，并不是说我们必须只能运行`native`代码了，那样的话java就被抛弃了。都有什么有代表性的cloud工具呢，可以从`CNCF`云原生基金组织的官网来看一些project的list，如下是一些明星选手，像k8s、普罗米修斯、etcd、fluentd。

![image](https://i.imgur.com/NLheJiK.png)

当然cn的项目也远不止这点，官网有张超大的(原图)[https://landscape.cncf.io/]，(冷知识是docker不在CNCF下，docker公司不想依托别人，自己单干，现在处境有点尬，一些管理编排工具干不过k8s，苦苦挣扎)。

![image](https://i.imgur.com/UDhcAs3.png)
## 2.1 golang
`cn`中很大一部分项目都是基于`golang`写的，比如`docker`、`k8s`等都是`golan`g写的，`golang`也成了`cn`上部署应用的常用语言。那`golang`为什么这么受`cloud native`欢迎呢。首先golang不像java是没有vm的，对于不同的OS会编译出不同的二进制文件，这一点和C语言比较像，native的运行文件使其效率上要高一点，当然更重要的是native相比jvm会使用更少的内存，jvm有个致命的缺点就是占用较多的内存来维护vm的管理。

为什么不是C语言或者rust呢？理论上也没问题，很多cn的项目也是基于c的，但是c的难度比golang要大，rust没能成为主流一部分原因是rust诞生的时间晚了一点没赶上，另一个原因是rust的难度比c还大。简单高效的golang毫无争议的成为了云原生的宠儿。
## 2.2 k8s
云原生中最负盛名的组件就是k8s了，它是由谷歌开源的一个容器编排和管理的工具，目前主要使用场景管理的是Docker这种容器。我们说docker可以快速启动、扩缩，但是对于分布式场景，还是需要一个好的管理平台。例如我们有10台宿主机，想要启动100个容器，总不能分别在10台机器上运行docker run指令启动吧，此外另一个重要的话题是微服务场景下，我们怎么设置网络，使得不同宿主机上的容器能够互相访问，当然我们还需要内部的DNS，以便于通过简单的域名，而不是一堆内网IP访问，负载均衡也是一个重要的话题，还有动态的扩容等等。

而这些k8s都帮忙做了，他是由一个master机器和一堆worker机器组成，`pod`是最小的管理单位，一个pod可能有一个或者多个容器(一个主容器+多个sidecar)，而一组相同功能的pod组成一个`deployment`，其负责配置pod数量，资源限制等。而`service`则是对这堆`pod`的集体抽象，在集群内抽象出一个ip，通过这个ip的endpoint，就可以在集群中访问这些pod上的服务，如果有多台pod会自动进行负载均衡。对于更多的概念介绍可以参考笔者[18年的文章](https://xiaogenban1993.github.io/18.1/k8s1_%E6%A6%82%E5%BF%B5%E5%92%8C%E8%BF%90%E8%A1%8C%E6%9C%BA%E5%88%B6%E7%AE%80%E4%BB%8B.html)。
## 2.2 k8s调度vm/jvm设想
k8s是管理容器的，一般是管理docker，而docker提供的一种虚拟运行时环境，这一点上docker和vm/jvm很像，那能否让k8s直接调度vm/jvm呢。调度vm是可以的例如`KubeVirt`就允许你在使用k8s管理容器的同时，也可以管理虚拟机。但是直接管理jvm好像还不行，我们期望k8s直接调度jvm是因为可以少一层docker的抽象以提高运行效率。有人会困惑jvm是一个进程，用k8s调度进程如何实现同一宿主机多个jvm都监听8080端口呢。当然是要借助pod的网络和磁盘抽象。

![image](https://i.imgur.com/qJab8kK.png)

但是实际上java在云原生场景并不吃香，因为JIT的编译方式，使java在启动速度和启动初期的预热，都占用较多时间和资源，对于微服务来说这一点是非常拉胯的。这也是没有出现k8s直接调度jvm的一个重要原因，属于是费力不讨好；这种形式只适合jvm语言像`java/scala/kotlin`，受众较小；最要命的是jvm出现较早也不满足OCI容器规范(OCI:Open Container Initiative)。

## 2.3 jvm的native化
既然直接用k8s调度jvm行不通了，我们能不能把java变成native程序，去掉jvm呢。这样是不是可以更快的启动呢，也更符合native的理念。这是一个很好的思路，目前也有这样的尝试，GraalVm。GraalVm可以将下图中这些编程语言都编译成Native版本的程序，即去掉了虚拟机，想象一下我们的java程序不再需要用`java -jar`这样的java指令运行而是直接`./myJava`执行，这使得运行程序的系统不需要安装java环境就可以运行java程序，而且启动速度更快，无JIT，无预热，想象下这也太美好了。

![image](https://i.imgur.com/3vl3Fia.png)

graalVm是Oracle贡献的，实际上的使用姿势是我们需要在开发机上下载GraalVm，在graalVM中自带了java等语言的环境，我们需要使用GraalVm中提供的java来编译和运行，这种使用姿势下，GraalVm实际上是一种更高级的jvm，他的优势在于更高效的一种编译方式，这么看下来就是一个加强版的HotSpot而已，平平无奇，好像并没有实现上面说到的Native，别急那是另一个特性。

![image](https://i.imgur.com/P5yEC6d.png)

Native Image才是重头戏，下图是官方的介绍，这里也介绍了这种native形式的优势，极少的资源(内存cpu)，快速的启动速，无预热出道即巅峰，可以打包到轻量级镜像(如alpine不需要openjdk环境)，更安全不易被攻击(其实是调试/监控等都不方便的高情商说法)

![image](https://i.imgur.com/c2Zzzg3.png)

目前Native Image还不算成熟，时常遇到build失败的情况，GraalVm还有很长的路要走，但是目前看来会是一个重要的发展方向，让老破车java焕发新的生机。当然大多数情况，Oracle是靠不住的，就图一乐，真神还得看spring。j2EE都快把路走死的时候`spring boot`真正让java重生的，而对于native，spring也有`spring native`了，虽然也还不是很成熟，但是spring总会让人很放心，感兴趣的可以自行了解。
# 3 webassembly（wasm）
webassembly最早是一种应用在浏览器上的前端技术，他的key point是说目前的js在浏览器的运行流程是js要编译成机器语言，然后在浏览器引擎(例如chrome v8)上面运行，中间多了一层解释的过程，如果能够直接运行编译好的程序就可以提高效率。这个设定初看感觉有点扯，甚至觉得闲的没事干，因为浏览器上的用户交互并不需要这么大的提升，我们运行js和运行wasm可能也就差几毫秒，甚至更少，在绝大多数页面场景下根本不需要这点提升。

但是wasm在web上的应用其实是瞄准了一些特定的场景，例如非常需要效率的视频、作图、游戏等领域。当然目前来看也只适用于这些领域，在视频编解码上可以带来质变，而作图和设计上已经有了非常典型的例子，那就是`figma`，figma是业界有名的UI设计工具，完全基于浏览器运行，他借助wasm技术将运行的性能提高了3倍以上。游戏领域像unity3d可以直接集成到浏览器中来运行游戏。这都是wasm带来的改变。

但是本文中我们不想过多的介绍wasm在web领域的应用，我们将视角转到cloud。

## 3.1 wasm的runtime
wasm虽然初期设计是给浏览器使用的，但是该规范使很多种语言都可以写wasm的程序，例如`c/c++/rust/golang/java`等等，在浏览器中v8引擎提供了wasm的runtime环境。而我们发现如果将这种runtime环境进行改造，作为一种“VM”将会获得很好的优势，例如多语言的支持，c/rust/golang等等，并且相比VM这种运行时的开销小很多，甚至比docker更轻量。而运行效率上因为可以针对性的对运行时需要的东西优化，而不像docker需要虚拟整个OS，所以效率上也应该至少不弱于docker。

这种runtime环境很快就诞生了，当然v8也算一个，但因为v8本来的定位是解释js用的，只是因为w3c规范，后续支持了wasm，但是直接运行wasm，我们需要更专业的runtime。例如`wasmer`、`wasmtime`和`wasmEdge`。这些runtime类比就是jre或者jvm，而`.wasm`文件的规范，就类比`.class`文件规范。他们的使用也都很简单，在自己的电脑中就可以安装他们，可以选择其中一个进行尝试，安装完成后，例如通过rust写的程序将编译的target设置为`wasm32-wasi`，就可以得到`.wasm`格式的文件输出。这个[wasmEdge的文档](https://wasmedge.org/book/zh/dev/rust.html)给了简单的步骤来在这个运行时环境中启动web服务器。

![image](https://i.imgur.com/lyuuXXJ.png)
## 3.2 wasm取代docker，成为k8s的调度单元
wasm相比于vm/jvm，相比于docker，都有着自己的优势，虽然目前还没有那么成熟，但是k8s调度wasm而不是docker已经初见雏形。wasmtime wasmer和wasmEdge也都已经是CNCF的一员。可见CNCF还是很看重wasm这个发展方向。

k8s目前也支持直接调度`wasm runtime`了，[这篇文章](https://developer.okta.com/blog/2022/01/28/webassembly-on-kubernetes-with-rust)中给出了一个使用rust打包wasm，并使用wasm-to-oci，将wasm转为符合OCI规范的容器，上传到容器镜像仓库，然后用Krustlet工具使k8s调度该容器运行。流程稍显繁琐，文章最后也有小结，目前的wasm in k8s还略显生涩。而[wasmEdge的官方文档](https://wasmedge.org/book/en/use_cases/kubernetes.html)也对自己在k8s中使用给出了例子。

![image](https://i.imgur.com/lMj9gOq.png)

结论大概就是wasm无法取代docker，至少目前还不够成熟，但是是个很好的发展方向，给我们很大的启发。

