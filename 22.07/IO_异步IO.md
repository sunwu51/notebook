# IO的分类
- 按照读取函数是阻塞还是返回分为，阻塞IO和非阻塞IO。
- 按照轮巡检查数据返回并处理还是回调函数处理分为，同步IO和异步IO。

其中阻塞IO一般来说是同步的，所以主要有三种形态，同步阻塞IO，同步非阻塞IO(java中的NIO)，异步非阻塞IO(java中的AIO)。

同步阻塞是最常见的，例如我们调用read函数读取数据的时候，线程被阻塞直到数据返回。

伪代码：
```
while (data = read(fd)){
    print(data)
}
```

同步非阻塞一般是使用类似try_read这样的API，如果读取到了数据就返回如果没有数据则返回空。

伪代码：
```
while(true){
    data = try_read(fd)
    if(data) {
        print(data)
    } else {
        continue
    }
}
```

异步非阻塞则是异步IO中最常用到的形式，回调函数所在的线程可以是当前线程，也可以是另一个线程。非阻塞read_async之后，当前线程可以进行其他事情的处理。

伪代码：
```
read_async(fd, data => {
    print(data)
})
```
# 使用场景
对于同步IO，需要一个线程对应一个fd，这是经典的IO模型，例如Tomcat就是基于这样的设计，一个request对应一个线程。在一般的并发量下，使用该模型配合线程池有着较好的性能，其实在大多数场景下改模型都有着较好的表现，尤其是计算密集型的应用。

![image](https://i.imgur.com/imt09Nm.png)

但是如果handler中有较多IO，例如较慢的数据库访问，请求其他服务等，这些IO往往比较浪费时间。假设Tomcat线程池最多有10个，而11个请求过来，前十个进行处理并且执行到IO，而IO需要非常长的时间，第11个请求可能是不需要IO的，但是仍需要等待一个线程资源空闲出来才能进行处理。

IO密集的场景通常异步IO模型，而不是一个请求一个线程的模式，是更合适的，异步非阻塞IO通常使用一个或者少数几个线程来承接请求的处理(handler)，然后对于处理中的IO操作使用异步非阻塞IO，保证所有的请求能在最短时间接受。这样可以用很少的线程数量就能处理大量的请求，这也是Nodejs的默认IO模型。

![image](https://i.imgur.com/8U3y4ta.png)

# 异步IO是如何实现的
所有的技术都没有魔法，同步IO使用的是Linux底层的例如`open`、`read`、`accept`等系统调用。那异步IO使用的是类似`epoll`这样的IO多路复用的系统调用，我们不需要仔细展开，只需要知道`epoll`这样的系统调用，能够实现多路IO链路可以复用同一个线程，换句话就是在一个线程里面高效的监听和处理多个客户端的连接。关键词：一个线程-多路IO，上面异步的时候我们说了是`使用少量线程承载大量并发`，其实本质就是IO多路复用呗。例如我们使用一个线程，利用epoll将多个客户端连接注册到fd列表，通过epoll_wait等待任意fd有数据返回，有数据返回后调用对应的处理函数。我们可以对这种形式进行封装，一种常见的封装形式是使用事件驱动（libevent库就是这种形式），如下图使用一个或者少数几个线程来轮巡事件队列，当有事件完成后就触发其对应的回调函数。

![image](https://i.imgur.com/CuT91UR.png)

Nodejs底层就是使用的libev库。

java的NIO虽然不是异步的，但底层和AIO一样也是基于epoll，通过对NIO的封装可以实现异步。java中AIO的直接使用较少，像Netty等框架其实是基于NIO的，性能上NIO与AIO区别不大因为都基于epoll，代码写法上区别较大，且AIO出现较晚。

# 响应式编程(reactive programming)
由微软提出，在.net中有`Rx`库，后续在java中第三方组织实现了`RxJava`库，在java9中jdk中实现了响应式流Reactive Streams，主要使用`java.util.concurrent.Flow`类。还有`akka`等实现响应式的库等。org.reactivestreams则是提供了响应式的API规范。

![image](https://i.imgur.com/T5bGTOb.png)

但是上述这些库都在`spring`官方出了`project reactor`[官网](https://projectreactor.io/)之后就黯然失色了，因为spring生态实在是太强大。也就成了最主流的java中的响应式编程形式。
