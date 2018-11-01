# etcd
etcd 是一个`分布式键值对存储`，设计用来可靠而快速的保存关键数据并提供访问。通过分布式锁，leader选举和写屏障(write barriers)来实现可靠的分布式协作。etcd集群是为`高可用`，持久性数据`存储`和`检索`而准备。

上面这段是官网的介绍，etcd其实定位和ZooKeeper类似，用于分布式存储，主要存储一些元数据信息。
# 下载etcd
etcd是golang写的，有可执行的二进制文件。可以直接在github上下载[https://github.com/etcd-io/etcd/releases/](https://github.com/etcd-io/etcd/releases/)只要选择适合自己的操作系统下的文件就行了。

这里我下载的是windows环境下的，下载完成后主要有两个可执行文件：`etcd`和`etcdctl`。第一个是本地启动etcd服务的，第二个则是命令行接入etcd服务的。
# 单机运行
单机运行，只需要
```
./etcd
```
然后设置和获取和删除相应的值，只需要
```bash
./etcdctl set k value
./etcdctl get k 
# 返回value
./etcdctl rm k
```
另外还有监控值变化的
```bash
./etcdctl watch k
```
# rest接口
上述的操作都可以直接通过2379默认的端口进行http请求的直接操作。
例如写set操作如下
```
curl http://localhost:2379/v2/keys/kkk2 -XPUT -d value="vvvx"
{"action":"set","node":{"key":"/kkk2","value":"vvvx","modifiedIndex":7,"createdIndex":7}}
```
更多操作可以[参考](https://segmentfault.com/a/1190000005649865)

