---
title: Vibe Coding Tools
tags:
  - vibe coding
  - claude code
  - codex
---
最近在倒腾一些vibe coding相关的事情，主要是因为最近发现ai的编程能力越来越强了，最早用`claude code`感觉整体的能力还比较差，但是随着版本迭代和新模型的推出，整体的能力已经非常强大，以至于工作中的简单需求都是扔给ai去写，人来做review了。

这篇文章主要是从个人的角度去评价一下我用过的一些vibe coding工具（也包括不同的模型），以及一些经验分享。

# 背景
我的Vibe Coding Tool Kit是比较杂的，这分为在公司和在家两个场景。

在公司还好，公司提供了丰富的ai工具

- `openai`，`anthropic`，`google`的主流模型在公司都有提供
- `cursor`也可以直接申请
- `augmentcode`也可以直接申请

但在家的话，情况就不一样了，受限于家境贫寒，以及`vibe coding`的大量token消耗，我主要的LLM访问渠道有：

- `OpenRouter`，但是现在or上也无法调用gpt和claude了，提示是我的国家/地区不让用这些模型。当然其实能访问的话，也尽量不会用or，他的价格就是原价，比较贵。
- `SiliconCloud`，硅基流动之前有一些邀请得到了一些优惠额度，大概有500块钱的额度。但是这个额度并不能用最新最猛的一些模型，只有充钱才行，目前我主要是拿来调`deepseekV3.2`。
- 一些转发的代理商，这种非常多，我也有三四个平台的账号，每个上面钱都不多。转发的代理商也分三六九等，我们后面再展开说这个。
- `OpenCode Zen`，opencode号称开源版本的ClaudeCode，zen是他提供的一个转发服务，做的事情和OpenRouter一样，只不过他能转发的模型很少，但好消息是，这上面很多模型是有蜜月期免费使用的，比如现在2026-02-19 `MiniMax2.5` `Glm5`这几个春节档最强国产编程模型都可以免费调用的。

