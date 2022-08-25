# IO的分类
- 按照读取函数是阻塞还是返回分为，阻塞IO和非阻塞IO。
- 按照轮巡检查数据返回并处理还是回调函数处理分为，同步IO和异步IO。

其中阻塞IO一般来说是同步的，所以主要有三种形态，同步阻塞IO，同步非阻塞IO(java中的NIO)，异步非阻塞IO(java中的AIO)。

同步阻塞是最常见的，例如我们调用read函数读取数据的时候，线程被阻塞直到数据返回。

```java
import java.io.IOException;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * BIO 创建一个同步阻塞的socket server
 * @author Frank
 * @date 2022/8/23 11:00
 */
public class BIO {
    public static void main(String[] args) throws IOException {
        // 1 创建一个socket server监听tcp 1111端口
        ServerSocket serverSocket = new ServerSocket(1111);
        // 2 阻塞式接受来自客户端的连接
        while(true) {
            Socket socket = serverSocket.accept();
            OutputStream out = socket.getOutputStream();
            System.out.println(socket.getRemoteSocketAddress() + "连接到服务端");
            // 3 为了不影响后续连接进来处理，使用多线程来处理连接
            new Thread(() -> {
                try {
                    byte[] buffer = new byte[1024];
                    int len = 0;
                    while ((len = socket.getInputStream().read(buffer)) > 0) {
                        System.out.println(socket.getRemoteSocketAddress() + "发送数据：" + new String(buffer, 0, len));
                        out.write(buffer, 0, len);
                    }
                } catch (Exception e){e.printStackTrace();}
            }).start();
        }
    }
}
```

同步非阻塞一般是使用类似try_read这样的API，如果读取到了数据就返回如果没有数据则返回空。一般通过轮巡的方式不断询问是否有数据到达，看似和同步阻塞的IO方式没有太大区别，只不过是等待的方式是阻塞，还是一直自己去问。

但实际上有很大的区别，例如在每次轮巡的间隔其实可以插入其他操作，此外像NIO一般会借助IO多路复用的系统调用，使得多个IO channel可以注册在一个监听上，通过询问是否有数据，直接问的是多个channel是否有数据到达，即完成了一个线程监听多路的壮举。
```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Set;

/**
 * NIO socket服务端，其中第三步select是直接返回的，不阻塞当前线程，所以是非阻塞的IO
 *  并且一个selector可以注册多个channel，这就使得多路io(channel)可以复用一个线程，
 *  注意这段代码只有一个线程，但是可以接收多个客户端连接，并进行处理。
 *
 *  通过while循环，不断的查看是否有channel有数据，是在等待数据
 *  也就是同步的形式，同步：接受数据->处理数据的逻辑流程不变
 *
 *  在while循环中，可以不用一直select，线程可以进行其他的任务，处理完之后再次select可以得到这段时间所有channel的消息
 * @author Frank
 * @date 2022/8/23 11:00
 */
public class NIO {
    public static void main(String[] args) throws IOException, InterruptedException {
        // 1 创建selector用来侦听多路IO消息 '文件描述符'
        // selector 担任了重要的通知角色，可以将任意IO注册到selector上，通过非阻塞轮巡selector来得知哪些路IO有消息了
        // 底层是epoll（linux下）
        // 后续会把server端注册上来，有服务端被客户端连接上来的IO消息
        // 也会把每个客户端连接注册上来，有客户端发送过来的数据
        Selector selector = Selector.open();
        ByteBuffer byteBuffer = ByteBuffer.allocate(1024);

        // 2 把server端注册上去
        ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
        serverSocketChannel.socket().bind(new InetSocketAddress("127.0.0.1", 1111));
        serverSocketChannel.configureBlocking(false);
        serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);
        boolean flag = false;
        while (true) {
            // 3 select方法是NIO的体现，他是非阻塞的，函数会立马返回
            if (selector.select() == 0) {
                continue;
            }

            // 4 如果有至少一路IO有消息，那么set不为空
            Set<SelectionKey> selectionKeys = selector.selectedKeys();
            for (SelectionKey key : selectionKeys) {
                if (key.isAcceptable()) {
                    System.out.println("客户端连接");
                    // 因为我们只注册了serverSocketChannel这一个可以accept的所以这里用强转即可
                    SocketChannel socketChannel = ((ServerSocketChannel) key.channel()).accept();
                    socketChannel.configureBlocking(false);
                    // 5 当第一次客户端连接时，就将这个连接也作为channel注册上，他是可读型的
                    socketChannel.register(selector, SelectionKey.OP_READ);
                } else if (key.isReadable()) {
                    // 6 因为步骤5把客户端连接也注册上来了，并且是可读上面的数据的，如果该channel被选出来说明有客户端数据来了
                    SocketChannel socketChannel = (SocketChannel)key.channel();
                    // 7 必须借助ByteBuffer接受和发送数据
                    byteBuffer.clear();
                    if (socketChannel.read(byteBuffer) <= 0){
                        continue;
                    }
                    byteBuffer.flip();
                    byte[] b = new byte[byteBuffer.limit()];
                    byteBuffer.get(b);
                    System.out.println(key +" 数据来了： " + new String(b));
                    byteBuffer.clear();byteBuffer.put(b);byteBuffer.flip();
                    socketChannel.write(byteBuffer);
                }
            }
            // 8 非常重要一定要清理掉每个channel的key，来表示已经处理过了，不然下一次还会被select
            selectionKeys.clear();
        }
    }
}
```
多路IO复用也是一种IO的形式，他与同步异步，阻塞非阻塞其实并不矛盾。例如linux下多路IO复用的select poll epoll系统调用就是阻塞且同步的IO形式（epoll的函数是epoll_wait名字就能看出阻塞）。但是这并不影响我们使用这些系统调用，封装成非阻塞的IO形式。使用一个底层线程等待channel数据，将有数据的channel放到事件循环中，用户线程不断查询事件列表是否有新的事件（查询非阻塞），也可以使用注册事件回调实现异步。这也就是为什么说linux下java的nio和aio底层都是epoll系统调用的原因。

