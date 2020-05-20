# 1 编排线程
## 1.1 循环屏障(栅栏) CycliCBarrier 
每个线程到达屏障后被阻隔并记录到达的总数，当总数等于预设的值后，这些线程都被"放行"，向下执行，之后屏障恢复为初始状态，可以再次使用。主要方法只有`await`。
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
## 1.2 计数器 CountDownLatch 
计数的位置和阻隔的位置是分离的，阻隔当前线程，在其他线程计数，当计数满了之后，"放行"当前线程。主要方法有`countDown`和`await`。
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
## 1.3 相位器 Phaser
相位器能实现屏障和计数器，是最全能的。他主要4个方法`arrive`、`register`、`arriveAndDeregister`、`awaitAdvance`。

awaitAdvance接参数是期望第几阶段结束。
![image](https://i.imgur.com/sn68i1g.png)
```java
static Phaser phaser = new Phaser(3);
   
public static void main(String[] args) {
   for(int i=0;i<6;i++) {
      new Thread(() -> {
         try {
             Thread.sleep(1000L);
         } catch (InterruptedException e) {
             e.printStackTrace();
         }
         phaser.arrive();
         System.out.println(phaser.getPhase() + "-" + phaser.getRegisteredParties());
      }).start();
    }
    phaser.awaitAdvance(phaser.getPhase());
    phaser.awaitAdvance(phaser.getPhase());
 }
 ```
打印：
```
1-3
0-3
0-3
1-3
1-3
2-3
```
这里使用phaser阶段的概念进行了多阶段计数，phaser比计数器强的除了循环可用，还有一点就是可以动态修改计数的数值。phaser使用过程中需要注意同步可以参考之前的出的[题目](https://gist.github.com/sunwu51/0cc15f42c6923a1498d869a85b6d905b)。
