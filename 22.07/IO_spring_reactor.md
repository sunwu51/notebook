# project reactor
spring webflux使用的是project reactor这个库，提供了Flux和Mono两种重要的`Publisher`类型，其中Flux是0-N个触发的数据，而Mono则是0-1个数据。

[官方文档](https://projectreactor.io/docs/core/release/reference/#getting-started-introducing-reactor)
# Mono  Flux 
![image](https://i.imgur.com/leAFBxr.png)  
![image](https://i.imgur.com/QKpYAxf.png)  
创建
```java
// 创建Mono，因为只有0或1个元素所以一般就是以下两种方式
Mono<String> noData = Mono.empty(); 
Mono<String> data = Mono.just("foo");

// 创建Flux，flux的方式多一些，主要还是来自集合
Flux<String> seq1 = Flux.just("foo", "bar", "foobar");
List<String> iterable = Arrays.asList("foo", "bar", "foobar");
Flux<String> seq2 = Flux.fromIterable(iterable);
Flux<Integer> seq3 = Flux.range(5, 3);
```
subscribe是publisher接口定义的唯一的方法。
```java
Flux<Integer> ints = Flux.range(1, 3).log(); // log方法修饰后可以打印日志
ints.subscribe(i -> System.out.println(i));
ints.subscribe(i -> System.out.println(i));
```
![image](https://i.imgur.com/BnZuxUc.png)

Stream是Flux中常用的处理形式，他与jdk8中的stream类似，也支持类似take、skip、map、filter、flatMap、collect等方法。
```java
Flux<Integer> ints = Flux.range(1, 4) 
      .map(i -> { 
        if (i <= 3) return i; 
        throw new RuntimeException("Got to 4"); 
      });
ints.subscribe(i -> System.out.println(i), 
      error -> System.err.println("Error: " + error),
      () -> System.out.println("finish"));
Flux<Integer> ints = Flux.range(1, 4) 
      .map(i -> { 
        if (i <= 3) return i; 
        throw new RuntimeException("Got to 4"); 
      });
ints.subscribe(i -> System.out.println(i), 
      error -> System.err.println("Error: " + error),
      () -> System.out.println("finish"));
```
# 线程模型
在Flux中默认的中间处理例如map中的函数和最终处理subscribe函数中的表达式，都是在这个语句注册的线程中执行的。

指定`Schedulers`可以修改默认的线程模型，例如下面代码展示了publishOn和subscribeOn的用法与区别，一般只需要使用前者。
```java
Flux.just("a", "b", "c") //this is where subscription triggers data production
        //this is influenced by subscribeOn
        .doOnNext(v -> System.out.println("before publishOn: " + Thread.currentThread().getName()))
        .publishOn(Schedulers.elastic())
        //the rest is influenced by publishOn
        .doOnNext(v -> System.out.println("after publishOn: " + Thread.currentThread().getName()))
        .subscribeOn(Schedulers.parallel())
        .subscribe(v -> System.out.println("received " + v + " on " + Thread.currentThread().getName()));
    Thread.sleep(5000);
```
subscribeOn指定的是subscribe的线程池，
```
before publishOn: parallel-1
before publishOn: parallel-1
before publishOn: parallel-1
after publishOn: elastic-2
received a on elastic-2
after publishOn: elastic-2
received b on elastic-2
after publishOn: elastic-2
received c on elastic-2
```
注意publishOn指定了线程池，但是实际上对于Flux执行的时候，仍然是只使用线程池中一个线程来处理next每一个元素，如果要进行并行处理需要使用`ParallelFlux`
```java
Flux.range(1, 10)
    .parallel(2)
    .runOn(Schedulers.parallel())
    .subscribe(i -> System.out.println(Thread.currentThread().getName() + " -> " + i));
```
# IO
上面的用法只是简单展示了API中的几个方法如何使用，Flux其主要还是用于IO场景。例如DB访问、http接口访问等。下面展示如何在spring项目中使用WebFlux。

我们要注意，使用WebFlux，需要保证我们的每个线程都是非阻塞的，也就是说我们handler中所有关于IO的部分都必须使用Flux模型。

# mysql reactive
目前r2dbc支持的有h2、mysql、postgre等，[文档](https://spring.io/projects/spring-data-r2dbc#overview)

引入依赖
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-r2dbc</artifactId>
</dependency>
<dependency>
    <groupId>dev.miku</groupId>
    <artifactId>r2dbc-mysql</artifactId>
    <version>0.8.2.RELEASE</version>
</dependency>
```
配置，注意关闭ssl模式，默认是开启的测试环境会报错
```properties
spring.r2dbc.url=r2dbcs:mysql://127.0.0.1:3306/test?useSSL=false&sslMode=DISABLED
spring.r2dbc.username=root
spring.r2dbc.password=
```
定义dao
```java
// user 类
@Data
public class User {
    @Id
    int id;
    String name;
}
// user repo 接口，注意该接口与Jpa的类似，只不过返回值需要是Flux或Mono。
public interface UserRepo extends R2dbcRepository<User, Integer> {
    Flux<User> findAllByName(String name);
    Mono<User> findById(int id);
}
```
在controller中如下，注意整条处理链路中没有任何阻塞，IO部分都是非阻塞的Flux
```java
@GetMapping("/all")
@ResponseBody
public Flux<User> getAll(){
    return userRepo.findAll();
}
```
也可以转换Flux
```java
@GetMapping("/names")
@ResponseBody
public Flux<Map.Entry> getNameList() {
    return userRepo.findAll().map(i -> Map.entry(i.getId(), i.getName()));
}
```
# WebClient
请求其他api也是常见的IO，webflux也提供了Flux版本的客户端WebClient，
```java
WebClient webClient = WebClient.create("https://www.baidu.com");

@GetMapping("/baidu")
@ResponseBody
public Mono<String> getBaidu(){
    return webClient.get().uri("s?wd={word}", "hello")
            .retrieve().bodyToMono(String.class);
}
```