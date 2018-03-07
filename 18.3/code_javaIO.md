# java IO
# 1 阻塞IO
传统的IO是阻塞的，常见的有字节流和字符流，OutputStream和InputStream是字节流，BufferedReader和Writer等是字符流。传统IO是阻塞的很明显的可以从read方法的阻塞中看出。
## 1.1 列举几个IO的类
字节流的FileOutpuStream、FileInputStream，字符流的BufferReader、BufferWriter、FileReader、FileWriter等。
## 1.2 java.io用了什么设计模式
装饰器设计模式，就是相对一个类的功能进行扩展的时候。可以定义一个新的类，新类包含一个原始类，各种方法都是调用原始类的方法，然后扩展方法自己写。这种方式可以避开继承关系。
# 2 NIO
NIO异步IO，核心是IO线程池。基于Channel和Buffer，selector监听Channel的事件，可以监听多个channel，所以即使单线程也能完成并发操作。可以向channel中写数据也可以从channel中读取数据。