# 背景
我每天早上需要坐公交去公司，或者乘坐地铁，但是后者很挤而且需要步行>1公里才能到公交站。公交的问题则是我要乘坐的公交频次不高，15-20min才有一趟，希望能在早上起床后实时的知道一些最近的公交动态，这样刷牙的时候心理有个预期。

高德地图已经提供了实时公交信息，但是每次要打开高德，调整到对应的公交比较麻烦，公交闹钟则是没搞懂怎么用，干脆自己写个工具来提醒自己，比如还有3站要到了，基本就得赶紧下楼了。
# 1 实时公交数据
这个数据首先想到就是高德，因为高德的app上有这个功能，结果到高德api文档上找了下，发现目前还未对外开放该接口。

然后想着看看高德地图是请求的什么接口，能不能抓包得到，结果一部分接口是内容部分加密了，另一部分则没什么用，总之此路也不通。

最后在网上找一些其他的应用和接口，搜到了一个`公交车到哪`的小程序，可以查看多个城市的公交实时位置信息，用Charles抓包看了下是个简单的http请求，尝试写到程序里调用，也是行得通的。那就用他了。

## 1.1 复习Charles的使用
在Charles的proxy setting中设置代理的端口号。

![image](https://i.imgur.com/u5F1nPC.png)

然后打开windows proxy

![image](https://i.imgur.com/dXZk7B3.png)

手机端在wifi设置里面找到代理，设置代理的ip是windows电脑的ip，port则是刚才的端口号。接下来Charles会有个提示有设备使用了该proxy，是否允许，点击allow即可。

接下来就可以在Charles抓包了，找到实时的公交数据的请求是这一条，他的参数和返回结果很容易就看到了。
![image](https://i.imgur.com/M0487NY.png)

# 2 when and where to run the script
要干什么知道了，就是要请求这个接口，然后根据json的内容判断距离我家最近站的一个距离就行了。但是要在什么时候什么设备上运行这个代码呢？

时间那肯定是早上8:30-9点去运行即可。

设备的话，显然自己电脑不行，因为电脑不能一直开机啊。树莓派？这玩意也不靠谱，不一定哪会就给踢了，而且还耗电，且有安全风险。

最后决定放到`render.com`平台上以web接口的形式暴露出来，配合`https://console.cron-job.org/dashboard`来设置工作日的8:30-9:00，每分钟请求一次web接口，而web接口的行为是，先请求实时公交数据，判断距离合适（比如说距离两三站了）就通知我"有个车距离只有2站了!"。
# 3 notify
如何通知呢？发短信，发微信，发邮件，发钉钉等。

发短信是最好的，但是要花钱，阿里云腾讯云的短信服务都是50块钱1000条，这太贵了，白嫖党显然不接受。

发邮件需要设置邮箱账户，比较麻烦，也pass了。

发微信微信目前比较封闭，不太支持api做消息发送。

发钉钉这个不错，钉钉群里面可以添加bot，通过webhook就可以往群里发送消息，但是钉钉我早就卸载了，此app>1G，非常占用空间，工作不用的话，只用来做这个事有点不值当，我这10代iPhone压力山大，也pass了。

最后用了slack，因为公司也在用这个聊天工具，所以直接新建个workspace给自己发消息用就可以了。

## 3.1 slack实现web hook发消息
第一步创建workspace

![image](https://i.imgur.com/6mqeJwO.png)

第二步创建一个channel，等会发消息用的channel，就是微信里群的概念。

![image](https://i.imgur.com/6ggEBcK.png)

第三步创建新的应用，直接访问`https://api.slack.com/apps?new_app=1`，在该页面中选择刚才创建的workspace来按照指示创建新的应用即可。

![image](https://i.imgur.com/eVDFLoU.png)

第四步创建完成后，在左侧点击`incoming webhooks`，开启并添加一个新的webhook，就能获得webhook的连接和使用方式了。

![image](https://i.imgur.com/oZi5ndx.png)

测试发送成功。

![image](https://i.imgur.com/8TK6CPS.png)

# 4 串联起来
代码[sunwu51/bus_notify](https://github.com/sunwu51/bus_notify)