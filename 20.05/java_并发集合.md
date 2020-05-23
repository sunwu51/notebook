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

这里有两个while循环内部的是尽量保证p指向tail，但是tail不一定指向真正的尾部节点，存在更新延时。外部的while通过cas强制性保证了p为最后一个节点的时候在后面追加newNode。

![image](https://i.imgur.com/ezLlq7K.png)

# 3 CopyOnWrite
## 3.1 CopyOnWriteArrayList和CopyOnWriteArraySet
`CopyOnWriteArrayList`和ArrayList很像，底层都是数组来存储。不同的是前者的数组和元素个数始终是同样大小的，后者数组是默认10，满了扩容0.5倍。前者则直接复制一份并且大小+1的数组，将最后一个元素赋值为要插入的元素，并替换原来的。

![image](https://i.imgur.com/ioI1z86.png)

这里主要通过了synchronized保证了写操作不会有并发问题，而读操作因为每个元素所在位置没变，所以也不会有并发问题。

`CopyOnWriteArraySet`底层存储使用的就是`CopyOnWriteArrayList`，所以在添加元素多了之后，需要遍历比较是否已经存在，因而效率不是很高。

# 4 ConcurrentMap
## 4.1 ConcurrentHashMap
## 4.2 ConcurrentSkipListMap
按照前面的思想进行分桶锁处理，是可以获得比较好的并发性能。但是对于红黑树实现的`TreeMap`没有桶，也没法分锁。所以对于有序的Map，有着另一种实现方式就是使用跳表的`ConcurrentSkipListMap`。跳表的原理如下，本身是链表，但是链表查询O(n)太慢，所以用空间换时间，O(logn)的复杂度。

![image](https://i.imgur.com/J015PCt.png)

以此为底层存储实现的Set就是`ConcurrentSkipListSet`。

前面说了存储原理，其实需要保证并发还是使用了CAS来保证的。

