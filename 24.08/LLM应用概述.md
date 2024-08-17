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
## 1.1 ollama
ollama的下载渠道没有被墙，所以对于国内用户来说是更友好的，他的安装简单，从下载页下载双击安装[https://ollama.com/download](https://ollama.com/download)，安装完打开后没有图形化界面，只是在系统中注入了`ollama`指令，
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

而对于`rest`接口，`ollama`则是默认已经启动了rest服务，在11434端口，如下可以访问该接口。

![img](https://i.imgur.com/NG8IloX.png)

## 1.2 LM studio
图形化界面比较好的`Lm studio`，与`ollama` `gpt4all`是类似的产品。我们从[https://lmstudio.ai/](https://lmstudio.ai/)官网下载，双击安装即可。

![img](https://i.imgur.com/jwMIKEI.png)

通过搜索，下载自己需要的模型，比如开源的扛把子`llama3.1`，中文较好的`qwen`

![img](https://i.imgur.com/dEQvqMe.png)

下载过程，可能比较慢甚至失败，因为他是从`huggingface`上下载的，如果不会翻墙可以换成上面介绍`ollama`工具，或者使用`hf-mirror.com`的国内镜像，具体做法如下。

![img](https://i.imgur.com/CZuJLiM.png)

默认下载速度有点慢，但起码能下载，如果有NDM下载器，速度大概在`1M/s`，下载完成后，需要到`LM studio`存放模型的目录

![img](https://i.imgur.com/6VOfb5J.png)


![img](https://i.imgur.com/Fso5EqD.png)

将模型文件放到这个模型目录下，并且需要创建对应的目录名，如下

![img](https://i.imgur.com/NjUWO9c.png)

下载完成，就可以装载模型，开始聊天了。

![img](https://i.imgur.com/DgkFja3.gif)

从聊天过程中，我们会发现10B参数以内的算是小模型，这些小模型直接用CPU就能跑起来并不需要显卡，所以即使mac电脑跑这些7B的模型也是没问题的。

当然我们最终还是要用`Rest`接口，如下：

![img](https://i.imgur.com/o2bhKTK.png)

![img](https://i.imgur.com/xbasAAs.png)

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

`function calling`或者叫`tools`的功能不是模型自带的能力，或者说他是通过让模型解析传入的可用函数和input，来决定用哪个函数，这样的一个额外的步骤，这个步骤需要工具来去实现，本质上是通过将信息传给模型，让模型去选择函数。开源模型想要实现`function call`，是可以直接使用提示词来实现的。

对于本地工具例如`ollama`，他对于函数调用是直到今年6月底才支持的，并且目前只支持`llama3.1`等少数几个新的模型，此外`llama3.1`的中文能力令人堪忧。

![img](https://i.imgur.com/ausMzIJ.png)

![img](https://i.imgur.com/EdmBDl9.png)

`majx13/test`是网友在qwen2的基础上训练的带有函数调用支持的模型，如果本地尝鲜可以直接`ollama run majx13/test`，对于中文的理解还是不错的。

![img](https://i.imgur.com/q76CsRs.png)

小结，如果想要使用函数调用或者叫tools或者叫插件的功能，有以下几种简单的接入方式：
- 1 直接使用openai的接口，是支持最好，市面上综合能力最强的模型，中文能力也非常好，`4o-mini`价格是一百万token4.2元，`4o`则贵很多1Mtoken要105元，[chatanywhere](https://api.chatanywhere.tech/)的价格与官方基本一致，[v3](https://api.gpt.ge/)的价格则为官方的`1/3`，`4o-min`大概是`1.5元`百万token，但是响应速度似乎不如前者。
- 2 本地可以用`ollama`配合`llama3.1` `qwen`的改造版`majx13/text`等模型。
- 3 国内云服务，例如直接用coze工具就可以快速开发，甚至不需要一行代码；字节云的`豆包function call`模型一百万token才2块钱，比`gpt`的价格有一点点优势，但是最主要的还是服务稳定，`gpt`使用代理很难保证服务的稳定性，但是个人开发还是建议直接用gpt代理。

## 1.5 多模态
传统大模型例如`gpt-3.5`是通过文本交互的形式，也就是`chat`，而多模态就是指出了文本之外的其他形式，例如pdf、word、图片、音频、视频，以及各种形式的混合。

例如我们自己用gpt也可以实现简单的多模态，比如用`whisper`等语音转文本的api把音频转文字，然后传给gpt进行交互；对于pdf则可以先用pdf转文本，然后就和chat一样了，比较麻烦的则是图片和视频。

对于图片，`openai`的api中的`messages`部分，可以使用`image_url`传输图片的url，来支持图文形式的多模态，例如用iphone的快捷指令就可以快速实现一个看图吟诗的功能。

<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=1906273521&bvid=BV1aS411w7Bb&cid=1645579868&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

上面视频本质就是调用了`gpt-4o-mini`，参数如下。

![img](https://i.imgur.com/URC9FoO.png)

# 2 RAG
上面多模态中pdf的例子，如果我们的pdf是一篇小说，小说的大小可能有1M，而一个模型支持的上下文一般在1k-256k左右，1M的小说本身就超过了token的限制。此外每次问一个小说中的问题，都需要在api中重新将小说上传，这样太浪费token效率也比较低。

`RAG(Retrieval-Augmented Generation)`直译就是检索增强生成，他由“检索”和“生成”组成。

检索就是在本地数据中检索出有用的数据，例如我们有一本书中华上下五千年的txt版，我们把这本书进行简单的拆分，例如本书有10章，我们就拆成10部分。现在我们提出一个问题，例如唐朝的开国皇帝是谁。此时就会先进行`检索`，从10章里面检索出最有可能包含问题答案的2-3章。

生成就是把检索的内容，提问给LLM，让LLM参考筛选出来的2-3章的内容，而不是全书的内容，来进行问题回答了。

## 2.1 embedding
上例子中，如何从10章里面挑选出最有可能含有“唐朝开国皇帝”答案的章节，这就有很多做法了，比如纯工程化的，进行“搜索引擎”构造，例如通过倒排，召回，粗排，精排。但是这种工程化方式缺少语意的理解。

如何加上语意呢？这就需要把各种文本给“向量化”，每一段文本表示成多维空间的一个向量，两个向量的距离越近，两个词就越相近。

![img](https://i.imgur.com/ytJne3j.png)

如何把词句转换成多维向量呢？把文本转换成向量的过程叫做向量化，也叫嵌入也就是`embedding`,`embedding`的模型也有很多，例如`LM studio`的`Local Server`页面右上角位置，就有embedding模型选择，这个模型叫做`nomic-embed-text-v1.5-GGUF`。

![img](https://i.imgur.com/bhZW4Ul.png)

openai提供的`embedding`模型如下，建议使用`3`，3-small的价格官方是1M 0.14元，3-large是1M 0.91元，建议使用3-small，2就不考虑了。

![img](https://i.imgur.com/ZUkAS5U.png)

`embedding`接口也有着相同的规范，接口`/v1/embedding`，入参json只需要`model`和`input`两个参数即可，例如`LM studio`装载后启动服务即可如下请求。

![img](https://i.imgur.com/mMpgDYW.png)

openai的官方3-small模型：

![img](https://i.imgur.com/hhCIdFu.png)

`ollama pull bge-m3`中文模型`bge-m3`，注意ollama这里api格式没有严格遵循openai的格式

![img](https://i.imgur.com/9Uh1UbF.png)

我们知道了嵌入`embedding`可以将各种数据给转成多维向量。如果有一本中华上下五千年，我可能需要每一章运行一次嵌入，最后得到10个向量，然后把要查询的问题也`embedding`以下得到一个向量，看这个向量和10个已有的向量哪个最相近。这里就引出了3个问题：
- 1 切分方式：章节切分不一定是一个好的切分方式，获取按照段落或句子切分，或者更复杂的其他切分方式。
- 2 向量数据库：章节的向量数据，每次都要用，应该提前存储，这就是`知识库`，存储的数据库可以用普通的数据库，因为主要存储和计算向量距离，也可以用专门的向量数据库。
- 3 排序方式：计算相似度和排序的方式，或者叫`rank`，也有很多，比如最简单的使用欧氏距离然后排序。

## 2.2 vector DB
向量数据库，主要目的就是存储上面数据本身，和数据生成的向量值；另外还需要提供快速的根据向量相似度的查询能力。向量数据库显然不是必须的，我们也可以将数据存到传统数据库，例如`mysql`中，但是这样计算相似度就要把数据拿出来自己计算了。

向量数据库的选型有很多，例如`chroma` `milvus` `qdrant`等，还有传统的`postgres` `elasticsearch`的增强插件，这里我们只是介绍向量数据库的作用，所以就选择内存中运行的`chromaDB`来做演示，这是最简单的。至于各种其他db之间的区别和优劣，我们以后单开文章去记录。

本地安装该数据库，`pip install chromadb`，插入数据和查询的过程非常简单，如下。
```python
import chromadb
# 创建连接
chroma_client = chromadb.Client()

# 创建collection
collection = chroma_client.create_collection(name="my_collection")

# 添加数据
collection.add(
    documents=[
        "php是世界上最好的编程语言",
        "youtube是最好的视频网站",
        "北京教委：探索打造京蒙教育协作新品牌",
        "七项机制助力北京CBD法治化营商环境建设",
        "第十届京津冀青年科学家论坛举办"
    ],
    ids=['1','2','3','4','5']
)

# 查询最相似的一条
results = collection.query(
    query_texts=["开源社区中最活跃的是c/c++"],
    n_results=1
)

print(results)
```
这里没有指定采用什么`embedding`算法，运行该文件的时候会看到默认会先下载`all-MiniLM-L6-v2`，即默认采用的就是你这个嵌入算法，这个算法非常小巧模型只有不到`80M`，维度有`300+`，只不过整体的效果有点拉，上面的数据得到的最相近的结果是4，什么环境建设，但是明眼人都应该知道其实应该是1.
```python
{'ids': [['4']], 'distances': [[1.0054192543029785]], 'metadatas': [[None]], 'embeddings': None, 'documents': [['七项机制助力北京CBD法治化营商环境建设']], 'uris': None, 'data': None, 
'included': ['metadatas', 'documents', 'distances']}
```
`chromaDB`接入的代码非常的简单，他屏蔽了很多很多细节，比如
- 内存中运行，进程结束，数据就没了。
- `embedding`算法默认就用了一个非常小巧的模型，不需要设置。
- 求出的向量的值，以及如何比较两个向量的距离，这些也都默认屏蔽了。

替换成上面我们用的“大”模型，写法如下：
```bash
$ pip install requests
```
```python
import chromadb
import requests
import json
########## 定义embedding函数，直接请求lm studio ###################
def embedding(input):
    url = "http://localhost:1234/v1/embeddings"
    payload = {
        "input": input,
        "model": "nomic-ai/nomic-embed-text-v1.5-GGUF/nomic-embed-text-v1.5.Q8_0.gguf"
    }
    headers = {
        "Content-Type": "application/json",
    }
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    return response.json()['data'][0]['embedding']
####################################################################

chroma_client = chromadb.Client()
collection = chroma_client.create_collection(name="docs")

documents=[
    "php是世界上最好的编程语言",
    "youtube是最好的视频网站",
    "北京教委：探索打造京蒙教育协作新品牌",
    "七项机制助力北京CBD法治化营商环境建设",
    "第十届京津冀青年科学家论坛举办"
]

ids = [str(i+1) for i,doc in enumerate(documents)]
embeddings = [embedding(doc) for doc in documents]

collection.add(
    documents=documents,
    embeddings=embeddings,
    ids=ids
)
query_text="开源社区中最活跃的是c/c++"

# 查询最相似的一条
results = collection.query(
    query_embeddings=embedding(query_text),
    n_results=1
)

print(results)
# 打印结果：
# {'ids': [['1']], 'distances': [[1.1179535388946533]], 'metadatas': [[None]], 'embeddings': None, 'documents': [['php是世界上最好的编程语言']], 'uris': None, 'data': None, 'included': ['metadatas', 'documents', 'distances']}
```
使用`lm studio`的嵌入算法，结果就更合理了，也可以将上面的url地址改成本地的`ollama`测试之前下载的`bge-m3`模型的效果，其实也是返回第一条。

这就是一个简单的代码例子了，`chroma`存内存的方式会导致数据容易丢失，可以采用持久化的方法代码类似下面。
```python
import chromadb
from chromadb.config import Settings
client = chromadb.Client(Settings(chroma_db_impl="sqlite",
                                    persist_directory="db/"
                                ))
```

这里建议大家去了解一下上面列出的其他几个db，他们大都是持久化存储，并且开源的同时，提供了一定额度的云服务，对于个人开发者或者初学者是肯定够用的。

这里稍微一提，关于两个向量的相似度是怎么求的，简单的有以下三种，其中余弦相似度是`chromadb`默认使用的，相似度的算法不是特别重要，因为各种算法求出来的相似度排序大致是一致的。
- 曼哈顿距离，`|a1-a2| + |b1-b2|`，每个位置差值的绝对值，求和，`绝对值的和=>L1范数`
- 欧几里得距离，`(a1,b1)`和`(a2,b2)`的欧距就是 `[(a1-a2)^2 + (b1-b2)^2]^(1/2)`，也就是常见的几何距离，`平方和开方=>L2范数`
- 余弦相似度，`(a1*b1 + a2*b2) / ((a1^2 + b1^2)^(1/2) + (a2^2 + b2^2)^(1/2))`，分子是`点乘`结果，分母是两个向量自身的`L2范数求和`
# 3 RAG in prod
接下来看几个整合了`RAG`的工具，然后分析他们的实现原理，来理解每个步骤的细节。
## 2.3 AnythinLLM
那么第一个超级整合软件就是[AnythingLLM](https://anythingllm.com/)，下载安装后。他需要选择默认的聊天模型是请求哪里，可供选择的有供应商有很多，我们选择`LM studio`，因为这个软件会打印请求和返回的参数，这对于我们了解`RAG`的过程是非常有帮助的，这个供应商也可以在我们创建完工作区之后，单独配置，如下，我指定了`LM studio`中的`qwen1.5-7B`模型。

![img](https://i.imgur.com/j7F2i9c.png)

然后配置向量数据库为[zilliz](https://cloud.zilliz.com/)，这里需要先到这个网站注册一个免费的账号，创建免费的一个`cluster`，拿到`endpoint`和`token`，如下图，复制过来即可。为什么选这个而不是`chromadb`或者默认的本地的`lancedb`呢，也是因为他是个云端服务有图形化页面，更方便我们知道底层原理。

![img](https://i.imgur.com/PYBcqJ8.png)

然后配置`embedding`模型是`ollama`的`bge-m3`，这里也可以用默认自带的，至于为什么不用`lm studio`，主要是我电脑这里选了之后，识别不出可用的`embedding`模型。

![img](https://i.imgur.com/TkL5506.png)

接下来我们来配置`rag`的数据，先用最简单的爬一个网页的数据作为一个doc，这里可能稍微慢一点，需要几秒才能完成，因为使用了云端的向量数据库，而且服务器在美国。

![img](https://i.imgur.com/kWK6wTm.png)

上面步骤就是知识库向量化，然后存入向量数据库的过程，他会
- 先调用`文本分割`，按照`1000`字符切分文档，这里我们的网站非常简单不需要切分；
- 然后对切分后每个块，进行embedding，使用的是配置好的`bge-m3`
- 然后将结果保存到`zilliz`

![img](https://i.imgur.com/h5mlHkK.png)

问一个关于我们博客首页的简单问题，然后查看`lm studio`的入参打印，忽略这里有bug，模型打印的是错误的，其实是`qwen`.

可以看到，索引出来的结果会作为`prompt`中追加的一部分，以`[CONTEXT 0]:xxxx[END CONTEXT 0]`的形式，如果有多个doc命中，这里就会有多条。

![img](https://i.imgur.com/QGHbd6j.png)

所以到这里我们知道了，`RAG`检索后的结果，是作为了提示词，再发送给`LLM`进行总结的。