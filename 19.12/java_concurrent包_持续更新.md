# concurrent包
concurrent包中有很多实用的类，像ConcurrentHashMap。本文介绍其中几个的用法和原理。

# 1 CyclicBarrier 屏障或叫栅栏
顾名思义，多个线程执行速度无法控制统一。如果有个事情是必须n个线程都昨晚某些事情才能运行的话，就需要屏障拦住先执行完毕的。
```java
static CyclicBarrier cyclicBarrier = new CyclicBarrier(10,()->{
        System.out.println("屏障已满，准备开始执行");
});
class R1 implements Runnable{
    @Override
    public void run() {
        System.out.println("到达屏障开始等待");
        try {
            cyclicBarrier.await();
            System.out.println("执行屏障后内容");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
@Test
public void CyclicBarrierTest(){
    for(int i=0;i<30;i++){
        new Thread(new R1()).start();
    }
}
```
打印结果：
```
到达屏障开始等待
到达屏障开始等待
到达屏障开始等待
到达屏障开始等待
到达屏障开始等待
到达屏障开始等待
到达屏障开始等待
到达屏障开始等待
到达屏障开始等待
到达屏障开始等待
屏障已满，准备开始执行
执行屏障后内容
执行屏障后内容
执行屏障后内容
执行屏障后内容
执行屏障后内容
执行屏障后内容
执行屏障后内容
执行屏障后内容
执行屏障后内容
执行屏障后内容
```
注意：栅栏可以循环使用，满了之后会放行，然后会再次开始拦截。
# 2 CountDownLatch
```java
static CountDownLatch countDownLatch = new CountDownLatch(5);
class R2 implements Runnable{
    @Override
    public void run() {
        System.out.println("R2准备");
        countDownLatch.countDown();
        System.out.println("R2后续");

    }
}
class R3 implements Runnable{
    @Override
    public void run() {
        try {
            System.out.println("等待5个R2准备完成");
            countDownLatch.await();
            System.out.println("R3执行");
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

    }
}
@Test
public void CountDownLatchTest(){
    new Thread(new R3()).start();
    for (int i=0;i<5;i++){
        new Thread(new R2()).start();
    }
}
```
打印：
```
等待5个R2准备完成
R2准备
R2后续
R2准备
R2后续
R2准备
R2后续
R2准备
R2后续
R2准备
R2后续
R3执行
```
CountDownLatch和栅栏非常像，也是await阻塞住，然后计数，记满了就放行。但是栅栏阻塞住的是每个线程，计数的也是这些线程。而Latch是阻塞住另外一个单独的线程，如上先阻塞住R3，然后记R2数，R2满了，给R3放行，并不阻塞R2自己。

场景选择：
- 如果是凑够了一起往下的模型就选栅栏
- 如果是凑够了就让另一个线程往下执行就选Latch

# 3 Semaphore
信号，这个类呢，是为了弥补下synchronized关键字修饰的同步代码块，只允许一个线程进入的问题。这个类包住的代码块（我叫他信号代码块）允许n个线程同时进入。但是一旦已经计数到了n，就再也不会让其他线程进入了。
```java
static Semaphore semaphore = new Semaphore(3,false);
class R4 implements Runnable{
    int i;
    public R4(int i){
        this.i =i ;
    }
    @Override
    public void run() {
        try {
            semaphore.acquire(1);
            System.out.println(i);
            Thread.sleep(1000);
            semaphore.release();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
// 因为用到了sleep所以不能用junit测试，
public void main(String[] args) throws InterruptedException {
    for(int i=0;i<10;i++){
        new Thread(new R4(i)).start();
    }
}
```
打印：先打印三个数，然后等待1s后再打印3个，依次类推
```
0
2
1
3
5
4
6
7
8
9
```
# 4 ConcurrentHashMap
在1.7的时候是分段锁，在1.8变成每个数组元素有synchronized关键字修饰了,此外像value，nextnode的等等都用了volatile修饰，保证可见性。
//-----待补充
# 5 BlockQueque
阻塞队列，满的时候put阻塞，空的时候poll阻塞，常用与生产者消费者模式。
//-----待补充