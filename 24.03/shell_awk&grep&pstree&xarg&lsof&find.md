本文介绍几个GNU/linux下的shell指令，可以帮助我们排查问题。

# 1 grep
日志内容排查当然少不了`grep`，`grep`自己就能处理大文件，所以`cat 1.log|grep xxx`这种管道用法是不合理的。

`grep`有三种用法，如下：
```bash
$ grep [OPTION...] PATTERNS [FILE...]
$ grep [OPTION...] -e PATTERNS ... [FILE...]
$ grep [OPTION...] -f PATTERN_FILE ... [FILE...]
```

列举几个最常见的用法：
```bash
# 从1.log文件中查找包含hello的行
$ grep 'hello' 1.log

# -v 反向查找，找到不包含hello的行
$ grep -v 'hello' 1.log

# -i 忽略大小写 -n 显示行号 --color高亮显示匹配部分
$ grep -i -l 'hello' 1.log --color

# -A 打印匹配行之后的N行，-B 打印匹配行之前的N行
$ grep -A 2 -B 2 'hello' 1.log

# -C 打印匹配行前后各N行，效果同上
$ grep -C 2 'hello' 1.log

# -r 递归搜索目录 -l 只打印匹配的文件名，这样可以找到那些内容含有hello的文件
$ grep -rl "hello" /path/to/directory
```

上面的用法我们可以快速定位要找的文本，并通过ABC参数可以打印出匹配行的上下文，尤其是对于搜索错误日志非常实用。

同时，`grep`还支持正则表达式，来模糊匹配，建议用-P来指定正则
```bash
# 默认是-G采用基础的正则BER，-P采用perl正则，-E采用扩展的正则，-F则是不用正则，直接匹配字符串

# 基础正则，支持常见的正则
$ grep '[A-Za-z]x*' 1.log # 匹配以字母开头，后面跟着0个或多个字母x

# -E实用扩展正则表达式，与默认差不多，但是默认的有些字符（如+）需要转义 -E则不用多转一次
$ grep -E '[A-Za-z]x+' 1.log # 匹配以字母开头，后面跟着1个或多个字母x

# -P与-E类似，但是是更丰富的Perl正则，例如引入了\d等支持
$ grep -P '\dx+' 1.log
```

此外对于多个文件场景
```bash
# 搜索所有的`.log`后缀的文件这对于有rollingfile配置日志文件目录比较友好。
$ grep 'hello' *.log

# 搜索指定的两个文件
$ grep 'hello' 1.log 2.log
```
# 2 find
文件查找，主要用法如下

基于文件名的查找
```bash
# 搜索/目录和子目录下所有文件名为hello.txt的文件；-maxdepth指定最大子目录深度
$ find / -maxdepth 4 -name 'hello.txt' 

# 搜索/目录和子目录下所有文件名是hello.开头的文件; -type指定类型f文件，d目录，l链接
$ find / -type f -name 'hello.*'

# 搜索/目录和子目录下的绝对路径中包含/libc的文件，正则匹配；此外-iregex则是忽略大小写
$ find / -regex '.*libc.*'
```

基于文件其他基础信息
```bash
# size>1M 并且上次修改时间是超过10天前的so文件
$ find / -size +1M -mtime +10 -name '*.so'

# size单位: k M G +是超过 -是小于 mtime单位是天，mmin单位则是分钟
```

基于查到的文件进行操作
```bash
# exec后面的表达式中，{}占位符代表找到的文件名，\;是;的转义，分割多个shell执行
$ find / -size +10M -exec du -h {} \;
```

# 3 xargs
`xargs`用来和管道`|`联合使用，可以进行非常流畅的将内容通过管道输送到后面的shell。

来看以下两者区别
```bash
$ ls | grep hello
$ ls | xargs grep hello
```

`ls | grep hello` 代表列出当前目录下的文件，然后过滤这些文件中，文件名含有hello的文件。

`ls | xargs grep hello` 代表累出当前目录下的文件，并过滤文件内容汇总还有hello的行。

为什么会有这么大的区别呢？其实是因为不同的指令对于管道的支持是不同的。一般来说，我们可能希望，`|`前面指令运行结果，能够作为后面指令的运行参数，但是实际上指令并不一定支持。以`ls`为例，下面指令我们想的是能得到等价于`ls 1.log`的效果，但是实际上`ls`并没有接收管道扔过来的`1.log`
```bash
# 下面运行结果等价于ls
$ echo '1.log' | ls
```
这时候就需要`xargs`来帮忙了，`xargs`让指令和管道配合的更好。
```bash
# xargs会将管道传过来的参数，作为后面指令的参数放到后面，等价于 ls 1.log
$ echo '1.log' | xargs ls
```
通过--verbose参数可以看到xargs的详细执行过程
```bash
# 列出所有的`.c`文件，并传给du运行，最终的指令是du -h hello.c main.c t1.c
$ ls *.c  | xargs --verbose du -h
du -h hello.c main.c t1.c 
4.0K	hello.c
4.0K	main.c
4.0K	t1.c
```
默认情况下`xargs`以空格为分隔符，即前一句的运行结果会被进行简单的处理，多个空格会合并为一个，然后回车也会被替换为空格
```bash
# 这里有回车和多个空格，最后作为ls参数的回车会替换为空格，多个空格会被合并
$ echo -e '2.log\n     3.log' | xargs --verbose ls
ls 2.log 3.log 
2.log  3.log
```

