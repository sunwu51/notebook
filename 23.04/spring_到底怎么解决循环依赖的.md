# spring 循环依赖
spring是如何解决循环依赖的，这是一道很常见的面试题，可能java开发者已经都背的很熟了，是使用了三级缓存，然后为什么需要三级而不是二级，因为要解决动态代理类的问题。
# 思考
这个问题我其实一直没想明白，为什么三级才能解决代理类，我直接在二级缓存中存不需要增强的对象或者需要增强就存代理对象，不就行了。为什么非要加一级缓存来解决呢？
# bean生命周期
这是我从网上找的一张图，bean生命周期第一步就是实例化，基本就是通过无参构造方法创建一个对象，当然有参的需要先完成参数bean的初始化这里不展开了。第二步是设置属性populate，这也就是依赖注入的过程，第三步是初始化了，初始化这个过程下面图里面拆了好几个步骤。

`aware`相关接口主要是实现里面的方法用来感知bean的开始初始化的，能拿到beanname等属性，一般很少用到；

`BeanPostProcessor`也是一个接口，需要实现前置和后置处理两个方法，这俩方法可以用来增强对象，然后返回代理对象，因为这俩方法是有返回值的，spring会用返回值来替换原来实例化这一步new出来的对象的，前置和后置处理主要是看是不是需要在5和6两步中使用代理类，不需要的话就放到后置处理去增强，需要的话就放到前置处理，大多数都是放到后置处理的；

`InitailizingBean`接口和`@PostConstruct`代表的`init-method`都是执行一个无返回值(或者说返回值不参与到后续流程)的方法，这两个仅仅就是在这个时间点运行一下函数，可以用于一些bean创建完成后的基础操作。这俩的作用完全一致，只不过前者是`JSR 250`规范下的，后者是spring自己的。

其他后续的流程就没那么重要了。

![image](https://i.imgur.com/IER2wWN.png)
# 三级缓存
上图并没有提到三级缓存，因为三级缓存算是一些细节处理，对于没有产生循环引用的单例bean来说，这个图就是主流程的很好抽象了。

那三级缓存是怎么起作用呢，首先三级缓存是三个map
- `Map<String, Object> singletonObjects`: 1级，存放能被直接使用的完全体单例bean对象。
- `Map<String, Object> earlySingletonObjects`: 2级，存放非完全体的对象。
- `Map<String, ObjectFactory<?>> singletonFactories`: 3级，存放能产生bean的工厂对象。

下面map1，map2，map3来代替三级缓存。


下面我们来说下bean的创建流程：
- 1 map1有了就直接返回，否则实例化`A a = new A()`，把a和def信息mbd加入到3级缓，`map3.put("beanName",() -> getEarlyBeanReference(beanName, mbd, bean))`，map3存的工厂对象，工厂对象中捕捉了这个创建的对象和一些bean的元数据信息mbd，例如需不需要aop增强，怎么个增强法都在mbd记录。然后删除map2中的值。
- 2 设置属性，依次从map1，map2，map3中寻找是不是有初始化过的bean
  - 2.1 map1或map2有的话就可以拿来设置到属性中
  - 2.2 map3中有的话，因为是工厂对象，是不能直接用的需要调用工厂对象的`getEarlyBeanReference`来产生对应的对象，产生的过程其实就是根据`mbd`判断是不是要增强，需要的话就增强并返回增强过的代理对象，不需要就返回1中创建的初始对象,这个函数名叫`wrapIfNecessary`。这里需要注意一下，该方法还做了个两个额外的操作就是1往`earlyProxyReferences`这个map里塞了原对象，2往map2塞了`wrapIfNecessary`后的对象，这俩后面有用的。
  - 2.3 都没有就先去创建这个依赖的bean，新bean创建流程也是从1开始。
- 3 初始化，主要来说一下后置处理，因为增强基本都在这里做的。后置处理会遍历注册的`processor`列表，依次运行，并把运行的结果替换原来的bean对象，
  - 3.1 AspectJ的Processor逻辑简介
    - 3.1.1 判断`earlyProxyReferences`中的value是否有当前beanName
        - 3.1.1.1 没有或者有的值不等于当前的bean，那就在这做增强`wrapIfNecessary`并返回。
        - 3.1.1.2 有并且等于当前bean，直接返回bean。
  - 3.2 @Async注解的Processor逻辑简介
    - 3.2.1 无脑运行map3中的`getEarlyBeanReference`获得bean。
- 4 初始化后置处理后，还有个很重要的判断，就是判断后置处理完的对象是不是等于一开始第一步实例化的对象，看他们是不是同一个对象了。
  - 4.1 如果是的话，判断map2中有没有，有的话塞到map1，没有就把自己塞进map1.完成。
  - 4.2 不是的话，需要判断一下当前bean getDependentBeans有没有元素。
    - 4.2.1 没有，没问题，直接塞到map1，完成。
    - 4.2.2 有，那完蛋，直接抛出异常。

这个流程一下子变复杂了，好像比图里多出来很多存储和判断，一下子看上去是有点乱的，我们用以下几个例子来过一遍。

## 1 普通的没有循环引用的bean
- a1 创建对象`A a = new A()`，塞到三缓`map3.put("a", ()->getEarlyBeanReference(beanName, mbd, a))`。
- a2 设置属性，假如a里面的属性只有个b，然后b不在map1，map2，map3中，那就去创建b.
    - b1 创建对象`B b = new B()`，塞到三缓`map3.put("b", ()->getEarlyBeanReference(beanName, mbd, b))`。
    - b2 设置属性，假如b里没有需要设置的属性了。
    - b3 初始化，假如b是需要增强的，后置处理`wrapIfNecessary`，也就是会变成b'。
    - b4 发现b'!=b，此时判断b有没有在map2发现无，直接`map1.put("b", b')`
- a2 就把刚创建好的b'，塞到a中，`a.b=b'`。
- a3 初始化，假如a也是需要增强的，后置处理后变成了a'。
- a4 发现a'!=a，dependent是空，直接`map1.put("a", a')`，完成a的装配。
# 2 a和b循环依赖，a需要aop增强
- 之前的步骤是相同的，从b2开始不同
    - b2 设置属性`b.a`，从map123中挨着找，在map3中找到了
        - b2.2 运行`wrapIfNecessary`将a增强为a',`b.a=a'`，把a'放到map2中，并且把原始对象a放到`earlyProxyReferences`，即`map2.put("a", a')`，`earlyProxyReferences.put("a",a)`。
    - b3 与上面一样，假如b也需要增强，就会变成b'。
    - b4 与上面一样，最终`map1.put("b", b')`
- a2 与上面一样`a.b=b'`。
- a3 初始化，发现a需要AspectJ增强，调用他的process方法
    - a3.1.1 从`earlyProxyReferences`拿出来发现是a和第一步是同一个对象
        - a3.1.1.2 有并且等于当前a，返回a。
- a4 一堆processor处理完了，判断下a==a
    - a4.1 map2中已经有a了值是a'，`map1.put("a", a')`
# 3 a和b循环，但a是async增强
只说一下不一样的，就是
- a3 初始化，发现a需要async增强，用他的processor。
    - a3.2.1 无脑增强，返回a'，这里就和aop不一样，aop这一步返回的是a。
- a4 a'!=a了
    - a4.2 getDependentBeans里是有个b的，依赖b的创建
        - a4.2.2 gg 抛出异常。

