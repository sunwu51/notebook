---
title: 用ai写一个ai翻译插件
date: 2024-09-17 11:55:00+8
tags:
    - ai
    - llm
    - extention
    - tools
    - translate
---
最近发现utools工具中常用的翻译插件不好使了，下载了百度翻译、有道翻译的插件，但是发现需要提供百度/有道的key才能访问，比较麻烦，其他第三方的又怕哪天不能用了，干脆就自己写一个插件算了。

![image](https://i.imgur.com/C2yzFK3.png)

![image](https://i.imgur.com/Cw5adR0.png)
# 使用ai来写
这里我们使用到`vscode` + `claude-dev`插件，并配置了`claude-3.5-sonet`这个编程效果较好的模型。

![image](https://i.imgur.com/QHe9dpU.png)

直接浏览器打开`index.html`，如下可以看到已经能实现英文翻译为中文的操作了，并且从`script.js`中能看到使用的就是`google翻译`的api。

![image](https://i.imgur.com/Nk9BORo.gif)

# 改进
上面的页面有几个问题：
- 1 只支持英文转中文，不支持中转英。
- 2 只用到了谷歌翻译，没梯子的话就用不了。

继续给`claude-dev`提需求，让他支持中英互译，效果很不错：

![img](https://i.imgur.com/L9L0550.gif)

然后我们提供一个ai翻译的接口，但是ai翻译的代码需要提供token等，我们让`claude`把这部分代码空出来，由我们自己来实现，效果同样很好:

![image](https://i.imgur.com/VLf4lW3.png)

接下来我们把需要调用`ai翻译`的部分补全，直接到`silicon cloud`用自己的token，在api文档中，让他给生成js代码。

![image](https://i.imgur.com/rvHIJ86.png)

替换原来的占位代码，测试效果也不错。

![image](https://i.imgur.com/JGDFxoH.png)

# 收尾
最后需要找个画图的ai给画一个可爱的logo，然后用utools加载就可以了。

![image](https://i.imgur.com/Ll5Qqhe.gif)

详细代码在[translate](https://github.com/sunwu51/notebook/tree/master/24.09/translate)目录下，只不过`script.js#L60`需要替换成自己的token。

该工具开发完成，使用`claude-3.5`模型总共输入token数为200K，输出token数9K，花费`$0.3`大概2块钱，当然可以换更便宜的模型例如`gpt-4o-mini` `gemini-flash`或者开源的模型，只不过`claude-dev`中适配最好的还是`claude-3.5`模型。