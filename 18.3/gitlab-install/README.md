# gitlab环境搭建
# 1 概述
在openshift上搭建gitlab环境，遇到了很多问题。

首先是redhat证书的问题，找不到证书文件无法从redhat的仓库下载镜像。通过安装证书后解决
```
yum install python-rhsm-certificates -y
```
然后又遇到了openshift启动容器时的用户权限问题，即openshift创建的容器中不能通过root用户操作，否则会有以下错误
```
No user exists for uid 1000340000
```
官方给出的解决方案是给项目赋予权限，但是这样操作比较危险。

于是放弃使用官网给的yml文件，通过自己写yml文件进行部署，同样在gitlab-ce容器启动的时候出现了权限问题。

于是在原生k8s集群上直接进行部署，写了三个`deployment`三个`service`和一个`ingress`完成了部署。

k8s中遇到的问题有：
1 service之间的互访问题，以前写的时候都是用的环境变量，但是这种方法很不智能，问过李国后，知道了公司的k8s环境已经配置好了域名解析服务，可以直接在pod中通过服务名(Service Name)进行互访。

2 接入服务问题，因为gitlab在pod中运行，并不知道该如何在自己电脑上就能访问这个网页。需要通过Ingress配置反向代理，然后访问ingress服务器即可。再次询问后得知，小米k8s环境中ingress是已经配置好的公用的一个服务，只需要我们自己配置下规则就可以了。