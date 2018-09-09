# ThreadLocal的get set remove
三个方法据说都可以清理key时null的数据。
# ThreadLocalMap
存储结构是`Entry[]`。注意啦，这里不是HashMap那种数据每个元素是链表的存储结构，而是直接就是Entry数组，存储到75时扩容。
# 先看不考虑key=null时的读写
根据hash(key)求出下标i,找到`e=table[i]`。就是到i号坑招人，分为坑里没人和坑里有人两种情况。

先说set的时候，如果`e==null`，就意味着这个坑没人占，直接`table[i]=[key,value]`就行了；

如果坑里有人(且`e.k!=null`如果是null在下一节重点讨论)，那就往后挪个坑`i++`，这种情况也比较常见就是hash冲突，hashmap采用的是链表往后挂，这里是数组坑位往后找。注意hash冲突的也未必就是连续的，比如`hash(k1)=hash(k2)=hash(k3)-1`，存入顺序是k1 k3 k2的话，会存成下面的情况。
```
例子1
...|k1|k3|k2|...
```

get的时候，坑里没人,则设置并返回`initialValue`方法中设置的值（不重写，默认是null）。

如果`e!=null`，e.k==key那就直接返回e.value，如果e.k!=k，就如同上面例子中k2.get()找到了k1的位置并不等于k2，此时i++往后找，到最后也找不到就返回null了。

remove的时候，坑里没人，啥也不用干了。坑里有人，看是不是要删的key，如果不是就往后找，如果是的话，也不能只是直接删除，即还是刚才的例子，如果k1被删除了，则k2.set(xx)的时候会找到k1原来那个位置，然后发现坑里没人就set了新的值进去，后面的k2还在，这样就不对了。所以应该是删除后，向后遍历(下标j)每一个Entry，直到null，每个tab[j]的k拿出来做`h=hash(k)`，然后从h到j，看看是不是有null的坑位，是的话就填充过去。**这个操作是很重要的，他的意义在于在每次删除的时候，都能把因删除元素(如例子中k1)而导致hash冲突而存到后面坑位的元素（如例子中k2），放到最靠近hash计算本来的位置（例子k1删除,k2会重新存入k1的位置）**

小结：目前不考虑有k=null的情况的时候，还是比较容易理解的。主要就是`Entry[]`的存储结构，hash冲突后往后挪位置。

# 考虑到key=null的话
因为弱引用的原因，在某些情况下，Entry的key可能被gc掉了，变成了null。这种时候需要怎么处理呢。
例如下面情况hash(k1)=hash(k2)=hash(k3)=hash(k4)-1=hash(k5),存入顺序k1 k2 k4 k3,k5然后因为弱引用，k2被gc了成了null。如下，k3.get()会怎样呢？
```
例子2
下标   x    x+1     x+2   x+3   x+4
...|k1-v1|null-v2|k4-v4|k3-v3|k5-v5|null|...
```
如果你快晕了，可以直接看下面的小结