如果上一级输出有很多空格但是不想被替换，可以用-d参数指定分隔符，
```bash
# 手动指定回车分割
$ echo -e '2.log\n3.log' | xargs -d '\n' --verbose ls
ls 2.log 3.log 
2.log  3.log

# 与find的-print0结合（find -print0使结果每行不以回车结尾而是\0）, xargs -0则是按照\0分割，将分割后的字符串依次作为ls后的参数
$ find . -name "*.log" -print0 | xargs -0 --verbose ls
```

默认情况下，`xargs`会将管道传过来的参数，作为后面指令的参数放到后面，如果我们希望传过来的参数按照空格分开，每个参数都作为后面指令的入参，运行多次.例如`echo -e '2.log\n3.log'| xargs --verbose ls`等价于`ls 2.log 3.log`，说白了最后还是一句shell，如果想要拆分多行，每行执行一次`ls 2.log`然后`ls 3.log`则可以这样
```bash
# -n 指定每个参数都作为ls的参数执行一次，n还可以指定其他比如每两个作为ls的参数运行一次shell
$ echo -e '2.log\n3.log' | xargs -n 1 ls
2.log
3.log
```

有了`xargs`，我们就可以熟练掌握管道化的指令了，比如上面`find / -size +10M -exec du -h {} \;`我们如果不知道-exec的用法，完全可以下面来替换达到一样效果
```bash
# find和xargs连用最好用-print0和-0配合，不然文件名可能有奇怪字符被xargs给转掉
find / -size +10M -print0| xargs -0 -n 1 du -h
```
# 4 pstree
`ps`指令可以帮助我们看当前系统下运行的进程情况，而`pstree`也是gnu/linux下的一个进程查看工具，可以帮助我们查看进程树。
```bash
# 直接使用，展示1号进程systemd和由此产生的进程/线程
$ pstree

# 指定PID，展示该进程和产生出来的进程、线程
$ pstree <PID>

# -T 只展示进程，不展示线程
$ pstree -T

# -p展示进程/线程ID，-t展示线程名称
$ pstree -pt <PID>
```

这是一个示例，展示java进程的线程树，与jstack的线程信息一致。
```bash
$ pstree -pt  150693
java(150693)─┬─{C1 CompilerThre}(150707)
             ├─{C2 CompilerThre}(150706)
             ├─{Catalina-utilit}(150716)
             ├─{Catalina-utilit}(150717)
             ├─{Common-Cleaner}(150711)
             ├─{Finalizer}(150702)
             ├─{G1 Conc#0}(150697)
             ├─{G1 Main Marker}(150696)
             ├─{G1 Refine#0}(150698)
             ├─{G1 Service}(150699)
             ├─{GC Thread#0}(150695)
             ├─{GC Thread#1}(150712)
             ├─{HikariPool-1 ho}(150715)
             ├─{Monitor Deflati}(150705)
             ├─{Notification Th}(150709)
             ├─{Reference Handl}(150701)
             ├─{Service Thread}(150704)
             ├─{Signal Dispatch}(150703)
             ├─{Sweeper thread}(150708)
             ├─{VM Periodic Tas}(150710)
             ├─{VM Thread}(150700)
             ├─{container-0}(150718)
             ├─{http-nio-8080-A}(150731)
             ├─{http-nio-8080-P}(150730)
             ├─{http-nio-8080-e}(150720)
             ├─{http-nio-8080-e}(150721)
             ├─{http-nio-8080-e}(150722)
             ├─{http-nio-8080-e}(150723)
             ├─{http-nio-8080-e}(150724)
             ├─{http-nio-8080-e}(150725)
             ├─{http-nio-8080-e}(150726)
             ├─{http-nio-8080-e}(150727)
             ├─{http-nio-8080-e}(150728)
             ├─{http-nio-8080-e}(150729)
             └─{java}(150694)
```
# 5 lsof
`lsof`用来查看当前系统打开的文件，可以帮助我们查看某个进程打开的文件情况，或者查看某个端口被哪个进程占用。因为Linux中一切都是文件，即使是端口也是文件，甚至控制台都是文件。

