# spring单元测试
springboot2.x项目创建后就有test文件夹，默认会有个java文件。这个文件内容是这样的
```java
@SpringBootTest
class UnittestApplicationTests {

    @Test
    void contextLoads() {
    }

}
```
1.x的时候类上面还有个RunWith注解的，2之后集成的是junit5，就没有这个注解了。


@SpringBootTest注解的作用是创建一个spring的上下文，将项目的Bean都初始化完成，有了这个注解之后我们可以直接@Autowire注入服务。

@Test注解是Junit中的，即对当前函数进行运行测试。除了这个注解，junit还提供了@BeforeEach @BeforeAll @AfterEach @AfterAll注解，意思都很明确，其中each的是普通方法，all的必须静态方法。

# 例子
```java
@SpringBootTest
@ContextConfiguration(classes = {Svc2.class,Svc1.class})
class UnittestApplicationTests {

    @Autowired
    Svc1 svc1;

    @Autowired
    Svc2 svc2;

    @BeforeEach
    void init(){
        System.out.println("haha");
    }

    @Test
    void test1() {
        Assertions.assertEquals(1,svc2.mod(1001));
    }

    @Test
    void test2() {
        Assertions.assertEquals(2,svc2.mod(1002));
    }

    @Test
    void test3() {
        Assertions.assertTrue(svc1.isLucky(7));
    }
}
```
@ContextConfiguration注解可以指定哪些类需要注入，而不是注入全部的bean。

Assertions是对应Junit4中的Assert

# mock与spy
例如svc1依赖svc2，但是svc2不好直接运行，需要mock以下，就可以限定只注入svc1，然后svc2通过MockBean注解或者SpyBean注解注入（后面说两者区别）。然后通过when thenReturn的表达式，完成svc2的mock。（注意表达式只在当前上下文有效，下一个Test需要重新when then）

```java
@SpringBootTest
@ContextConfiguration(classes = {Svc1.class})
public class Svc1Test {
    @Autowired
    Svc1 svc1;

    @SpyBean
    Svc2 svc2;

    @BeforeEach
    void mockSvc2(){
        when(svc2.mod(487357395)).thenReturn(777);
    }

    @Test
    void test1(){
        Assertions.assertTrue(svc1.isLucky(487357395));
    }

    @Test
    void test2(){
        Assertions.assertTrue(svc1.isGood(932432400));
    }
    @Test
    void test3(){
        Assertions.assertTrue(svc1.isLucky(487357395));
    }
}
```

MockBean和SpyBean的区别是，MockBean是mock整个Bean，如果用到某个方法，就必须when then设定。SpyBean是可以mock部分方法，而另一些按照bean正常行为运行。一般可以直接用SpyBean。

# 附录
```java
@Service
public class Svc1 {
    /**
     * lucky number
     * 能被7整除的数
     */
    @Autowired
    Svc2 svc2;

    public boolean isLucky(int num){
        num = svc2.mod(num);
        return num%7 == 0;
    }

    public boolean isGood(int num){
        num = svc2.mod2(num);
        return num == 0;
    }
}
```

```java
@Service
public class Svc2 {
    public int mod(int num){
        return num%1000;
    }

    public int mod2(int num){
        return num%100;
    }
}
```