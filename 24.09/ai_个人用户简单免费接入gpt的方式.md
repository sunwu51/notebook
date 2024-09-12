---
title: 个人用户简单免费接入gpt的方式
date: 2024-09-12 19:31:00+8
tags:
    - ai
    - llm
    - gpt
    - github
---
在国内，最简单、最稳定、且免费的接入gpt的方式，就是使用`github models`，`github models`主要是给ai开发者提供了一个体验的平台，并且提供了`gpt`模型和其他多个开闭源模型的接入。

按照官方的说法是有一些用量上的限制比如每分钟限制多少次或者多少token，但是具体规则没有说，主要是防止你直接拿他的api去商用了，但是对于个人用户来说是戳戳有余，我正常个人使用还没有发现过限额。

# 注册
登录[https://gh.io/models](https://gh.io/models)，加入等待队列，因为`models`现在还是beta阶段，所以没有完全开放给所有人使用，但是这个队列审核基本都能过，大概等个2周左右，就可以审核通过。

![email](https://i.imgur.com/BWAYIly.png)

审核通过后，点击模型，可以直接进行对话。

![chat](https://i.imgur.com/H6AbQ3n.gif)

# api接入
也可以通过api的方式接入，例如使用chatbox等软件进行配置，需要先创建一个github的token，这里token不需要申请任何权限，如下。

![image](https://i.imgur.com/lfOJePa.png)

![image](https://i.imgur.com/uXcrLWe.png)

![image](https://i.imgur.com/zh1ZM2d.png)