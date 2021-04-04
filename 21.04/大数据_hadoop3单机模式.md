# hadoop3
# 预装的软件
这里系统是unbutu所以是apt安装
```
apt install ssh
apt install pdsh
apt install openjdk-8-jdk-headless
```

配置免密登录自己
```
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa

cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

chmod 0600 ~/.ssh/authorized_keys
```
配置pdsh默认使用ssh，在/etc/profile中添加
```
export PDSH_RCMD_TYPE=ssh
```
并使其生效
```
source /etc/profile
```
hadoop下载列表页面https://hadoop.apache.org/releases.html，到一个干净的目录下下载，比/opt目录
```
wget https://mirrors.bfsu.edu.cn/apache/hadoop/common/hadoop-3.2.2/hadoop-3.2.2.tar.gz
```
解压出来
```
tar -zxvf hadoop-3.2.2.tar.gz
```
# hadoop文件修改
首先修改etc/hadoop目录下的`hadoop-env.sh`，这个文件要配置一些全局的变量。在文件第一行添加java_home的配置。
```
JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
```
接下来按照官方给的配置方式进行修改

etc/hadoop/core-site.xml:
```xml
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://localhost:9000</value>
    </property>
</configuration>
```
etc/hadoop/hdfs-site.xml:
```xml
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>1</value>
    </property>
</configuration>
```
sbin/start-dfs.sh第一行添加
```
HDFS_NAMENODE_USER=root
HDFS_DATANODE_USER=root
HDFS_SECONDARYNAMENODE_USER=root
```

# 开始启动服务
格式化文件系统
```sh
bin/hdfs namenode -format
```
启动nameNode和dataNode
```sh
sbin/start-dfs.sh
```
# hdfs操作
```
bin/hadoop fs -xxx
```
xxx是操作文件的指令，例如 ls /可以列出/下所有文件，put可以拷貝本機文件到hdfs，cat可以查看文件等等。