---
title: LLM供应商
date: 2024-09-14 15:29:00+8
tags:
    - ai
    - llm
    - gpt
---
在使用各种ai工具的时候，要么就是在ai工具内进行付费，要么就是提供`openai`的key，而随着其他模型的快速发展，`claude` `gemeni`等也成为一些用户的选择，所以我们现阶段会看到ai应用中会有`LLM provider`供应商这么个选项：

![image](https://i.imgur.com/hd0NGua.png)

本文来盘点一下这些供应商，当然提供ai接口服务的供应商非常多，这里列的肯定也是不全的，只是把一些常见的列出来了。

这里`openai` `claude` `google` `mistral` `cohere`等我们跳过，因为他们就是模型的原始提供商。

此外`ollama` `lm studio`等本地的大模型供应商我们也跳过，就是在自己本机运行的服务。

# 1 云服务提供商
国内外传统云服务提供商如阿里云、火山云、azure、aws等等，也是ai接口的提供商，尤其是提供了自家研发或者自家扶持的模型，如火山提供豆包，`谷歌云gcp`提供`Gemini`、`azure`提供`openai-gpt`、`aws bedrock`提供`llama` `claude`等。
## 1.1 azure openai
[微软azure云](https://ai.azure.com/)，封装了openai的接口，使得整个接口调用变得非常复杂如下，计费和openai一致。

![image](https://i.imgur.com/NRh9sXG.png)

适用群体：
- 中国大陆用户可以调用`azure`，绕开openai对国内的限制
- 一直是azure客户的公司

优点：
- 国内可以访问gpt
- 可以进行微调

缺点：
- 使用流程非常繁琐
- 与openai的官方接口不兼容
- 只有openai的模型可用，无法使用`claude` `llama`等其他模型
## 1.2 火山云
火山云主要提供了豆包系列模型，价格比较便宜，并且支持微调。

![image](https://i.imgur.com/KFnlwmF.png)

![image](https://i.imgur.com/sQUVvFG.png)

适用群体：
- 中国大陆用户
- 云服务一般是tob的，所以同样适合一些中小公司

优点：
- 价格便宜，百万token也就1块钱
- 中文能力比`llama`等英文向模型强很多
- 方便集成到字节的其他产品如`coze`中
- 支持微调，方便企业进行业务定制化模型

缺点：
- 使用流程繁琐，这也是传统云服务商的通病了
- 与openai官方接口不兼容
- 只有豆包和少数几个开源模型，无法使用`gpt` `claude`等业界领先模型。

# 2 售卖算力的供应商
售卖算力的供应商，主要就是卖gpu资源的，主要售卖的是开源模型，跑在自己的gpu云上，通过不断优化模型、或者优化硬件，来降低成本实现盈利。
## 2.1 silicon cloud
[硅基流动](https://cloud.siliconflow.cn/i/DJxZbtZp)，国内的公司，在国内调用非常快，稳定，价格还便宜，10B以下模型都可以免费调用。目前主要是售卖gpu算力，没有开展api代理的工作，所以支持的模型都是开源的。如`qwen` `llama`等。`llama3.1`价格：

![image](https://i.imgur.com/iERa4Qs.png)

![image](https://i.imgur.com/tyJcan9.png)

使用群体：
- 国内个人开发者
- 中小企业

优点：
- 在国内价格、速度、稳定性各方面优势明显
- 中文页面和中国人习惯
- 提供了世面上优秀的各种开源模型
- 兼容openai的接口

缺点：
- 目前对外提供的模型，都是开源模型，无法调用gpt等模型。

## 2.2 together ai
[together ai](https://together.ai)与`silicon`定位一致，同样是提供开源模型，售卖算力，因为是海外的平台，在价格和速度方面对比`silicon`就有些没有优势了，所以这里我们直接不展开介绍了，这里只列出`llama3.1`的价格如下，是turbo版本模型，比硅基贵了不少。

![image](https://i.imgur.com/IOz5Eck.png)

## 2.3 groq cloud
[groq cloud](https://groq.com/pricing/)和前面两个定位一致，同样是提供开源模型，售卖算力，是海外平台，同样对比`silicon`，在价格和速度上没啥优势。

![image](https://i.imgur.com/ZjjwbOt.png)

但是`groq`的优势是输出比较快，基于硬件上的定制化优化，使得回答问题的速度比同行快一些，所以本质上`groq`是搞硬件的。
# 3 代理
还有一类供应商，提供代理的能力，实现套娃，类似一个网关，可以将`openai` `anthropic` `google`等等其他供应商的api汇总过来，进行封装，提供统一的对外endpoint，即只需要接入这一个代理商，就可以在保持大部分代码不动，只修改`model`参数，就可以自由的在`gpt` `gemini`等等模型之间切换了。

## 3.1 open router
[openrouter](https://openrouter.ai/)同时提供闭源三巨头`gpt` `claude` `gemini`三大模型，还有众多模型的供应商，`router`的名字很贴合。可以使用`$1`美元的免费额度。

![image](https://i.imgur.com/4va5MmH.png)

开源llama3.1-70b，百万token 2块钱，甚至比`SiliconCloud`还低，

![image](https://i.imgur.com/WwgzPXJ.png)

闭源模型如gpt是和openai官网价格一致甚至更低，并且已经提供了最最最新的`o1`模型了。

![image](https://i.imgur.com/D7Hkv35.png)

并且从响应速度来看，可能得益于负载均衡的架构，`open router`也很快。

![image](https://i.imgur.com/YL7IZdS.png)

适用人群：
- 较为广泛，但是国内的公司不太会直接接入外网的服务

优点：
- 包罗万象
- 价格公道
- 兼容openai

缺点：
- 国外的平台，搞不好哪天域名被拉黑。
- 平台的页面做的优点简单

## 3.2 chatanywhere
[chatanywhere](https://chatanywhere.apifox.cn/doc-2694962)国人做的代理服务，我之前一直使用的一个代理服务，`gpt4`刚出来的时候，提供的`3.5`的免费token对于个人用户非常友好。主要提供`openai`模型代理，价格与官网一致，`azure`线路比官网价格还低一些。

早期是比官网价格低不少的，可能是为了揽客，现在与官网一致，基本是个代理的作用，速度还是很不错的。

![image](https://i.imgur.com/9r4vQfR.png)

适用人群：
- 个人开发者或个人用户

优点：
- 稳定，很少出现问题
- 响应也很迅速
- 早年间的白月光

缺点：
- 只提供了openai的模型和一个`claude-3.5`但是后者总是失败
- `-ca`的az线路出现过多次抖动
- 对比`openrouter`没什么优势

## 3.3 V3 api
[v3](https://api.v3.cm/register?aff=CXrK)与`openrouter`类似，代理了很多其他供应商和模型，而且是国人做的。

![image](https://i.imgur.com/zQbKApC.png)

价格标注和官网的是一致的，但是充值的时候，会发现`100美元`，只需要充值`225rmb`，换句话说汇率只有`2.25`左右，天然的有将近3折的优惠价。

适用人群：
- 个人开发者或个人用户

优点：
- 模型很多，跟进很快，`o1`刚发布就已经支持了
- 价格便宜，天然3折，并且很多模型不定期还会折上折，例如`gpt`部分模型很多时候比官网价格还便宜！！
- 国内的模型比较多
- 充值和使用都非常方便


缺点：
- 登录页面每次用github登录，都要重试多次才能登陆，系统页面有种机场的感觉
- 主线路之前出现过多次响应较慢的情况，工单反馈也很难快速解决，总体体量还是较小
- 模型中缺少优秀的开源大模型


# 4 上述供应商汇总表格
| provider | 国内/海外 | 国内访问速度 | 服务稳定性 | 支持gpt | 支持claude | 其他模型 | 价格(只看output) |
| ---- | ---- | ---- | --- | --- | --- | --- | --- | 
| azure openai | 海外 | 快 | 大厂稳定 | ✔️ | ❌ | - | 对齐官网 4o:￥105/M 4o-mini:￥4.2/M|
| 火山云 | 国内 | 快 | 大厂稳定 | ❌ | ❌ | 豆包 | 128K: ￥9/M 32K: ￥2/M |
| silicon cloud | 国内 | 快 | 本土稳定 | ❌ | ❌ | llama,qwen,deepseek,mistral等 | llama3.1-70B-inst: ￥4.13/M |
| together ai | 海外 | 慢 | 不稳定，官网好像被墙了 | ❌ | ❌ | llama等 | llama3.1-70B-inst: ￥6/M 但是有部分税 |
| groq cloud | 海外 | 快 | 目前稳定 | ❌ | ❌ | llama等 | llama3.1-70B-inst: ￥5.6/M |
| open router | 海外 | 快 | 目前稳定 | ✔️ | ✔️ | llama等200多个 | 4o: ￥105/M 4o-mini:￥4.2/M llama3.1-70B-inst: ￥2/M |
| chatanywhere | 国内(但机器海外) | 快 | 目前稳定 | ✔️ | ✔️ | - | 4o: ￥105/M 4o-mini:￥4.2/M |
| V3 api | 国内(但机器海外) | 快 | 目前稳定 | ✔️ | ✔️ | qwen等 | 4o: ￥40左右/M 4o-mini:￥1.5左右/M |

个人比较推荐openrouter和v3。