![img](https://i.imgur.com/nI4y3w6.png)

# augmentcode
这个插件是第一次让我我改变`vibe coding`认知的这么个插件，我25年上半年刚入职新公司，对项目都不是很了解，当时公司就买了这个插件，鼓励员工使用，我让这个插件帮我解释各种代码逻辑，修改代码，写单测，非常有用。节省了非常多的时间。

虽然好用，但是这个插件包括`cursor`对于普通人来说太贵了，一个月大概都是20美元，140块钱，还是太贵了。如果公司没有购买的话，我理解大多数人是用不起的。更适合普通人的方法，一种是拼车，比如三四个基友一起买一个订阅，这样一个人一个月大概三四十，每天也就1块钱，就还可以接受。另外一种就是直接搜咸鱼，这个就自己搜吧，感觉属于灰产。
# ClaudeCode (CC)
`claude code`作为`anthropic`公司推出，也是`Vibe coding`第一次以系统化的工具出现的开山之作。在cc刚出来的时候，是很惊艳的。各种tool的深度集成比如bash、file读写、websearch等，这些都真正优化了vibe coding的体验。还有subagent拆分上下文等等。我最早是没觉得`Vibe Coding`会有多好的发展的，当时是觉得模型需要上下文，但是项目有时候太大了，很难给他提供正确合适的上下文代码，毕竟调用栈可能比较长。结果后来就比较打脸，CC通过你提供的关键词，进行搜索定位函数，然后继续搜索定位函数调用的地方，不断重复，把要修改的功能的整个链路都通过bash的`grep`或者`rg`等工具搜索到。

我经常用`CC`来实现工作中的依赖度比较低的需求，还有我不了解的项目某个feature是在哪段代码实现的，也可以让`CC`去找，定位还是很准确的。其实Ai的`Coding`能力我是不惊讶的，但是主要是理解和找已有的项目的关键代码的能力我之前一直抱有怀疑，但是`CC`证明完全没问题，而且比我自己找的效果还要好。

`claude code`评价一下就是大多数人的选择，各种项目表现都是不错的，如果你还没开始`Vibe Coding`，那么你可以赶快体验一下`CC`，很长一段时间都是我的主要的ai变成工具。再说到CC的缺点，因为国内无法直接调用`Anthropic`的接口，所以想要用`Claude`模型是比较麻烦的。要么用一些转发代理的渠道继续用`claude`模型，要么就换其他国产模型，当然这两种方式都需要修改配置文件。

简单介绍下如何修改，有一些开源的工具可以帮你修改配置文件，比如`ccswith` `ccman`之类的，可以自己搜一下，他们不仅可以改`CC`还能改`codex`等。

如果要自己修改的话，`CC`的配置文件在`~/.claude/settings.json`，不同操作系统的目录都是这个。这个文件的格式如下:
```json:settings.json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.siliconflow.cn/v1",
    "ANTHROPIC_AUTH_TOKEN": "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "ANTHROPIC_MODEL": "deepseek-ai/DeepSeek-V3.2",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-ai/DeepSeek-V3.2",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "32000"
  },
  "permissions": {
    "allow": [],
    "deny": []
  },
  "alwaysThinkingEnabled": true
}
```
这里主要是通过一些`env`环境变量来指定的，其中如果要修改为第三方模型主要是要修改`ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_MODEL`。另外还需要保证你的这个第三方的模型供应商是有`/messages`接口的，因为`CC`是按照自家`anthropic`的接口来调用的，如果你的供应商只提供了`/chat/completions`接口（这是openai的接口规范），那么是不能通过修改配置的方式来实现的，还需要一层接口转换层。好消息是现在大多数供应商都同时提供`chat/completions`和`messages`接口形式。

如果你的供应商就正好仅提供`chat/completions`接口，那么你可以删掉上面的`env`配置，安装`claude-code-router`这个开源项目，然后根据项目说明用它来配置转换即可。

另外评价一下模型，其实我一直是`claude-sonnet`模型的用户，从`claude-sonnet-3.5`开始就没有切换到`GPT`系列模型用过，直到`gpt-5.2-codex`，当然这是后话。整体我觉得`claude-sonnet`系列模型的编程能力一直在最高水准一档。

我现在的用法是`CC` + `claude-sonnet`，我相信原配肯定是最好的。在公司就用公司提供的额度，在家里的话没有办法，只能用一些转发平台，转发平台便宜很多，但是这些转发平台，大都采用一些逆向技术，分析了某些app提供的优惠码或者套餐之类的，然后自己注册很多这种app的新号，形成一个池子，然后将客户的请求模拟成这些新号从app中发起的请求，算是灰产，但起码真的是`claude`模型。这些国内的转发平台，很多不支持内建的工具调用，例如`WebSearch` `WebFetch`，最简单的验证方式是，你配好之后打开`cc`，问一句“帮我搜索一下当前北京的气温”。看他能不能正常去网络上搜索。

这里我个人感觉`web`搜索的能力是很重要的，我的案例也有不少：
- 1 公司用了一个比较冷门的测试框架`karate`，这时候有些特殊的改动是需要到他的官网去搜索如何写的。
- 2 我在研究大模型的openai的`chat/completions`和anthropic的`/messages`接口的区别，这时候需要到他们的官网去搜索文档，以及还想要对比`openrouter`和`litellm`对参数的兼容，这些也需要搜索文档。


总之对于一些变更比较频繁，或者一些比较新的技术，web搜索能力是很重要的。

题外话：

这时候有人会说`function calling`的执行者不都是本地吗，这和模型的能力有什么关系？正常来说是本地提供一个名为`web_search`的函数，大模型判断要触发这个函数，返回给客户端参数，客户端调用一个搜索的函数。但是去年开始`openai`和`anthropic`开始提供内建的`tools`，主要就包括了`websearch`等几个。也就是搜索这个能力，在服务端集成了，这就简化了搜索的流程，不再需要2轮对话，而是1轮对话，server端发现要触发search，自己就触发，然后拿回结果进行汇总，一次性返回响应了。

如果你购买了某个转发的服务，你不妨在`claude code`中进行一下上面的测试，如果能正常进行搜索，那么这个转发平台就是真转发，好平台，如果报错不支持，那么就是比较差的。整个流程可以进行抓包观察的，如下：

第一个请求会触发本地一个`WebSearch`搜索函数，什么，本地？没错，这是`CC`封装的本地函数。刚才不是说`Server`端的内建`web_search`吗？别急，继续看下一个请求。

![img](https://i.imgur.com/LqNB8Ji.png)

第二个请求是`subagent`发起的，默认这个`agent`应该是用`haiku`小模型触发即可，但是这里我都指定了一个模型，他的结果如下，可以看出我这个转发平台是比较靠谱的。

![img](https://i.imgur.com/3OSEGm5.png)

最终`CC`页面的效果是这样的：

![img](https://i.imgur.com/bK1YpHf.png)

`WebSearch`和`WebFetch`是两个独立的`tool`上面的调用过程中实际上只用到了内建的`websearch`，而后续的`webFetch`是本地执行的，我没有抓包到`WebFetch`的`LLM`请求。从[这篇文章](https://medium.com/@liranyoffe/reverse-engineering-claude-code-web-tools-1409249316c3)的分析可知`CC`的`WebFetch`确实没有用自家的内建工具，而是本地发起的，而本地发起的流程中还需要到`claude.ai`去校验域名是否安全，而这一步在国内，如果没有配置代理会被墙，如下。

![img](https://i.imgur.com/qOJ9Ux4.png)

# Codex
`codex`是`openai`推出的与`claudecode`竞争的产品，`openai`的产品策略还不止是和`cc`对齐，在`openai`官网已经把`codex`列为专门的产品，看上去要更重视一些。甚至推出了新的模型`gpt-5.1-codex` `gpt-5.2-codex` 以及`gpt-5.3-codex`。甚至`gpt-5.3-codex`目前还没有开放`api`访问。我对`gpt`的态度一直都是比较通用，但是在编程上还是`claude`更强，但是`gpt-5.2-codex`让我改变了想法。

之前有一个简单的demo的页面+后端接口的设计实现，分别交给`CC`+`claude-sonnet-4.5`，`codex`+`gpt-5.2-codex`和`gemini-cli`+`gemini-2.5-pro`实现，然后我发现`gemini`组合的bug太多了，虽然后续一直让他修复，最终也是一个可用的状态，但是一次性交付能力比较差，而且页面设计的也一般（我忘了在哪看的说gemini前端设计很好——我是完全没感觉到，可能是偶发？）。`CC`的功能一次性交付了，但是整体页面样式非常普通，有点像早年`bootstrap`，另外就是有一些细节做的不是很好，后续让他改进也完成的不错。而`codex`组合让我眼前一亮，首先是页面样式设计的非常美观，更重要的是细节，`codex`对细节的把控非常好，加了很多小提示，切换的时候动画的流畅上也有专门的设计。当然这一个案例其实并不能说明什么，但是足够让我先把`gemini`给淘汰掉吧。

此后我也开始大量使用`codex`，他确实也惊艳到我很多次，我给这个模型的关键描述就是细节，细节怪。我还用`codex`做了以下事情：

1 把`jetbrains`的java反编译工具`fernflower`改成`java8`语法了，`codex`用了大概两个小时，将所有的代码都改成了java8总计2k行作用。中间有个改动有`bug`，导致单测无法通过，他自行分析代码，添加了一些日志和新的单测，最终找到了问题并修复了。要知道这个任务，我是先用的`CC` + `glm4.7`做的，完全做不了，写到一般就问题原来越多，以至于无法收敛，最终自己放弃了。这是`codex`最终给的改动，[repo](https://github.com/sunwu51/fernflower)，我也用这个`repo`的jar包更新了我另外一个`swapper`项目中的反编译功能，废弃了`CFR`改为用这个库了（之前是因为它是java21的望而却步）。

2 调研并写一个AI三种接口规范的demo演示页面`chat/completions` `messages` `responses`，效果非常好，甚至看到页面的时候我自己都没想到一些细节，比如我在需求描述里面有写要对比下不同接口的内建`web_search`的写法，然后我的endpoint用的是`openrouter`，结果他还调研了`openrouter`发现网关层本来也有个`plugins`可以添加WebSearch的能力，把这个也加到功能开关之一了。

![img](https://i.imgur.com/G1raLgT.png)

3 让`codex`帮我写一个反向代理`openrouter`这个代理的代理服务，背景是`openrouter`上用不了`claude`如下图，需要用VPN，这样非常麻烦，所以想到写个`cloudflare`的`worker`，把所有请求都转发到`openrouter`，然后`worker`指定只在美国部署。

![img](https://i.imgur.com/CHrHrh1.png)

这是`codex`给我的结果[repo](https://github.com/sunwu51/cf-openrouter-proxy)，我没写过一行代码，包括前面几个也是，我就在刷哔站视频，然后看他干活，效果就是他给整个`openrouter`代理了，我也可以在国内通过这个代理访问`or`的`claude` `gpt`模型了（虽然是原价，但是是正宗的渠道）。

![img](https://i.imgur.com/mc4S4vE.png)

![img](https://i.imgur.com/E5lJh7R.png)

![img](https://i.imgur.com/Bcl2eiF.png)

4 让codex帮我分析为什么`litellm`无法配置下游只有`responses`接口的供应商，结果他直接下载了`litellm`源码，然后定位到是可以的，要在`model`配置的时候添加`openai/responses/`前缀，并把对应代码给我展示。我配上之后果然好使，然后我又想让`CC`中能用`responses`接口，这还需要一个改动是怎么把上面提到的`websearch`做兼容，因为`openai`和`anthropic`都支持WebSearch但是在入参中的定义方式是不同的，`codex`帮我修改了请求转换器把这个转换完成了，最终我能在`CC`中使用`repsonses`接口的`gpt-5.3-codex`模型，并且支持`web_search` `web_fetch`工具了（openai只有`web_search`，实际上要把antropic的search+fetch 都映射成openai的search
）。

![img](https://i.imgur.com/3Me15GA.png)


`codex`如果要修改成第三方模型的话，也可以用`CCswitch`等工具，自己修改的话需要修改配置文件`~/.codex/config.toml`，其格式如下：
```toml:config.toml
model = "gpt-5.3-codex"
model_reasoning_effort = "xhigh"
disable_response_storage = true
sandbox_mode = "danger-full-access"
windows_wsl_setup_acknowledged = true
approval_policy = "never"
profile = "auto-max"
file_opener = "vscode"
model_provider = "gmn"
# web_search = "cached"
suppress_unstable_features_warning = true

[history]
persistence = "save-all"

[tui]
notifications = true

[shell_environment_policy]
inherit = "all"
ignore_default_excludes = false

[sandbox_workspace_write]
network_access = true

[features]
plan_tool = true
apply_patch_freeform = true
view_image_tool = true
unified_exec = false
streamable_shell = false
rmcp_client = true
elevated_windows_sandbox = true

[profiles.auto-max]
approval_policy = "never"
sandbox_mode = "workspace-write"

[profiles.review]
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[notice]
hide_gpt5_1_migration_prompt = true

[model_providers.gmn]
name = "gmn"
base_url = "<your_base_url>"
wire_api = "responses"
requires_openai_auth = true
```

这里需要你修改上面`model`和`base_url`，然后修改同一目录下的`auth.json`
```json:auth.json
{                                                                                                     
  "OPENAI_API_KEY": "sk-xxxxxx"
}
```

`codex`比较坑的是现在的版本已经不再支持`wire_api=chat`了，说人话就是不再支持自家的`chat/completions`接口了，只支持`responses`这个接口，大多数供应商都没有支持这个去年3月推出的规范，好像就`openai`自己在固执的使用这个接口，这个有点难绷，如果要购买一些提供`gpt`模型平台的额度的话，可以看下`gpt`这些模型支持的`endpoint`是否有`responses`如下。

![img](https://i.imgur.com/oSJHOKg.png)


`codex`相比`cc`，其他的几个优势，`codex`开源，`CC`闭源； `codex`有个mac版本的`app`； `codex`还有沙盒环境并行开发。
# OpenCode
前提：我个人感觉工具之间的差距不是很大，比如让`cc`和`codex`同时都用同一个模型，得到的效果差距不会太大。毕竟大家都是抄来抄去。你加了个什么`tool`我也会加一个。所以`OpenCode`作为一个号称开源版本的`ClaudeCode`，很受欢迎就是理所当然的了。据说是逆向分析了`CC`在各个场景下发送的数据包，就像前面介绍`web_search`我进行的抓包一样，然后根据抓包的内容就知道了，不同场景的提示词。然后稍微改吧改吧，就整合出了开源版本的`CC`，早期应该还有另外几个“开源版CC”，但是`OpenCode`团队在各方面都做的最好，所以就成为活下来的那一个了。所以我认为那些对比`OpenCode` vs `ClaudeCode`，用相同的模型，还能对比出巨大差异的，都是扯淡。

有了上面这层理解，再来审视`OpenCode`这个工具，思路就清晰了。`OpenCode`的接入使用可以说是最友好的，刚启动或者`/connect`就可以选择很多家供应商，然后配置key和选择模型。

![img](https://i.imgur.com/E5WCBSO.png)

如果你是代理供应商不在这里面，你还可以修改一下`~/.config/opencode/opencode.json`这个配置文件，来增加供应商，如下是我增加了一个本地的`litellm`服务的配置。
```json:opencode.json
{                                                                                                                                              
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "litellm": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "LiteLLM",
      "options": {
        "baseURL": "http://localhost:6043/v1"
      },
      "models": {
        "v3/gpt-5.3-codex": {
          "name": "v3/gpt-5.3-codex"
        },
        "v3/claude-opus-4-6-max": {
          "name": "v3/claude-opus-4-6-max"
        },
        "gmn/gpt-5.3-codex": {
          "name": "gmn/gpt-5.3-codex"
        }
      }
    }
  }
}
```
这里还是围绕前面说的`websearch` `webfetch`来说一下`OpenCode`与其他两个工具的不同，我们前面说的这个网页能力被`openai/Anthropic`集成到server端了，他们出的工具`CC/codex`也就用了server端搜索的能力。但是`OpenCode`要考虑的是各个供应商的不同的模型，所以对于搜索功能给出的实现是本地的搜索。

如下，我分别用支持`claude-opus-4-6-max`和`deepseek`进行了web搜索，他们都是能做到的。

![img](https://i.imgur.com/HWUf5Uj.png)

![img](https://i.imgur.com/GiainLx.png)

![img](https://i.imgur.com/v0vdGsh.png)

这里的搜索工具还是像之前一样，用两轮对话的方式，本地发起查询。这样对大多数模型供应商的兼容性更好，当然也会有另外一个问题，就是如果有时候要搜索一些框架或者文档，比如`claude`的官方文档，用中国的`ip`就看不了。还有一些会很慢，比如`spring`官方文档的页面等，甚至有时候国内访问github都超时，如下图。总之有利有弊吧。

![img](https://i.imgur.com/u2UWwnZ.png)


另外值得一提的是`OpenCode`有个`OhMyOpenCode`(OMO)插件，默认配置了多个agent来完成不同类型的任务，由一个管家`agent`调度多个`subagent`而不同的`subsagent`可以配置不同的模型。另外`OMO`会帮忙安装一些`MCP`工具，其中就有`WebSearch`(基于`https://mcp.exa.ai/mcp`)，原来`OpenCode`只有`WebFetch`功能，需要模型直接按照经验给出要访问的`URL`才行，而有了`WebSearch`可以先搜索信息，再找到对应的网址，这样信息更准确。额外再强调一下`openai`的`websearch`是集合了`websearch` `webfetch` `grep`三合一的功能。

下面是三种cli进行网页搜索和爬取的流程对比：

![img](https://raw.githubusercontent.com/sunwu51/notebook/refs/heads/master/26.02/svgs/opencode-search-fetch-flow.svg)

![img](https://raw.githubusercontent.com/sunwu51/notebook/refs/heads/master/26.02/svgs/claudecode-search-fetch-flow.svg)

![img](https://raw.githubusercontent.com/sunwu51/notebook/refs/heads/master/26.02/svgs/codex-search-fetch-flow.svg)

# 供应商
因为国内这个环境的问题，我们就不说`openai` `anthropic` `google`等这些条件苛刻的官方渠道了。

能够正规访问到`gpt/claude`模型的供应商就是`openrouter`，价格也是官方的价格，但是比较坑的就是去年下半年的时候，他也加了地区判断，中国的ip无法访问`gpt/claude`等模型，其他没有地区政策的模型还是正常访问的。所以这也就是为啥上面，我提到让`codex`帮我写了个`openrouter`的代理服务了。靠这个代理服务就可以正常访问了。

各种转发平台，我现在手头有个四五个转发平台，价格波动也比较大，比如有个转发平台他同一个模型有多个分组，其实是不同的渠道，有的是逆向，有的是官转。如果是官方转的渠道，他基本就是原价。而如果是逆向的，他又不支持`web_search`这些功能。对于逆向渠道会便宜不少，大概便宜5到15倍，取决于逆向渠道，我个人就是看手里这几个哪个模型便宜，就用哪个，因为不同模型在不同平台，细算下来又有差异。

最后我将各个不同的供应商和他们支持的自己会用到的模型，配置到本地的`litellm`中，这样相当于自己做了一个网关汇总，就不需要每个应用里面再去单独配置各个供应商了。

总之不差钱的富哥就用`openrouter`原价吧，如果是`vibecoding`的话，算上`prompt cache`我觉得一天也就两三刀，（我是指在家自己用的项目，工作要每天都用的话不止这个数）大概十几块钱，一个月的话估计也就用个10来天，算下来一百多，好像和开会员差不多了，但是突出一个随用随付，没有心理负担。如果是家境贫寒，那我建议直接用`opencode` + `zen`提供的免费模型，一条龙给你安排明白了，而且免费的模型还真不差`glm5` `minimax`都是国产巅峰了。如果心有不甘还想用`claude`这些模型的，那就搜一搜中转的平台，货比三家，少充点对比下价格倍率，和支持的功能（建议测下是否支持WebSearch）。然后咸鱼搜一搜有没有渠道，以及看看搭伙能不能几个人共用`plus`之类的。


# 锐评
三个`cli`工具的对比`CC`, `Codex`, `OpenCode`，从能力上我觉得差距是不大的。从页面美观上，`OpenCode`要更好一些，尤其是在`Windows`环境下。另外就是查询最新信息的`web`功能上，如果是国外用户，那这三个工具都没有问题，但是如果是国内用户，网页在哪里发起的访问，是否能访问就是一个绕不开的问题。（原谅我全篇都在关注`web`的扩展，因为我写很多东西真的需要依赖上网的功能）如果考虑到`websearch` `webfetch`的兼容性，那我觉得满血的`codex` + `gpt-codex转发`，在国内是最友好的，这也成为了我目前在家环境的主要开发方式。因为所有网页访问都是委托给`llm`供应商来完成的，供应商其实最终是转发到了`openai`，他是可以无墙访问`github` `google`等等各种技术网站的。当然如果你配置个`HTTPS_PROXY`环境变量，然后启动`CC`也没问题，只是如果是渠道代理的可能会有`chat`请求多绕几圈的问题。`codex`的坑在于，新版本只支持`responses`这个非主流接口了，除了`openai`很少有其他供应商做这个接口的兼容，所以如果你用的不是`gpt`模型，没有`responses`接口的话，那我建议放弃`codex`吧，不然还要找转换工具。

模型的对比，从编程能力上，`opus-4.6`和`codex-5.3`应该是第一档的，不论是实际用下来的效果还是网上的benchmark都是这样，`gemini`的话，一直说他的前端能力很强，这个我的体验不是很明显，可能我审美太拉了。另外是国内的模型`MiniMax` `Glm5` `Kimi2.5`这几组效果也不错，对于普通的需求是够用的，属于第二档了。我的体感就是，国内模型在编程细节上还有待提升，另外就是没有“匠心”精神，之前有个让`glm`把我的反编译的工具从`cfr`改成其他的，结果给我好几个方案，然后我说随便哪个只要实现就行，结果写了一个多小时，消耗了我20块钱的token，最后什么也没干，把改动都回滚了，然后给出如下答卷（心态崩了）。

![img](https://i.imgur.com/IF2b0LT.png)

从模型价格上对比，因为`vibe coding`是非常消耗`token`的，所以价格也是一个重要的参考项。以下价格均来自`openrouter`平台，如果在各自平台有订阅，或者特殊供应商有优惠，价格也会有波动，这里主要是个参考。
- `claude-opus-4.6` I/O/W $5/M $25/M $10/k
- `claude-sonnet-4.6` I/O/W $3/M $15/M $10/k
- `gpt-5.2-codex` I/O/W $1.75/M $14/M $10/k
- `gemini-3.1-pro-preview` I/O $2/M $12/M

相比之下，国产模型在价格上的优势巨大：
- `qwen-3.5-plus` I/O $0.4/M $2.4/M
- `minimax-2.5` I/O $0.3/M $2.1/M
- `glm5` I/O $0.3/M $2.55/M
- `kimi2.5` I/O $0.23/M $3/M

