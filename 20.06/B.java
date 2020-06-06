import java.util.Scanner;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * @author Frank
 * @date 2020/6/2 2:15
 */
public class B {

    public static void main(String[] args) throws InterruptedException {
       test2();

/*
1
2
3
4
5
6
7
 */

    }

    /**
     * 场景一 线程1拿到锁，线程2尝试拿锁。
     */
    public static void test1() throws InterruptedException {
        Lock l = new ReentrantLock();
        Thread t1 = new Thread(()->{
            l.lock();
            System.out.println("线程" + Thread.currentThread().getId() +"拿到锁");
            try {
                Thread.sleep(100000000000000000l);
            } catch (InterruptedException e) {
                System.out.println("线程" + Thread.currentThread().getId() +"释放锁");
            }
            l.unlock();
        });
        t1.start();
        Scanner sc = new Scanner(System.in);
        sc.nextLine();
        new Thread(()->{
            l.lock();
            System.out.println("线程" + Thread.currentThread().getId() +"拿到锁");
            l.unlock();
        }).start();

        sc.nextLine();
        t1.interrupt();


    }

    public static void test2() throws InterruptedException {
        Lock l = new ReentrantLock();
        new Thread(()->{
            l.lock();
            try {
                Thread.sleep(5000l);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            l.unlock();
        }).start();
        for(int i=0;i<100;i++){
            int t = i;
            new Thread(()->{
                l.lock();
                System.out.println(t);
                l.unlock();
            }).start();
            Thread.sleep(10);
        }


    }
}
