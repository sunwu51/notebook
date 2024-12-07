---
title: 从JNI异常案例出发浅谈异常捕捉机制
date: 2024-12-06 20:26:00+8
tags:
    - 异常捕捉
    - catch
    - panic
    - exception
---
# 1 起因
最近写了一个java的native程序，然后程序中出现了未捕捉的异常（例如整数除0，数组越界等），竟然会导致整个jvm进程崩溃，一个简单的例子就是当前目录下的`Demo.java` `Demo.c`。
```java :Demo.java
public class Demo {
    public static native int divide(int a, int b);
    static {
        System.load("C:\\Users\\sunwu\\Desktop\\base\\gateway\\notebook\\24.12\\libDemo.dll");
    }
    public static void main(String[] args) {
        try {
            System.out.println(divide(10, 2));
            System.out.println(divide(10, 0));
        } catch (Throwable t) {
            System.out.println("Error " + t);
        }
    }    
}
```

```c :Demo.c
#include <jni.h>
JNIEXPORT jint JNICALL Java_Demo_divide
  (JNIEnv *env, jclass clz, jint a, jint b) {
    return a /b;
}
```

将`Demo.java`和`Demo.c`编译成Demo.class和libDemo.dll，然后运行`java Demo`，结果如下：

![image](https://i.imgur.com/yqN3ePj.png)

这里`native`程序没有处理好异常，java程序没有捕捉到异常，整个jvm进程崩溃，这是一个非常严重的问题，尤其是线上服务，当参数没有做好验证，调用这种`native`程序，程序内部又没有做检查和异常捕获的话，是非常危险的。

除了验证参数外，java程序员会觉得，还需要在`native`程序中做异常检查，但是c语言是没有`try catch`的，可以借助c++
```cpp :Demo.cpp
#include <jni.h>
#include <stdexcept>
extern "C" JNIEXPORT jint JNICALL Java_Demo_divide
  (JNIEnv *env, jclass clz, jint a, jint b) {
    try {
        return a /b;
    } catch (const std::exception &e) {
        env->ThrowNew(env->FindClass("java/lang/ArithmeticException"), e.what());
        return 0;
    }
}
```
然后发现cpp用了`try-catch`然后向`jvm`抛出异常，结果并没到预期，而是和之前一样，进程崩溃了。这是因为即使`cpp`也有无法捕捉的异常，会导致程序崩溃，例如
- 整数除零
- 数组越界
- 空指针解引用
- 类型转换错误
- 等

所以，在`native`程序中，需要自己额外注意这些情况的发生，一旦出现可能都是致命的。

但是，我写的native程序用的并不是`c/cpp`，而是使用了`rust`,
```rust :Demo.rs
#[macro_use]
extern crate jni;

use jni::JNIEnv;
use jni::objects::{JClass};
use jni::sys::jint;
#[no_mangle]
pub extern "C" fn Java_Demo_divide(env: JNIEnv, _class: JClass, a: jint, b: jint) -> jint {
    return a / b;
}
```

报错其实长得不太一样，但是结局是一样的，就是jvm catch不到异常，最终进程崩溃：

![img](https://i.imgur.com/EOPoIK0.png)

和`c/cpp`不同的是`rust`提供可以捕捉除零这些`panic`，并且提供了`catch_unwind`，一种类似`try-catch`的机制。
```rust :lib.rs
#[macro_use]
extern crate jni;

use jni::JNIEnv;
use jni::objects::{JClass};
use jni::sys::jint;
use std::panic;

#[no_mangle]
pub extern "C" fn Java_Demo_divide(mut env: JNIEnv, _class: JClass, a: jint, b: jint) -> jint {
    let res = panic::catch_unwind(|| {
        return a / b;
    });

    match res {
        Ok(x) => x,
        Err(_) => {
            env.throw_new("java/lang/ArithmeticException", "Divide by zero").unwrap();
            return 0;
        },
    }
}
```
![img](https://i.imgur.com/Tda9wWM.png)

当然这里还是有一些rust的日志，我们可以把panic的hook设置为空函数，这样日志就纯净多了。
```rust :lib.rs
pub extern "C" fn Java_Demo_divide(mut env: JNIEnv, _class: JClass, a: jint, b: jint) -> jint {
    // 设置回调为空函数
    panic::set_hook(Box::new(|_| {}));

    let res = panic::catch_unwind(|| {
        return a / b;
    });

    match res {
        Ok(x) => x,
        Err(_) => {
            env.throw_new("java/lang/ArithmeticException", "Divide by zero").unwrap();
            return 0;
        },
    }
}
```
![img](https://i.imgur.com/G4nvsSW.png)


# 2 错误处理
我们来讨论下错误处理，这个编程语言中都会涉及到的机制。

我们可以自己来想一下，如果要设计一组api，去执行一些功能，正确的处理可以返回正确的结果，比如要查询某些信息的接口，返回的结果就是查询的结果。但是如果执行失败，应该返回什么呢？这里有一些思路：

## 2.1 返回状态码
就像HTTP协议一样，200表示成功，其他状态码可能是失败，不同状态码会有不同的含义。在c语言的很多接口中都是用的int返回值，非0表示失败，0表示成功。但c语言是单返回值的，如果把状态码作为返回值，那查询的信息放到哪里呢？一般需要再入参中放置一个指针，把结果放到指针中。正常返回后，判断状态码，如果是成功，再去指针地址获取数据。例如标准库中的一些函数：
```c
int pthread_create(pthread_t *thread, const pthread_attr_t *attr,
                   void *(*start_routine) (void *), void *arg);
// 返回值为0表示成功，非0表示失败
// 线程ID通过第一个指针参数返回

int getaddrinfo(const char *node, const char *service,
                const struct addrinfo *hints,
                struct addrinfo **res);
// 返回0表示成功（网络地址ip解析）
// 解析结果通过res指针返回

size_t fread(void *ptr, size_t size, size_t nmemb, FILE *stream);
// 返回实际读取的元素个数
// 数据通过ptr指针返回
```
这种设计，相比于把返回值再单独封装一个结构体来放置数据+状态码，省去一层封装效率更高，更符合c语言底层操作的特性。但是缺点就是可读性较差，容易出现指针使用错误，所以高级语言中大都不再使用这种设计。

我们可以着重讨论下指针用错的情况，例如上面的`fread`函数，传入的`ptr`指针是空指针或者`ptr`提前申请的空间比`nmemb`的大小小，则会导致读取失败，而这个失败可能会导致段错误，引发`SIGSEGV`信号，进而导致进程崩溃。是的，没错，段错误会导致进程崩溃。而引发段错误的，通常是内存访问错误，例如访问空指针，访问越界等等，这些异常不会反馈在函数的返回值的状态码中，因为是更严重的错误，是直接导致进程崩溃的。

## 2.2 抛出异常

高级语言例如`java`等，一般将返回值设计为要查询的数据，而至于发生异常的时候，则直接抛出一个异常，由上层去捕捉异常，使用`try-catch`语法。
```java
private void write(int b, boolean append) throws IOException
// 写文件的函数，会抛出IO异常。可能导致异常的情况有，文件不存在，文件无权限、无法写入等等。
```
有一种异常比较特殊，`RuntimeException`运行时异常，是不需要强制处理的，例如`NullPointerException`空指针异常，`ArrayIndexOutOfBoundsException`数组越界异常，对应上面提到的c中段错误，在`java`中则是被运行时做了较好的处理，反馈为运行时的异常。这些异常不会导致进程崩溃，如果没有`try-catch`的话，最多就是导致线程结束。因为运行时异常时异常随时都有可能发生，每次都要捕捉就导致程序到处都是捕捉异常，非常麻烦，所以并不强制要求处理运行时异常。

`try-catch-finally`的异常捕捉方式从`c++`开始就有了，他的一个主要的优势就是可以把正常的逻辑代码和异常处理代码分开，如下在`try`中可以按照无异常发生顺序的写逻辑，而在`catch`中可以集中处理异常，并且对`Exception`或`Throwable`做兜底的`catch`处理，再加上`finally`中控制资源释放，整体代码就非常有安全感。
```java
try {
    /// 这里是正常的逻辑代码
    /// 读文件
    /// 写文件
    /// 查数据库
    /// 调用其他函数等等
} catch (FileNotFoundException e) {
    /// 文件不存在的异常处理
} catch (SQLException e) {
    /// 数据库异常处理
} catch (IOException e) {
    /// 其他的IO异常处理
} catch (Exception e) {
    /// 其他异常处理
} finally {
    /// 一些必须执行的逻辑，例如资源释放
}
```

## 2.3 多返回值

一些语言例如`golang`等，支持多返回值，一般把第一个返回值设计为当前函数正常执行的结果例如查询的信息，第二个返回值是错误`err`，这种方式和前面`c`的处理有点类似，或者说是对`c`的加强，都是把错误返回，只不过`c`是返回了一个int，要自己判断不同的code的含义，`go`则返回了错误err结构体，此外`go`的多返回值就类似于`c`封装了一个结构体，有正常结果和错误两部分，这样由函数运行时产生数据把结果都放到返回值中，可以避免指针使用错误。这种方式提高了阅读性，也减少了错误。
```go
file, err := os.Open("filename.txt")
/// 打开文件


resp, err := http.Get("https://example.com")
/// http请求


t, err := time.Parse(time.RFC3339, "2023-12-07T12:00:00Z")
/// 时间解析
```
但是与`throw`抛出异常相比，多返回值可以更好的判断每一个错误的位置，例如上面`try-catch`的例子中，如果有对两个文件的操作，如果将两个文件操作放到一个`try-catch`中，抛出异常时，就不知道是哪个文件导致的。
```java
try { 读文件A();  读文件B(); } 
catch(IOException e) { /*这里无法判断是A 还是B*/}
```
这可能就需要写两个`try-catch`分别处理文件A和B的读操作，代码就变长了，并且没有能够很好的把业务逻辑和异常处理分开。而如果是`golang`，则可以很好的识别出是哪个文件导致的。
```go
contentA, errA := ioutil.ReadFile("A.txt")
if errA != nil {/*A读取失败*/}

contentB, errB := ioutil.ReadFile("B.txt")
if errB != nil {/*B读取失败*/}
```
当然了，`golang`这种方式的问题也是因为区分的太细，每个`err`都要做判断，判断错误的代码穿插在正常的逻辑中间，没办法很好的分离关注点。

## 2。4 Result/Either

还有一些语言采用`Result/Either`的方式，和`golang`的多返回值类似，只不过更适合单返回值的语言，例如`Rust`中`Result<T, E>`是一个枚举类型，他要么是`OK(T)`类型，里面会存放正常结果，要么是`Err(E)`类型，里面会存放错误信息。`Scala`的`Either[L, R]`也是类似的，要么是`L`要么是`R`。说到底都和`golang`的`content, err := xxx`是类似的效果。这里不再展开说了。


# 3 不同类型异常的处理
了解了这些错误处理的形式，我们再来说一下，不同语言针对“段错误”的异常，严重的异常，异常的兜底的处理方式。

## 3.1 C语言
首先是`c`语言中，段错误也来自`c`，一旦发生段错误，C语言没有给开发者处理的机会，只能是提前避免，一旦发生了段错误，例如数组越界，当然也包含除0异常等，都会导致进程崩溃；这些异常在c中就是严重的异常，需要开发者提前避免，例如在数组越界之前就做判断，在除0之前就做判断；
```c
int main() {
    int *q = NULL;
    *q = 10; // 会触发段错误
    printf("Program completed.\n");
    return 0;
}
// Segmentation fault 
// 段错误进程挂掉
```
不仅是当前线程崩溃，而是整个进程崩溃
```c
#include <stdio.h>
#include <pthread.h>
#include <unistd.h>

// 线程函数
void* thread_function(void* arg) {
    sleep(1);
    int *p = NULL;
    *p = 10;
    return NULL;
}

int main() {
    pthread_t thread;
    
    // 创建线程
    if (pthread_create(&thread, NULL, thread_function, NULL) != 0) {
        printf("线程创建失败\n");
        return 1;
    }
    
    // 等待线程结束
    if (pthread_join(thread, NULL) != 0) {
        printf("等待线程失败\n");
        return 1;
    }
    
    // 这一行运行不到，因为线程执行的时候已经导致进程崩溃了
    printf("Program completed.\n");
    return 0;
}
```
而对于兜底处理，需要借助信号的处理机制和`setjmp/longjmp`，信号处理的函数只能在线程级别注册，如果多线程需要各自注册，下面是一个简单的`setjmp`的例子配合`signal_handle`注册可以捕捉到段错误异常。
```c
#include <stdio.h>
#include <setjmp.h>
#include <signal.h>
#include <pthread.h>
#include <unistd.h>

jmp_buf global_exception;
struct ErrorContext {
    int code;
    char msg[256];
};

void signal_handler(int signum) {
    longjmp(global_exception, signum);
}

int main() {
    int *q = NULL;
    *q = 10; // 会触发段错误

    struct ErrorContext ctx = {0};
    
    // 设置信号处理
    signal(SIGSEGV, signal_handler);
    
    // 设置异常捕获点
    int exception = setjmp(global_exception);
    
    if (exception == 0) {
        // 正常执行
        int *p = NULL;
        *p = 10; // 会触发段错误
        // 错误发生后，会再次跳到setjmp这一行，并且exception此时返回信号值
    } else {
        // 异常处理
        ctx.code = exception;
        snprintf(ctx.msg, sizeof(ctx.msg), 
                 "Caught signal: %d", exception);
        // 记录日志
        fprintf(stderr, "Error: %s\n", ctx.msg);
    }

    printf("Program completed.\n");
    return 0;
}
/**
$ gcc main.c && ./a.exe
Error: Caught signal: 11
Program completed.
**/
```
但是多线程的场景就比较复杂，上面`signal`函数是指给当前线程注册收到信号的处理函数，但是多线程场景下，每个线程需要各自注册，并且需要设置异常捕获点，否则无法捕获到段错误的异常。默认情况下，这个信号会被发送到引发段错误的线程上。

## 3.2 java
`java`中抛出的异常是随着堆栈一层层向上，直到有一个地方能`catch`这个异常，而如果没有任何地方能`catch`，最终会导致当前线程崩溃，但是如果当前线程不是主线程的话，是不会导致进程崩溃的，数组越界等“段错误”也是类似的，最多导致当前线程崩溃。

![img](https://i.imgur.com/f6XsVwy.png)

而`java`中什么算是严重的错误呢，这与`c`中就有较大不同，`c`中整数除零、越界等都是严重的错误，但是`java`中就是一个`RuntimeException`，并不算是一种严重的错误，因为`jre`已经很好的处理过了这些错误，我们也可以自己构建自定义的`RuntimeException`。`java`中的异常分类则是`Throwable`接口下有两个大的分类`Error`和`Exception`，其中`Error`才是比较严重的错误，`Error`一般是无法处理的，不可恢复的错误，比如`OOM`、类不存在、方法不存在、栈溢出等，一般`Error`不太需要`catch`，因为`catch`到了，最多也就是打印个日志，开发者很难处理这类异常。当然即使是`Error`也只会导致当前线程崩溃，不会导致进程崩溃。而`Exception`则又分为`RuntimeException`和非运行时异常，前者不强制要求处理，后者需要开发者必须处理，要么继续往上抛出，要么在自己这里处理掉。

对于兜底处理，`java`中做的比较好，就是`try-catch`直接把`Throwable`给`catch`住，所有的异常，都逃不过这一层`catch`，也就不会往上抛了，同时还提供了`finally`来保证异常情况下一些释放和收尾操作的执行。

![img](https://i.imgur.com/BgEJaXq.png)

## 3.3 golang
`golang`中正常的函数返回的`err`，由开发者自行处理即可，而对于“段错误”或者其他的“运行时异常”，则是提供了`panic`机制，`panic`的传递与`java`的异常是一样的，同样是栈不断向上抛出，直到有能够处理它的地方，如果没有任何一层栈能处理`panic`，会导致`进程退出`，这一点与`java`不同，`java`的异常即使是`Error`也不会导致进程崩溃。而`go`的`panic`则是面向恢复的，需要有地方去“捕捉”`panic`，在go中是恢复，否则就会导致进程崩溃，好在很多框架都内置了恢复`panic`的机制，比如`gin`、`beego`等。原生代码如下，会导致进程崩溃，无法打印程序完成这一行
```go
package main

func main() {
	done := make(chan bool)
	// 启动一个协程
	go func() {
		b := 0
		a := 100 / b
		println(a)
		done <- true
	}()
	
    // 等待协程完成
	<-done
    // 或者改成：time.Sleep(1 * time.Second)

	println("程序完成")
}
```
![img](https://i.imgur.com/MwsHpY4.png)

`panic`就是`golang`中的“严重错误”了，这个错误严重到，如果没有恢复机制，会导致进程退出。那就来看下该如何恢复`recover`:
```go
package main

func main() {
	done := make(chan bool)
	// 启动一个协程
	go func() {
		defer func() {
			if r := recover(); r != nil {
				if errStr, ok := r.(string); ok {
					println("Recovered from panic with message:", errStr)
				} else {
					println("Recovered from panic with unknown type")
				}
				done <- false
			}
		}()
		b := 0
		a := 100 / b
		println(a)
		done <- true
	}()

	// 等待协程完成
	<-done
	println("程序完成")
}
```
![img](https://i.imgur.com/hu3vvSc.png)

这里还要说一下`defer`关键字，他类似的`java`中的`finally`，是一定会执行到的代码，但是它的调用顺序是和函数调用栈的顺序相反的，也就是说，如果函数中声明了多段`defer`他们会在函数执行结束后，按顺序反向执行，当然如果有`panic`发生，则会从`panic`这一行开始，往上依次执行`defer`。有了这个`defer`的机制，再来看`recover`函数，这个函数是指当前协程栈如果发生了`panic`，才能恢复，如果栈没有发生`panic`，则返回`nil`，否则返回引发`panic`的值，一般是个string。`recover`函数的返回值是interface{}，所以它不能直接打印，需要使用类型断言，如果断言成功，则打印出`panic`的值，否则打印出`panic`未知类型。

## 3.4 rust
`rust`中和`golang`的情况是类似的，一般执行过程中通过`Result`将错误返回，开发者自行处理，而对于没有办法预测的错误，会产生`panic`，同样可以用宏`panic!`自己产生错误，`rust`的`panic`会导致线程结束，但是不会导致进程崩溃。
```rust
use std::thread;

fn main() {   
    // 创建一个新线程
    let handle = thread::spawn(|| {
        panic!("子线程 panic");
    });

    // 等待子线程完成
    handle.join().unwrap_or(());

    println!("程序完成");
}
```
这段代码运行结果，会打印程序完成，即`join`函数`unwrap`会失败，但是`unwrap_or`处理了这个错误，不会导致主线程崩溃，也不会导致进程崩溃。

![img](https://i.imgur.com/2cMX4gN.png)

我们把`unwrap_or`修改一下，会看到主线程`join`能捕捉到子线程的`panic`
```rust
    match handle.join() {
        Ok(_) => println!("子线程完成"),
        Err(e) => println!("子线程 panic: {:?}", e),
    }
```
![img](https://i.imgur.com/5MXDfUU.png)

这里我们不展开讨论协程的库。
# 4 回到最初jni的场景
我们再回头思考，jni的场景下，在c中发生了除零的错误，接下来其实按照c语言的逻辑是会向进程的当前线程发送一个`SIGFPE`信号的，如果是段错误则是`SIGSEGV`，那是不是我在java中捕捉这个信号，就可以避免进程崩溃呢？如果是除零异常是不可以的，会在`new Signal`的时候就报错，因为这个信号已经被`JVM`内置处理，并且不允许用户处理了，但是我们自己`jni`函数中的信号，`jvm`又无法正常处理，导致了进程崩溃.
```java :Demo.java
import sun.misc.Signal;
public class Demo {
    public static native int divide(int a, int b);
    static {
        // System.load("C:\\Users\\sunwu\\Desktop\\base\\gateway\\notebook\\24.12\\demo\\target\\release\\demo.dll");
        System.load("C:\\Users\\sunwu\\Desktop\\base\\gateway\\notebook\\24.12\\libDemo.dll");
    }
    public static void main(String[] args) {
        try {
            Signal.handle(new Signal("FPE"), sig -> System.out.println(sig));
            System.out.println(divide(10, 2));
            System.out.println(divide(10, 0));
        } catch (Throwable t) {
            System.out.println("Error " + t);
        }
    } 
}
// $ java Demo
// Error java.lang.IllegalArgumentException: Signal already used by VM or OS: SIGFPE
```
我们修改c代码，把`signal`的处理放到c的代码里是否可以呢？
```c :Demo.c
#include <jni.h>
#include <stdio.h>
#include <setjmp.h>
#include <signal.h>
#include <pthread.h>
#include <unistd.h>

jmp_buf global_exception;
struct ErrorContext {
    int code;
    char msg[256];
};

void signal_handler(int signum) {
    longjmp(global_exception, signum);
}
JNIEXPORT jint JNICALL Java_Demo_divide
  (JNIEnv *env, jclass clz, jint a, jint b) {
    signal(SIGFPE, signal_handler);
    struct ErrorContext ctx = {0};
    // 设置异常捕获点
    int exception = setjmp(global_exception);
    if (exception == 0) {
        return a /b;
    } else {
        ctx.code = exception;
        snprintf(ctx.msg, sizeof(ctx.msg), 
                 "Caught signal: %d", exception);
        
        fprintf(stderr, "Error: %s\n", ctx.msg);
        return 0;
    }
}
```
答案是不行，c代码中的`signal_handler`函数并没有触发，猜测还是`jvm`做了一些提前的捕捉，但是又不能正常处理，导致了致命错误，这发生在信号能到达这个线程之前，虚拟机就崩溃了。

![img](https://i.imgur.com/8mDtOMi.png)

如果换成`SEGV`呢？结果是一样的，这里就不再贴图了。另外即使，java中能够捕捉这个信号，其实和没办法和出现错误的线程和代码对应起来，所以还是要写`c`的jni函数的时候，自己再代码中检查好，越界、除零、空指针等等的问题。

如果是`rust`呢？因为`rust`的`panic`上面例子中能看出，他并没有导致进程崩溃，但是用`rust`写的`jni`函数`panic`却能导致`jvm`进程退出。我们在第一个章节用了`panic::catch_unwind`来捕捉了所有的`panic`，如果不进行捕捉，直接`return a/b;`除以0的时候，会出现`panic`并导致进程的崩溃，如下。

![img](https://i.imgur.com/aJxTd99.png)

虽然，纯`rust`代码中`panic`不会导致进程崩溃，但是`jvm`环境变得复杂，`panic`传递到栈的最上层，就到了`jvm`层了，这时候是无法处理`panic`，进而导致整个`jvm`挂掉了。所以如果用`rust`写`native`程序，建议套一层`panic::catch_unwind`。
```rust
{
    let res = panic::catch_unwind(|| {
        return a / b; // 把要执行的逻辑放到这里。
    });

    match res {
        Ok(x) => x,
        Err(_) => {
            env.throw_new("java/lang/RuntimeException", "Error when invoke native method").unwrap();
            return 0;
        },
    }
}
```
当然这里还会遇到一个问题，就是如果要执行的逻辑中，需要用到`env`也就是`JNIEnv`这个变量，并且是需要用可变引用的话，这里会报错的。

![img](https://i.imgur.com/TgxFqD7.png)

因为可变引用在发生panic的时候，可能导致这个变量发生部分数据的变化，而另一部分没来得及变化，产生不一致性，这样在堆栈展开过程中使用这个变量可能会导致更严重的错误。但是显然这里的`env`并不会有类似的问题，他就是个`jni`的环境，`get_string`等函数并不会导致`env`变量出现问题。所以我们可以使用`AssertSafeUnwind`来`wrap`一下闭包，这个函数的作用就是我确认不会有安全问题绕开编译器的报错用的，如下框架可以作为一个`rust`写`jni`代码的一个代码模板。
```rust
pub extern "C" fn Java_Demo_toLowercase(mut env: JNIEnv, _class: JClass, s: JString) -> jstring {
    // panic时不打印stderr
    panic::set_hook(Box::new(|_| {}));
    // 把所有的逻辑放到catch_unwind中，类似于一个try操作
    let res = panic::catch_unwind(AssertUnwindSafe(|| {
        let result = env.get_string(&s).unwrap().to_str().unwrap().to_lowercase();
        let result = env.new_string(result).expect("Couldn't create java string");
        result.into_raw()
    }));
    // 处理结果，处理异常，类似于一个catch操作
    match res {
        Ok(x) => x,
        Err(_) => {
            let msg = "native method error. ".to_string();
            if let Some(s) = err.downcast_ref::<&str>() {
                msg.push_str(s);
            } else if let Some(s) = err.downcast_ref::<String>() {
                msg.push_str(s);
            }
            // 调用throw_new方法给jvm上下文抛出一个运行时异常。
            env.throw_new("java/lang/RuntimeException", msg).unwrap();
            return std::ptr::null_mut();
        },
    }
}
```

例如发生越界异常的时候，jvm能捕捉到一个运行时异常：

![img](https://i.imgur.com/ne3jejb.png)