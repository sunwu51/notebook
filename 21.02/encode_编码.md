# 编码
编码是指 字节码与字符的映射关系。字符集则是映射的这个集合。
# asii
最早的编码只有128个字符，使用了一个字节就可以映射。这些字符包含了常见的26个英文字母，英文标点，回车等。下图为标准ascii码的映射表。后来随着其他非英文国家开始使用计算机，ascii码将128-255也加入进来，但是并没有推广开来，因为多128个也不足以解决问题。

![ascii](https://i.imgur.com/dudaHAX.png)
# gb2312(1980)
对于中文来说gb2312是一个标准，他既指一个字符集，也指这个字符集的编码。收录汉字6763个，一级汉字3755个，二级汉字3008个。拉丁字母、希腊字母、日本平假字、西里尔字母等682个全角字符。又叫gb2312-80或gb2312-1980.

gb2312（其他编码也是）是兼容asii码的，为了能够兼容ascii码，0-127还是ascii的编码映射，而像汉字部分则使用两个字节表示。
```
区字节 + 位字节
```
0xB0 - 0xF7 一共有87个区号，都是大于127的数字。
0xA1 - 0xFE 一共有94个位号，都是大于127的数字。

啊 是gb2312的第一个汉字，编码就是B0A1。
```java
public static String byteToHex(byte[] bytes){
    String strHex = "";
    StringBuilder sb = new StringBuilder("");
    for (int n = 0; n < bytes.length; n++) {
        strHex = Integer.toHexString(bytes[n] & 0xFF).toUpperCase();
        sb.append("0x");
        sb.append((strHex.length() == 1) ? "0" + strHex : strHex); 
        sb.append(" ");
    }
    return sb.toString().trim();
}
public static void main(String[] args) throws Exception {
    String c = "啊";
    System.out.println(byteToHex(c.getBytes("gb2312")));
}
// 打印0xB0 0xA1
```
# gbk(1995)
gb2312字符集只有6k个汉字，这对于博大精深的中国汉字是远远不够的，新华字典小本的收录汉字就有11200个汉字。所以gbk在gb2312的基础上又进行了丰富。gbk全程汉字内码扩展规范。

gbk兼容gb2312，当然也就兼容ascii。同样还是两个字节表示汉字。一个字节是兼容ascii用的0-127的数。两个字节每个字节同样要大于127。

gb2312中区从B0开始有些浪费。因为大于128就可以区分了。所以gbk的区从129即0x81开始。位其实是没有必要大于128的，所以位的部分有的采用了小于128的部分。

整体范围是：

汉字区

B0A1-F7FE 原GB2312编码

8140-A0FE GB13000.1中CJK汉字6080个

AA40-FEA0 CJK汉字和增补汉字8160个

图形符号

AAA1-AFFE F8A1-FEFE A140-A7A0 共1000多个符号。

例如 瞭 是gbk收录，但是gb2312并没有收录的汉字。
```java
String c = "瞭";
System.out.println(byteToHex(c.getBytes("gb2312")));
System.out.println(byteToHex(c.getBytes("gbk")));
// 打印
// 0x3F
// 0xB2 0x74
```
3F是63 ascii中能看出对应的是英文问号，这也是解码失败的时候呈现的样子。

# gb18030(2000，2005)
最新的国标规范，完全兼容gb2312，基本兼容gbk。gb18030的字节构成更复杂。收录的字符数多于gbk。

一个字节是兼容ascii，两个字节基本是兼容gbk，而如果是四个字节，则是兼容Unicode字符。

![gb18030](https://i.imgur.com/kJSyAFV.png)

㞎 是gb18030收录，但是gbk没有的汉字。
```java
String c = "㞎";
System.out.println(byteToHex(c.getBytes("gb2312")));
System.out.println(byteToHex(c.getBytes("gbk")));
System.out.println(byteToHex(c.getBytes("gb18030")));
// 打印
// 0x3F
// 0x3F
// 0x82 0x30 0xCB 0x34
```
# utf-8
utf-8是编码名，对应的字符集是Unicode。使用1-4个字节来编码字符，1个字节同样还是兼容ascii，2个字节用来表示非英文的字母文字，如希腊、拉丁等。象形文字基本是3个字节，像中日韩。极少使用的语言字符用4个字节。

Unicode字符集是世界上所有语言字符的集合，所以对于中文的空间占用并不友好，一个汉字基本都是3个字节。


# 其他
utf-16也是Unicode的编码规范，他的优点是大部分字符都是2字节存储，但是缺点是不兼容ascii，所以用的不是很多。

# 编程
我们经常遇到的乱码问题。
- 1 程序文件是有编码的
- 2 读的文件或数据也是有编码的
- 3 展示数据的平台也是有编码的

如果将编码A的文件，用编码B的IDE或者文本浏览器打开就会显示乱码。

如果程序读取编码A的数据，并转成字符串，默认转换编码是B，也会乱码。

如果向前端返回的数据编码是A，而浏览器用编码B去展示也是乱码，类似第一种。

## 注意1
如果程序文件分别用gbk和utf-8运行如下代码，结果一样。
```java
String c = "啊";
System.out.println(byteToHex(c.getBytes("utf-8")));
System.out.println(byteToHex(c.getBytes("gb2312")));
System.out.println(byteToHex(c.getBytes("gbk")));
System.out.println(byteToHex(c.getBytes("gb18030")));
```
## 注意2
如果网站后台是gbk的，那在urlencode的时候需要适用gbk类型的encode。urlencode其实就是将非ascii字符转成%hex。
```java
System.out.println(URLEncoder.encode("啊", "gb2312"));
// 打印%B0%A1
```
## 注意3
如何将一段文字，从编码A强制转为编码B，但是这一般是不会进行的操作，因为强转肯定是乱码。
```java
String c ="啊";
System.out.println(new String(c.getBytes("gb2312"),"utf-8"));
//打印��
```
注意啦，这里出现了菱形问号，他的utf8字节码是0xEF 0xBF 0xBD，也是一种常见的信号，一般看到菱形问号，就说明，是其他编码的字节码用utf-8在展示。

## 注意4
如果爬gbk编码的网页，不要直接获取html字符串，再将字符串转为gbk编码，而是要获取`byte[]`，然后将`byte[]`转为字符串。因为直接获取字符串，相当于将`byte[]`按照默认编码一般是utf8转为了字符串，gbk的字节流直接转为utf8是有损的，有些在utf8中没有映射关系的字节码就会以问号形式出现，而再将这些文本转gbk则会失真。

```java
String uri = "http://cy.5156edu.com/serach.php?f_key=%D1%DA%B6%FA%B5%C1%C1%E5&f_type=chengyu";
byte[] body = restTemplate.getForObject(uri,byte[].class);
String html = new String(body,"gbk");
```
## 注意5
读文件的时候不建议使用`FileInputStream`+`byte[]`的方式。
```java
FileInputStream fs = new FileInputStream("1.txt");
byte[] buff = new byte[29];
int l =0;
while ( (l =fs.read(buff)) > 0){
    System.out.print(new String(buff,0,l));
}
```
例如1.txt中又10个啊字，文件编码是utf8.byte长度是29而10个啊是30个字节，会导致最后一个啊字没有读完整，进而导致编码错误。
最终打印`啊啊啊啊啊啊啊啊啊��`