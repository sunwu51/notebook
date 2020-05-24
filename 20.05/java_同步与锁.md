# 同步与锁
# 1 如何实现锁
定义变量a=0，如果有线程过来看到a=0则认为锁没被别人拿走，这时他将a设置为1，自己拿走锁。另一个线程过来发现a=1了则认为有人用锁，自己就等待。

但是这个过程存在并发问题，获取锁的操作是有两步的：
- 1 查看锁是不是还在
- 2 把锁状态设置为1

如果在1和2之间，有另一个线程进来拿锁。则另一个线程也认为锁还在，认为自己能拿走锁，就导致两个线程都拿到锁了。

这个问题在软件层面无解，所以CPU在硬件上添加了一些原子性操作指令集。CAS（CompareAndSwap）比较并交换。这样上面1和2两步就可以合成一步`cas(state,0,1)`，cas函数的返回值是boolean，表示是否将锁赋值为0了（即自己是否拿到了锁）。
# 2 Lock
Lock接口就是使用上面cas原理实现的锁，它基于AQS框架。以`ReentrantLock`为例，这个类中的lock和unlock方法，完全是委托给内部成员变量sync执行的，所以核心内容都是sync实现的。

先从lock函数出发，看看加锁过程是如何实现的，先看下非公平的Sync：206行就是我们1中的cas，207行如果获取到锁了就把锁拥有者设置为当前线程。否则就`acquire(1)`。

