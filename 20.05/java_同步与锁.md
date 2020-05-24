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







