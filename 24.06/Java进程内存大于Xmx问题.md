---
title: java进程内存大于Xmx问题
date: 2024-06-19 23:21:00+8
tags:
    - java
    - jvm
    - rss
    - heap
    - 内存
---
# 1 `Rss > Xmx`现象
生产环境下其实是很常见的，`java`进程的内存超过了设置的`Xmx`，这也很容易理解，因为`Xmx`指的是堆内存的上限，而`Rss（Resident set size）`是整个进程的内存，他不仅包括了堆内存，还包括了`jvm`这个c++进程运行所需要的内存。

简单讲`Rss`是总内存 = 堆内存 + 堆外内存，`Xmx`只是限制的堆内存大小，接下来用一个简单的`Main.java`为例
```java :Main.java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        Scanner sc = new Scanner(System.in);
        while (true) {
            int cmd = sc.nextInt();
            switch (cmd) {
                case 1:
                    for (int i = 0; i< 10_000_000; i++) {
                        list.add("i=" + i);
                    }
                    System.out.println("add finish, current size " + list.size());
                    break;
                case 0:
                    list.clear();
                    System.out.println("clear finish");
                default:
                    break;
            }
        }
    }
}
```
首先使用java 8具体版本为`8.0.412-zulu`
```bash
$ javac Main.java
$ java -Xmx2g -Xms2g -XX:+PrintGC Main

## 此时查看内存占用，空壳程序大概占用32M内存
```
![img](https://i.imgur.com/VqTKEph.png)

然后java进程的控制台输入`1`回车，代码逻辑是在一个list中加入1kw个`String`，连续输入两个`1`，日志如下。

![image](https://i.imgur.com/IsFssQX.png)

![image](https://i.imgur.com/SSH9WJh.png)

此时`rss` - `heap` = `200M`，这部分是堆外的diff，但是常见的堆外内存`metaspace` `compressedClassSpace` `codeSpace`加起来远远不到200M，是jvm进程自己占用了较多的堆外内存，这部分很难追溯。

此时`java`进程输入`0`清理内存，但是因为没有gc所以内存无变化，然后我们使用指令强制GC：`jcmd $(jps | grep Main | awk '{print $1}') GC.run`，发现`rss`内存一点都没有减小，而`jmap`查看堆内存已经只有不到100m了，那gc清理的内存为什么没有从`RSS`减去呢。

![img](https://i.imgur.com/mbOhf9Z.gif)

多次创建和清理后，`Rss`来到2.2G

![img](https://i.imgur.com/A9R1MYI.png)

触发GC后，内存仍是`2.2G`，堆内存仅`79M`

![img](https://i.imgur.com/JIOAZVh.png)

# 2 如何才能归还
这是因为jvm申请到内存后，是不会轻易将内存归还回去OS的。大内存占用有哪些坏处呢？不归还，当然对jvm进程本身是百益无害的，但是较大的`rss`可能会导致操作系统无法给其他进程分配内存，还有可能导致操作系统`OOM`，被迫把`jvm`进程给干掉。

因而如果操作系统内存远大于`Xmx`堆内存的设置的话，那其实无所谓，如果操作系统内存只比`Xmx`大一点点，那很有可能会在堆内存被撑大之后，无法归还OS，最后导致总`Rss`超过了系统内存，最终被kill。

归还的方式有以下几个方向：
- `UseG1GC`并且设置`Xms<Xmx`，尤其是`jdk11`之后效果更佳
- 调整`MAX_ARENA_SIZE`或使用`Jemalloc`改善底层`libc`的内存申请策略。

## 2.1 g1
修改启动指令`-Xms200m -XX:+UseG1GC`指定`Xms`只有200M，并且使用g1gc，重复上面的流程，最后进程RSS只有`323M`
```bash
$ java -Xmx2g -Xms200m -XX:+UseG1GC -XX:+PrintGC Main
```
![img](https://i.imgur.com/tb1kHdS.gif)

从图中左侧看出，堆大小在gc的过程中不断调节，一开始young区200M，然后不够了，不断扩大最终2004M，在最后一次GC的时候大小又缩小到`266M`，缩小的过程中会把内存归还操作系统。

扩缩的过程是伴随在gc之后的，所以对整体的性能影响不算大，但是肯定也有一点点影响。但是生产环境较少看到`Xms < Xmx`的情况，一般都设置为相等，这个可能来自较早的流传下来的习惯，因为之前没有`g1`的时候，是没有这个效果，所以设置为不同对整体没有任何收益，尤其是服务端进程。这个大家可以酌情去设置，做好灰度验证，最终适合自己业务场景，那么就可以使用这种启动参数。
## 2.2 MAX_ARENA_SIZE
`ARENA`是linux的libc中的默认malloc实现(ptmalloc)，分配内存时的概念，他是为了解决多线程分配内存的并发问题设置的，在多个（64位系统默认是核心数x8）空间上分配内存，这个空间就是`ARENA`，较大的`ARENA`数，会导致内存碎片较多，通过如下指令，改为 1 ，会加剧多线程内存分配的竞争问题，但是带来的好处是，可以在一个`ARENA`分配，如果之前有用不到的内存，一定程度上可以复用。
```bash
$ export MALLOC_ARENA_MAX=1 && java -Xmx2g -Xms2g -XX:+PrintGC Main
```
这个参数，并不会使得内存可以归还OS，但是多次分配->清理->分配->清理后，的Rss总大小会比原来小一些，例如之前重复操作会导致`Rss`大于`2.1G`这里我们同样多次操作，最后只有`1.9G`。

![image](https://i.imgur.com/qSKFFC4.png)

## 2.3 Jemalloc
`jemalloc`是一种有着更好性能表现的`malloc`实现，可以替换`libc`的`ptmalloc`，到`github`下载最新[release版本的代码](https://github.com/jemalloc/jemalloc/releases)。

```bash
$ ./configure --enable-prof --enable-stats --enable-debug --enable-fill
$ make
$ make install
```
![image](https://i.imgur.com/o2bRCnu.png)
启动java进程
```bash
$ export LD_PRELOAD=/usr/local/lib/libjemalloc.so

$ java -Xmx2g -Xms2g -XX:+PrintGC Main
```
`pmap`查看确实使用了`jemalloc.so.2`

![img](https://i.imgur.com/hhwM3dm.png)

运行1 1 0 1 1 0，折腾一圈之后发现内存时`2015M`，比之前的`2.2G`也要少一点。

![img](https://i.imgur.com/kcUC1Yi.png)

可以看到`malloc`相关的两个策略，对于内存的缩小，表现非常有限，但是你会发现在网上搜索各种资料，最后都会指向这两者，因为他们确实还是有一点效果的，并且可能针对不同的程序环境，效果会有不同，只能说我这个简单场景下表现一般。

`jemalloc`还可以追踪内存`profiling`我们以后有机会再去展开讲。