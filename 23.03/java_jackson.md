# jackson
# 1 基本用法
`jackson`是java中常用的json序列化/反序列化的库。基本用法如下

第一步创建一个ObjectMapper
```java
ObjectMapper objectMapper = new ObjectMapper();
```
序列化
```java
String sam = objectMapper.writeValueAsString(new Person(1, "Sam", null));
```
反序列化
```java
objectMapper.readValue("{\"id\": 1, \"name\":\"Sam\",\"parent\":null}", Person.class);
```

**哪些字段可以序列化？**

public的字段，或者有public getXX方法的字段,例如下面例子中name和parent可以被序列化成json列，id则被忽略。
```java
class Person {
    int id;
    String name;
    public Person parent;

    public String getName() {
        return this.name;
    }
}
```
而如果将getName进行修改如下，则json的列名会变为"n"
```java
// {"n": "Sam"}
String name;
public String getN() {
    return this.name;
}
```
比较变态的如果列是public，同时又给了public的get方法，但是返回的数据还不一样。会以列优先级更高。
```java
// {"name": "Sam"}
public String name;
public String getName() {
    return this.name + "!!!";
}
```

**哪些字段可以反序列化？**

与序列化是对称的，`public`或者有`public setXxx`方法的字段可以被反序列化。

**嵌套类型会递归进行序列化**

上面例子中Person类型有个parent字段是复杂类型，该项有值可以递归进行序列化，但是如果出现循环，则会抛出异常。


