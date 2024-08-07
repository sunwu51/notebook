---
tags: awk,grep,sed
---

这篇文件介绍的非常浅显，建议直接看比较新的文章中对于`awk` `grep`的介绍: `../24.03/shell_awk&grep&pstree&xarg&lsof&find`
# awk
通俗讲awk，就是逐行执行一个命令，一般命令包含print。例如：
```bash
# 打印文件每一行
awk '{print $0}' x.xml

# 按照空格分词后，打印每一行第一个单词
awk '{print $1}' x.xml

# 按照,分词而不是空格
awk -F ',' '{print $1}' x.xml

# 按照,分词而不是空格
awk -F ',' '{print $1}' x.xml

# 打印第一个单词中包含cat的行的第二个单词和第四个单词,~包含 !~不包含 ==全等
awk '$1~"cat"{print $2 and $4}' x.xml

# 注意= ~这些对比字符串的时候记得加上双引号，有时候不加也可以，但最好加上。
```
上面是对文件内容进行检索和打印的，有些时候我们往往需要对之前输出的结果进行操作
```bash
# 获取当前运行的docker容器id
docker ps|awk '$1!~"CONTA"{print $1}'
```
# grep
这里顺带讲下grep,grep是过滤的。例如
```bash
# 打印123
echo 123 |grep 12

# -i 不区分大小写的匹配
echo 123abc |grep  -i ABc

# 正则过滤,输出123abc
echo 123abc |grep  "^\d\{2,4\}[a-z]\{3\}"
```
注意grep的正则中，\d \w [a-z] ^$ .*等都和普通正则一样，但是{}()和?+必须加\转译才行，如上面的\{3\}是代表出现3次。

grep用的时候一般就用这些。
# sed
字符串替换
```bash
# 中间支持正则，但不支持\d\w,用[0-9][a-z]之类的替换
sed 's/要被取代的字串/新的字串/g'

# 将结尾是数字的，把该数字改为miao，这里正则不贪婪
sed 's/[0-9]$/miao/g'
```
sed还有其他很多用法，这里我用的最多的就是这个字符替换，其余的用到再百度吧。