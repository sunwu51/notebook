# threadlocal
# 1 基础
现象：threadlocal作为一个全局变量，在不同的线程去get的时候能够获取不同的值。

应用场景：
- SimpleDateFormat线程不安全，每个线程都要用，new太多，放到threadlocal中线程池可反复使用。
- 一个请求链路很长，经过数个服务，每次都要放到参数带着。改为直接放到threadlocal作为上下文。（每个线程独立的上下文）

原理：`ThreadLocal`对象本身其实不存储内容，而是`Thread`对象有个`ThreadLocalMap`来进行存储，`ThreadLocal`作为这个map的key，运行get方法，实际是`map.get(threadlocal)`

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1912/ThreadLocal1.png)

# 2 使用习惯
线程池与ThreadLocal配合使用的时候，一定注意线程是回收的，Thread对象还在，因而ThreadLocalMap还在，因而里面的key-value都没有被销毁。这样轻则是引起内存泄漏，一直没有清理这部分内容。严重的则会因为再次get到线程上一世的内容，导致错误。

所以如果threadlocal不再使用了，一定记得及时remove掉，防止不必要的麻烦。

上面场景1其实是利用了不被清理这一点进行了复用。
> 下面基于jdk1.8
# 3 弱引用
```java
/**
 * The entries in this hash map extend WeakReference, using
 * its main ref field as the key (which is always a
* ThreadLocal object).  Note that null keys (i.e. entry.get()
 * == null) mean that the key is no longer referenced, so the
* entry can be expunged from table.  Such entries are referred to
 * as "stale entries" in the code that follows.
 */
static class Entry extends WeakReference<ThreadLocal<?>> {
    /** The value associated with this ThreadLocal. */
    Object value;

    Entry(ThreadLocal<?> k, Object v) {
        super(k);
        value = v;
    }
}
```
`key`弱引用了`entry`,也就是说entry如果没有被其他对象强引的话，下次gc就被删掉了。这个有啥用呢？

我们思考什么时候不被其他强引用，首先entry是被map的entry[]属性强引用的，map是被thread强引用的，所以thread没结束的话，这个弱引用形同虚设。而一旦thread销毁，而往往ThreadLocal是一个全局变量，如果此时不设置为弱引用，那么entry或者说value就一直存在不被gc，导致内存泄漏。

弱引用保证了线程销毁的时候，threadlocalmap中的entry对象和entry中的value清理掉（value一般唯一被entry引用）。

# 4 内存结构
ThreadLocalMap是采用了数组的存储结构，每个元素就是entry本身，而不是链表红黑树。这是因为链表或树，上下节点有指针强引用，进而导致一个entry是被另一个entry强引用的。假设全局下强引用了一个entry，这将会导致这个entry和他所在的链表的后面所有元素都无法被清除了。

虽然上述情况很少出现，但是array却很好的避免了这一点。

数组会出现冲突，是怎么解决的？
> 如果冲突就往后一位，如果后面一位不为空，就继续往后，直到找到空位子。

可能会出现hash为3,4,3的元素abc分别存储最后存入的样子是abc（ac的hash都是3却不相邻），这也是为啥get的时候需要一直找到null为止。

# 5 get set remove清理key为null的entry
先说get的时候，直接找`arr[hash(key)]`，如果就是key所在的entry那就返回：
```java
private Entry getEntry(ThreadLocal<?> key) {
    int i = key.threadLocalHashCode & (table.length - 1);
    Entry e = table[i];
    if (e != null && e.get() == key)
        return e;
    else
        return getEntryAfterMiss(key, i, e);
}
```
如果没找到就数组往下找,一直找到null元素，都没找到的话就返回null：
```java
private Entry getEntryAfterMiss(ThreadLocal<?> key, int i, Entry e) {
    Entry[] tab = table;
    int len = tab.length;

    while (e != null) {
        ThreadLocal<?> k = e.get();
        if (k == key)
            return e;
        if (k == null)
            expungeStaleEntry(i);
        else
            i = nextIndex(i, len);
        e = tab[i];
    }
    return null;
}
```
！！ 注意，get过程中找到k==null的需要进行`expungeStaleEntry`(清除陈旧的entry),将k=null的当前这条entry的value和entry本身清理掉。然后还需要从当前位置向后一直到null的所有元素都进行重排。重排可以定义为：
```
元素尽量往他本来应该在的hash(element)这个位置移动的过程叫做重排

先删除k=null的这个元素，然后后面的重排的过程叫删除并重排
```
例如hash为4、3的bc分别在4和5位置，这是有可能的因为3位置可能之前有元素，后来key成了null如下：
```
数组:
xxx|xxx|xxx|null-v|b-v|c-v|null|....
get(某个hash为3的元素)触发了重排:
xxx|xxx|xxx|c-v|b-v|null|....
```
上面重排过程c-v移动到了b-v前面，因为b的hash本就是4所以保持不动，c的hash是3，尽量前移发现3位置是null就直接到3了。

```java
private int expungeStaleEntry(int staleSlot) {
    Entry[] tab = table;
    int len = tab.length;

    // expunge entry at staleSlot
    tab[staleSlot].value = null;
    tab[staleSlot] = null;
    size--;

    // Rehash until we encounter null
    Entry e;
    int i;
    for (i = nextIndex(staleSlot, len);
         (e = tab[i]) != null;
         i = nextIndex(i, len)) {
        ThreadLocal<?> k = e.get();
        if (k == null) {
            e.value = null;
            tab[i] = null;
            size--;
        } else {
            int h = k.threadLocalHashCode & (len - 1);
            if (h != i) {
                tab[i] = null;

                // Unlike Knuth 6.4 Algorithm R, we must scan until
                // null because multiple entries could have been stale.
                while (tab[h] != null)
                    h = nextIndex(h, len);
                tab[h] = e;
            }
        }
    }
    return i;
}
```
remove和get一样，还少了初始化的步骤。


set

set是最复杂的，假设hash(key)=x，同样去找table[x]。
- 如果找到null，就直接令table[x]=<key,value>。
- 如果找到e，且e.k==key，则直接更新e.v=value。
- 如果找到e，且e.k!=key，则x++。

如果上述过程中找到了e.k==null，这里和get不一样，假设这个位置下标是`y（y>=x）`。set的时候是先去找一数`z`。括号里先不看，方便理解（先向左，找到null为止，找下标最小的一个e.k==null的元素，这个下标就是z。如果没有找到，则）向后找找到第一个e.k==null的元素的下标就是z了。

>也就是找到k=null的再往后找下一个k=null的。

在向后找的过程中，需要一边判断e.k是不是刚好就是key。如果是的话，循环就可以退出了，`将y位置直接设置为[key,value]`，将找到的这个位置清除，令z=当前这个位置。然后在z往后运行log(size)次【删除并重排】。

set的清理不是一轮而是log2(table.length)-1轮，清理范围更大；
set的key本身找到的话会被跳到尽可能最靠前的地方（y位置）。

下面所有的k的hash都是x，思考k4.set(vv4)过程。
```
x        x+1    x+2    x+3
|null-v1|k2-v2|k3-v3|k4-v4|..
️
|k4-vv4 |k2-v2|k3-v3|null |..
```
如果按照get的流程，则应该是k2，3，4各自前移一步，此处set策略不同，仔细体会下。
> set清理比get要多，但都不是完全清理掉k=null的。

为啥要清理k=null的，因为用不到了，get不到了，所以没有存在的意义，不清理也是内存垃圾。
