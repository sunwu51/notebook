# dep
1.5版本之前go的依赖下载如下
```
[go get xxx]  ===> $GOPATH/src
```
对于平时写写东西是没啥区别啦，但是如果是要把项目单独拿出来就比较麻烦了，因为要从src中剥离出本项目才用到的依赖。

为此go1.5后，也支持从./vendor文件夹中查找依赖了。并且有了很多包管理工具比如dep、godep、glide等。这里只介绍官方出的dep。

一个比较成熟的项目的目录应该是这样的
```
_/project
|_/.git
|_/http
  |_handler1.go
  |_handler2.go
|_main.go
|_/vendor
  |_/github.com
    |_.....
```
# 安装和使用
```
go get -u github.com/golang/dep/cmd/dep
```