翻开源码，把get以及get相关的函数拿来，一共有四个函数。
```java
/* 
    该函数的逻辑就是，到坑位找e，找坑的具体逻辑在getEntry函数
    e不为null则返回e.value
    e为null或者map本身就是null,则需要插入初始化值，并返回
 */
public T get() {                                    
    Thread t = Thread.currentThread();              
    ThreadLocalMap map = getMap(t);                 
    if (map != null) {                              
        ThreadLocalMap.Entry e = map.getEntry(this);
        if (e != null) {                            
            @SuppressWarnings("unchecked")          
            T result = (T)e.value;                  
            return result;                          
        }                                           
    }                                               
    return setInitialValue();                       
}     
/*
  找坑位：
  找到hash(key)为下标的坑位，坑里有人e,且e.k==key的话，代表找到了直接返回e
  坑里没人，或者，坑里有人但e.k!=key，认为miss了，则调用并返回getEntryAfterMiss方法
*/
private Entry getEntry(ThreadLocal<?> key) {     
    //i是hash运算后求出的key应该在的下标         
    int i = key.threadLocalHashCode & (table.length - 1); 
    Entry e = table[i];                                   
    if (e != null && e.get() == key)                      
        return e;                                         
    else                                                  
        return getEntryAfterMiss(key, i, e);              
} 
/*
  miss后返回啥：
  下标i++，向后遍历，如果找到了一个e.k==key的，那就返回，如同之前的例子1中找到了k2.
                  如果找到一个e.k=null的，那就调用eSE方法传入这个下标进行清理


  理论上eSE只会运行最多一次啊，因为运行一次后将i--null之间的k=null处理了，那下次遇到k=null之前就直接遇到e=null了
*/
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
/*
  清理函数：
  先把传入的下标ss位置直接清理了
  然后向后遍历，凡是遇到k=null的也都清理了
             遇到k!=null的就计算他本来应该在的位置h，找到离h位置最近的一个null坑塞入，尽量往h处前移
  ************
例子2
下标   x    x+1     x+2   x+3   x+4
...|k1-v1|null-v2|k4-v4|k3-v3|k5-v5|null|...
   例子2中k3.get时，
   getEntry发现e1.k!=k3，则认为miss调用getEntryAfterMiss
      先到e1，发现e1.k!=null，则求hash(e1.k)发现就是当前位置，就不移动
      向后到e2，e2.k==null，则认为需要清理调用expungeStaleEntry
        把e2清理为null，然后向后遍历
        到e4，hash(k4)=x+1,于是把e4移动到x+1号坑，x+2坑null
        到e3，hash(k3)=x,x有人，x+1有人，x+2没人，e3移到x+2坑
        到e5，hash(k5)=x,x一直到x+2都有人，e5移到x+3坑
        到null，退出循环
        此时从x号到x+3分别为|e1|e4|e3|e5|
      向后到e3（此时已经产生挪位），e3.k==k3,返回e3.v，退出循环。
  ************
  这个移动位置的操作保证了k1 k3 k5三个hash一样的，在存储上一定是不被null隔开的。
  注意返回值i一定是比staleSlot大，且i坑位一定是null，
*/
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
小结：get函数会清理hash(key)即下标x，到下一个null即下标x+5之间所有的k=null的元素，并会对这范围内的其他元素进行尽量前移，补坑，保证hash算出的下标为x的都是不被null隔开的，使得之后的get set等函数不会出错。

一切清理都发生在寻找过程中发现`k=null`的时候，如果上来就找到了是不会运行清理的。

set是不是也是类似的处理呢？同样来看源码：
```java
/*
    就是拿出map然后调用map的set
*/
public void set(T value) {              
    Thread t = Thread.currentThread();  
    ThreadLocalMap map = getMap(t);     
    if (map != null)                    
        map.set(this, value);           
    else                                
        createMap(t, value);            
} 
/*
   map.set函数
   从源码的注释中可以发现和get方法是不一样的，就是说set分为add和update，而两者其实都很多，get是找坑的方式只适合update而add就不适合了。
     i=hash(key)为下标，i++如果找到了tab[i].k=key则直接赋值然后结束运行。
     如果找到上述情况之前，遇到了tab[i].k=null,也就意味着要擦除，则调用rSE函数，然后结束运行。此时应当在擦除的位置上赋值了。
     如果找到了tab[i]=null也没有k==key的元素被发现，则认为是新增的条目，赋值给tab[i]这个空坑位即可。
*/
private void set(ThreadLocal<?> key, Object value) {                                                                                          
    // We don't use a fast path as with get() because it is at              
    // least as common to use set() to create new entries as                
    // it is to replace existing ones, in which case, a fast                
    // path would fail more often than not.                                 
                                                                            
    Entry[] tab = table;                                                    
    int len = tab.length;                                                   
    int i = key.threadLocalHashCode & (len-1);                              
                                                                            
    for (Entry e = tab[i];                                                  
         e != null;                                                         
         e = tab[i = nextIndex(i, len)]) {                                  
        ThreadLocal<?> k = e.get();                                         
                                                                            
        if (k == key) {                                                     
            e.value = value;                                                
            return;                                                         
        }                                                                   
                                                                            
        if (k == null) {                                                    
            replaceStaleEntry(key, value, i);                               
            return;                                                         
        }                                                                   
    }                                                                       
                                                                            
    tab[i] = new Entry(key, value);                                         
    int sz = ++size;                                                        
    if (!cleanSomeSlots(i, sz) && sz >= threshold)                          
        rehash();                                                           
}

