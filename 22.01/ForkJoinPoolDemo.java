import lombok.SneakyThrows;

import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * @author Frank
 * @date 2022/1/18 20:10
 */
public class ForkJoinPoolDemo {

    public static void main(String[] args) {
        ThreadPoolExecutor pool1 = new ThreadPoolExecutor(4,
                4,
                0,
                TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(1000),
                new ThreadPoolExecutor.CallerRunsPolicy());

        ForkJoinPool pool2 = new ForkJoinPool(4);

        Task task1 = new Task("task1", 0, pool1);
        Task task2 = new Task("task2", 1, pool1);
        Task task3 = new Task("task3", 1, pool1);
        Task task4 = new Task("task4", 1, pool1);
        Task task5 = new Task("task5", 10, pool1);
        Task task6 = new Task("task6", 10, pool1);
        Task task7 = new Task("task7", 1, pool1);
        Task task8 = new Task("task8", 1, pool1);
        Task task9 = new Task("task9", 1, pool1);


        task1.dependentTasks.add(task2);
        task1.dependentTasks.add(task3);
        task1.dependentTasks.add(task4);
        task1.dependentTasks.add(task5);
        task1.dependentTasks.add(task6);
        task2.dependentTasks.add(task7);
        task3.dependentTasks.add(task8);
        task4.dependentTasks.add(task9);

        System.out.println("start time: " + new Date());
//        pool1.submit(task1);
        pool2.invoke(task1);

        new ArrayList<Integer>().parallelStream().reduce((a, b)-> a+b);
    }
}

class Task extends RecursiveTask<String> implements Callable<String>{
    String name;
    ThreadPoolExecutor pool;
    long execTime;
    List<Task> dependentTasks = new ArrayList<>();


    public Task(String name, long execTime, ThreadPoolExecutor pool) {
        this.name = name;
        this.execTime = execTime;
        this.pool = pool;
    }

    @Override
    @SneakyThrows
    public String call() throws Exception {
        List<Future<String>> futures = dependentTasks.stream()
                .map(task -> pool.submit(task))
                .collect(Collectors.toList());

        for (Future<String> future : futures) {
            future.get();
        }
        Thread.sleep(execTime * 1000);
        System.out.println("time: " + new Date() + ", taskName:" + name + ", thread:" + Thread.currentThread());
        return "time" + new Date() + ", taskName:" + name;
    }

    @SneakyThrows
    @Override
    protected String compute() {
        for (Task dependentTask : dependentTasks) {
            dependentTask.fork();
        }
        for (Task dependentTask : dependentTasks) {
            dependentTask.join();
        }
        Thread.sleep(execTime * 1000);
        System.out.println("time: " + new Date() + ", taskName:" + name + ", thread:" + Thread.currentThread());
        return "xxx";
    }
}

// [100w] 求和 4 0-1/4 1/4-1/2 ...
// 100w === 0-50w 50w-100w == 0-25w 25-50 50-75 75-100


