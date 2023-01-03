# 池化技术
我们在很多工具很多场景中经常看到池化技术，例如连接池、对象池、线程池，这些都是利用了池化技术，而池化技术本身其实是一种资源复用的出发点。

当我们`创建某些资源有较高的代价`的时候，就可以通过先创建一批这种资源放到池子里，当需要销毁资源的时候，不是真正的销毁而是`返回到池子`中。等下一次再需要该资源的时候，直接将`池子中的该资源`返回去。

这样一来，避免了多次创建和销毁资源，而典型的有较高创建代价的资源有
- tcp连接，三次握手代价较高，对应的池化技术就是连接池，当然针对更细的场景有数据库连接池，http连接池等等。
- OS线程，线程的create/destroy需要进入内核态，代价也很高。对应池化技术就是线程池，线程池在java中又有经典线程池模型和ForkedJoin模型。
- 对象，在特定场景下，对象的创建和销毁也成为了一种负担，一般上层场景较少，底层框架会有大量且频繁使用对象的场景，这时候为了减少对象创建和销毁就会使用对象池，本文不对该对象池做讨论，主要对连接池和线程池做展开。
# 1 数据库连接池
主要以最火的`Hikari`的源码为例，展开分析。上面我们知道了连接池的目的就是复用tcp连接，说白了就是复用`Connection`对象，通俗讲就是我们可以事先创建很多个`jdbc Connection`放到一个池子中，等使用的时候从中拿，用完了再还回来。

![image](https://i.imgur.com/v3RYLtK.png)

这个过程如上图，好像Pool的实现并不麻烦，只需要一个队列和维护队列`push/poll`的方法就可以了。然而实际上，数据库连接池还需要一些繁琐的“运维”工作，例如
- 1 维持连接的鲜活的keepLive，可能是每过多少秒看看tcp是否正常。
- 2 如果一个连接失效了，可能是被db断开也可能是超过一定寿命了，需要被清理的操作。
- 3 清理完，得进行补充以达到设定的poolSize。
- 4 等等

“运维”工作是必须做的本分，此外还要考虑并发和性能问题，例如多线程同时想获取连接，怎么避免把同一个conn给了多个线程等。

我们来看一下hikari的设计，下面是Hikari使用方法。
```xml
<!-- https://mvnrepository.com/artifact/com.zaxxer/HikariCP -->
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
    <version>5.0.1</version>
</dependency>
<!-- https://mvnrepository.com/artifact/com.h2database/h2 -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <version>2.1.214</version>
</dependency>
```
```java
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbConnPool {
    private static final DataSource dataSource;

    static {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:h2:mem:test;MODE=MySQL;");
        config.setUsername("sa");
        config.setPassword("");
        dataSource = new HikariDataSource(config);
    }


    public static void main(String[] args) {
        try (Connection conn = dataSource.getConnection()) {
            Statement stat = conn.createStatement();
            stat.execute("create table test (id INTEGER PRIMARY KEY, name VARCHAR(255))");
            stat.execute("insert into test (id, name) values (1, 'a')");
            stat.execute("insert into test (id, name) values (2, 'b')");

            ResultSet resultSet = stat.executeQuery("select * from test");
            while (resultSet.next()) {
                System.out.println("name: " + resultSet.getString("name"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```
这是hikari主要的几个类的uml图，简单说一下几个重要的点
- 1 用户使用的是`HikariDatasource`这个类，调用`getConnection`方法去使用一个连接，这个连接是`HikariProxyConnection`类型。
- 2 `HikariDatasource`中的功能主要封在`HikariPool`这个类中，主要是一些线程池异步的进行池子的“维护”，例如houseKeepTask中有每30s检查连接数并填充的任务。
- 3 `ConncurrentBag`是`HikariPool`中的主要成员，是存放连接的池子本身，主要有list来存放，其中ThreadLocal是加速用的。
- 4 池子中存的是`PoolEntry`对象，该对象持有要返回的`Connection`，除此之外还有记录状态标志位，调度线程来keepAlive和endOfLife的清理，当然还有保证不被多个线程同时获取的cas操作。
- 5 `HikariProxyConnection`是用户最终拿到的`Connection`，他的close方法是归还到池子中。

<img width="971" alt="image" src="https://user-images.githubusercontent.com/15844103/210301554-a65d9565-f7f7-4d45-94b3-f0873faa982a.png">

# 2 http连接池
与上面数据库连接池一样都是tcp连接池，我们已经看到连接池其实主要是对池子中现存的连接的一些维护工作，和并发场景下的性能等。http连接池的思路是类似的，所以没有太多的额外的知识点。不过这里想顺便介绍下NIO加持下的Http连接方式，上面介绍的Hikari的连接池是同步的连接，这里我们针对底层是NIO的jdk11之后自带的HttpClient源码进行分析。下面是基础的使用姿势。
```java
HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .GET()                           // 默认就是get可以不写
    .uri(URI.create(BASE_URL))       // url
    .headers("k1", "v1", "k2", "v2") // 添加header，没有可以不写这行
    .timeout(Duration.of(30, ChronoUnit.SECONDS)) // 配置超时，超时后会以HTTPTimeoutException抛出异常
    .build();

client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
  .whenComplete((response, err) -> {
    if (err == null && response.statusCode() == 200) {
      String res = response.body();
      // do something
      System.out.println(Thread.currentThread() + -":" + res); // execution thread is ForkJoinPool.commonPool
    }
});
```
首先`HttpClient.newHttpClient`创建的是`jdk.internal.net.http.HttpClientImpl`这个默认的实现，我们简单的来梳理下。

`HttpClientImpl`中semgr成员是`SelectorManager`类型继承自Thread，是一个独立运行的单线程，该线程是事件循环，主要处理注册上来的事件，同时作为NIO的主循环也检测IO selectedKey进行事件的回调，这个循环是整个HttpClient的核心代码所在。以`建立连接`事件为例，在建立连接的函数中，将连接建立的事件进行注册，实际上是`SocketChannel`注册到NIO的`Selector`中，此时是非阻塞的，把`CompleteableFuture`传到事件中，等待连接完成，之后触发这个cf作为回调。

<img width="787" alt="image" src="https://user-images.githubusercontent.com/15844103/210335079-58b4bce5-66d0-4cc7-9c0b-52dc1a956033.png">

<img width="747" alt="image" src="https://user-images.githubusercontent.com/15844103/210335776-7df79755-9371-489e-bf64-3f38ea4183b9.png">

<img width="602" alt="image" src="https://user-images.githubusercontent.com/15844103/210336478-d1d3f863-bf97-433c-8e54-5d60eeb40d4f.png">

<img width="698" alt="image" src="https://user-images.githubusercontent.com/15844103/210336713-0c566e24-6644-4885-9bff-654f1a12abc5.png">






