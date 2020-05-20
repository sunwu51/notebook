#  并发集合类
## 1 同步队列 BlockingQueue和BlockingDuque
### 1.1 BlockingQueue

普通的阻塞队列，主要有以下几种实现。

> ArrayBlockingQueue 底层实现是数组，和ArrayQueue底层实现一致。主要是多出了阻塞(同步)的方法put和take。

>LinkedBlockingQueue 底层实现是单链表。也是多出了阻塞的put和take方法。

> PriorityBlockingQueue 底层实现就是PriorityQueue，注意这个类中的put方法是非阻塞的等价于offer方法，但是take方式是阻塞的。

> SynchronousQueue 特点是只能存0个元素,即put和take单独运行都会阻塞，只有put阻塞后，另一个线程配合着take，才能拿到东西。newCachedThreadPool中使用的就是该队列，coreSize为0，队列也是满的(0个就满了)，所以只能往maxSize开辟新线程。

> DelayQueue 可以实现在特定的时间的时候才能从队列拿出元素，早于这个时间拿不到元素。内部使用的是优先队列(堆)实现，即可以实现虽然后插入但是设定时间更靠前的，可以先被拿出来。
```java
// ArrayBlockingQueue的put与take
public void put(E e) throws InterruptedException {
    checkNotNull(e);
    final ReentrantLock lock = this.lock;
    lock.lockInterruptibly();
    try {
        while (count == items.length)
            notFull.await();
        enqueue(e);
    } finally {
        lock.unlock();
    }
}
public E take() throws InterruptedException {
    final ReentrantLock lock = this.lock;
    lock.lockInterruptibly();
    try {
        while (count == 0)
            notEmpty.await();
        return dequeue();
    } finally {
        lock.unlock();
    }
}
```
![image](https://i.imgur.com/v2Pt6Mi.png)
### 1.2 BlockingDuque

双向阻塞队列，继承自BlockingQueue和Duque，自身额外提供了如下方法：

![image](https://i.imgur.com/BRUW8JT.png)

主要实现类就一个`LinkedBlockingDeque`，跟LinkedBlockingQueue有点像，只不过后者是单链表，而他是双链表，所以可以进行两头插入，他就是同步版本的LinkedList。
# 2 非同步队列
## 2.1 ConcurrentLinkedQueue与ConcurrentLinkedDuque
前者是单向队列，后者双向。原理上和同步队列不同，同步队列使用一把锁来控制入队和出队，而`ConcurrentLinkedQueue`使用CAS来控制并发下的一致性。

以offer为例，下面代码比较短，CAS是cpu原子性的指令，比较并设置值，两步操作能保证原子性。

插入流程为，新节点newNode，p一开始指向tail节点
- 第一阶段：
  - q指向p.next 一直尝试 判断`p.next如果=null`，则`p.next=newNode`，如果执行成功了，则进入下一阶段
  - 否则p q相等（一般是并发操作导致）
- 

![image](https://i.imgur.com/ezLlq7K.png)
