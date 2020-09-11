# regular expression
[B站视频](https://www.bilibili.com/video/BV1Rf4y1X7R8)

# 基础
```
123   完全匹配123

^123  必须以123开头

123$  必须以123结尾

[abc] 匹配a或b或c

[a-z] 匹配所有小写字母

[a-zA-Z]  匹配大小写字母

[^a-z] 匹配所有非小写字母的一个字符

1{2}   匹配两个1

1{2,}  至少两个1

1{2,3} 2到3个1

.      匹配任意字符(但不能匹配换行)
```

# 特殊表达
```
\d 等于[0-9]
\D 等于[^0-9]
[\d\D] 匹配任意字符包括换行

\w 数字字母或下划线
\W 除了数字字母下划线外所有

\s 回车空格tab等特殊符号
\S \s外所有字符
```
# 次数表达
```
? 0或1次 {0,1}
+ 1或1次以上 {1,}
* 0或任意次 {0,}
```
# 组
```
无名组:
(a)bc 匹配abc且拿到第一个组是a

有名组:
(?<xx>a)bc 匹配abc拿到第一个组是a且组名是xxx

不捕捉组:
(?:a)bc 匹配abc，且拿不到组信息。

引用组：
(a)b\1\1 匹配abaa，通过\1引用第一个组
(?<xx>a)b\k<xx>\k<xx> 通过\k<组名>应用组

组中的或
(a|b)cd 匹配acd或bcd
```
# 组高级
```
PositiveLookahead
a(?=bc) 匹配abc中的a，匹配到后面必须紧跟bc的a。

NegativeLookahead
a(?!bc) 匹配abcabd中第二个a，即匹配后面没有紧接着bc的a。

PositiveLookbehind
(?<=ab)c 匹配abc中的c，即匹配紧跟在ab后面的c

NegativeLookbehind
(?<!ab)c 匹配abcaxc中的第二个c，即匹配不紧跟在ab后面的c。
```
# 题目
aabc类型的字符，例如滔滔不绝，孜孜不倦
```
^(?<a>.)\k<a>(?!\k<a>)(\k<b>.)(?!\k<b>|\k<a>).$
```