# idea双击没反应
今天因为安装docker对电脑进行了大量操作，最后发现idea咋打不开了。
# 查看日志
在idea安装目录下，idea.exe文件旁边有个idea.bat文件，在这个文件最后追加一行`pause`，然后双击bat文件

![image](https://i.imgur.com/9AcVWs2.png)

![image](https://i.imgur.com/cynHf5v.png)

# hosts
看到这想起来之前是agent jar的方式 破解的idea，然后今天为了清理出更多空间给虚拟机，删掉了一些文件，看来就是jar缺失导致的了，于是赶紧下载了一份，放到上面所说的位置了。
