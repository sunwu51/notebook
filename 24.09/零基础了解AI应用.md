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
大模型的多模态能力，现阶段主要是指可以向模型输入图片来进行解析，只有部分模型支持，比如`gpt4o` `4o-mini` `qwen-vl` `gemini` `molmo`等等。多模态能力的基本用法就是上传一张图片，让模型去解析图片，并且返回图片的描述。

![image](https://i.imgur.com/xwYmhR1.png)

具体来说是通过API中的`messages`参数中指定一张图片，图片可以是`http(s)://`开头的网络图片的url，或者是base64编码的图片，以`data:image/jpeg;base64,`开头的图片编码。
```json
{
    "model": "google/gemini-pro-1.5",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What's in this image?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
            }
          }
        ]
      }
    ]
  }
```

多模态的应用场景目前还比较少，大多数`chat app`中支持上传图片，进行图文混合的提问，能提供一定的`OCR`能力。另外就是`molmo`官方视频里展现的那样有强大的识别能力，还提供了标识`point`指出物体在图像中的位置。

![image](https://i.imgur.com/0W7EiPN.png)
# 6 RAG与相关工具
`RAG` (Retrieval-augmented Generation)也是常听到的一种技术手段，通俗讲就是：因为模型的上下文长度是有限的，如果业务数据总量超过了上下文，例如`gpt-4o`上下文是128k，就需要压缩上下文的长度。此外很多上下文的内容也不是必须传给`LLM`的。

例如有一本人物传记，我们想要LLM根据书中内容，回答这个人18岁高考考了多少分，去了哪个大学，那么正本书的内容都作为`prompt`显然不必要的，`RAG`的作用就是把高考、大学等相关的信息提炼出来，到这本书中去检索，找到相关性比较高的章节，把这部分章节作为`prompt`，这样就大大减少了`prompt`的长度。那么`RAG`是如何检索出相关性高的部分章节的呢？

其实是通过向量化或者叫嵌入或者叫`embedding`，我们把`embedding`理解成一个黑盒的函数，他的入参是字符串，出参是一个向量或者叫`double数组`，数组长度就是嵌入算法的维度，任意的字符串甚至是其他数据形式，都可以通过`embedding`函数得到一个向量。那么我们可以把我们的知识库，上面例子中就是正本人物传记，先进行拆分，比如每个章节拆分、或者每个段落、或者固定的每1k个字进行拆分，拆分成多个分片`chunk`，每个`chunk`运行`embedding`函数得到向量，再把`chunk`和向量存起来，可以存到普通的数据库，也可以是向量数据库(Vector Database)，后者对向量存储、查找、计算都有专门优化。

实际`RAG`接入`chat`流程如下，我们首先通过上述过程将知识库向量化之后存到了向量数据库。当用户发起`query`, 我们可以通过`embedding`函数得到相应的向量，然后检索向量数据库，得到相似度高`chunks`，即找到相关性比较高的章节，把这部分章节也就是图中的`context`和用户的问题`query`拼接起来，有的应用是直接拼到`role=system`的message中，有的是新增一条`role=user`的消息，总之都是作为`prompt`传给`LLM`。

![image](https://i.imgur.com/UCTMTkL.png)

对于`embedding`，目前和`LLM`大模型一样，有很多算法，接口定义可以[参考](https://platform.openai.com/docs/api-reference/embeddings/create)，一般就是入参为字符串，返回double数组。`openai` `google`等，都提供了闭源的`embedding`实现的接口，`silicon cloud`上也有一些开源的实现，效果也都不错。之前的`tab manager`的视频，就是一个很好的单点的去理解`embedding`函数作用的例子。

在应用上，`RAG`环节主要有两种应用，一种就是向量数据库，纯做数据库的，目前世面上有很多，`chroma` `qdrant`等等，还有对传统数据库进行向量能力增强的`postgres` `es`等，大家可以自行去了解；另一种应用就是做`RAG`应用，其实就是把上面我们提到的这个检索的过程进一步的进行调优，和细节丰富，比如知识库引入`pdf/word转文本`就可以多支持pdf格式 doc格式的文件，引入`ocr`又可以支持图片转文本，再搞个爬虫程序，又可以基于url引入知识库了，然后应用可以自行集成这些内容转换、embedding计算、向量数据库，设置可以设置`LLM`配置，就完成了一套本地的知识库问答系统。例如`AnythingLLM`，也有对检索的流程进行优化的，比如网易的`Qanything`是先检索，然后再用`rerank`算法从初筛结果中，再选出更精确相关的`chunks`。

演示`AnythingLLM`,下载双击即可安装，然后进行配置 =》导入知识库 =》本地知识问答

第一步：安装向量数据库`qdrant`，不用`AnythingLLM`内置的`LanceDB`的原因是之前有bug导致查询失败。

直接从[github](https://github.com/qdrant/qdrant/releases)下载最新的二进制文件即可，如果想要webui还需要单独下载webui，也是从[github](https://github.com/qdrant/qdrant-web-ui/releases)下载zip文件，加压到前面qdrant下载完成后的`./static`目录下（需自己新建）即可。

![image](https://i.imgur.com/WyqeMX0.png)

双击`qdrant.exe`运行数据库，打开`http://127.0.0.1:6333/dashboard`就可以看到了

![image](https://i.imgur.com/To6RjJL.png)

第二步：准备[SiliconCloud](https://siliconflow.cn/zh-cn/siliconcloud)账号，这是国内的平台用手机号即可完成注册，我们要使用这个平台提供的免费的`embedding`和`chat`接口。

![image](https://i.imgur.com/I4B9R0l.png)

第三步：官网下载AnythingLLM安装，然后进行配置，这里把可能要输入的几个文本，写在这`https://api.siliconflow.cn/v1` `Qwen/Qwen2.5-7B-Instruct` `BAAI/bge-m3`

![image](https://i.imgur.com/IjMnZ4i.png)

新建工作区“魁拔”，问他魁拔多久诞生一次等问题，可以看到答案完全错误（看过魁拔的应该知道每隔333年诞生一次魁拔）。魁拔之书是讲述四代魁拔迷麟的故事，从[这里](https://zxcs.zip/book/7478.html)下载的，下载后注意重新用`utf-8`编码把文件保存。

![image](https://i.imgur.com/krxmftw.png)

![image](https://i.imgur.com/zJzrsDw.gif)

# 7 微调与相关工具
微调(Fine-tuning)是直接用自己的数据，对已有的模型进行进一步的训练，给模型增加"思想钢印"，让模型了解我们提供的业务自身数据。比如上面`RAG`中提到的知识库人物传记这本书，我们直接作为训练数据，来微调模型，这样模型自己就有了这本书的内容，就不需要作为`prompt`再提供了。因而微调看上去是解决，业务内部问题的最好方法。

解决业务问题，一般就是通过`prompt`提供上下文，或者微调，而`prompt`长度限制等原因又衍生了`RAG`这种手段。所以本质上就是两种手段，要么给模型微调，要么`prompt`。`prompt`的优势在于非常灵活，模型可以随便换，业务数据也可以更新，但是缺点是每次需要携带，每次都是传入数据片段`chunks`模型没有全局的理解这些数据。微调就正好相反，他是全局理解了业务数据的，但是不太灵活，如果业务数据变化，需要重新微调，底座模型变化也需要重新微调。

一般来说，各个闭源的模型供应商会提供微调的接口或者页面，例如`openai`，但是国内用不了openai，可以看一下字节的豆包的流程，大概就是基于底座模型和自己的数据进行微调，得到一个新的模型，创建一个新模型的接入点，然后就可以使用新的模型了。不过我没有购买这些服务，这里只能给大家看下微调的接口参数如下。

![image](https://i.imgur.com/pQDN112.png)

而我们自己可以对一些开源的模型进行微调，来体验微调的效果，例如`llama` `qwen`等开源模型都是可以拿来微调的，微调的方式和工具也非常多。比如使用`unsloth`库、huggingface上自带的`autotrain`、最简单易用的`llama-factory`等。一般来说，如果你家境富裕，有16g显存或者以上的显卡的话，建议你本地来体验一下微调。如果你家境贫寒的话，可以使用一些在线平台来体验微调，例如谷歌的`colab`每天有免费的显卡使用额度大概能微调个1次，也可以按量付费，也花不了几块钱。也可以使用`hugggingface`上的`autotrain`配合购买上面的显卡额度来进行微调，价格和`colab`大差不差。当然还有国内的魔塔平台，也是不错的，注册新用户有优惠，配合阿里云的机器优惠非常的划算，基本体验阶段就不花钱。

使用`llama-factory`在本地进行微调（虽然名字有llama，但其实和llama模型无关，可以微调各种模型），这个工具对`windows`支持很好，而且可以直接web界面操作，对于新手是非常友好的。这是官方的[repo](https://github.com/hiyouga/LLaMA-Factory)，安装方式也在官方`readme`中提到了，而且也提供了详细的[入门教程](https://zhuanlan.zhihu.com/p/695287607)，关于安装这里不在赘述。我们直接在本地启动：
```bash
# linux/mac下set改为export来设置环境变量
$ set USE_MODELSCOPE_HUB=1  # 因为huggingface被墙，所以从魔塔下载，将这个值设置为1
$ set HF_ENDPOINT=https://hf-mirror.com # 也是因为hg被墙，将hg入口设置为镜像地址，主要是为了除了模型下载另外一些需要hg同步信息的操作

$ llamafactory-cli.exe webui # 启动webui，前面安装完成llamafactory-cli会自动设置到全局PATH中可调用
```
启动完成，会自动打开`http://localhost:7860`，接下来我们准备10条训练数据如下，这十条数据都是在说魁拔每隔333年诞生，因为如果是单条数据的话很难有好的训练效果。
```json:kuiba.json
[
  {
    "instruction": "魁拔多少年复活一次。",
    "input": "",
    "output": "根据《魁拔之书》的记载，魁拔每隔333年复活一次。"
  },
  {
    "instruction": "魁拔诞生的周期。",
    "input": "",
    "output": "魁拔每隔333年诞生，所以诞生周期是333年。"
  },
  {
    "instruction": "魁拔复活的周期。",
    "input": "",
    "output": "魁拔每隔333年诞生，所以魁拔复活周期是333年。"
  },
  {
    "instruction": "魁拔是谁。",
    "input": "",
    "output": "魁拔是《魁拔之书》中的一个角色，每隔333年诞生一次的生物。"
  },
  {
    "instruction": "计算魁拔下一次复活的时间，假设上次复活时间是910年。",
    "input": "910",
    "output": "如果魁拔上次在910年复活，那么下一次复活将在910+333年，也就是1243年。"
  },
  {
    "instruction": "根据《魁拔之书》的记载，魁拔每隔多少年复活一次",
    "input": "",
    "output": "根据《魁拔之书》的记载，魁拔每隔333年复活一次。"
  },
  {
    "instruction": "魁拔复活的时间间隔是多少？",
    "input": "",
    "output": "333年"
  },
  {
    "instruction": "如果魁拔上一次复活时间是1800年，魁拔下一次复活的时间？",
    "input": "",
    "output": "魁拔每隔333年诞生，所以下一次复活是2133年。"
  },
  {
    "instruction": "魁拔诞生要隔多少年？",
    "input": "",
    "output": "333年"
  },
  {
    "instruction": "魁拔复活要隔多少年？",
    "input": "",
    "output": "333年"
  }
]
```

![img](https://i.imgur.com/VtD50jI.png)

![img](https://i.imgur.com/HIxPLh8.png)

训练开始后，会自动从魔塔先下载底座模型，也就是`qwen2.5-3b-instruct`，速度还是很快的我这里的速度是`30+M/s`，下载完之后会开始训练，训练进度也很快，我这里是3090显卡，一两分钟就结束了，当然主要也是因为数据集非常小。训练过程中大概占用了`8G-9G`显存的样子。

![img](https://i.imgur.com/PAOyDN7.png)

![img](https://i.imgur.com/2OLs18D.png)

![img](https://i.imgur.com/SNO0SRE.png)


这里就可以对比在微调之前，该问题的效果：

![image](https://i.imgur.com/RefOmSy.png)

小结：微调实际的效果，跟微调的方式、参数、训练数据集还有底座模型都有关，比较不可控。需要花时间去进行炼丹，人力和机器成本都比较高。一般来说当需要某个领域的知识增强的时候可以使用微调，对于大多数情况来说，微调的投入产出比并不划算。因而我们会发现，`RAG`在业务场景中使用的远比微调要多。
# 8 前沿技术
提示词缓存：`claude`模型中开始引入了，提示词缓存(prompt cache)，对于一些非常长的设定类的提示词，服务端可以进行缓存，降低成本。`2024-10-01`openai开发者大会，也引入了改功能。这项功能对用户来说，不需要做任何调整，服务端自动支持的。

实时语音交互：`gpt-4o-realtim-preview`模型中支持，可以与大模型进行语音的实时对话，比`asr` `tts` `llm`缝合的效果好很多，尤其是延时非常低。其他厂商暂未支持。

蒸馏：将大模型蒸馏成小模型。例如可以从`gpt-4o`这样的大模型中，通过特定领域的问题提问得到的答案，再将这些QA数据在`4o-mini`模型上微调得到尺寸小很多的模型，但同时能解决特定领域的问题。`2024-10-01`openai开发者大会上，公布了更加简单易用的蒸馏接口和方案。

视觉微调：`2024-10-01`openai开发者大会上，公布了图像微调，效果显著。


# 9 其他常见ai应用盘点
有了上面的基础知识，我们就来盘点一下常见的一些`ai`应用的实现原理了。

注意：
- 上面提到的`chat`类应用、知识库应用、向量db已经介绍过了，这里不再重复介绍；
- 生成图片和视频的应用，我没咋用过，这里也不会涉及。
## 9.1 IDE中的自动补全
在`IDE`中，我们可以在代码中输入一些关键词，有些插件就能自动往下续写，这就是自动补全的能力。

![img](https://i.imgur.com/ffyLraz.png)

我个人体验过以下插件，列出了个人一些看法，其中对于效果，一般提示内容比较相关，代码无明显错误，并且有异常边界处理，就认为是不错。毕竟这部分提示更多的还是给用户提供一些参考，而不是完全的自动生成代码。

| 插件 | 效果 | 套餐形式 | 价格(/月) | 评语 | 推荐指数 |
| --- | --- | --- | --- | --- | --- |
| tabnine | 免费版凑活用，中文续写有乱码情况 | 免费或付费套餐 | $12 | 赛道老玩家 | 3 |
| aws whisperer | 效果不错 | 个人免费 | 0 | 隔两天就需要重新登录，心态爆炸 | 2 |
| codium | 免费版没有补全提示 | 免费或付费套餐 | $10 | 国服网络有问题啊 | 2 |
| supermaven | 效果不错 | 补全是完全免费 | 0 | YYDS | 5 |
| continue | 纯调ai接口，反应慢 | 开源软件自己配置LLM供应商的 | - | 全走ai接口算下来每月费用也不低 | 1 |
| baidu comate | 效果不错 | 个人免费，企业付费 | 0 | 挺不错的，不知道代码会不会被利用 | 5 |
| tongyi lingma | 效果不错 | 个人免费 | 0 | 我个人觉得比百度好用一丢丢，不是指ai生成而是使用方式 | 5 |

这类补全工具，一般会有本地的数据或者模型，可以快速提示，也会有远程的`AI`接口进行支持，所以总体体验上，还是不错的，如果是个人用户那么通义灵码就很不错，他不仅有智能补全，还有智能代码问答，包含了开源`continue`插件的所有功能，只不过使用默认自己的千问模型，后者则是开源自己指定LLM供应商，要花钱。但是通义有个问题就是，他并没有对企业免费，这样可能在公司有偷着用被发现的风险，那这样看下来`supermaven`可能是更好的选择，但`supermaven`代码问答能力几乎没有。

我们来看一下工作原理，[配置charles代理](./charles抓包.md)来进行抓包，使用vscode来观察，这是`continue`插件配置了`openrouter llm provider`时候，抓包得到的代码提示的请求内容。可以看到有个非常长的`prompt`，上来教了模型如何填充代码，并且还给出了一个例子，输入输出应该是什么样等等信息，最后才说当前给的代码是什么，然后让大模型进行填充，这里关注下`stop`字段。

![image](https://i.imgur.com/9BGDKqk.png)

这种每打一个字母，都会请求一次`LLM`模型的方式效率很低，因为大模型一般反应都比较慢，而我们打字又比较快，带来的体验就很差，所以大多数代码补全都是本地和LLM结合的方式，其他几个插件都是混合方式实现的。

## 9.2 IDE中的代码问答
与普通的`chat`不同，`IDE`中的代码问答，一般需要支持选中代码后AI解释/单测/注释等；单独的聊天窗口，可以根据整个项目目录下的文件进行问题回答。例如`continue`中询问当前目录结构规律，他是能把相关信息给到模型的。

![img](https://i.imgur.com/2qPut4X.png)

| 插件 | 效果 | 套餐形式 | 价格(/月) | 评语 | 推荐指数 |
| --- | --- | --- | --- | --- | --- |
| baidu comate | 效果不错 | 个人免费，企业付费 | 0 | 中文指令有点出戏 | 4。5 |
| tongyi lingma | 效果不错 | 个人免费 | 0 | 插件不错但是模型能力比claude还是差一些 | 4.5 |
| continue | 配置claude模型和openai的embedding，顶呱呱 | 开源软件自己配置LLM供应商的 | - | 效果是好，但是模型接口都要自己花钱 | 4.5 |

工作原理很简单，就是把关联的上下文文件内容直接放到`prompt`中传到chat接口。

![img](https://i.imgur.com/kCH9OE6.png)

如果是`@整个项目空间`然后进行一些提问，整个流程则为`RAG`那一套，即把提问进行向量化，找到相似度最高的文件，把这些文件作为上下文都传给`chat`，如下问题找到了8个相关的文件，作为“参考”，其实就是作为提问的上下文。

![image](https://i.imgur.com/8tp2IIg.png)

## 9.3 IDE中的composer
`composer`是`cursor IDE`中的叫法，实际上是通过描述，让AI帮我们生成项目代码，并生成需要的目录结构和文件，并且可以`follow`话题，对项目进行代码整改。他与普通的代码问答不同，能够直接修改和创建文件，也能够基于当前的项目文件内容，进行整改。因而有着更高的实用性。

目前的产品以`cursor`为主，`$20/m`比较贵，其他的ide如`void editor`还在beta阶段。目前具有这项能力的还有`vscode`插件`claude-dev`(5.8Kstar)以及命令行工具`aider`(19.8Kstar)。

以`claude-dev`为例：

![image](https://i.imgur.com/jZQKsoK.png)

具体的请求参数我列到这里

<iframe src="https://play.xiaogenban1993.com/?js=eJwDAAAAAAE%3D&css=eJwDAAAAAAE%3D&html=eJzdXFtvHEd2fg%2BQ%2F1DhBktqMRz6kgUSxTFAkfSaC0oURNqKERpSTXfNTJk9XeOubo7GgfO6MJIAuSB5yOYxTwES5ClYINj8Gmv3b%2BTc6tJzoWWbtuI1bHg401116tS5fOdS9c68Me%2F%2B%2Fu8p%2BOcv8X87M1eaaue%2B2tF1O23c3BYHRaW70uy%2FPfzpvnd1bdr7I9PqnQE%2Fr188a921qT289Mdv%2Fslb%2FHVrZnPT6LZrDHz%2FxlC%2Bnhnv9cTgs3%2BRzYr%2F7DSuwmd3%2FNLD2zw8%2FVC4ujV1m97pvUePtMs5vduaF216k3%2FCr%2BCnj1yndGPUEa1GHZubgdJqaifTaqn8ta0qUyrvxu0CnyrNjakcLEEtbDtVMAas0N4YdV27BTw5McrWaqbrpZo3btLo2czWE1XpetLhAgdqDN%2BZhWuu4XNpvJ3Uaq7b1jQ1fKHrUo2Mb%2BFlXbS2MH54VV%2FVfwb%2FXNXqqj46fHz44PTs9PL05AJ%2F2FdIfqFr1Rhd0uu61tXyM6MK2DCk5UY31nV%2BGzn4Cr6%2FaGwLL1VG1wNlxmNbWOAt%2F74wVbVfuqKbwVfADRx6mE9emlE3ga9n88q8UNb7znh6Eya9sSVOWYJoWGSleTGH6XVrHS7Yjcemwd91U0yBggIkQ1dANzBm2vIgK1yKM0818F0XwCSvWgf%2Fugo%2BTHWrKtOqJTxhXpiig2UdnZ0idbAtpVeuhoeM6rxpdj0RDY80A1VZ4PsYaASybqxZwKZ3TSGMLM3Y1laIbswElukN0jxAWudAN3Bp5GEF9LvsBTNVxqTN8ddq7KrKLfa7ufoU2ERDDtXl1HgjS5iaas7kA3NACkDilrhOZK%2F1U5DOhQWSGthEAwxULYwK4%2FuugN88TYocRboHIIrX%2BIcpLXDTNcrOcE8M7iRxzbyAZeMTQmVXl6bxLRCLXyKjiq5p4GkFX7Y0n8Zt%2FQQoGyhQhLFrSKZYPZUj9WY%2B4YpnSNXMNSwwT6cmcV8RR3UFq5vAIj2tWdNyUAUb2LuGdIt2BieuKiITJGHqUbZz8lClSNAsvNi6Zqn2dov7Bx%2FARP7Ad%2FWiOzh2i7pyuvQHJYy4%2F2kJLGzp8%2B494CmMPkKVKSowBCWOb%2Bob27gamfWMBZi2ynoRbJJyBexsSGBwL4Ai4Q4IFxILfGs6FGuTSfu1WSYZtzVKb3oRTISbpXUc0Cg1WA2v9qZukWwQSm9dmHnb6cqCyiO%2FXTPRNf4BA9qGhOAe%2FUCjiL2C3VF7OGMwBLgf5T1ZG2q0rrxTk86S6BcWX9kXUQL9WUwt7CpJDMvQvIIdVuOugUGboTod017WBtgIv8v38bmwNAuvB6l1Xetxtlu3dEDDIn2d50dRNJ4FQlwVp55rMAq7wHmzCwrX0LNJoOYajTBpvW1555P2p%2Beq5VCdI%2BUL683GR8HW4Mitm4PNgRcGwhrgIvhCmADWZ9FkIg0TU8PuF73lL2B0QxSXrt5tgWVozsBkg1Iw%2B2D4GswEOqEkSJW95vUfG38Ns%2FesMfKGjVPkTFDUnulC%2BovGeS%2BLAYHXCm2ZHVuYLuM6bA4YSbEqNXrO%2FQaX2RjfVa0YXVEcWHHTuI7tR2WBdhEr1BrdgFPrKt3A8oDMcVcRZ%2FpGhwxu8olgeOlroaxAE1aRAYtOBExJCX%2Fb8ZJdidFCE7GwMWNN%2FK4na3yKMoSTPktW%2FhnrG8oUsm8CDmVF07d4B1pPMFTrAsL2cwOTM90bmY2MWqDtzNUqcY3mGDVg2kwTdoiUvjEVM2lq5ySSCwODFKYBW1bTLD5YLXLqxJuZXsY5ClxKi5QRK2aw3Ra4r1rL7MmJiEhjddiR9oZJ4UGJI2DlEdu0%2B%2Bo9h6ZB464OeJXwGz8JJsds8V3IiRka0Ih4cNi%2BxQ0%2BQhzNJnu%2BZXczczzAP1habpUUGiaYOjHu8BaJ7i2ywnJSuYK4YxHJgaSAY8rthNCAwIJ0mq2uBscrFpOhMHE9vh9xR2IPUYB75bvJBHFmj6VADTE8GKElsz5jAI5BoAawfSCENSQqpSqmCEx8NMVB%2FQQ4smIWrqsADhHAUY5YtlFsxOLT05vsGnizTgxoNy8JoNBgon2eBNmUG%2FVe0OEzQYZxKU1XfxVaJDEFfW5o5rEBxQbvgIMTeMvAWvYyiTxDoFyNA0jVOUzldc86CgUIasDviM6bHEAjtxZTsTFhGaVD5j8GtgN52fgBnvfBMK6hALki486P6hHqUNHYOe49CHBB%2FFpSmDQjRw%2FjWHwK5wNja3kmYBzsOkgiBS83%2FHPl6sk%2B%2FFKzaZd5cSiNONiU2RT933EfbI%2F9H14ckQQZhJy6ItjMUBJt1rUx8zRCmFJGGOniekJ%2BiahC7gbEdw0ISqSnlP0G5IRwF4yZRvpZ7jUY6RMNbi9wOg8xrA%2F0atjZRaQRLQFYx8JsFEGJHZ5h4BDlr9BzMl4aNwHstZ86tuag5R6CYWDpJCpKMG0ZOpdARO2xR0YmTNtZ9Ei0JwXB7sAjQZSkvsBNkAl%2FL%2FmbIN7WZ5YBFxqlPIQKPUG%2FTF4DNmdkgh8DcUX4CwSDlSAJNqMeBRTP7AdgqMeob9G84FTI37GhJIKPEY7vRshoYoaYIPEmLWw7CCuw0dHrHJ8SbABuw2IBNwhARDiDJMGyG4Kfw7hluRkVlSzzDUrGqHANGm4YDn0jQeYEUJQBdNRIcNQY8je9fUWfAPuCDlYo3eQm7Tg5SV2WaBxgL1xN%2FHMUPekUkw4yb0nKbgRXht0MwZ%2FfZBVJsPF5kiqRncwprAhxxlEUYvivdnFFvHrUsjmGHRiNZRmOq%2FrJB2dZZqO5Jbqz%2Fr565fgu070a9up5UT7nsEvDiBiUmczfLkkJyVqSWWZxDnki33bFdQhzMW7GYO1rRJpg7hxqA4kKInOMVEIsK5KzixHubgpTWI4ZS2RpjsZ82lkyFPg8GZhjp3CBwb78FaoCWmMYA8TnD98%2Ff3hCOxqcAz40dTOTAVEc5oEZo52XGbf4ysxHjS1gQMSJ9bXSIwgX6KWLjy4uTx6q00fvnT95eHh5ev4ogtOoQes4VoxIhtVIVxCtuYY1Mxr5pHTRQeHGwc6gd6IUnVhzyk4IvkWKKcBFxbOIme2450Jz94zCDwqOAGQU%2BVD2gqUiE50QxwYcs1V%2Bv5bIIFEWYw5gnJkbTC3h2lCOd9nJ0V7qXIh%2F%2FGNWUSY5ZnNkiXsYc9fpb%2FbByzsS8nvDNXMVeJq4%2Bryez9g9VtVzZmjIgGRc%2FFp8IrdOexW2r8cvLZo%2FhEhn7k1XOkKknCAAb7UI2wyPqT1UKh6CiLqHHN2L%2BIxUliI20LVsJfeep0xX0p8V3IrKUzTg2lieOSoPIS8M2aCnrMgQjXSF8CHKmm2XnM8hDGYr%2BHuoHgAR5QpWRbPFGqqXbKfJNWA4vRpiX54fn5MkYBgAEXdXFwQve1lPjGtrIAmj%2FxHNZ2vMKTASlUxCFjcxOgspgpAdEANAVjB3qXnWgMMEF1IoK%2FYBJsTcxVCdIQBHL7KRwbhBsKSRFahMAsDBAZtQ3HVCs2gxGjOVRD4R5a1fkeAVBkbNX%2BFkdIpbQzXc2GgGQb4t4mXDOVhZGiw8M7%2Br8RbHaMx7jKkk3IpCF9E8A9GgUnsRUMFmzeeDhA1kY2ONI8j7ICUTMQtAqIvYi6wkdQVlthy3hlmS%2BenqyohAEEIPOQ%2FPm4AptaECxUZiGjdvrJZUueL0Lrm8kMsOoazfFoESltdd61AcGdwK0MGlJaCTxdRDdRHzBHn2FVCYFYijyykDOBLGvCwTk4pRELDUhPsZhhkZEmUiooSVMjvi2lMOaJBvk899DQRWDNKJ4%2BhVAeqROiLgN20HuzhOQgrSzOEiDySppFFnK0zOqfcvH54N1NHFBbuTn%2BsbfUFBntqXrGVIroLdl0hm1LgFbF6MXch1toyQUMpTPohUCt5Bn4K4BLlFWzgHs4DeuKdPwSEsDIOgsFd9wLqIYf%2F2vMN2OJu7%2F1zGYq4EhRo8JqbQh%2Bq8iTTpWvJUwT5lBY9%2BNoKDhqToGzNklXPXOI8nc1VR8EMESohEohtrPttTB2ysYmmuCkgtIsmIZii%2FtiKOe2Y4GarHS5CjepBtPtkB5E%2BFmgyiJYFfaTiCDQ4s52DKr4XCAi1UTPxQHfawFSUo%2BCEJBElOY5oKGb0WSXIRKBduZCNZtTbtxy4OWduxkYS8SExk5ornSG%2BVBApMXViOEqP00%2FuwENfMXYNr5SgBbAgZepIPlMNkbiX8FDPM%2B4CFN10t9NL3NyWYfRtKKDEnRwUDHAcLMUN1EkCtFoQQht%2BCcFMZL%2BZbedGcG1pK0XGFC%2FAsRc7IIN2UfnP5OQYVXLwUp5n7fpimTtrHVp2z3mgUcqi%2FWbqDvchkmzNLqf6Z8ma7NyYGZyUzh4UlBiNBM9Epz%2BaYsKWniVKxGuDvPYXKKeqXYAhJWskrhQTcGCAlppEGK%2BaS5gtuOc%2Bn0haAOdITbetoQ3ELXY1L5PwX8QVYGz1lLAtn%2BBEeeMZ72M2fhQek5MXsDskWGrpfK8i8Rpb1XolwQ%2FNBNCe4rJBzlOxTgY4rzY7S1bdeM1g7ygjgiDIJJwfQ78Nib0w0s3kaDKyRrSjtKNEtcOTG2RJL%2FOJ%2BN3OId11cZukAw6wHHvEtSh8hWzUbC6JfTBJ6uzqGHQnFrBbaehNuKUKS0be%2BjQWJGN%2FLIMzOqYEQS%2BgTeiSEhTCCTR1F0tZzKmWgwCARfEV1A37kWTeJU25CCTUCKfxr5k11k0PEFBKGSDqGaFyG9CakyDGzg6EFVQARgfluJtodMpwxJs7jS0CbaA84jJFWkAKFcUUqLjMnFwYM%2BcJaRAIdjtEzeosJoXQuDgkRKhoHKTXokXcVkFKlAlZYCdizDoaOc4QFRRHcqmCcL2ELlbO7cHNZmfYtBQdEFPwCpAxjBmviMAnMHSoMnLa7%2BIF6dH6pTD3R3EekeUjysq5pMfNcY3KWzC5N8ejkw5MnypB6Biv3TAxfiHnjajCzGBbismlC0Sof%2FQ9QjwDMBHCFU4TEqFhMIhCcnJR%2FsYyMnA01CPIZIUWV6mK4e5ROSNY2LQRcURNjYj8HZQ04ToNvEH%2FjWSuvdo64jlktr3YG8Of5tZZPF2DC%2BNPPEB7iR9MWnP0R3UVGj0xvyZSsX5l8APi5DYrHZkFJVpR8qQN8QBvxHibJx42JpnOmm%2BvSLVBTuQlGU81yt2Tq12Ya5ikDwgSjyhXY2CNIIkTQOnVthBiiSaotni0omp1xmxdoO7WI0Jw31M%2BBdQZNCQTLuAWgIYTg1PeWBawzdsUvWoQEYEM1QkLM42cIAKs%2BCTK11MvUb29hPz3F4Vs2Bd4LR26rluGyDttcAA0WYMScU8%2FgINVy%2BvEf7JXBgH57E0%2BOYSzLK4I7iA7UaJnperSgLA3wKM60T%2F0coaYdjO%2FcYXBhhQKBuLEkH1OjAZb3oXRGKooDO4UVQiWsu9FVR%2BZxvX8iHz%2BmW0rGcGhIW7RVmAgIAo2V15CwXIFkLkkoAw3OgTBBvKu6EK9KrXrcKyScYmeS%2BQxu%2B%2FJUw8RUFvoGn%2Fk6mm5smhB0r60%2BZRWWDE1gBPL74mJtlIuePm2QgQEXUoMehlWEQXuZZaY7cTmmIpbcLOEw3FeasifMR28C1CIZPnpyenl6dHh2X%2FxvmaU1WFF70e1AHZ49PfzooufSj84fPj47uTxh3y5R7JodSc02j84f7T86%2Bdn55enhg7MTiP2wpwRsHFc6qdoP6y%2FM1FW4LjZLuwcHOBSJAxmhrubQo9wlaHJx%2BeT06PLsI%2FXe%2BZMHp8fHJ4%2FYqj784OIyWqjDs7N%2BNZ%2FXBOivFsCzpOZNFI4RNqTMIBDBVAiAN2CZ4E%2FeVlLs5HAwNBPYCvSPGuwwloCL4mt0%2FYDBcTf7NcmQlMyLTecPfn5ydHn64Qn%2B8VHfEmnqSaw58rYtJcIxEAHBBhUikbUo4IuaDRzjZAACc9aEkPDHZmkwemxJZwZMYMn2iSh5E4LlLAmaR%2FsEokzLA4O8FVMLxgQ1HhGFXwEStsWSv3WYL%2FssmGB%2BkNy0JLWAaSV5i7dAPYDCnLz4gkfdFxsWPAep6ApK1z4P%2BqgyTmBHPCwVs1AoOcJRJUWoZPPMPMot7AuMONsH4EZQX3wDeBQytA58Opm40LPEHEbTgOFWzLbIDpHlofS%2B7bcgSpqIGrMlmWgxBKbx8wTUOGY5KdFARUtYKLkdLDEzb9J8LKDUeoDzxbSs5OJRDLJwlSQD0BJZ2Jmm9Arin7eH6gkEjbMRtiQuQ29z6i7vuWrGQ7Hvea0dOBUIxVd0nKwH37QwDZXgES9WFI0RtMh3ckWwTNjWYSgKovRyepnrGKSns5Q4D%2Bnhd6gcCE%2B%2B%2B85B%2FAjbNsHUOtYL%2B61JK51bMWuwuQ2X%2Bq00pfhTt1uEHCgwEm%2BQ9c%2FzCBBw1INeqZKj%2BdT0FbIVlNHkjPNqxoqjgtvafB6R1524qGHESJlEUHGZKrw%2B%2FZRPwj6VgxbTC2ansGfsvqtlIhq7TMlsmZom7WVpyG3Dq5rAQ3CQ6LKJSzJ6KjqL9NBLDeapU10qZrW4PTBltiTigrHAOvpuDpAQEyEpTS5Tn3I39y384EoEp2lcJAZbOx3GhcucrsqFjJPIGYrZlqgT2YoiDPL8wSWFvZiyFkKIOunh3EAVisPMeoQUA3V8TkGErW%2FcdSjtSN1sDxEBuTuad4yHSJpUM5AheFx%2FL8hua3Q56Cc6VqL63ovMpldLEQmtWzN4%2BO9cYqBscN5GgcZByMB7%2FNFQnUu5uJ%2BOW4tnv2VSTraFHGIvQRf6VKmMnzrkst42EsWpW1B9tj9kTBr%2BaSjhbm26RW5t7E8aZK3bdP6mA6XDFPtzqZ6U5sUQ266eB0LYH0hvlnCOijPA0J9%2BNylH9QDMm%2Bw9aqitO8OOADALAelb8gvBkzKIN3W5MS5PyUrgFJ1vkLZWCfgB%2FNvYAJeg13prCAGy2HBwQf0aAJeBkW7h1ZtvXNXHZqxxBy%2Bmpqruq6P7V1dPTx8dnz%2B9uLri%2Fo6337q6Kmbl0LwwV%2FX76JSOQyYPn8%2F7CK7qI2nNeCpILXv0a%2FQVrZwqK8DKY5dM3TYOj8v1jqNlB9LMHPAgloN28gc%2BT3%2FEjx%2Fzh88H287FodDc%2Bam4d1DI372qX%2F76H19%2B8be%2F%2FeV%2Fvvz1P738h795%2BR9%2Fx5%2B%2F%2FNVf%2F%2BZfv3j5b%2F%2Fy8r%2F%2B%2Fstf%2FfvLX%2F7vb7%2F4xW%2F%2B%2BRdf%2Fs9%2FX9Xg7%2FHtbGmfD74NLRv8P5D2o9AO%2BqGlAiOAChBpEJP7Bw8tdiO4cQuPKHzmIB582efE3%2F6Ys1vgAUtArxhBUJOqafZ%2F9OY%2BvnJVl9pPR0435QE2tn7iUULjpOeo5Zd65Dc9NxweyL9B6w7gw9hO4FcHo1x3dqTpc3VVT%2B4fnJ3ph4f772k%2B7wPhmT7QFQQx%2BtlnU1jxzMl7OP9WsVV7ryy29wKvHjkBu2PsvRji1m1i9vcm5Pi%2Fj%2BWkKOKvTedBw%2BjB22ayH7%2Fq0bSDHfpET7%2BJLV%2FVTmm445nf3jnZ1JQdQH1oJouFl7WjGeG4zdqhOMXdnXn%2FSGply8NPbMiQOGkNW6ZK%2FHpPXO4m4QUhIJ3FfG195CFh8kpN5Edh3NCjnffdtbf11X0N493b%2F4R6VgU6CpwbYQZhRRe4BoFx2QZFCIK29ks2KoQ8sID%2BqJskEvHBCrwRpkjKJzWOAIq1ZUSbgVWpmy%2FI70lKcIVR%2BWgjVVUUw8MQtsaUPuq9pnoZZnGaGeeCOXKjw6w7%2FaV83lP%2BPvcCxO57qx7v8q8%2F3mA6Pt%2FmH7%2B5nYgtHbdZiCd4yDeGPnL2RiqLoknpmBf1595iL7ad5dF1%2F4BuvyUia1HhFJj0k1MkJlkOepxz9zngpwoM%2B6ROEhnSk3LYS6LLu141OoyLbz4%2Bfo%2BE4vj86M%2FDiw9TJhQPPcbktPTcwW7QkrAhL3Wcg1WwGFlDzF9zqI0TheQmJalZQYbfvbbiJt2ZqlLt1eXVXcfnwvf4TN6NCZZ6e4vwq%2Fvzu1E5YsBr0Lde7vs2nXvKlxSIdFDu6zZ9O83YT2rk0yFekFL0WaHeE%2FMDMZUis%2FRHQSNI0RCO1hssNvodcrWuV4zHlk%2Fs86yzgfu58djghx224AILqaulQzS3dzjmZ4pTlzXfPxBm%2BV1QIVmR%2B37UaIXMLLa6mxWmXmAW57i6tGV3p9jbFvMaFD5v1r5N3x8LjNa9c%2Buvemo9XT6y6dB6rlvxPDwljkMbvmtymC4eiaeOdQdxYyA9AKbp9DnleamRW66IAV2ee2ykyCj5Iati75iU7AhswneikLJJ6dVgbrM7GsLulWvKsirxJER3xhMYDXOFGEeBSFFHhYhOxhgQKMJ9Xj3pqIRAYrwEBP3iK8lF2XrMI94J0echwzup3CinFSZq45lpahQeqN2fDFvPd2dcwjzSKU6P3COfmKeEkycMGhovQNj7yb3v0ojxlr4GE5Z6%2Fm4zYGfZVSF12b%2F5g6tkfdySXQdxOs4uLEFD1XSrd5Bk10ysDN67wmR1pLGuPJXPN28hNZDG%2FsXWzff55ooQl%2FzO2C5aY4y2UNJfC6iIe%2FPNVmzqbrauLfwuiMz6GyjbKAE7qz98%2FJXsfDo1HMy5rfflYIyb3bvTv8SJ6ma7NPsu1QtmIHSUp4hShtJ3lwbjdZmGjbeEfJWp8NmJu3DjU1FpT42IYVY88k59JJ67Gu%2FF%2Bn5%2Bzcj262e2WpyEh%2BLtVut3VMXzBf3ONTvDSq%2F0uvFPSF4P%2B%2BCdesmW4L1VfsMlNdS4QMccYBDsV9rc4OboME2V3xv3gw5wsmvLvgsjlHrSoyjccinND1v%2F8vsIbtO4I75nw3%2FbizZyzan1jZ1Qe51sXtK0D56cDahraWVCGR87rrDlAft6OSum53NAU%2FBxNjMlHrzCbkm6DQM3mWwpE1tVdOCPTynllDfhvgVSKleAJKmya7iFIFy%2FgJ1WMblr5faWLCGCD1IDhtxKQpUJOkgXziQRTTmPaNzvXhm7ZkP16RvqIuxONI4ShIscraXXtSTY8ZV0xYokj1oH%2ByGn7aZtO79%2FcEA3Zkydb%2B%2B%2F%2FcYbbxzMqWkZ7TP8doBKctA6uuSP%2BgXEqN%2BNCiKHXoMGbmxFuU0VD%2FOml%2BzEAnV5cR9BOsOU57FTriv2heZnS2KAHzePfGXMv4ODch2KvNKzkZ101GA34LQ8ON4GY3%2BaaBAOT9hQvsoa0UKTUa%2FP7LTlA16MLG12K9Jqy%2BNoCXToUZVsO5VjulrmTrrIvS%2F9816fgPgVeO8aNy1jUyGXZ%2BLNAeHaN%2BYkX6CTrvHJjvDj3Uh47IpLePgIkostIvvw2z61iHwPah0F5q50OxenvL1qg2ZLt23M%2B%2FQPu4EQYqhvvFi7xLtQzLkj6BpZ8DqUd61D6zbN3d4Hxg1gXU9YX%2BHoZchSgDiHyyu%2BUX8XoiU%2BhcBHCcPBGiksc7e7KaaOIpFdULVd3uQZd5HPQb5aKnlRbxZ3%2BoeGZm7rk%2Bas2NPOdx21CvunPPn8qLlM3Dds4%2FphFaoPt5SpYx%2BcBubfoAGdudQAui4Ia9dv7K501u3SKQHOvKLqcgVmBZXF84j%2FX6vj6%2BkAZMUdZilXGymHvZN9eG%2FdHR%2FnO15rGMThv2634N0YUuHmq5pR%2FF%2FWf%2FQMzIMt2Cp2rYNh4Il3DvBu%2FP8DekXp3A%3D%3D" height="730"
    allow="clipboard-write"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"></iframe>

上面只是一个函数调用的例子，我们让claude-dev写功能的时候，他也会申请文件的写权限，创建或修改文件内容。`claude-dev`和`aider`都是开源的，不收费，自己设置模型按量使用的。而`cursor`每个月$20，是比较贵的。

## 9.4 AI实现前端代码
我个人用过`vercel`的`v0`，但是效果嘛，只能说简单的还行，但是简单的`claude-dev`也能搞定，`v0`还要付费。目前没有觉得`v0`有不可取代的优势。

## 9.5 记忆存储应用
大模型是无状态的，上下文都是通过`prompt`携带的，那如何解决一个不吃香菜的用户，每次问菜谱的时候，LLM都要重新去了解用户吃不吃香菜的问题呢？那就是记忆了，记忆这个东西算是一种辅助，作用不是特别大。目前有一些开源实现`mem0`等。

这些工具的原理和介绍，在[参考这里](https://www.xiaogenban1993.com/blog/24.08/LLM%E5%BA%94%E7%94%A8%E6%A6%82%E8%BF%B0#4-memory)，个人感觉是并不复杂的实现，而且业务收益也不算大。

## 9.6 AI流程平台
一个ai应用往往需要多个流程，比如大模型调用、函数调用、函数调用完了再大模型调用、知识库、记忆等，这些组件就像是一个流程图的各个节点，所以就有了这样一类工具或者叫平台，来整合这些组件，实现一个完整的ai应用。比如开源的`langchain` `dify`等，还有字节的`coze`。

那我们就以`coze`为例，基本的bot搭建长这样。

![image](https://i.imgur.com/vANQS9b.png)

这里面技能中有个扩展性非常强的工作流，可以自由编排，例如我们搭建一个对话机器人，想要获取用户是否有买xx产品的意向，意向的等级分为哪些，当前对话分析出用户意向等级是多少，把上下文传给LLM分析，就可以得出这些结论。然后根据不同的意向我们还要往下进行不同的处理，此外这些对话中分析出来的数据也需要通过接口回推给我们系统的数据库，那这里就可以加一个`代码`节点，可以写nodejs程序，完成数据推送到业务自己的系统。等等，总之工作流的想象空间很大。

![image](https://i.imgur.com/E383cIZ.png)


## 9.7 办公文稿类
文稿类型我用的倒不是很多，但是也是一个重要的赛道，比如帮写`ppt`的`gamma`，帮写笔记的`notion ai`，这类我的感觉是没啥用，可能我写作水平太差了，`notion`给提示的都不是很满意，而且感觉他还非常贵。

## 9.8 小结
上面列出了一些，我使用和了解过的一些ai工具，以及他们的工作原理，如果后续遇到新的ai应用，不妨也在脑子里想一想，他大概是怎么实现的吧。