文件相关（注意这里文件特指文件系统中的文件而不是everything），我们可以用`lsof`查看文件被哪个进程打开，或者查看文件被哪个进程打开，并打印出进程的<span data-word-id="51586842" class="abbreviate-word">PID</span>
```bash
# 查看进程打开的文件，一般会有一些进程可执行文件、动态链接库、读写的文件句柄等
$ lsof -p <PID>

# 查看用户打开的文件
$ lsof -u <USER>

# 反过来查看文件被哪些进程打开
$ lsof /usr/lib/x86_64-linux-gnu/libc-2.31.so
```

端口相关，一般可以用`netstat -antp`来查看进程监听的端口，但是netstat可能没有内置，可以用`apt install net-tools`来安装，但是lsof也能查看端口
```bash
# -i 是查看端口监听 后面接TCP或UDP可以区分协议，
$ lsof -i <TCP/UDP>

# 可以查看特定的端口 或特定协议的特定端口 被哪个进程占用
$ lsof -i :8080
$ lsof -i TCP:8080

# 占用不一定是监听可以用| grep LISTE来过滤监听 或者-sTCP:LISTEN,过滤tcp套接字，状态为监听
$ lsof -i :8080 -sTCP:LISTEN
```

# 6 awk
`awk`是一种编程语言和工具，它主要用于文本和数据的提取和报告。在UNIX和类UNIX系统中，`awk`特别适合对结构化文本和字符串进行操作

基本用法如下
```bash
$ gawk [ POSIX or GNU style options ] -f program-file [ -- ] file ...
$ gawk [ POSIX or GNU style options ] [ -- ] program-text file ...
```

awk其实理解起来并不复杂，他就是会对文件的每一行都运行一段函数，我们只需要记住几个常用的函数中的语法即可
```bash
# 对1.log每一行文本，运行print $1这段代码，print打印类似echo输出到控制台，$1 $2 ...分别是按照空格拆开的 第1,2...列
$ awk '{print $1}' 1.log

# -F指定每列的分隔符，这里指定分隔符为逗号
$ awk -F ',' '{print $1}' 1.txt

# /正则/ 下面用法用正则匹配行，效果等于grep 'h\w' 1.txt，换句话说大多数场景下awk可以替代grep
$ awk '/h\w/ {print}' 1.txt
```

常见{}中可用的内置变量与内置函数：
- $0整行 $1第一列 $2第二列...
- NR当前行号(从1开始) NF当前行总列数
- FS分隔符默认空格-F可以改，RS行分隔符默认回车
- FILENAME文件名
- print打印函数，类似shell的echo，用逗号隔开打印多个变量，输出结果会用空格隔开
- gsub字符串替换
- -v可以传递变量进去`awk -v var="value" '{print var,$1}' filename`
- length(string)
- index(string, search_string)，从1开始，没有则返回0，和编程语言不一样下标从1开始
- substr(string, start [, length])
- split(string, array [, fieldsep])
- toupper(string) tolower(string)
- sub(regexp, replacement, [,target])在target中查找regexp的第一个匹配项，并用replacement替换它如果没有提供target则默认为整行（$0）
- gsub(regexp, replacement [, target]) 与上面类似，只不过sub是第一个匹配项，gsub是所有匹配项
- if($1 ~ /正则/) 判断语句，正则匹配的



```bash
# 把每行第一列，重新输出到另一个文件，注意双引号
$ awk '{print $1 > "outputfile.txt"}' 1.txt

# BEGIN {} 指在开始之前的时候的准备工作，可以修改一些变量的值，或者赋给变量初值
# END {} 指在最后一行之后执行的收尾工作
# 这里我们给定sum初值为0，分隔符逗号；每一行把列数加到sum中，最后打印sum，多句之间分号隔开类似c语言
$ awk 'BEGIN {FS=","; SUM=0} {SUM = SUM + NF} END {print SUM}'  1.txt

# 执行函数中增加if判断，只有奇数行可以执行sum的增加，sum可以不给初值，默认就为0
# FS如果不是在BEGIN修改而是中间某一句，那么不影响当前行，而是影响下一行。
$ awk 'BEGIN {FS=","} {if (NR % 2 == 1)SUM = SUM + NF} END {print SUM}'  1.txt

# printf函数可以打印格式化的字符串，类似c的printf
$ awk '{printf "第一列为%s\n", $1}' 1.txt

# 把hello替换为hi，输出整行，注意并不修改源文件，只是改了$0变量的值，不产生实际影响
$ awk '{ gsub(/hello/, "hi"); print $0}' filename
```

实际中我们常常与管道结合使用`awk`
```bash
# ps查看进程信息，grep过滤java进程，awk打印第二列（pid）, sort -n按照数字进行从小到大排序
$ ps aux | grep java | awk '{print $2}' | sort -n
```