# java time
java中有很多表示时间的类，我们一起看一下他们的区别和使用场景。
# 1 Date
有两个`Date`类，分别是java.util.Date和java.sql.Date。后者是sql中的date，他是只有年月日没有更细粒度的时间信息的。所以一般前者用的较多。`Date`类主要包含了`年`,`月`,`日`,`时`,`分`,`秒`信息。可以通过这些信息构造`Date`对象，也可以通过一个`Date`对象获取这些信息。

因为`Date`本来就是表示日期的类，所以也在内部计算出了星期信息。

原则上`Date`是不需要`毫秒`信息的，但是`Date`中有个fastTime字段记录了毫秒信息，其他信息的计算也都基于这个毫秒信息。所以可以通过`getTime`方法拿到毫秒信息。
```java
new Date() // 当前时间，实际上市基于System.currentTimeMillis
new Date(long) // 用毫秒数构造，这个方法决定了其他时间对象，只要转为毫秒数，就可以很容易转为Date对象
new Date(2022-1900, 1, 25, 11, 19, 22) // 年是1900的偏移量，月是0-11
new Date(2022-1900, 1, 25, 11, 19, 22).getYear() // 122而不是2022
new Date(2022-1900, 1, 25, 11, 19, 22).getMonth() // 1 指的是2月，0才是1月
new Date().getTime() // 等价于System.currentTimeMillis
```
综上，`Date`是基于系统的毫秒偏移，来表示时间，并提供了日期相关的内在计算，可以快速的获取年月日星时分秒等信息，计算时候的时区则是使用了系统默认时区`TimeZone.getDefaultRef()`。
`Date`在设计上存在诸多问题，例如1900之前的年份没法表示；0表示1月；日期的含义竟然包括了时分秒等信息；格式化工具线程不安全；隐式的使用了系统默认时区；隐式的使用了默认的日历系统。
# 2 Calendar
`Calendar`也是老的jdk中的时间表示，也位于`java.util`包中，此类没有提供构造方法，可以通过`Calendar.getInstance()`创建当前时间的日历对象，也可以使用builder来构建。默认返回的是`GregorianCalendar`，这也是世界上绝大多数国家都在使用的日历系统，但是有些国家比如日本、东南亚一些国家像泰国等没有使用，需要指定历法来创建。

`Calendar`引入了可选历法，同时也引入了地区和时区的成员变量，弥补了`Date`的这些缺陷。比起`Date`，还提供了时间的加法函数add
```java
new Calendar.Builder()
                     .setLocale(locale)
                     .setTimeZone(zone)
                     .setInstant(System.currentTimeMillis())
                     .build()   // builder创建Calendar
new Calendar.Builder().setInstant(long).build() // 用毫秒数构造，这个方法决定了其他时间对象，只要转为毫秒数，就可以很容易转为Calendar对象
Calendar.getInstance().getTimeInMillis() // 等价于System.currentTimeMillis
Calendar.getInstance().setTimeZone(xxx)  // 不改变本质的时间毫秒数，只改变用于计算用的时区，是对于当前对象的改动，不是返回新对象
```
综上，`Calendar`也是基于毫秒数进行时间计算的一个类，他比`Date`强的地方是提供更细的日历值计算，比如位于一年的第几周，还有时间加法运算，但是时间的格式化类只能作用于date类。
# 基础知识补充
时区相关的类`ZoneId`、`TimeZone`，时刻是唯一的，但是对同一时刻，不同的时区描述是不一样的，比如中国早上10点在美国可能是晚上10点。

先来看一下`ZoneId`的用法，抽象类`ZoneId`有两个子类，`ZoneRegion`和`ZoneOffset`
```java
// 这三个返回的就是ZoneRegion，他们三个本质的偏移都是0
ZoneId.of("UTC")
ZoneId.of("GMT")
ZoneId.of("UT")

// 下面返回的是ZoneOffset
ZoneId.of("GMT+1")
ZoneId.of("UT-01:22")
ZoneId.of("UTC+05")
```
有人会问GMT和UTC还有UT应该是有区别的但是为啥说一样呢？

因为这是java里是一样的，但是实际追究历史的话，是三种计算时间的方式，他们在现实世界有着细微的区别，但是在java中是一样的。

