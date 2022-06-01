# jsoup
在java中像用jquery一样，进行爬虫。
```xml
<dependency>
    <groupId>org.jsoup</groupId>
    <artifactId>jsoup</artifactId>
    <version>1.14.3</version>
</dependency>
```
```java
Document doc = Jsoup.connect(url).get();
// 使用css选择器选取元素
Element e = doc.select('div.myclass li[class!=ori]');
// 获取文本
if(e == null) {
    log.error("element not exist");
}
e.text();
```