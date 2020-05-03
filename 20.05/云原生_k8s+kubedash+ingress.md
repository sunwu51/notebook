# 云原生
# 1 前言
之前的安装非常麻烦，主要是有些镜像是`gcr`的，国内机器访问不了。两年过去了，情况发生了变化，国内有人专门封装了离线包，使整个过程变得简单多了。
# 2 安装k8s
首先准备三台机器（其实也可以2台或者1台，但是建议三台）。linux系统，root密码一致，我这里都是`123123`，ssh允许root登录，并且三台机器的hostname改成不一样的，不然后面无法区分。三台机器无需事先安装docker，后面会自动安装。

使用国内大佬封好的工具[sealyun](https://sealyun.com/docs/tutorial.html#%E5%AE%89%E8%A3%85%E6%95%99%E7%A8%8B):

第一步先下载k8s离线安装包，从上面链接中可以下载，也可以通过我的oss[下载链接](https://bolg.obs.cn-north-1.myhuaweicloud.com/2005/kube1.18.0.tar.gz)。

第二步安装sealyun这个工具：
```bash
wget -c https://github.com/fanux/sealos/releases/download/v3.3.4/sealos && chmod +x sealos && mv sealos /usr/bin
```
[其他版本下载地址](https://github.com/fanux/sealos/releases)。

第三步开始安装
```bash
sealos init --master 192.168.0.12  \
    --node 192.168.0.13  \
    --node 192.168.0.14  \
    --user root  \
    --passwd 123123 \
    --version v1.18.0 \
    --pkg-url /root/kube1.18.0.tar.gz 
```
这里可以指定多个master多个node，上面我是指定了一个master节点，2个node节点，123123就是我的密码，然后pkg-url指定刚才下载好的k8s安装包。运行指令后会安装10-20分钟，耐心等待。
# 3 安装kuboard
[sealyun](https://sealyun.com/docs/app.html#app%E7%A6%BB%E7%BA%BF%E5%8C%85%E5%8E%9F%E7%90%86)提供了一键安装的脚本。
```
sealos install --pkg-url https://github.com/sealstore/dashboard/releases/download/v1.0-1/kuboard.tar
```
安装完成后，在浏览器访问 `http://masterIp:32567`得到一个登陆页面要求输入token，这个token通过下面指令获取。
```
echo $(kubectl -n kube-system get secret $(kubectl -n kube-system get secret | grep kuboard-user | awk '{print $1}') -o go-template='{{.data.token}}' | base64 -d)
```
登陆完成后大概长这样，名称空间我这里自己多创建了一个，不用在意。
![image](https://i.imgur.com/AngMwSu.png)
左下角是三个机器，显示名称是hostname。
# 4 安装ingress (contour)
刚才3中提供的应用列表其实是有ingress的，但是直接用一键安装脚本，在本地安装的时候会遇到问题，因为这个脚本默认type:LoadBalancer是不适合本地安装的，他要获取本机的公网地址，导致后面external_ip一直处于pending状态，无法正常工作。到这听不懂没关系，总之就是按照下面我说的来就对了。

在[contour官网](https://projectcontour.io/docs/v1.4.0/deploy-options/#host-networking)能找到这样一句话。  
![image](https://i.imgur.com/qa6SYc7.png)

需要我们进行一点修改就可以了，具体步骤：
```bash
# 下载整个项目 
git clone https://github.com/projectcontour/contour.git

# 修改最后一行LoadBalancer改为NodePort
vim ./contour/examples/contour/02-service-envoy.yaml 

# 创建资源
kubectl apply -f contour/examples/contour/
```
创建完成后在kuboard页面能看到这个namespace
![image](https://i.imgur.com/iv4DUox.png)
![image](https://i.imgur.com/xtIl5P6.png)

注意里面的contour和envoy都是需要下载镜像的，不过不是gcr的镜像而是dockerhub的，所以只需保证机器是能联网的，就可自动下载。
# 5 开始玩~
创建个nginx服务，用ingress反向代理。

首先创建一个nginx的服务：
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/2005/rjJwmXq8Gs.gif)

然后直接访问http://nginx是不行的，因为第一没有配置hosts，第二并不是80端口，我们ingress没有配置端口，需要自己去看一下,我的是31784如下
![image](https://i.imgur.com/eMOtwIO.png)  
配置hosts文件，nginx这个域名指向任意一台机器最好是node机器，master有时候有问题，总之就是任意一台node就行。然后访问nginx:31784这个地址就可以了。
![image](https://i.imgur.com/L8pWaxS.gif)

这里发现其实自己本地玩稍微有点麻烦，还得配置hosts文件，又得配置端口的，很烦。其实也可以稍微简化下，比如在master机器创建个nginx服务或者iptables规则，将80收到的数据包转发到31784。然后去配置通配符域名。

创建nginx服务：
```
docker run --restart always -d -p 80:80 nginx
```
进入这个容器修改/etc/nginx/conf.d/default.conf
```
server {
    listen       80;
    server_name  localhost;

    location / {
        proxy_set_header  Host  $host;
        proxy_set_header  X-real-ip $remote_addr;
        proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://192.168.0.13:31784;
    }
}
```
然后在域名里进行通配符配置
![image](https://i.imgur.com/TFz6vfQ.png)

修改服务的ingress入口域名为符合上面条件的  
![image](https://i.imgur.com/J1yAJJ1.png)

![image](https://i.imgur.com/dfCvb2a.png)