![image](https://i.imgur.com/fYc18fu.png)

对于一些常见的时区简称和哪些地区使用可以参考[https://www.timeanddate.com/time/zones/](https://www.timeanddate.com/time/zones/)

通过地区名获取时区的方法如下。

```java
// 通过ZoneId名称全程来创建ZoneId对象
ZoneId.of("Asia/Shanghai")

// 通过下面方法可以通过简称来创建ZoneId对象
ZoneId.of("EST", ZoneId.SHORT_IDS)
```

`TimeZone`和`ZoneId`类似，也是表示时区的，两者可以简单的互转。
```java
TimeZone.getTimeZone("UTC")   //! 注意该方法如果传入字符串不合法返回的是GMT+0
TimeZone.getTimeZone("xx", false) // 不合法则返回null 
TimeZone.getTimeZone(ZoneId.of("UTC")) // zoneId -> timeZone
TimeZone.getTimeZone("UTC").toZoneId() // timeZone -> zoneId
```

`Clock`也是一个时区相关的类，他主要有俩作用，记录时区和创建`Instant`，注意这里有个理解的偏差，就是老想着创建出来的Instant是在这个时区下面的，但是其实Instant是没有时区的绝对值。
```java
Clock.systemDefaultZone()
Clock.systemUTC()
Clock.offset(baseClock, duration)

// 下面两个写法结果一致，并没有时差，因为Instant没有时区
Clock.systemDefaultZone().instant()
Clock.systemUTC().instant()

// 下面结果一致
Clock.systemDefaultZone().millis()
Clock.systemUTC().millis()
```
`Clock`主要用于模拟和测试，上面是SystemClock，他的结果一致，下面则不一样
```java
// OffsetClock 这是当前时间 + 1天的Instant
Clock.offset(Clock.systemUTC(), Duration.of(1, ChronoUnit.DAYS)).instant()

// FixClock 定死了毫秒时间0，也就是19700101000000，后面的时区不影响值
Clock.fixed(Instant.ofEpochMilli(0L), ZoneId.of("UTC+1")).instant()

// TickClock 打点计时器，返回的Instant必须是9s的倍数
Clock.tick(Clock.systemUTC(), Duration.ofSeconds(9)).instant()
```
# 3 Instant
`Instant`与时区无关的绝对的时间，和System.currentTimeMillis类似，但是Instant是精确到纳秒。

因为纳秒的精度一个long存不过来，所以分为两个字段分别存seconds和nanos。

```java
Instant.now()
Instant.ofEpochMilli(millis)
Instant.ofEpochSecond(4, -999_999_999) // s + ns
```
其他用法
```java
instant.truncatedTo(ChronoUnit.HOURS) // 取整到小于等于当前时间的整秒时间
Instant.now().atZone(ZoneId.of("UTC")) // 转换成UTC下的ZonedDateTime
```
java.time包下的时间都是基于纳秒精度为计算核心的，所以脱离了System.currentTimeMillis

# 4 LocalDateTime
`Instant`没有时区，是绝对的时间值，但是toString，显示的是UTC0的时间，也不能处理日期相关的东西，例如当前是几月几号。
`LocalDateTime`就是对`Date`的替代品，后者核心是基于一个毫秒，前者则更精细了到了纳秒。两个重要属性是LocalDate(年月日)，LocalTime(时分秒纳秒)
```java
// 下面2个的时间，有8小时时差
LocalDateTime.now()
LocalDateTime.now(ZoneId.of("UTC"))

// 以下两者不同，前者表示当前时间的UTC表示，后者表示当前时间的年月日时分秒不变，时区换UTC
LocalDateTime.now(ZoneId.of("UTC"))
LocalDateTime.now().atZone(ZoneId.of("UTC"))

// LocalDateTime的月从1开始，下面表示2022-01-01 01:01:01
LocalDateTime.of(2022,1,1,1,1,1)
```
# 5 ZonedDateTime
包含了LocalDateTime和Zone两部分信息。

```java
ZonedDateTime.now() //系统时区
ZonedDateTime.now(ZoneId.of("UTC")) //UTC0时区
ZonedDateTime.now(Clock.systemUTC()) // 同上

ZonedDateTime.now(Clock.systemUTC()).toLocalDateTime() // 直接拿出localDateTime部分
ZonedDateTime.now(Clock.systemUTC()).toInstant()       // 转换为Instant
```

345都提供了isBefore这样的比较方法，但是不建议在localDateTime类使用该方法，因为可能是不同时区。

# 格式化
old : `SimpleDateFormat` 线程不安全
```java
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
Date d = sdf.parse("2022-01-01 11:11:11");
String str = sdf.format(d);
```
new : `DateTimeFormatter` 线程安全
```java
DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
dtf.format(LocalDateTime.now());
LocalDateTime.parse("2022-01-01 11:11:11", dtf);
```
