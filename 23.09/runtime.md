# What is a Runtime
# 1 前言
Runtime直译过来就是运行时，他可以描述程序的一个阶段，也就是运行阶段，与之对比的就是编译阶段，结束阶段等；他也可以是一个名词，指运行环境。这里主要讨论的就是后者。
# 2 CRT（C Runtime）
一个简单的程序运行结构图如下，runtime其实作为我们的程序App和操作系统内核Kernel中间的一个纽带。这个图中的runtime其实特指`CRT`，为什么是C呢？因为Linux内核是C写的，内核本就是一个程序，我们要想在Linux上运行程序，也得用C，或者至少最终是用C与Linux内核交互。

![image](https://i.imgur.com/lSmnFgR.png)

CRT的库（或者叫标准C库，libc）有多种实现，换言之，能与内核交流的库有多套。以Linux为例，经典的libc是`GNU libc`，或称其为`glibc`。glibc有自己的一些问题，牵扯到GNU的一些历史，这里不展开。另一种常见的libc就是`musl libc`，他的实现更加独立和解耦。

像`CentOS`、`Ubuntu`、`Debian`等Linux都是GNU Linux，即都是内置了GNU的各种库，并且内置了`glibc`，当然libc自己或者随着内核更替也在版本更替。

![image](https://i.imgur.com/dstx0Wy.png)

libc可以直接打到程序里，也可以作为动态链接库，两者各有优劣。

# 3 系统调用与函数调用
这是个题外话，但是为了好理解还是补充一下这方面的知识。为了方便与内核交互，内核对外提供了一些API，这些就是`系统调用`，系统调用触发后，程序从用户态进入内核态，只有三种方式能触发该状态的转变，而系统调用就是唯一一种主动触发的，可见其重要性。

常见的系统调用，比如打开文件的`open/read/write`，申请内存的`brk/mmap`，经常听说的多路io复用的`select/poll/epoll`，还有零拷贝的`sendfile`等等，都是系统调用，通俗讲，只要想主动访问外部资源（堆内存、io、cpu等等），都是需要系统调用滴。

函数调用，就是不需要访问外部资源的，比如栈上的数学运算。当然这是狭义的函数调用概念，广义上来讲，但凡不是系统调用的，都是函数调用，函数调用里面可能也封装了系统调用。例如`libc`中打开文件的`fopen`就是函数，他会调用`open`系统调用，因为open参数复杂，`fopen`进行了简化和封装；再比如申请内存的`malloc`也是函数，他会根据申请空间的大小选择使用`brk`还是`mmap`系统调用。

# 4 其他语言的程序是如何运行的
上面介绍了C的重要性，也介绍了libc这种`c app`和内核传话的通讯工具，但是非C语言是怎样与内核交互呢。

编译型语言像C/C++/GO/Rust的运行方式是编译成二进制文件，直接调用`libc`，当然了不同的语言环境可能有自己的`runtime`来确保完成一些额外工作，例如`Golang`也有自己的`runtime`，这个`go runtime`需要完成诸如垃圾清理、协程调度器等工作，所以golang编译出的二进制文件在linux下运行的结果如下。

![image](https://i.imgur.com/0u27oDf.png)

解释型语言像java/python/nodejs的运行方式是代码由解释器运行，逐行执行，当然对于大多数解释型语言都会引入提供性能的`JIT`技术，动态侦测热代码进行编译，以java为例，jre的jit技术将热函数编译成机器码运行，而其他的就用解释器运行，而热函数是程序不断运行去侦测出来的，这种动态编译的技术，也使得java程序需要“预热”才能达到较高的性能。

![image](https://i.imgur.com/ylBi4LE.png)

虽然有预热和性能低于AOT等等缺点，但是解释型语言也有强项，就是多平台的兼容，因为对不同的平台会提供不同的`runtime`环境（windows linux arm64 x86_64等不同平台需要安装不同的jre），而这些runtime就像适配器，向下适配了`C runtime`和内核，所以对于用户代码来说就可以做到，不同平台的完全兼容，即用一个jar包，或者一个py文件可以在不同平台上运行。而编译型语言无法做到，只能编译出native的二进制文件。

# 5 另类的runtime--Container===是否会革了java的命
容器其实也是一种runtime，容器与VM的区别是什么？如下图，其实就是容器本身不具有内核，而VM是有自己内核的独立OS。换言之容器中所有进程的运行本质都是运行在宿主机系统上的进程，只是通过PID namespace隔离了一下。

![image](https://i.imgur.com/mA5yTHr.png)

![image](https://i.imgur.com/MYJTh6m.png)

容器中一个C语言的程序运行是怎样的呢，其实和之前的C程序运行结构图类似。Docker引擎只是做了一层翻译，最终程序还是与host的内核交互，这层翻译我们也可以叫他`Container Runtime`，他相比直接在host上native运行有10%+的performance loss。

![image](https://i.imgur.com/Wpthqvn.png)

思考：Docker的出现其实已经完成了java兼容多平台的能力，云原生时代java面临巨大窘境，java的Native化趋势明显。

GraalVm、spring native能否救java的命，目前的阻力重重，几年后再来看结果。

# 6 wasm--要革Container的半条命
