# go的包管理工具
1.5版本之前go的依赖下载如下
```
[go get xxx]  ===> $GOPATH/src
```
对于平时写写东西是没啥区别啦，但是如果是要把项目单独拿出来就比较麻烦了，因为要从src中剥离出本项目才用到的依赖。

为此go1.5后，也支持从./vendor文件夹中查找依赖了。并且有了很多包管理工具比如dep、godep、glide、govendor等。其中godep是最早的，dep是官方主推的，glide是功能最全的，govendor上手简单。

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
本来想搞一下dep的，结果发现有些包拉取的时候出现了bug，可能还是不太稳定吧，我们暂时就用govendor吧

# govendor
## 1 安装
```shell
$ go get -u github.com/kardianos/govendor
```
## 2 初始化
```shell
$ mkdir $GOPATH/src/自己的项目目录
$ cd $GOPATH/src/自己的项目目录
$ govendor init
```
初始化生成了一个vendor目录，里面只有一个vendor.json文件格式如下
```json
{
	"comment": "",
	"ignore": "test",
	"package": [],
	"rootPath": "github.com/sunwu51/govendordemo"
}
```
## 3 添加包
以gin为例添加依赖
```shell
$ govendor fetch github.com/gin-gonic/gin@v1.3
```
fetch是从远端下载依赖，后面可以加版本号，也可以不加。
```shell
$ govendor add github.com/gin-gonic/gin
```
add是从`$GOPATH/src`中将已经下载好的包拷贝到vendor。对于很多项目都会用到的库，我们可以`go get`下载到`$GOPATH/src`然后在每个项目中`govendor add`即可。
```shell
$ govendor get github.com/gin-gonic/gin
```
get命令=go get+govendor add
```shell
$ govendor sync
```
类似于npm install，会同步json文件的所有包。
## 4 删除包
```shell
$ govendor remove xxx
```
## 5 查看状态
```shell
$ govendor list //列出依赖
$ govendor status //查询状态
```