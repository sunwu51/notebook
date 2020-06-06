

import sun.misc.Unsafe;

import java.lang.reflect.Field;
/**
 * @author frank wy170862@alibaba-inc.com
 * @date 2020-02-24
 */
public class A {
    public static void main(String[] args) throws Exception {
        test6();
    }
    /**
     * 一、正常创建的对象，状态为无锁，观察hashcode和age的变化
     *
     * 锁状态：无锁，hashCode：0,age: 0
     * ---------------
     *
     * 运行hashcode方法，得到hashcode:648129364
     * 锁状态：无锁，hashCode：648129364,age: 0
     * ---------------
     *
     * [GC (System.gc()) [PSYoungGen: 6568K->1095K(76288K)] 6568K->1103K(251392K), 0.0017301 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]
     * [Full GC (System.gc()) [PSYoungGen: 1095K->0K(76288K)] [ParOldGen: 8K->932K(175104K)] 1103K->932K(251392K), [Metaspace: 3084K->3084K(1056768K)], 0.0054386 secs] [Times: user=0.02 sys=0.01, real=0.01 secs]
     * 运行一次gc，obj的age+1
     * 锁状态：无锁，hashCode：648129364,age: 1
     * ---------------
     *  @throws Exception
     */
    private static void test1() throws Exception {
        Object a = new Object();
        printLockHeader(a);
        System.out.println("运行hashcode方法，得到hashcode:" + a.hashCode());;
        printLockHeader(a);
        System.gc();
        System.out.println("运行一次gc，obj的age+1");
        // sleep 1s 让gc完成，但是不一定能100%触发gc，可以配合添加运行参数 -XX:+PrintGCDetails，观察确实gc了
        Thread.sleep(1000);
        printLockHeader(a);
    }
    /**
     * 二、正常创建的对象，状态为无锁，无锁状态直接加锁会变成轻量锁
     *
     * 锁状态：无锁，hashCode：0,age: 0
     * ---------------
     *
     * 对a加锁后
     * 锁状态：轻量级锁，LockRecord地址：1c00010c6e28
     * ---------------
     * @throws Exception
     */
    private static void test2() throws Exception {
        Object a = new Object();
        printLockHeader(a);
        synchronized (a){
            System.out.println("对a加锁后");
            printLockHeader(a);
        }
    }
    /**
     * 三、程序启动一定时间后，正常创建的对象，状态为偏向锁且thread为0，此时加锁默认为偏向锁
     * 一段时间一般是几秒，-XX:BiasedLockingStartupDelay=0可以指定默认就使用偏向锁，而不是无锁
     *
     * 锁状态：偏向锁，thread：0,epoch: 0,age: 0
     * ---------------
     *
     * 对a加锁后
     * 锁状态：偏向锁，thread：137069895700,epoch: 0,age: 0
     * ---------------
     *
     * 偏向锁重入后
     * 锁状态：偏向锁，thread：137069895700,epoch: 0,age: 0
     * ---------------
     * @throws Exception
     */
    private static void test3() throws Exception {
        Thread.sleep(5*1000);
        Object a = new Object();
        printLockHeader(a);
        synchronized (a){
            System.out.println("对a加锁后");
            printLockHeader(a);
            System.out.println("偏向锁重入后");
            synchronized (a){
                printLockHeader(a);
            }
        }
    }
    /**
     * 四、基于三，当另一个线程尝试使用对象锁的时候，升级为轻量锁
     *
     * 锁状态：偏向锁，thread：0,epoch: 0,age: 0
     * ---------------
     *
     * 线程1对a加锁后
     * 锁状态：偏向锁，thread：137122299998,epoch: 0,age: 0
     * ---------------
     *
     * 锁释放了
     * 线程2对a加锁后
     * 锁状态：轻量级锁，LockRecord地址：1c00015e6a18
     * ---------------
     * @throws Exception
     */
    private static void test4() throws Exception {
        Thread.sleep(5*1000);
        Object a = new Object();
        printLockHeader(a);
        new Thread(
                ()->{
                    synchronized (a){
                        System.out.println("线程1对a加锁后");
                        try {
                            printLockHeader(a);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                    try {
                        Thread.sleep(10000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }

                }
        ).start();
        // 中间sleep1s，保证锁释放掉，使两个线程不会有竞争关系
        Thread.sleep(1000);
        System.out.println("锁释放了");
        new Thread(
                ()->{
                    synchronized (a){
                        System.out.println("线程2对a加锁后");
                        try {
                            printLockHeader(a);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                }
        ).start();
    }
    /**
     * 五、基于四，当产生竞争的时候偏向锁直接升级为重量级锁
     *
     * 锁状态：偏向锁，thread：0,epoch: 0,age: 0
     * ---------------
     *
     * 线程1对a加锁后
     * 锁状态：偏向锁，thread：137025283340,epoch: 0,age: 0
     * ---------------
     *
     * 线程2对a加锁后
     * 锁状态：重量级锁，Monitor地址：1fe758800a02
     * ---------------
     * @throws Exception
     */
    private static void test5() throws Exception {
        Thread.sleep(5*1000);
        Object a = new Object();
        printLockHeader(a);
        new Thread(
                ()->{
                    synchronized (a){
                        System.out.println("线程1对a加锁后");
                        try {
                            printLockHeader(a);
                            Thread.sleep(1000);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                }
        ).start();
        new Thread(
                ()->{
                    synchronized (a){
                        System.out.println("线程2对a加锁后");
                        try {
                            printLockHeader(a);
                            Thread.sleep(1000);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                }
        ).start();
    }
    /**
     * 六、四+五 演示偏向-轻量-重量过程
     *
     * 锁状态：偏向锁，thread：0,epoch: 0,age: 0
     * ---------------
     *
     * 线程1对a加锁后
     * 锁状态：偏向锁，thread：137272648594,epoch: 0,age: 0
     * ---------------
     *
     * 锁释放
     * 线程2对a加锁后
     * 锁状态：轻量级锁，LockRecord地址：1c0001b43e18
     * ---------------
     *
     * 锁释放
     * 线程3对a加锁后
     * 锁状态：轻量级锁，LockRecord地址：1c0001b43e18
     * ---------------
     *
     * 线程4对a加锁后
     * 锁状态：重量级锁，Monitor地址：1ff616600f02
     * ---------------
     * @throws Exception
     */
    private static void test6() throws Exception {
        Thread.sleep(5*1000);
        Object a = new Object();
        printLockHeader(a);
        new Thread(
                ()->{
                    synchronized (a){
                        System.out.println("线程1对a加锁后");
                        try {
                            printLockHeader(a);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                    try {
                        Thread.sleep(10000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
        ).start();
        // 中间sleep1s，使线程不会有竞争关系
        Thread.sleep(1000);
        System.out.println("锁释放");
        new Thread(
                ()->{
                    synchronized (a){
                        System.out.println("线程2对a加锁后");
                        try {
                            printLockHeader(a);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }

                }
        ).start();
        // 中间sleep1s，使线程不会有竞争关系
        Thread.sleep(1000);
        System.out.println("锁释放");
        new Thread(
                ()->{
                    synchronized (a){
                        System.out.println("线程3对a加锁后");
                        try {
                            printLockHeader(a);
                            Thread.sleep(1000);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                }
        ).start();
        // 此时不再sleep，使线程必然发生竞争，升级为重量级锁
        new Thread(
                ()->{
                    synchronized (a){
                        System.out.println("线程4对a加锁后");
                        try {
                            printLockHeader(a);
                            Thread.sleep(1000);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                }
        ).start();
    }
    private static Unsafe getUnsafe() throws Exception {
        Class<?> unsafeClass = Class.forName("sun.misc.Unsafe");
        Field field = unsafeClass.getDeclaredField("theUnsafe");
        field.setAccessible(true);
        return  (Unsafe) field.get(null);
    }
    private static void printLockHeader(Object obj) throws Exception {
        Unsafe us = getUnsafe();
        StringBuilder sb = new StringBuilder();
        int status = us.getByte(obj, 0L) & 0B11;
        // 0 轻量级 1 无锁或偏向 2 重量级 3 GC标记
        switch (status){
            case 0:
                // ptr_to_lock_record:62|lock:2
                long ptrToLockRecord =
                        (byteMod(us.getByte(obj, 0L))>>2) +
                                (byteMod(us.getByte(obj, 1L))<<6) +
                                (byteMod(us.getByte(obj, 2L))<<14) +
                                (byteMod(us.getByte(obj, 3L))<<22) +
                                (byteMod(us.getByte(obj, 4L))<<30) +
                                (byteMod(us.getByte(obj, 5L))<<38) +
                                (byteMod(us.getByte(obj, 6L))<<46) +
                                (byteMod(us.getByte(obj, 7L))<<54);
                sb.append("锁状态：轻量级锁，LockRecord地址：")
                        .append(Long.toHexString(ptrToLockRecord))
                ;
                break;
            case 1:
                boolean biased = (us.getByte(obj, 0L)&4) == 4;
                if(!biased){
                    // unused:25 | identity_hashcode:31 | unused:1 | age:4 | biased_lock:1 | lock:2
                    int hashCode = (int)(byteMod(us.getByte(obj, 1L))
                            + (byteMod(us.getByte(obj, 2L))<<8)
                            + (byteMod(us.getByte(obj, 3L))<<16)
                            + ((byteMod(us.getByte(obj, 4L))&Integer.MAX_VALUE) <<24))
                            ;
                    int age = (us.getByte(obj,0L)>>3)&0B1111;
                    sb.append("锁状态：无锁，hashCode：")
                            .append(hashCode)
                            .append(",age: ")
                            .append(age);
                }else{
                    //thread:54|epoch:2|unused:1| age:4 | biased_lock:1 | lock:2
                    long thread = (byteMod(us.getByte(obj, 1L))>>2) +
                            (byteMod(us.getByte(obj, 2L))<<6) +
                            (byteMod(us.getByte(obj, 3L))<<14) +
                            (byteMod(us.getByte(obj, 4L))<<22) +
                            (byteMod(us.getByte(obj, 5L))<<30) +
                            (byteMod(us.getByte(obj, 6L))<<38) +
                            (byteMod(us.getByte(obj, 7L))<<46);
                    ;
                    int epoch = us.getByte(obj, 1L) & 0B11;
                    int age = (us.getByte(obj,0L)>>3)&0B1111;
                    sb.append("锁状态：偏向锁，thread：")
                            .append(thread)
                            .append(",epoch: ")
                            .append(epoch)
                            .append(",age: ")
                            .append(age);
                }
                break;
            case 2:
                // ptr_to_heavyweight_monitor:62| lock:2
                long ptrToMonitor =
                        (byteMod(us.getByte(obj, 0L))>>2) +
                                (byteMod(us.getByte(obj, 1L))<<6) +
                                (byteMod(us.getByte(obj, 2L))<<14) +
                                (byteMod(us.getByte(obj, 3L))<<22) +
                                (byteMod(us.getByte(obj, 4L))<<30) +
                                (byteMod(us.getByte(obj, 5L))<<38) +
                                (byteMod(us.getByte(obj, 6L))<<46) +
                                (byteMod(us.getByte(obj, 7L))<<54);
                sb.append("锁状态：重量级锁，Monitor地址：")
                        .append(Long.toHexString(ptrToMonitor))
                ;
                break;
            case 3:
                sb.append("锁状态：GC标记");
                break;
            default:
                break;
        }
        if(obj instanceof Object[]){
            int arrLen = us.getInt(obj, 3L);
            sb.append("对象为数组类型，数组长度:")
                    .append(arrLen);
        }
        sb.append("\n").append("---------------").append("\n");
        System.out.println(sb.toString());
    }
    private static long byteMod(byte b){
        if(b>=0){
            return b;
        }
        return b + 256;
    }
}