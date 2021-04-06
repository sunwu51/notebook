# hive的搭建和使用
# 1 下载
之前hadoop使用的是3.x所以hive也要使用3.x版本。
```
wget https://mirrors.bfsu.edu.cn/apache/hive/hive-3.1.2/apache-hive-3.1.2-bin.tar.gz
```
解压
```
tar -zxvf apache-hive-3.1.2-bin.tar.gz
```
# 2 添加环境变量
/etc/profile
```
export HIVE_HOME=/opt/apache-hive-3.1.2-bin
export PATH=$HIVE_HOME/bin:$PATH
```
使其生效
```
source /etc/profile
```
# 3 创建目录
```
$HADOOP_HOME/bin/hadoop fs -mkdir       /tmp
$HADOOP_HOME/bin/hadoop fs -mkdir       /user/hive/warehouse
$HADOOP_HOME/bin/hadoop fs -chmod 777   /tmp
$HADOOP_HOME/bin/hadoop fs -chmod 777   /user/hive/warehouse
```
# 4 启动
```
$HIVE_HOME/bin/schematool -dbType derby -initSchema
$HIVE_HOME/bin/beeline -u jdbc:hive2://localhost:10000
```
# 5 可能采坑
运行hiveserver2的时候，出现下面这个google的nosuchmethod，是guava的jar包冲突导致的，到hive的lib目录下吧guava换成28.0-jre版本
![image](https://i.imgur.com/UO1Ihem.png)

beeline连接报错，root is not allow...这个是hadoop没有进项相关配置。
![image](https://i.imgur.com/3OE2HxH.png)
需要先stop-dfs.sh停止hadoop，然后修改core-site.xml配置，追加如下配置。
```xml
<property>      
    <name>hadoop.proxyuser.root.hosts</name>
    <value>*</value>        
</property>         
<property>                      
    <name>hadoop.proxyuser.root.groups<name>                               
    <value>*</value>                        
</property>
```