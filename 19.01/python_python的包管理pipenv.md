# python的包管理工具pipenv
早期python项目没啥包管理的，最多就是一个requirement.txt文件声明依赖的库和版本。pipenv使这种情况有了改善。


安装
```shell
$ pip install pipenv
```

三种方式创建虚拟环境
```shell
$ pipenv --two
$ pipenv --three
$ pipenv shell 
```
two是基于python2创建虚拟环境,three则是基于python3，shell则是以当前系统的python环境创建虚拟机，并进入一个shell模式。创建虚拟环境，主要是干了两件事情，在当前目录下生成`Pipfile`文件，该文件记录了pip的配置，和当前项目的依赖情况，类似于package.json。另一件事就是将python环境整个复制了一份到`~/.virtualenvs/xxxx`，然后之后在这个目录下通过`pipenv`安装的依赖都只会下载到这个目录，专门服务于本项目。


安装依赖
```shell
$ pipenv install flask
```
安装的依赖都在上面讲的目录下，并且第一个包安装后也会生成一个`Pipfile.lock`文件，该文件记录了依赖的一些lock信息，类似于yarn的lock文件。

```shell
$ pipenv install
```
根据Pipfile文件下载所有依赖。

# 修改虚拟环境目录
用户目录下的那个文件如果有多个项目就要复制很多份，这目录windows下是c盘。修改目录的方式可以参考[https://www.cnblogs.com/Guhongying/p/10054110.html](https://www.cnblogs.com/Guhongying/p/10054110.html)





