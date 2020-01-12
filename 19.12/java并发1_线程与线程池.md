# 线程与线程池
线程概念不多说了，java声明线程的三种方式：继承thread类和实现runnable接口，或者使用线程池。

## 为什么需要线程池呢？
首先线程池是创建好的线程对象组成的池子，有了创建好的对象，就不需要频繁的创建(new)和销毁(gc)线程对象了，而这些动作会消耗性能，这是最主要的一个原因。除此之外，线程池实现了很多特殊功能。下面会讲

## 如何创建线程池？
直接使用`ThreadPoolExecutor`类的构造方法就可以创建线程池。我们来看下构造参数：
```java
/**
*  corePoolSize    核心线程数
*  maximumPoolSize 最大线程数
*  keepAliveTime   idle线程存活时间
*  unit            上个参数的单位
*  workQueue       线程对象的缓冲队列
*  threadFactory   生成线程的工厂(可选
*  handler         达到容量后的回调(可选)
*/
public ThreadPoolExecutor(int corePoolSize,
                              int maximumPoolSize,
                              long keepAliveTime,
                              TimeUnit unit,
                              BlockingQueue<Runnable> workQueue,
                              ThreadFactory threadFactory,
                              RejectedExecutionHandler handler) 
```
详解：

- 核心线程数参数是表示当前线程池最佳的工作状态：是有这么多个线程的时候。线程池会趋于这个状态，即如果线程不够这个值，新来的task就会new线程来做，如果超过了这个数量，并且有的线程是idle空闲状态的话，就会在`keepalive`时间后gc掉这个线程对象。

我们来从头到尾看线程池工作方式：
- 1 首先task到来，线程池是空的没有任何线程对象。此时会看设置的coreSize，如果当前线程数&lt;coreSize，则new线程对象来做这个任务。
- 2 task一直来。等到有一个task来了，且当前线程数=coreSize了。此时将task塞到queue中。
- 3 task继续来。等到有一个task来了，且当前队列也满了。此时将新来的task创建新的线程去执行，注意是新来的这个线程去处理，而不是处理队列中的，来的早不如来的巧啊。
- 4 task继续来。等到有一个task来了，且当前总的线程数=maxSize了，此时触发rejectExecute，回调handler。

上面的是一种极端情况，如果线程执行完了，就会从队列中拿task去做。如果队列中没有任务，那么当前线程对象就无所事事，idle状态。如果线程是idle状态持续keepalive时间了，且当前总线程数>coreSize，那么就gc掉这个线程对象，避免占用太多内存。

# 分析jdk中的线程池
```java
public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                  60L, TimeUnit.SECONDS,
                                  new SynchronousQueue<Runnable>());
}
public static ExecutorService newFixedThreadPool(int nThreads) {
    return new ThreadPoolExecutor(nThreads, nThreads,
                                  0L, TimeUnit.MILLISECONDS,
                                  new LinkedBlockingQueue<Runnable>());
}
```
cached的coreSize是0,队列长度也是0。因而直接进入上面的第3步，并且maxSize是intmax，所以可以创建非常多的线程对象。并且这些线程对象如果一旦空闲就只能活60s。不过60s内如果有新任务就可以复用啦。（不足：60s太随意，intmax可能导致高并发下线程对象太多内存炸了）

fixed的coreSize和maxSize都是传入参数个，且队列无限大。所以上面步骤1->2,再也到不了3，一直往队列里塞，然后coreSize个线程对象慢慢处理任务。（不足：linedQueue无限大，也会导致内存炸掉）



