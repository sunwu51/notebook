# 垃圾收集器
在之前的笔记中简单记录过各个垃圾收集器，这里做更细的介绍，尤其是cms和g1。
# 年轻代的收集器
## 1 serial
串行收集，复制算法，单线程，stop the world。

评价：简单实用，可配合SerialOld
## 2 ParNew
并发收集，复制算法，多线程，stop the world

评价：serial的多线程版本，可配合CMS。
## 3 Parallel Scavenge
并行收集，复制算法，多线程，stop the world

评价：关注吞吐量的垃圾收集器，可配合Parallel Old
# 老年代的收集器
## 1 Serial Old
串行收集，标记整理，单线程，stop the world。

评价：简单实用。
## 2 Parallel Old
并行收集，标记整理，stop the wold。

评价：一般就和PS配合，用于关注吞吐的场景。
## 3 CMS
多次标记：
- 1 初次标记，标出O区的GCROOT对象和被Y区引用的对象，耗时短StopTheWorld
- 2 并发标记，GCRootTracing，时间长，但不用StopTheWorld
- 3 重新标记，修正并发标记中的错误，时间中等，StopTheWold

并发清理：
- 采用`标记清除`算法，定点清理内存，而不影响其他位置内存，所以可以并发搞，不用StopTheWorld。

评价：
极大的降低StopTheWorld时间，是服务端常用的垃圾收集器，配合PawNew使用。不过标记清理是有内存碎片的，这是个比较明显的缺点。


# G1垃圾收集器
## 1 内存结构
G1首先在内存结构上采用了region化的方法，将堆内存划分成2000块左右的小块，每块大小1-32M（2的幂次），每块region都可以作为E、S、O任意一种，分配灵活，但是存在大对象问题。解决方法是：
- 小于一半region size的可以正常存入E区
- 一半到一个region size的直接存入O区一个region中，这个region又叫Humongous region，我们也可以把它叫做H区（他本质还是O区的）
- 比一个region size还要大的对象，需要存入连续的多个region中，这多个region都是H区。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1909/g1-0.png)

## 2 两个概念
- RememberSets，又叫Rsets是每个region中都有的一份存储空间，用于存储本region的对象被其他region对象的引用记录。
- CollectionSets，又叫Csets是一次GC中需要被清理的regions集合，注意G1每次GC不是全部region都参与的，可能只清理少数几个，这几个就被叫做Csets。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1909/g1-7.png)

## 3 YGC
年轻代的GC，StopTheWorld，复制算法。将E和S(from)区复制到S(to)，注意S(to)一开始是没有标识的，就是个free region。`下图中没有标出YGC进入老年代的对象，有可能有一部分会进入O区!!`。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1909/g1-1.png)
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1909/g1-2.png)
## 4 MixGC
G1对于老年代的GC比较特殊，本质上不是只针对老年代，也有部分年轻代，所以又叫MixGC。
- 初次标记，也是标记GCroot直接引的对象和所在Region，但是与CMS不同的是，这里不止标记O区。注意初次标记一般和YGC同时发生，利用YGC的STW时间，顺带把这事给干了。日志格式如下
```
[GC pause (G1 Evacuation Pause) (young) (initial-mark), 0.0062656 secs]
```
- RootRegion扫描，扫描GCroot所在的region到Old区的引用。日志格式
```
1.362: [GC concurrent-root-region-scan-start]
1.364: [GC concurrent-root-region-scan-end, 0.0028513 secs]
```
- 并发标记，类似CMS，但是标记的是整个堆，而不是只有O区。这期间如果发现某个region所有对象都是'垃圾'则标记为X。日志格式
```
1.364: [GC concurrent-mark-start]
1.645: [GC concurrent-mark-end, 0.2803470 secs]
```
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1909/g1-3.png)
- 重新标记，类似CMS，但也是整个堆，并且上一步中的X区被删除。另外采用了初始标记阶段的SATB，重新标记的速度变快。日志格式
```
1.645: [GC remark 1.645: [Finalize Marking, 0.0009461 secs] 1.646: [GC ref-proc, 0.0000417 secs] 1.646: [Unloading, 0.0011301 secs], 0.0074056 secs]
[Times: user=0.01 sys=0.00, real=0.01 secs]
```
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1909/g1-4.png)
- 复制/清理，选择所有Y区reigons和'对象存活率较低'的O区regions组成Csets，进行复制清理。日志格式：
```
1.652: [GC cleanup 1213M->1213M(1885M), 0.0030492 secs]
[Times: user=0.01 sys=0.00, real=0.00 secs]
```

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1909/g1-5.png)
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1909/g1-6.png)
## 问题列表
RootRegionScan这个阶段是干嘛的？
> 标记出RootRegion指向O区的region，标记这些region是为了降低并发标记的扫描范围，因为并发标记需要扫描GCROOT引用或间接的所有对象，而这些对象一定是在RootRegion出发指向的Region中的。MIXGC中Y区本来就要全扫，所以这里再按照O区过滤下，这样就缩小了扫描范围。该阶段的操作为遍历O区region查询Rset是否有来自RootRegion的，（RootRegion是初始标记得到的）。

Rset作用有哪些？
> 上题中的作用是一个，还有个作用是YGC时，O区不GC因而认为O区全为‘GCroot’，需扫描全部O区。有了Rset只需要查看所有Y区region的Rset就知道被哪些O区region跨带引用了，避免了扫描整个O区。

G1提高效率的点有哪些？
> 1 重新标记时X区域直接删除。  
2 Rset降低了扫描的范围，上题中两点。  
3 重新标记阶段使用SATB速度比CMS快。  
4 清理过程为选取部分存活率低的Region进行清理，不是全部，提高了清理的效率。

对比CMS，有哪些不同？
>1 region化的内存结构，采用复制清理的方式，避免了内存碎片。但是这种清理也造成了STW。  
2 SATB速度更快。  
3 初始标记，并发标记，重新标记，清理垃圾四个阶段很像，但是G1中有很多标记region的操作，并借助Rset进行了范围的缩小，提高了并发标记的速度。小结下就是初始标记和YGC的STW一起了，提高了效率；并发标记因为rset的设计，扫描范围缩小了，提高了效率；重新标记因为使用了SATB提高了效率；清理虽然造成了STW，但是复制使内存紧凑，避免了内存碎片。同时只清理垃圾较多的region，最大限度的降低了STW时间。


