---
title: charles抓包
date: 2024-09-29 16:00:00+8
tags:
  - charles
  - proxy
  - 抓包
---
# 安装
官网下载安装适合自己OS的`charles`，然后打开，建议购买一个正版的证书，官网的价格是$50，淘宝有50rmb的，但是不知道靠不靠谱，也可以到网上找破解教程，就是有点累，我个人是买了一个正版。一个正版的证书在同一时间只能在一台电脑上使用，对于个人来说是完全够用。

# 安装证书
mac系统下，help -> SSL proxying -> Install Charles Root Certificate，然后注意选择安装到"系统"而不是"icloud"。

![rootcert](https://i.imgur.com/nfZHeO3.png)

在安装完之后，可以在钥匙串访问 -> 系统，中找到Charles这个证书，双击选择始终信任，如果是windows系统也可以在类似的位置找到，并且需要信任该证书。

![key](https://i.imgur.com/iLkeWqB.png)

# 配置代理
开启`ssl`代理，可以代理https协议的请求。

![sslProxy](https://i.imgur.com/PpNe9PY.png)

![sslproxy](https://i.imgur.com/Ge0ShtV.png)

此时会在默认的`8888`端口启动代理服务，如果在一些软件中已经可以手动配置`http://localhost:8888`为代理了。

![img](https://i.imgur.com/ecjMRu5.png)

此时通过代理访问百度，查看证书会发现，证书已经是charles颁发的证书了。

![img](https://i.imgur.com/cejr4P3.png)

# 系统代理
命令行配置`HTTP_PROXY=http://localhost:8888`和`HTTPS_PROXY=http://localhost:8888`为默认的代理选项。

在mac系统中也可以通过网络详情中，进行配置。

![img](https://i.imgur.com/b4gNQrC.png)

# vscode中配置代理
如果想要抓包vscode及其插件的请求，则需要在vscode中配置http代理，在设置中搜索`proxy`，然后修改以下两项，最后需要重启vscode生效。

![img](https://i.imgur.com/uw0tGfM.png)

# 抓包
配置完成，在charles中可以查看各种`https`的数据包明文，例如想知道continue插件中，`@文件名`作为LLM上下文，是如何在请求中实现的，就可以抓包如下，是通过把文件内容直接塞到输入中实现的。

![img](https://i.imgur.com/NbmzrE1.png)