![image](https://i.imgur.com/WP2ozNW.png)

acquire函数其实非常重要，他代表了锁获取失败时候，线程的动作。aquire是AQS中定义的final方法，主要是调用tryAquire/addWaiter/acquireQueued这几个方法。

![image](https://i.imgur.com/Se9Xsx6.png)  
tryAquire函数：尝试获取锁，在图1中，他直接调用nonfaireTryAcquire方法，如下，这个函数也是尝试拿锁，并且加了一个如果已经拿到锁了，就`state+1`的操作。  
![image](https://i.imgur.com/3i2rupz.png)  
addWaiter是把当前线程(设置为互斥模式)，追加到队列尾部  
![image](https://i.imgur.com/wK5EHvR.png)   
acquireQueued是不断判断当前线程是不是位于队列头部了，如果是则尝试获取锁，获取失败也是不断重试。这里也是体现了AQS的自旋特性，死循环对每个节点不断判断和尝试加锁。其他人的说法：`一旦加入同步队列，就需要使用该方法，自旋阻塞唤醒来不断的尝试获取锁，直到被中断或获取到锁`  
![image](https://i.imgur.com/B8fe55K.png)  

AQS中需要用队列，且只对队列头部的线程进行加锁尝试(x)？

> 这个队列叫做CLH队列，存储Node，字段有thread，waitStatus，prev，next，nextWaiter(Condition中使用)。队列节点除了给可重入的Lock用，更多的是AQS提供了一个框架，可以实现公平锁，非公平锁，以及对park、unpark的时候，queue是有用的。

> 并不是只对头部加锁，公平锁是对头部加锁，而非公平锁，在锁释放的瞬间，有新的线程过来，新的线程会竞争到这把锁。


公平锁与非公平锁的区别[参考](https://www.jianshu.com/p/f584799f1c77)


unlock就比较简单了，因为只有加了锁的线程才能释放锁，所以就判断下owner是不是currentThread，是的话，就state-1。此外上面加锁的时候我们把2次尝试拿锁都失败的，节点的prev状态设置为了-1，并且使该节点的线程park了，所以这里需要将其唤醒，使其继续自旋拿锁。
![image](https://i.imgur.com/QMtehyn.png)

# 3 Condition
先说下CLH队列中Node的waitStatus状态，主要有5种 
- 0 默认是没有状态 
- 1 CANCELLED因为超时或中断取消
- -1 SIGNAL 需要unpark唤醒接班人
- -2 CONDITION节点在等待队列中，被Condition给await了，需要在被signal之后，才能从等待队列转移到同步队列。
- -3 PROPAGETE传播状态，共享锁用的。

Condition是个接口，在AQS中的实现类是ConditionObject，这个类内部维护了另一个队列，条件队列或者叫等待队列吧。这个队列也是用了前面提到的Node类作为元素，但是为了和同步队列区分没有使用next和prev，而是使用了nextWaiter。


await的过程通俗讲就是，把当前线程添加到等待队列尾部，释放当前线程的锁，确保已经不在同步队列后，进行park。注意addConditionWaiter中没有使用CAS保证并发，因为能对等待队列操作的线程只能是当前持有锁的线程。fullyRelease则是释放全部的state，isOnSyncQueue这里应该是必然返回false，线程进入park阻塞状态。下面的就是出现中断等状况运行到的代码，这里不展开了。
![image](https://i.imgur.com/cFKKES4.png)

signal的过程也很简单，就是判断是不是当前线程有这把锁，并且至少有个线程在等待被唤醒，也是只有当前持有锁的线程在操作，也不需要CAS。
![image](https://i.imgur.com/2GI2A9c.png)  
![image](https://i.imgur.com/tEXqz7n.png)  
# 4 synchronized
jdk1.6之前是重型锁，利用linux内核的mutex互斥锁，保证只有一个线程能够进入，反编译代码中能看到`monitorenter`,`monitorexit`，而1.6之后引入了偏向锁和轻量级锁。之前讲对象头中就含有这3种锁的状态信息和锁记录的指针。
![image](https://i.imgur.com/wuTsp0z.png)

Java中的synchronized有偏向锁、轻量级锁、重量级锁三种形式，分别对应了锁只被一个线程持有、不同线程交替持有锁、多线程竞争锁三种情况。当条件不满足时，锁会按偏向锁->轻量级锁->重量级锁 的顺序升级。锁也是能降级的，只不过条件很苛刻。


> 锁记录主要有两部分第一部分就是对象头中对应的偏向锁这一行(Displaced Mark Word)这里简称Mark，第二部分Obj是指向锁对象。对于偏向锁的锁记录，第一部分直接是空，只有第二部分。

## 4.1 偏向锁
对象一开始使用的时候都是偏向锁，即锁标志位`01`，是否偏向锁`1`，线程id`0`。

加锁时判断线程id是否为当前线程？
- 否，则通过`cas(线程id,0,当前线程id)`就可以尝试获取锁了，获取失败升级为轻量级锁，一般是已经有了偏向的线程后，新的线程想获取锁。升级时间是下一次全局安全点(safepoint没有字节码运行的时间点)。
- 是，偏向锁在重入的时候发现线程id是自己，在当前栈帧上创建锁记录，锁记录Mark部分为null。

在释放的时候，只需要在线程栈找到最近的一条指向该对象的锁记录，将Obj改成null即可，注意这里不会去改`线程id`(这个线程id这辈子只可能是两个值0或者第一次来的线程)。

如果锁释放后(注意是释放后)，又有另一个线程想使用该锁，`cas(线程id,0,当前线程id)`返回false，因为释放时不修改线程id，毕竟偏向锁，偏心这个线程。返回false后，偏向锁升级为轻量锁。
## 4.2 轻量锁
如果锁标志位是无锁`01`，是否偏向`0`，的时候加锁就会按照轻量锁来。

轻量锁再使用对象加锁的时候，先在栈帧创建锁记录，补全两部分内容。CAS操作将锁记录的地址存到对象头的`锁记录指针`的字段，`cas(锁记录指针,0,刚创建的锁记录指针)`。

- 如果cas成功则轻量锁获取成功，则将锁标志位改为轻量级锁`00`。
- 如果cas失败，可能是重入，检查下对象头中锁记录指针是不是指向当前线程之前的栈帧，是的话则为重入，继续执行同步代码即可。否则其他线程持有锁，则膨胀为重量级锁。标志位变为`10`，后面等锁的线程阻塞，当前线程自旋拿锁。


解锁：遍历栈帧，找到Obj指向当前对象的锁记录，若`Mark=null`，说明是之前重入导致的，此时只需要Obj设置为null即可。而如果`Mark!=null`，说明是第一次进入时的锁记录，则`cas(锁记录指针,Mark,0)`。如果成功，则这个线程的该对象锁全部释放完了。否则可能是膨胀为重量级锁导致的，需要配合进行膨胀。

## 4.3 重量级锁
重量级锁，使用的是mutex互斥量，最大的问题就是挂起和唤醒都要进入内核态完成，而大多数场景下同步代码都是简单如对某全局对象的写操作。这种场景下，重锁用户态内核态切换的开销就比较不划算。
![image](https://i.imgur.com/el756Bv.png)  

重量级锁，在jdk1.4后存在自旋次数设定，在自旋n次后才进入内核态。1.6后参数取消，改为自适应。

mutex互斥量是操作系统提供的锁[参考](https://blog.csdn.net/qq_39736982/article/details/82348672)。对于一些资源的操作，通过先申请到mutex然后才能操作这些资源，实现锁的效果。对应的系统调用是`futex`.  
![image](https://i.imgur.com/aL7fFCx.png)

# 5 小结
`RenentrantLock`通过AQS、cas、自旋配合park实现了锁，而`synchronized`偏向锁->轻量锁->重量锁 变形过程。

存在一些误解：
- Lock只是自旋是不对的，Lock只尝试三次，就进入park了。
- synchronize性能不如Lock也是不对的，其实需要分场景，比如在轻量级锁场景(无竞争)场景下，lock和synchronized都是一次cas就能拿到锁，没有用户内核态切换，两者性能相近。
- 而在重量级锁(存在竞争)场景下，lock队列中线程都会进入park状态，park底层调用的是`pthread_cond_wait`这与wait底层调用相同，而await是park实现的，所以最终我们发现java的这些释放锁的阻塞方式底层实现都是一样的。这个库函数在glibc中，最终的系统调用还是`futex`,synchronized引发的阻塞也是`futex`[参考](https://blog.csdn.net/GYHYCX/article/details/106084621)，所以这个场景下也好像没有太大的区别。


现代锁的设计理念，通过以上的各种代码和趋势分析我们发现：  

早期的锁，完全依赖内核态，开销太大。而用户态的CAS自旋锁，又会在某些高竞争的情况下导致cpu空转浪费资源。

将两者融合的解决方案就出来了：CAS进行锁的获取，如果获取到了就不用进内核态。如果获取不到则自旋n次，如果n次之后还获取不到则futex系统调用让出cpu资源，等待被唤醒。


# 6 参考文献
- https://github.com/farmerjohngit/myblog/issues/12
- https://blog.csdn.net/GYHYCX/article/details/106084621
- https://tech.meituan.com/2018/11/15/java-lock.html
- https://blog.csdn.net/u010318270/article/details/89558090
- https://www.cnblogs.com/zhangchaoyang/articles/2302085.html
- https://www.cnblogs.com/yougewe/p/9751501.html
- https://blog.csdn.net/qq_29373285/article/details/85964460
- https://www.zhihu.com/question/55075763
- https://blog.csdn.net/lengxiao1993/article/details/81568130