# 2 修改json字段名或者忽略字段
当java类中field名称保持不变，想要修改Json中的字段名，则可以使用`@JsonProperty("xxx")`注解
```java
// {"myName": "Sam"}
@JsonProperty("myName")
private String name;
```
而如果java类中必须有get方法，但是不想在反序列化的时候对外暴露，则可以使用`@JsonIgnore`添加到field上或者get方法上。
```java
// {"age": "11"}
@JsonIgnore
public String name;
public int age
```
或者也可以在类上添加`@JsonIgnoreProperties({ "internalId", "secretKey" })`，来将多个字段ignore。
`JsonIgnoreProperties`还有个作用是忽略未知的json input field。下面进行反序列化的时候会报错，`Unrecognized field "id" (class Person), not marked as ignorable`
```java
// {"id": 1, "name": "Sam"}
class Person {
    public String name;
}
```
而给Person添加注解后则可以忽略不认识的id属性，下面写法则不报错。
```java
// {"id": 1, "name": "Sam"}
@JsonIgnoreProperties(ignoreUnknown = true)
class Person {
    public String name;
}
```
`ignoreUnknown`是常用的策略，也可以在objectMapper中全局配置。
```java
objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
```
# 3 修改Naming策略
默认的名称策略是json与java保持一致，java一般为小写驼峰，因而json也是如此。
```java
// {"firstName": "Sam"}
String firstName;
```
通过`@JsonNaming`可以修改某一列或者整个类的映射方式，例如下面代码将该field修改为kebab横线的命名方式。
```java
// {"first-name": "Sam"}
@JsonNaming(
    value = PropertyNamingStrategy.KebabCaseStrategy.class)
String firstName;
```
将该注解加到整个类上，则是对每个字段都生效，也可以直接加到`ObjectMapper`中，对所有类生效。
```java
ObjectMapper objectMapper = new ObjectMapper();
objectMapper.setPropertyNamingStrategy(PropertyNamingStrategy.KEBAB_CASE);
```
# 4 枚举类型
在反序列化的时候，枚举类型可以识别字符串，也可以识别下标值。
```java
// {"type": 0}
// {"type": "A"}
// 上面两种json都可以反序列化成功
class Person {
    public Type type;
}
enum Type {
    A,
    B
}
```
但是对于序列化，默认是字符串A，如果想要用下标，可以使用相关策略。
```java
objectMapper.configure(SerializationFeature.WRITE_ENUMS_USING_INDEX, true);
```
# 5 时间类型
时间类型也是一种除了基础类型之外常用的类型，例如`Date`,`Timestamp`,`LocalDateTime`,`ZonedDateTime`,`Instant`等，都是常用的时间类型。
```java
@Getter
@Setter
class TimeSpec{
    java.util.Date utilDate;
    Date sqlDate;
    Timestamp sqlTimestamp;
    Instant instant;
    LocalDate localDate;
    LocalDateTime localDateTime;
    ZonedDateTime zonedDateTime;
}
```
默认情况下，序列化行为如下，可以看到老的包下的类基本都是序列化为long，而time下的类都是有复杂子结构的，这是因为有这些get方法，这样的格式有很多问题，例如可读性差，长度冗余，因为没有对应的set方法，所以对于time下的类来说，序列化出来的json没有办法直接反序列化回去。为了能更好的支持time包下类的序列化，需要在Jackson中注册`JavaTimeModule`
```json
{
    "utilDate":1679973942379,
    "sqlDate":1679973942379,
    "sqlTimestamp":1679973942379,
    "instant":{
        "epochSecond":1679973942,
        "nano":379000000
    },
    "localDate":{
        "year":2023,
        "month":"MARCH",
        "monthValue":3,
        "dayOfMonth":28,
        "chronology":{
            "id":"ISO",
            "calendarType":"iso8601"
        },
        "era":"CE",
        "dayOfYear":87,
        "dayOfWeek":"TUESDAY",
        "leapYear":false
    },
    "localDateTime":{
        "year":2023,
        "month":"MARCH",
        "nano":379000000,
        "monthValue":3,
        "dayOfMonth":28,
        "hour":3,
        "minute":25,
        "second":42,
        "dayOfYear":87,
        "dayOfWeek":"TUESDAY",
        "chronology":{
            "id":"ISO",
            "calendarType":"iso8601"
        }
    },
    "zonedDateTime":{
        "offset":{
            "totalSeconds":0,
            "id":"Z",
            "rules":{
                "fixedOffset":true,
                "transitions":[
                    
                ],
                "transitionRules":[
                    
                ]
            }
        },
        "zone":{
            "id":"UTC",
            "rules":{
                "fixedOffset":true,
                "transitions":[
                    
                ],
                "transitionRules":[
                    
                ]
            }
        },
        "year":2023,
        "month":"MARCH",
        "nano":379000000,
        "monthValue":3,
        "dayOfMonth":28,
        "hour":3,
        "minute":25,
        "second":42,
        "dayOfYear":87,
        "dayOfWeek":"TUESDAY",
        "chronology":{
            "id":"ISO",
            "calendarType":"iso8601"
        }
    }
}
```
## 5.1 注册module调整time包下的类的行为
```xml
<dependency>
    <groupId>com.fasterxml.jackson.datatype</groupId>
    <artifactId>jackson-datatype-jsr310</artifactId>
    <version>${jackson-version}</version>
</dependency>
```
2.12以上的Jackson可以不用手动注入module了。
```java
objectMapper.registerModule(new JavaTimeModule());
```
此时序列化出来的结果如下，该结果可以直接被注册module后的objectMapper反序列化。
```json
{
    "utilDate":1679974795838,
    "sqlDate":1679974795838,
    "sqlTimestamp":1679974795838,
    "instant":1679974795.838000000,
    "localDate":[2023,3,28],
    "localDateTime":[2023,3,28,3,39,55,838000000],
    "zonedDateTime":1679974795.838000000
}
```
## 5.2 序列化不用时间戳形式
时间戳可读性还是有点差，通过配置策略，可以展示可读性更好的ISO形式，下面是配置方式和json格式。
```java
objectMapper.registerModule(new JavaTimeModule());
objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

{
    "utilDate":"2023-03-28T03:44:38.889+0000",
    "sqlDate":"2023-03-28",
    "sqlTimestamp":"2023-03-28T03:44:38.889+0000",
    "instant":"2023-03-28T03:44:38.889Z",
    "localDate":"2023-03-28",
    "localDateTime":"2023-03-28T03:44:38.889",
    "zonedDateTime":"2023-03-28T03:44:38.889Z"
}
```
在注册`JavaTimeModule`后反序列化是同时支持时间戳和这种ISO形式的，不需要再配置反序列化feature。

