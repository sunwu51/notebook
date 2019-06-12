# 域名、ddns、https证书
# 1 域名
申请域名，国内域名需要备案，推荐申请国外域名。我在`namecheap`上申请的付费域名。也有免费的域名`freenom`不过这个网站好像针对国内用户，无法申请了。

常见的域名配置类型有，A记录、AAAA记录、CAA记录、CNAME、URL、TXT等等。

AAAA是A的IPV6版，CAA是证书机构相关的，TXT一般是做域名拥有验证用的，所以比较多用到的就是A、CNAME和URL。

---
---
**A记录**：就是最单纯的`域名-IP`的对应关系。例如配置如下。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1906/dns1.png)

通过访问`test.microfrank.top`和直接访问该IP效果一样。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1906/dns2.jpg)

---
---
**CNAME**：别名记录存储`域名-另一个域名`。例如配置如下。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1906/dns3.jpg)

则访问`test2.microfrank.top`与访问`test.microfrank.top`效果一样。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1906/dns4.jpg)

---
---
**URL**：URL跳转`域名-url`，注意url是有`http://`这样的开头的。URL记录配置中有个马赛克配置，默认无马赛克。例如配置如下

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1906/dns5.jpg)

则访问test3，就会跳转到test，url会变化，这就是无马赛克的效果。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1906/dns6.jpg)

如果选择马赛克mask，则可以添加自定义的页面Title，例如我添加为my title。此时访问test3，地址栏不变，不再是跳转，而是通过frame的方式将test1引用过来了。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1906/dns7.jpg)

# 2 ddns
动态域名解析，主要在家用路由器配置，将一个域名始终能映射到家庭路由器的出口IP。以国内最常用的花生壳为例。注册登录花生壳，进入账号管理，然后注册域名，选择免费的域名进行注册后，就会显示在域名列表，然后就不用管了。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1906/dns8.jpg)

打开家里路由器，找到ddns配置部分，选择花生壳，登录账号即可完成了，非常简单。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1906/dns1.gif)

# 3 https证书
在阿里云https证书选择，免费证书，一年，话费0.00元购买。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1906/dns9.jpg)

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1906/dns10.png)

申请成功后，可以下载证书的密钥文件和证书文件，在相关服务器进行配置，就可以了。