/*
   替换旧元素：
   之前函数中遇到了k=null的情况就调用本函数，将要设置的k-v和，k=null的坑号传过来了
     ss为坑号，ss向前遍历，直到null，找到k=null的元素中下标最小的存到sTE
     向后遍历，直到null，同样找到k=null的元素需要记录下标最小的（即第一个）存到sTE
       不过不同于向前遍历，如果找到了e.k=key，就可直接结束函数了了，令e.v=value，并且将e换到ss位置然后此时sTE如果不为SS了，则从sTE运行log(len)次eSE。
     如果最终到null也没能找到e.k=key的元素，则认为并有这样一个key，此时就在ss处（还记得ss是传入的参数，是k=null，且是当前key最接近hash(k)的（王位最有利竞争者）的那个坑号吧），将其赋值。sTE如果不为SS了，否则直接将i赋值给sTE（因为换位后i就是k=null了），则从sTE运行log(len)次eSE。


*/
private void replaceStaleEntry(ThreadLocal<?> key, Object value,           
                               int staleSlot) {                            
    Entry[] tab = table;                                                   
    int len = tab.length;                                                  
    Entry e;                                                               
                                                                           
    // Back up to check for prior stale entry in current run.              
    // We clean out whole runs at a time to avoid continual                
    // incremental rehashing due to garbage collector freeing              
    // up refs in bunches (i.e., whenever the collector runs).             
    int slotToExpunge = staleSlot;                                         
    for (int i = prevIndex(staleSlot, len);                                
         (e = tab[i]) != null;                                             
         i = prevIndex(i, len))                                            
        if (e.get() == null)                                               
            slotToExpunge = i;                                             
                                                                           
    // Find either the key or trailing null slot of run, whichever         
    // occurs first                                                        
    for (int i = nextIndex(staleSlot, len);                                
         (e = tab[i]) != null;                                             
         i = nextIndex(i, len)) {                                          
        ThreadLocal<?> k = e.get();                                        
                                                                           
        // If we find key, then we need to swap it                         
        // with the stale entry to maintain hash table order.              
        // The newly stale slot, or any other stale slot                   
        // encountered above it, can then be sent to expungeStaleEntry     
        // to remove or rehash all of the other entries in run.            
        if (k == key) {                                                    
            e.value = value;                                               
                                                                           
            tab[i] = tab[staleSlot];                                       
            tab[staleSlot] = e;                                            
                                                                           
            // Start expunge at preceding stale entry if it exists         
            if (slotToExpunge == staleSlot)                                
                slotToExpunge = i;                                         
            cleanSomeSlots(expungeStaleEntry(slotToExpunge), len);         
            return;                                                        
        }                                                                  
                                                                           
        // If we didn't find stale entry on backward scan, the             
        // first stale entry seen while scanning for key is the            
        // first still present in the run.                                 
        if (k == null && slotToExpunge == staleSlot)                       
            slotToExpunge = i;                                             
    }                                                                      
                                                                           
    // If key not found, put new entry in stale slot                       
    tab[staleSlot].value = null;                                           
    tab[staleSlot] = new Entry(key, value);                                
                                                                           
    // If there are any other stale entries in run, expunge them           
    if (slotToExpunge != staleSlot)                                        
        cleanSomeSlots(expungeStaleEntry(slotToExpunge), len);             
}                                                                       private boolean cleanSomeSlots(int i, int n) {
    boolean removed = false;                  
    Entry[] tab = table;                      
    int len = tab.length;                     
    do {                                      
        i = nextIndex(i, len);                
        Entry e = tab[i];                     
        if (e != null && e.get() == null) {   
            n = len;                          
            removed = true;                   
            i = expungeStaleEntry(i);         
        }                                     
    } while ( (n >>>= 1) != 0);               
    return removed;                           
}                                         
```
小结：set和get方法前面思路一样，但是清理方式不同，因为set要设置值，所以细节上也有很多不同。get的在发现k=null的元素和null之间的进行删除/前移，set因为要设置这个值，所以发现的第一个要用来set值，但是又不能保证后面是不是有key，所以也要向后遍历找key。如果后面找不到的话，就设置这第一个k=null的元素，如果找到了则删除找到的，然后再设置这第一个k=null的元素。

这里看出set值如果遇到k=null的其实这元素会被set，但是清理还要吗？到这里发现不清理好像也没有任何关系，因为set的和hash(key)就是无null隔开的。但是在set中还是添加了clear逻辑，是将刚才第一个k=null的位置ss，向前找最小k=null下标，如果没有则向后找第一个k=null下标，这个下标叫st吧，在st运行清除/前移，然后返回值是下一个null下标i,再带入清除/前移，反复loglen次。

即get清理hash(key)-->null路上的内存泄漏，set第一次清理null-->hash(key)-->null位置的内存泄漏，然后从后面这个null到下一个null...一共loglen次。get清理的少，set清理的多，但是其实都不是全清理，而且清理也需要发生在查找路上遇到k=null的时候。

remove的时候
```java
private void remove(ThreadLocal<?> key) {     
    Entry[] tab = table;                      
    int len = tab.length;                     
    int i = key.threadLocalHashCode & (len-1);
    for (Entry e = tab[i];                    
         e != null;                           
         e = tab[i = nextIndex(i, len)]) {    
        if (e.get() == key) {                 
            e.clear();                        
            expungeStaleEntry(i);             
            return;                           
        }                                     
    }                                         
}                                             
```
比较简单，就是找到key删除，然后eSE，当前位置-->null，清理/前移。前移是很重要滴，因为删除了产生null，很可能需要后面补齐。
