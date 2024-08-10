---
title: LLM应用概述
date: 2024-08-07 00:14:30+8
tags:
    - ai
    - llm
    - rag
---
# 1 LLM模型
`LLM`应用结构中，最基础的就是`LLM(Large Language Model)`大语音模型，我们可以将其称为“底座”。LLM有很多，包括闭源的`chatgpt` `claude`，还有开源的`llama` `qwen`等等。

有了LLM模型，我们就可以简单的运行一个聊天的能力了，我们知道模型是一个巨大的文件，而聊天能力则是以`Rest`服务的形式提供的，目前的共识是大家都和`OpenAI`的`Rest`接口进行对齐。

对于开源模型的使用，你可以有两种用法，一种是使用`ollama` `gpt4all`或者`LM studio`这种客户端工具去下载，并启动；另一种则是使用`siliconflow硅基流动`这种平台提供的免费的key进行调用。

前者的好处是完全是本地的，坏处则是稍大的模型需要显卡，后者10b以下的模型全是免费调用的，不需要本地任何硬件条件，但是坏处是你不知道他们有没有存储你的对话数据。
## 1.1 LM studio
这里图形化界面比较好的`Lm studio`为例，`ollama` `gpt4all`也是类似的产品。我们从[https://lmstudio.ai/](https://lmstudio.ai/)官网下载，双击安装即可。

![img](https://i.imgur.com/jwMIKEI.png)

通过搜索，下载自己需要的模型，比如开源的扛把子`llama3.1`，中文较好的`qwen`

![img](https://i.imgur.com/dEQvqMe.png)

下载过程，可能比较慢甚至失败，因为他是从`huggingface`上下载的，如果不会翻墙可以换成下面介绍`ollama`工具。

下载完成，就可以装载模型，开始聊天了。

![img](https://i.imgur.com/DgkFja3.gif)

从聊天过程中，我们会发现10B参数以内的算是小模型，这些小模型直接用CPU就能跑起来并不需要显卡，所以即使mac电脑跑这些7B的模型也是没问题的。

当然我们最终还是要用`Rest`接口，如下：

![img](https://i.imgur.com/o2bhKTK.png)

![img](https://i.imgur.com/xbasAAs.png)

## 1.2 ollama
ollama的下载渠道没有被墙，所以对于国内用户来说是更友好的，他的安装同样简单，从下载页下载双击安装[https://ollama.com/download](https://ollama.com/download)，安装完打开后没有图形化界面，只是在系统中注入了`ollama`指令，
```bash
$ ollama list # 查看下载好的模型
$ ollama pull {模型名} # 下载模型
$ ollama run {模型名} # run模型，如果没有则会先下载
```
模型名可以从[官网](https://ollama.com/library)去搜索，在无任何梯子代理的情况下，家庭下载速度在`9M/s`，还是比较快的。

![img](https://i.imgur.com/7VKyRuO.png)

`ollama run`之后就可以直接和模型对话了，10B以下的小模型显存占用和速度都是可以接受的

![img](https://i.imgur.com/4TujcJ8.gif)

中等模型对于我的`3090 24G`显卡就已经非常吃力了，基本是一个蹦字的状态了，这里给大家做一个基准的参考。

![img](https://i.imgur.com/GSLA9Zf.gif)

而对于`rest`接口，`ollama`则是默认已经启动了rest服务，在11434端口，我们只需要把端口更换即可。

![img](https://i.imgur.com/NG8IloX.png)

## 1.3 rest接口格式
上面两个软件，都能实现在本地启动LLM rest服务，我们说这个服务的接口形式是和`openAI`对齐的，这里我们就来解释一下这个出入参的形式。

这里主要是使用了`/v1/chat/completions`接口，openAI的[官方文档](https://platform.openai.com/docs/api-reference/chat/create)

我们简单介绍一下`request`的json参数
```json
{
    // model 和 messages是必填参数，其他都是选填
    "model" : "模型名，必填",
    "messages": [
        {
            "role": "system/user/assistant/tool/等等", 
            "content": "内容" // content可以是string，也可以是数组[{type: text, text: 内容}, {type: text, text: 内容}]
        },
        {
            "role": "system/user/assistant/tool/等等", 
            "content":[ 
                {"type": "text", "text": "解释图片内容"},
                {"type": "image_url", "image_url": {"url": "http url或者base64url" }}
                // image_url需要支持多模态的模型，如gpt-4o-mini等才支持的类型
                // base64url是 data:image/jpeg;base64,base64编码的图片格式，注意jpeg部分如果是别的格式需要换，例如png等
            ]
        },
    ],
    // 以下参数均为非必填
    "max_tokens": 512, // 限制输出的最大token，省钱用的，但长问题可能回答一半截断，默认值是模型自身的上下文token数
    "temperature": 0.7, //0-1的数字，越小则越严谨，越大则越想象发散，一般忽略或设置0.7/0.8即可
    "top_p": 1, //与温度类似的功能，默认是1，建议使用温度，不用这个
    "stream": false, //是否使用http stream流式返回答案，默认false就是一下子全量返回
    "tools": [
        {
            "type": "function", // 目前openai只支持function，很多模型还不支持tools参数
            "function": {
                "description": "描述函数作用，非必须",
                "name": "必填函数名",
                "parameters": "参数描述，非必填，空参数就不用填",
                "strict": false // 是否严格模式，严格的话，入参只能是parameters中定义的子集
            }
        }
    ],
    "tool_choice": "none/auto/required" // tools为空，默认值是none，tools不为空默认auto即自动判断是否从tools中选择一个函数。
    // 其他自己看文档
}
```
入参的参数中大都比较容易理解，第一次看比较懵逼的其实是`tools`相关的参数，主要与`function calling`函数调用相关。而`messages`中`image_url`与多模态相关。
## 1.4 function calling
函数调用，是一项重要的能力用来调用其他的外部服务，举个例子，想要让LLM发送一封邮件、查一查现在的天气、开启空调等等，只是通过对话式没办法实现了，因为已有的知识无法回答或者无法自己触发，这时候就需要函数调用了。[官方教程](https://platform.openai.com/docs/api-reference/chat/docs/guides/function-calling)

![img](https://i.imgur.com/EdRzHBE.png)

一个简单的例子如下，我们传入消息和可供使用的函数（tools），gpt分析语意解析出是需要调用函数，并返回了函数调用形式的response。

![img](https://i.imgur.com/JUxpE5A.png)

当我们在msg中没有提供足够的信息完成调用的时候，如果想让gpt来追问，可以设置prompt如下

![img](https://i.imgur.com/SLsCGvg.png)

![img](https://i.imgur.com/32k06tv.png)

不断确认，最终获取到所有必传的参数，形成函数调用的返回结果。

![img](https://i.imgur.com/6IXO4g3.png)

而真正的发起调用，则是在我们的应用收到函数调用的response后，自己去调用一个发送邮件的函数，而gpt已经给出了入参，当然这里发送邮件就是成功或失败，没有需要继续分析的，我们再给出一个coze中的插件的例子，其实coze插件的概念就是函数调用。

![img](https://i.imgur.com/pQepRuE.png)