## 5.3 反序列化支持的形式
下面的time下的类都是注册了`JavaTimeModule`的情况下来讨论的。

先列出一些序列化之后的格式，下面的{}代表可以存在也可不存在。
- 1 毫秒时间戳 = 1679974795838
- 2 秒.纳秒时间戳 = 1679974795.838000000
- 3 ISO_LOCAL_DATE = 2023-03-28
- 4 ISO_LOCAL_TIME = 03:44:{38{.9位以内数字}}
- 5 ISO_LOCAL_DATE_TIME = ISO_LOCAL_DATE + 'T' + ISO_LOCAL_TIME
- 6 ISO_DATE_TIME = ISO_LOCAL_DATE_TIME + {offsetId{[zoneRegionId]}}
- 7 ISO_ZONED_DATE_TIME = ISO_LOCAL_DATE_TIME + offsetId + {[zoneRegionId]}
- 8 ISO_LOCAL_DATE_TIME + offsetId = 7 不含 [zoneRegionId]

这里尤其要注意有些形式例如`ISO_ZONED_DATE_TIME`他其实有很多种合法的形式，下面都是合法的：
- 2023-03-28T03:44Z
- 2023-03-28T03:44:22+01:00
- 2023-03-28T03:44:22.12+02:30
- 2023-03-28T03:44:22.123456789-03:00
- 2023-03-28T03:44:22.123+03:00[UTC]
- 2023-03-28T03:44:22.123-04:00[America/New_York]
- 2023-03-28T03:44:22.123-04:00[-05:00]
- 2023-03-28T03:44:22.123-04:00[UTC-05:00]

上面例子中offsetId取值Z就是utc时区，取值`+01:00`则代表的是+1时区，而[UTC]和[America/New_York]以及[-05:00]等代表的则是zoneRegionId，即zoneId或RegionId，Region都有哪些可以参考`Time Zone Database (TZDB)`。虽然这一部分是选填项，是对offsetId的补充说明，但是如果和offsetId存在冲突的话，实际上是以这部分为准，上面最后2个实际生效的是-5时区。


我们回到JacksonTime的反序列化：
- Date支持1,3,5,8其中135不含时区信息，自动应用机器当前时区，例如：如果当前机器+8，传入的是-8的，那么实际的日期可能会是前一天。
- Timestamp也是1,3,5,8。和Date一样，这些都是老包，即都是基于毫秒时间戳的统一行为。
- LocalDate支持3,5，因为没有时区所以时间戳和带时区的都不支持
- LocalDateTime只支持5，必须有时间部分，所以不支持3
- ZonedDateTime支持2,7，有时区，且是新的time包要用2这种时间戳形式，然后支持7，多种时区的表示方式。
- Instant支持2和8并且时区只能是Z，其他写法如+01:00会报错。

当然也可以不记这些规则，直接用`@JsonFormat`设置一个`pattern`即可，注意pattern中的Z，写法是`Z` `+0800`等形式，而不是`+08:00`。
```java
@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ssZ")
ZonedDateTime zonedDateTime;
```

小结：
对于时间的表达，建议使用`ZonedDateTime`和`LocalDateTime`来准确的表达时间，`ZonedDateTime`在反序列化的时候支持的形式比较灵活，最放心的写法是用`@JsonFormat`来制定时间pattern。
# 6 子类型

# 7 自定义序列化和反序列化

# 8 其他注解
- @JsonAlias("_n","Name","name") 别名
- @JsonInclude 设置序列化时，字段在什么情况下被include，例如可以配置null值就不include到json，来减少数据量`@JsonInclude(JsonInclude.Include.NON_NULL)`
# 9 其他策略