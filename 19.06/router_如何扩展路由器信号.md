# 扩展路由器信号
如果你家里有个废旧的路由器，那可以用来扩展信号。
# 主路由器配置
首先在目前正在使用的路由器中做信道的配置，一般是2.4G那个频段的设置里。不同路由器不太一样，就到管理页面挨着找找无线设置相关的有个频段设置，这里默认是自动的，要设置成一个固定的值，比如设置为1。
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1906/router1.jpg)
除了上述设置之外，留意下lan口分配的IP频段比如可能是192.168.0.1/24。
# 扩展路由器配置
进入扩展路由的界面。

1 设置lan口的IP，因为有可能和主路由的LAN口重复，所以最好修改下，比如改为192.168.0.2/24。保存（有的路由器需重启）

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1906/router2.jpg)

2 关闭DHCP，因为需要用主路由的DHCP，保存。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1906/router3.jpg)

3 开启wsd功能（不同路由器，这个配置地方不同，使劲找就行，肯定有，我12年买的路由器都有），然后wsd需要配置主路由的信息和对应的信道（这里信道1），填写完成保存。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1906/router4.jpg)
# 配置完成进行连接
用手机分别连接两个wifi信号，都能上网，并且都能在主路由的管理页面看到。搞定。