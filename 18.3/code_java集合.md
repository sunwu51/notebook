# java集合
# 集合概述
List Set Map这三种主要类型，其他的Queue Stack等
# ArrayList vs LinkedList vs Vector
`ArrayList`底层实现是`数组`，默认数组大小是`10`，查询方便，但是删除和插入代价高。超出后扩展一半。  
`LinkedList`底层实现是`双向链表`，查询和遍历都要从头开始，代价高，但是删除和插入方便。  
`Vector`和ArrayList类似，是线程安全的，扩大倍数是1倍。
# HashTable vs HashMap
HashTable jdk1.1，HashMap jdk1.2出的，两者的提供的api几乎完全一样，主要区别有两个：  
`HashTable`是线程安全的，`HashMap`不是线程安全的。  
`HashTable`键值都不能存`null`，`HashMap`可以。  
注意：HashTable已经被废弃了，如果需要线程安全的Map你需要使用`ConcurrentHashMap`。
# HashMap实现
数据结构在1.7版本及之前使用数组存储，数组每个元素是链表。两个重要的方法`hashCode()` `equals()`的介绍，equals是判断俩对象是不是同一个对象，即最后判断到内存中的位置是不是一个。hashCode则是对内存中位置进行一个hash运算得到一个正整数，因而equals返回true的俩对象一定有相同的hashCode，反过来则不一定。

容量和扩容：默认16且必须为2的幂次，当达到初始容量0.75倍的时候开始扩容，变为两倍。负载因子0.75。

put操作的时候，计算key的hashCode，并对其再次进行hash运算，使最后结果在[0,当前数组长度)范围，然后到数组这个位置的链表中遍历，看是否已经存在了这个key，如果确实没有则追加到链表尾部。get操作的时候也类似，就是计算key的hash找到链表，遍历找到key，将Entry取出。  

1.8版本做出的改动，当链表长度大于8的时候存储结构转为红黑树。
# HashMap的容量为什么要设为2的幂次
最简单的思路`hashCode % len`得到下标，但取模算法代价高，如果len是2的幂次则下标0到len-1，通过`hashCode & (len-1)`即可得到一个符合条件的下标且计算速度快很多倍。
```java
static int indexFor(int h, int length) {
    // assert Integer.bitCount(length) == 1 : "length must be a non-zero power of 2";
    return h & (length-1);
}
```
# ConcurrentHashMap vs HashTable
ConcurrentHashMap相比HashTable有哪些改进？HashTable在进行元素操作的时候，是将整个HashTable锁住，而Concurrent则是将该Entry所在的链表锁住，即分段锁、粒度更细的锁。
# HashMap vs LinkedHashMap vs TreeMap
`LinkedHashMap`是按照插入顺序进行排序，`TreeMap`是按照大小顺序进行排序。

`LinkedHashMap`是`HashMap`的子类，二者唯一的区别是`LinkedHashMap`在`HashMap`的基础上，采用双向链表将所有entry连接起来，这样是为保证元素的迭代顺序跟插入顺序相同。LinkedList+HashMap结构混合起来就是LinkedHashMap

`TreeMap`数据结构为红黑树，可以保证节点遍历顺序为大小顺序。

HashSet就是HashMap中value全都指向一个内部静态类，TreeSet也是TreeMap的阉割版本。
# CopyOnWriteArrayList vs ArrayList
前者是Concurrent包下的，工作方式为可以同时读，但在写的时候复制一个副本进行操作，然后合并到原集合，有更好的读取性能，写性能不好，适合大量读而少量写的场景。
# fail-fast vs fail-safe
java.util包中的全部集合类都被设计为fail-fast的。而java.util.concurrent中的集合类都为fail-safe的。

fail-fast迭代器抛出ConcurrentModificationException，而fail-safe迭代器从不抛ConcurrentModificationException。

该异常在同时写的时候被抛出。通过Collections.synchronizedCollection(Collection c)可以将一个非同步集合变成同步集合，但是是整体锁。
Collections.UnmodifiableCollection是另一个加工函数，可以将集合的增删等写操作变成禁止的。对应的异常是`UnsupportedOperationException`
# Comparable vs Comparator
两者都是接口，前者是类实现这个接口后（重写compareTo(T t)），就可以通过Arrays.sort或Collections.sort对这个类组成的数组或集合进行排序。

后者则是如果类本身没有实现Comparable，且不方便改类的时候，可以通过写一个比较器类实现Comparator（重写compare(T t1,T t2)），将这个比较器传入sort方法中，也可以完成排序。

`Comparable`相当于“内部比较器”，而`Comparator`相当于“外部比较器”。

