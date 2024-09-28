---
title: 零基础了解AI应用
date: 2024-09-28 16:40:00
tags:
    - ai
    - llm
    - gpt
---
# 1 序言
`LLM`可以说是近些年最火的技术了，也确实给我们的生活带来了完全不同的体验，基于`LLM`的`AI`应用不断地涌现，很多人都会感觉自己`out`了。别慌，看完这篇文章，你会对`LLM`相关的应用，运行的方式有较好的理解，以后看到别的应用，大体也能猜出他的运行原理了。

在本文中，我们不会介绍`LLM`运行原理这种理论知识，更多的是把这些技术作为一个黑盒子，让你可以快速的了解到应用的运行方式，以及他们是如何盈利的。

在之前其实有过几篇文章介绍`LLM`相关的内容，但是觉得写得不够清晰，所以重新整理了这篇，希望能更简洁、通俗。

# 2 chat能力与聊天应用
`LLM`大语音模型，他的基础能力就是提供了语言对话的服务，也被称为底座模型。`chatGPT`最早就是以聊天机器人的形式出现的。用户输入一段文本，比如提出一个问题或者给出一个话题，`LLM`会根据其训练数据和算法生成相应的回复。这就是`LLM`最基础的能力，像[通义千问](https://tongyi.aliyun.com/) [豆包](https://www.doubao.com)等，都提供了聊天应用。

<Slider>
    <div>
        <img src="https://i.imgur.com/rL15fYd.png" />
    </div>
    <div>
        <img src="https://i.imgur.com/8SM6aEt.png" />
    </div>
    <div>
        <img src="https://i.imgur.com/kDXLfJS.png" />
    </div>
</Slider>


`chat`作为最基础、最重要的能力，一般也会堆外直接提供API来进行调用，而这些提供API的服务，又被叫做`LLM供应商`(之前的文章中盘点过市面上一部分常见的供应商)。`chat`接口的形式大部分供应商都是兼容或者类似`openai`(gpt的公司)提出的接口规范，是个http接口。`URL`一般是`${baseURL}/chat/completions`，而具体的参数形式可以查看[openAI文档](https://platform.openai.com/docs/api-reference/chat/create)

![request](https://i.imgur.com/7uPqW6f.png)

![response](https://i.imgur.com/Eihru2u.png)

> 在请求中有个`stream`参数默认为false，如果为true，则会返回一个流式的响应，这就是聊天应用不断地发送消息的“蹦字”效果。

有了`chat`接口，就可以不在官方的聊天页面进行交互了，我们可以在任何自己的应用中嵌入`LLM`的能力，例如第三方的聊天软件`chat box`、chrome插件`sider`等等，我甚至还让ai帮我写过一个类似的[聊天室](https://sunwu51.github.io/simple-gpt-chat-room/)

<Slider>
    <div>
        <img src="https://i.imgur.com/JQxcvPL.png" />
    </div>
    <div>
        <img src="https://i.imgur.com/Qx5GFAe.png" />
    </div>
    <div>
        <img src="https://i.imgur.com/LUJE9WX.png" />
    </div>
</Slider>

> 接口是无状态的，那是知道对话的上下文的呢？是通过将历史的对话记录，都放到入参`messages`数组中，用户说的话`role=user`，模型说的`role=assistant`。

有了模型，把他部署成服务，提供接口，这就是`LLM`供应商了，`OpenAI`就是一个供应商；还有些公司部署的是开源模型，也提供出了`chat`等接口，例如`silicon cloud` `groq`等也是一种供应商，他们都是售卖gpu算力赚钱；此外还有一种供应商是转发请求，把用户的请求转发到`openai`或者`groq`等，而用户付费在自己的平台，例如`openrouter`等，他们有些是赚取差价。具体的可以查看`LLM供应商`这篇文章，有详细的展开。

小结：聊天类的应用非常适合日常答疑，替代部分搜索引擎的功能，找一个国内可以接入的供应商例如`silicon cloud`、`openrouter`，在`chatbox`中一配置，就可以激活你的`AI助手`了。

# 3 prompt提示词
在使用 `chat` 接口时，`prompt` 提示词是一个非常重要的组成部分。它是指引模型生成回复的关键信息。通过精心设计的 `prompt`，你可以引导模型产生符合你需求的回答或内容。

入参`messages`就是提示词，可以设置`role=system/user/assistant等`消息内容，提示词也是一门学问，其中`system`类型的消息是对`LLM`角色和能力的设定，他对模型的返回内容有着很大的影响。在`LLM`的计费中，提示词或者叫输入，和模型的输出是分开计费的，一般输入token的价格要低于输出的token价格，但基本上差距在10倍以内。

![image](https://i.imgur.com/w0DrlRS.png)

提示词的遵循程度是一个模型好坏的重要衡量指标，有些模型名字会看到`-instruct`后缀，例如`Qwen2.5-72B-Instruct`，都是基于基础的模型上进行了调整，能够更好的遵循指令的版本。

![image](https://i.imgur.com/jdZqVgO.png)

`精心调整的提示词` + `底座LLM模型` = `应用`

很多应用都是上面这个简单的等式得到的，比如上面这个翻译的提示词就可以用来开发一个翻译应用；而`沉浸式翻译`中使用大模型翻译的功能，也是类似的实现；`webpilot`也是一个chrome插件，他能基于当前网页的内容，进行ai问答。


<Slider>
    <div>
        <img src="https://i.imgur.com/92JP3jY.png" />
    </div>
    <div>
        <img src="https://i.imgur.com/03FfFft.png" />
    </div>
    <div>
        <img src="https://i.imgur.com/oEo3Hrt.png" />
    </div>
    <div>
        <img src="https://i.imgur.com/2ReFZOP.png" />
    </div>
</Slider>

> 关于模型的定价，可以以`claude3.5`为例，他的input也就是提示词，是百万token $3，输出则是$15，同级别的模型价格是接近的。

> 那一个token对应多少汉字或单词呢？这没有固定的对应关系，一般1个单词大约有1.5个token，一个汉字大约是1个token，实际可能有浮动。

小结：精心调配的提示词对实现功能非常重要，所以有专门的提示词工程师，网上有很多提示词小技巧的教程，可以简单去了解。

# 4 function calling 函数调用
函数调用确实是实现复杂应用和增强模型功能的重要手段之一。通过函数调用，模型不仅可以执行内置的功能，还可以与外部API和服务进行交互，从而获取实时数据、执行计算任务或操作数据库等。这种灵活性使得基于大语言模型的应用能够更加丰富和实用。

函数调用并不是让`LLM`直接去调用某个函数，而是把一系列函数的名称和参数传给`LLM`，后者根据用户的输入进行自然语言解析，分析出是否要调用以及如果调用函数，具体调用的是列表中哪一个函数，对应的参数是什么。

用法是通过`chat`接口中的`tools`入参，该入参的样例如下，这是一个发送邮件的函数。
```json
"tools": [
    {
      "type": "function",
      "function": {
        "name": "send_email",  // 函数名
        "parameters": {        // 参数
          "type": "object",    // 参数是个json对象
          "properties": {
            "email": {         // json中email表示收件人
              "type": "string",
              "description": "收件人邮箱地址"
            },
            "content": {       // json中content表示邮件的内容
              "type": "string",
              "description": "发送的邮件内容"
            }
          }
        },
        "required": [          // email和content都是必需的参数
          "email",
          "content"
        ]
      }
    }
]
```
我们来看如何在`chat`接口中使用：

<Slider>
    <div>
        <img src="https://i.imgur.com/zEwDC9k.png" />
    </div>
    <div>
        <img src="https://i.imgur.com/TGVUhkr.png" />
    </div>
    <div>
        <img src="https://i.imgur.com/9bvk4Dt.png" />
    </div>
    <div>
        <img src="https://i.imgur.com/BITCuhs.png" />
    </div>
    <div>
        <img src="https://i.imgur.com/aenhz9F.png" />
    </div>
</Slider>

函数调用给了应用非常大的空间，上面发送邮件只是一个非常简单的场景，比如我们可以把谷歌搜索作为一个插件，然后`prompt`中设置让ai借助搜索引擎插件将得到的信息进行汇总并生成答案，`openai`的插件市场（插件基本都是函数调用）就有这样的插件，`Bing Ai`也是类似的工作方式。

![img](https://i.imgur.com/46oyaLn.png)

用`AI + 搜索引擎`代替传统搜索引擎，也是一个赛道，目前比较有竞争力的产品有[perplexity.ai](https://www.perplexity.ai/)，还在内侧阶段的有openai的[searchGPT](https://openai.com/index/searchgpt-prototype/)，个人感觉是ai搜索确实有效果，信息收集和汇总很不错，但是一些比较冷门的问题，容易漏掉一些信息，不如从谷歌上列文虎克式的浏览每一项，总之就是有共识的内容搜索效果不错，细节性问题的肯定是不如人自己去判断每条信息。

![image](https://i.imgur.com/IBrHLRO.png)

`openai`市场上有很多插件，但是国内用户不太能用得上。适合中国宝宝的[coze](https://www.coze.cn/store/plugin)平台也提供了很多插件，比如百度搜索插件、OCR插件、HTTP请求插件、生成二维码插件等等，而且你也可以写代码自定义插件。

![img](https://i.imgur.com/rHzR9PN.png)

关于`coze`还有很多其他功能，我们后面会讲到。

# 5 多模态
大模型的多模态能力，现阶段主要是指可以向模型输入图片来进行解析。