我们甚至可以自己封装一个线程使用BIO的方式等待数据，有数据了就放到一个缓存中，上层读取数据是非阻塞的立马返回缓存（还没读完那就是空），这样就实现了非阻塞的IO形式，但是这种形式的效率可远不如epoll加持下的NIO，因而一般人们说的非阻塞IO指的都是后者。同理使用多线程+BIO也可以很简单的实现AIO，但是只是形式是AIO，效率并不高。

![image](https://i.imgur.com/rG0eFMC.png)

![image](https://i.imgur.com/uKLOVL9.png)

异步非阻塞则是异步IO中最常用到的形式，回调函数所在的线程可以是当前线程，也可以是另一个线程。java中的aio是在bio包中的，异步io但是也是非阻塞io，这并不矛盾。AIO同样基于epoll系统调用，因而效率上与NIO区别不大，但是是一种全新的编程思路，像nodejs，容易产生回调地域，且异步的代码逻辑很容易出错，因为AIO的使用相比NIO要少很多，很多网络框架如netty Tomcat都是使用NIO。
```java
import lombok.SneakyThrows;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;

/**
 * java的aio和nodejs的写法很像，只不过强类型使得代码更冗长，而且java的aio事件注册是一次性的，触发后就没有了，需要递归的注册
 * 来保持一直是这个回调函数，aio的异步回调函数，是由另一个线程执行的。
 *
 * 注意：java没有aio的包，aio是在nio包中的，底层当然也是epoll(linux)，windows下是IOCP
 * 下面代码是异步非阻塞的，代码立刻返回体现了非阻塞，在回调函数中处理得到的数据体现了异步
 * 执行回调的线程默认是另一个线程，工作线程
 *  *
 * @date 2022/8/25 10:20
 */
public class AIO {
    public static void main(String[] args) throws IOException, InterruptedException {
        AsynchronousServerSocketChannel serverChannel =
                AsynchronousServerSocketChannel.open().bind(new InetSocketAddress(1111));
        System.out.println(Thread.currentThread() + "开始监听1111端口");
        serverChannel.accept(null, new CompletionHandler<>() {
            @SneakyThrows
            @Override
            public void completed(AsynchronousSocketChannel channel, Object attachment) {
                // 递归注册accept
                serverChannel.accept(attachment, this);
                System.out.println(Thread.currentThread() + "有客户端连接上来了" + channel.getRemoteAddress());
                ByteBuffer buffer = ByteBuffer.allocate(1024);
                channel.read(buffer, null, new CompletionHandler<Integer, ByteBuffer>() {
                    @SneakyThrows
                    @Override
                    public void completed(Integer len, ByteBuffer attachment) {
                        // 递归注册read
                        channel.read(buffer, null, this);
                        buffer.flip();
                        System.out.println(channel.getRemoteAddress() + "：" + new String(buffer.array(), 0, len));
                        buffer.clear();
//                        channel.write(ByteBuffer.wrap("HelloClient".getBytes()));
                    }

                    @Override
                    public void failed(Throwable exc, ByteBuffer attachment) {

                    }
                });
            }

            @Override
            public void failed(Throwable exc, Object attachment) {
            }
        });
        Thread.sleep(Integer.MAX_VALUE);
    }
}
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
