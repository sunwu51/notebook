# 根据特性查找文件
根据`文件大小`查找文件，如在当前目录及其子目录下，找`大于500M`的文件
```bash
find . -size +500M
```
根据文件名和文件类型查找文件，如当前目录及其子目录下，查找xxxService.java文件
```bash
find . -type f -name "*Service.java"
```
根据文件修改时间查找文件，如过去1分钟被修改(或读、或创建)过的文件
```bash
# 一分钟内修改过
find . -cmin -1
# 一天内修改过
find . -ctime -1
# 注意：
# time是天，min是分
# c是change包括权限修改，a是access读，m是modified写不包括权限修改
# -1是<=1 1x以内；+1是>1 1x以前； 1是=1 1x的时候
```
find常与xargs联合使用，如查找所有大于1024M的文件，并且按照从大到小顺序打印文件大小和文件名
```sh
# find查找1024M以上的文件，并且把文件名用null(\0)隔开并打印在同一行
# xargs -0 按照\0来split前面的输入，然后du -m 显示每个文件大小用m做单位
# sort -n按照数字排序（数字转换类似js parseFloat），-r反序，大的在前
find / -size +1024M -print0|xargs -0 du -m|sort -nr
```
# 根据文件内容查找文件或找出内容
查找当前目录，所有很有xxx字样的文件，输出每行是文件路径+含xxx的一行数据
```bash
# 只查找当前目录
grep "xxx" .
# 同时查找子目录，并显示行号
grep -nr "xxx" *
```
查找1.txt文件中含有xxx字样的一行，及这一行前面2行和后面10行
```bash
# A after; B before
grep -A 10 -B 2 -rn "xxx" 1.txt 
```
如果只想看出现了几次
```sh
grep "xxx" 1.log|wc -l
```
# 磁盘、文件大小
df查看磁盘使用情况
```bash
# h是比较好理解的单位显示，也可指定-m或-k
df -h
```
du查看指定目录（包含所有子目录下所有文件）下每个文件大小和总大小
```bash
# 无参数为查看当前目录
du
# hmk指定单位
du -h
du -m
du -k
# 如果文件太多显示出来不容易看，限制深度，如只查看一级文件/目录大小
du -d 1
```
# 读文件：more less head tail cat 
cat最简单直接读取全文，适用于小文件。
```sh
# -n显示行号
cat -n file
```
head和tail分别从头和尾读取文件
```sh
# 从头/尾读取x行
tail/head -n x file
# 阻塞式持续读取尾部
tail -f file
```
more和less很像，是比较强大的读取工具。一般linux都会有more，但有时没有less这里只介绍more了
```bash
# more后 回车是下一行，空格是下一页，b是上一页，q是推出
more file
# -4是每页显示4行，+5是从第5行开始
more -4 +5 file
```

