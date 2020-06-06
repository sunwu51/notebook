import java.util.concurrent.*;

/**
 * @author Frank
 * @date 2020/6/6 11:39
 */
public class C {
    public static void main(String[] args) throws InterruptedException {
        test3();
    }


    public static void test1(){
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(2);
        new Thread(()->{
            int i = 0;
            while(true){
                try {
                    queue.put(i++);
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
        new Thread(()->{
            while(true){
                try {
                    System.out.println("c1 - "+queue.take());
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
        new Thread(()->{
            while(true){
                try {
                    System.out.println("c2 - "+queue.take());
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

    public static void test2() throws InterruptedException {
        BlockingQueue<Integer> queue = new SynchronousQueue<>();
//        System.out.println(queue.offer(1));
        new Thread(()->{
            try {
                System.out.println(queue.take());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();

        Thread.sleep(1000);
        queue.put(1);



    }

    public static void test3(){
        ConcurrentLinkedQueue<Integer> queue = new ConcurrentLinkedQueue<>();
        queue.offer(1);
        queue.offer(2);
        queue.offer(2);
        queue.offer(2);
        queue.offer(2);
        queue.offer(2);
    }
}
