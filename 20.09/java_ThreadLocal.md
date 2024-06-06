# 1 概述
今天再次聊起来ThreadLocal，还有点感慨，实习的时候还讲过这个东西。大部分人其实都知道以下几点：
- ThreadLocal是使用线程“专享”的变量的时候使用的。
- ThreadLocal用完了要remove
- ThreadLocal原理上是Thread对象中有个map，而ThreadLocal本身作为key，value则是要存储的变量内容。
以上的内容，大家都知道这里不赘述，下面我们展开讲一下Map存储方式，弱引用，以及内存泄漏等问题。
# 2 ThreadLocalMap
线程对象中的成员变量ThreadLocalMap，key是ThreadLocal本身，value是要存的变量。他的存储结构和HashMap不同，是Entry[]。
数组如果遇到hash冲突，则是直接向后推一位的方式来进行存储。这种存储方式会产生很多有趣的排布，例如下面我们用颜色相同表示hashcode算出的数组下标相同，就会出现下面的情况。

![image](https://i.imgur.com/HQlw7lt.png)

这里其实想说的是，相同hashcode的不一定挨着，hashcode算出来的下标的数组位置不一定存着一个hashcode算出来就是自己的。这个数组的put和get其实是比较复杂的过程，后面会提到“顺带”清理的设计。
# 3 弱引用与内存泄漏
Map中的Entry是弱引用类型的，他的定义如下，弱引用的含义是整个Entry对于作为key的ThreadLocal是弱引用。这也就意味着，如果这个ThreadLocal只被这个Entry引用，而没有被其他对象强引用了，就会在下一次GC的时候回收掉这个ThreadLocal。
```
static class Entry extends WeakReference<ThreadLocal<?>> {
    /** The value associated with this ThreadLocal. */
    Object value;
    Entry(ThreadLocal<?> k, Object v) {
        super(k);
        value = v;
    }
}
```
很多人不太理解弱引用的作用，我们简单的写一段伪代码，代码段1：
```java
public class M{
    Object a = new Object();
    ExecutorService threadPool = Executors.newFixedThreadPool(20);
    
    public static void main(String[] args){
        new M().f(a);
        new M().f(a);
        new M().f(a);
    }
    
    public void f(Object a){
        ThreadLocal tl = new ThreadLocal();
        threadPool.exec(()->{
            tl.set(a);
        });
    }
}
```
我们来看代码执行到第7行的时候，在这个时刻f函数执行完了一次。所以f函数的栈会被回收。栈，我们知道主要是以栈帧为单位存储基础数据类型和对象引用，f函数中主要就是存储了tl这个对象引用，在执行完成后，栈被释放，tl这个地址也就被释放了，于是tl原来指向的ThreadLocal对象就没有了这个强引用。 注意14行的set方法，实际上创建了一个Entry对象，key是tl指向的对象，value是a，且Entry对key是弱引用。 到这里我们得出结论，tl原来指向的ThreadLocal对象没有了强引用(tl被清理了)，所以下一次gc的时候，原tl所指向的ThreadLocal对象就会被清理掉。
上面稍微有点绕，主要是tl和tl所指向的对象要在这个场景下区分开，毕竟"tl"本质是个4字节地址，而真正的对象是没有名字的。
假设没有弱引用，上面的场景中，tl所指向的内存就一直不会释放，内存泄漏。(因为线程池的缘故，线程对象不被回收，进而导致Entry不被回收)。设计弱引用的思路出发点就是，用户程序都不再使用这个key了，Entry引用的这个key也没有意义，直接清理了这key就可以了。原来弱引用一定程度上减少了内存泄漏，但是却没有完全解决，因为清理掉key之后，会导致这个Entry的内容此时是这样的 ： null-a。我们还应该把这个Entry给清理掉，那怎么清除这些key是null的Entry呢？
这就要说ThreadLocal另一个巧妙的设计了，就是在get、set、remove方法的时候，需要在Entry数组上进行寻址，这个寻址的过程中会"顺带"看看这个下标里的Entry是不是key为null的Entry，如果是的话，说明是之前弱引用产出的垃圾，就会顺手把这个Entry设为null。这块内容在前年实习的时候讲过，也写过文章简述，这里不赘述。下面图展示这个清理过程：
例如运行tl.get()，的时候tl在第三个红色框，然后黑色是key为null的Entry。

![a](https://i.imgur.com/q4bytLE.png)

tl的hashcode找到第一个红块，发现不是，往后找一位还不是，继续往后发现了key为null的Entry，就把他清理为null了，然后继续往后直到找到第三个红块。

![a](https://i.imgur.com/n0h36Tr.png)

找到之后还需要做合并，是一个往自己该在的位置趋近的操作。例如黄色计算的下标如果是2，则黄色前移一格。

![a](https://i.imgur.com/K4GgG14.png)

而如果黄色计算的下标是3的话，则第三个红色块需要补位。

![a](https://i.imgur.com/4WTL0G2.png)

当然这个清理是“顺带”的清理，并不是全盘扫描的清理，所以即使做了这样的设计，仍然不能完全避免内存泄漏。在线程结束的时候运行`tl.remove()`，就可以直接清理掉Entry对象。那也就没有弱引用啥的了，直接就没有引用了。也可以使tl指向的内存被gc。每次线程执行完毕的时候都手动remove，这样根本也不需要弱引用，就能避免内存泄漏。
有人会有疑问，如果我后面想要用这个key怎么办，你咋给我清理掉了？这个情况其实不成立，如果后面在操作这个key，这说明还有强引用，所以就不会被清理。例如下面这种情况，代码段2。
```java
public class M{
    Object a = new Object();
    ExecutorService threadPool = Executors.newFixedThreadPool(20);
    
    public static void main(String[] args){
        System.out.println(new M().f(a));
    }
    
    public ThreadLocal f(Object a){
        ThreadLocal tl = new ThreadLocal();
        threadPool.exec(()->{
            tl.set(a);
        });
        return tl;
    }
}
```
其实更多的使用场景中，我们把ThreadLocal作为静态的变量来使用的，本身就不希望被清理，也没有Key的内存泄漏问题的。例如,代码段3
```java
public class M{
    
    static ThreadLocal tl = new ThreadLocal();
    
    Object a = new Object();
    ExecutorService threadPool = Executors.newFixedThreadPool(20);
    
    public static void main(String[] args){
        new M().f(a);
    }
    
    public void f(Object a){
        threadPool.exec(()->{
            tl.set(a);
        });
    }
}
```
即使这样还是建议remove，因为线程下一次被拿来使用的时候里面的ThreadLocalMap中含有tl-a这样一条Entry，会导致tl.get()的时候拿到非预期的值。
# 4 为什么是Entry数组
其实我从看ThreadLocal以来，一直有个疑问，就是为什么要用Entry数组的设计方式。而不使用HashMap那种数组+链表的实现方式。我个人感觉，其实HashMap也能实现相同的功能。
HashMap在get和set的时候操作都相对简单，但是HashMap元素是链表，所以Entry有next指针指向下一个Entry，铁锁连环。像上面提到的清理key为null的Entry的时候，就不能像数组那样洒脱的:arr[x] =null；最关键的是每次“顺带”清理的只有当前链表中的其他Entry了（源码中set的时候，清理范围是比较大的），考虑到HashMap的复杂度O(1)，也就是每个链表的平均长度是很短的，所以清理范围就很小了。当然这是我的个人想法，两年前就google过这个问题，网上没有找到答案。之前还想着把get set的过程做成动画，为此专门学了Moho，后来也不了了之，不愧是我:)