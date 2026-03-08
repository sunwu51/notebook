---
title: Websearch工具对比
tags:
  - websearch
  - 工具
  - ai
  - agent
date: 2026-03-08T12:00:00+08:00
---

# Websearch工具对比

## 前言
今天继续来死磕`websearch`工具，这种类型的工具主要是分为几个大类：
- 1 搜索引擎供应商提供的`api`已经凉了（`google`和`baidu`已经不提供此类型的`API`，`bing`官方搜索api去年11月下线）。
- 2 爬取搜索引擎结果的`SERP(search engine result page) API`的供应商，如果`serpAPI`、`serper`、`searchAPI`等。 
- 3 自建搜索API的，现在也大都和`AI`集成的比较丝滑，`EXA`、`Tavily`、`Brave`、`Linkup`等。
- 4 用爬虫技术发起搜索引擎请求的工具，如`Duckduckgo MCP`、`orz-mcp`等。
- 5 AI模型自带搜索功能`openai` `anthropic` `perplexity` 等。

这些工具，有一些差异，除了价格和免费额度之外，在功能上也有差异，搜索的入参上基本的参数就是关键词，返回值基本是`title`+`url`+`summary`的搜索结果数组，这和政策人类使用搜索引擎看到的页面内容一致。这些是基本的字段，有些工具提供了更多样的配置和返回信息，例如搜索完之后会把每个`url`里面的内容拉取出来，进行一些简单的处理转为`markdown`格式，然后在输出结果中展示，还有的会把页面内容再和搜索关键词进行相关度判断，只返回相关度高的段落，我们先把这类能力统称为"深度提取"能力。还有性能上的一些限流，

## 对比

表格中的价格部分，按照单次搜索返回结果`<=10`来计算，很多平台搜索加过超过一个数量会翻倍算价格；接口形式这里是列出官方支持的形式，毕竟mcp形式都可以基于rest封装；注册条件，有的只需要oauth登录google或者github就可以完成注册，也认为是需要邮箱。

| 工具 | 免费额度 | 价格 |  接口形式 | 深度提取 | 是否提供fetch |  限流 | 注册难度 | 其他功能 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| serpAPI   | 250次/月 | 订阅制：最低每月$25/k次 | rest | ❌️ | ❌️ | 免费额度50次/h | 需要邮箱和手机认证 | 支持数个搜索引擎的结果 |
| searchAPI | 100次一次性额度 | 订阅制：最低每月$40/10k次，折合$4/k次 | rest | ❌️ | ❌️ | 免费额度20次/h  | 需要邮箱和手机认证 | 支持数个搜索引擎的结果 |
| serper   | 2500次一次性额度 | 用量付费：最低充值额度是$1/k次 | rest, mcp | ❌️ | ❌️ | 未明确说明 | 需要邮箱 | 充值越多单次搜索均价会越低 |
| exa       | 匿名免费使用，不保证稳定性 | 用量付费：$7/k次 | rest, mcp | ✅️ | ✅️（mcp默认没开需要自己加参数） | 匿名用户无保障，实测2qps报错 | 需要邮箱，匿名使用则不需要注册 | 支持域名，日期等过滤参数  | 
| tavily    | 1000次/月 | 用量付费：$8/k次 | rest, mcp | ✅️ | ✅️ | 免费额度100次/min | 需要邮箱 | 支持域名，日期，是否总结答案等参数  |
| brave     | 1000次/月(需填信用卡) | 用量付费：$5/k次 | rest, mcp | ✅️ | ❌️ | 免费部分和付费部分一致50qps | 需要邮箱，信用卡 | 支持复杂的搜索参数，返回结果也结构也较为复杂  |
| linkup    | 1000次/月 | 用量付费：€5/k次 | rest | ✅️ | ✅️ | 免费部分和付费部分一致10qps | 需要邮箱 | 支持域名，日期等过滤  |
| openai: web_search_tool    | 无 | 用量付费：$10/k次 | builtin tool | ✅️ | ✅️ | - | - | - |
| anthropic: web_search_tool | 无 | 用量付费：$10/k次 | builtin tool | ✅️ | ✅️ | - | - | - |
| perplexity: web_search_tool, search api | 无 | 用量付费：$5/k次 | builtin tool/rest | ✅️ | ✅️ | 初级付费用户3qps | 需要邮箱，信用卡 | 支持域名、日期等过滤 |


`duckduckgo-mcp` `orz-mcp`等都是通过模拟爬虫访问搜索引擎页面，然后抓取内容，所以都是免费的，并且稳定性没有保证，也不支持深度搜索等。

## 对个人使用的建议

如果是个人使用，需要根据个人用量进行评估，普通的用户每天会有几十次搜索，多的时候上百次，那么一个月用量其实就在1k~10k次的区间，对于这类用户，显然是需要每月刷新免费额度且额度在千次左右的`exa` `tavily`  `linkup` `brave`是最合适的，这也是`ai`时代比较受欢迎的工具。

首先推荐的肯定还是`exa`，因为可以纯免费的体验使用，虽然不保证稳定性，但是免费的要什么自行车，并且稳定性，限流后也可以让llm重试搜索。如果需要他的`fetch`功能的话，记得要修改下`mcp`的url，默认是没有`crawling_exa`工具的。
```
https://mcp.exa.ai/mcp?tools=web_search_exa,web_search_advanced_exa,get_code_context_exa,crawling_exa,company_research_exa,people_search_exa,deep_researcher_start,deep_researcher_check,deep_search_exa
```
实测下来是同一个出口的ip会有2qps限流，1qps的时候没问题，2qps直接报错
```json
{"code":-32000,"message":"You've hit Exa's free MCP rate limit. To continue using without limits, create your own Exa API key.\n\nFix: Create API key at https://dashboard.exa.ai/api-keys , and then update Exa MCP URL to this https://mcp.exa.ai/mcp?exaApiKey=YOUR_EXA_API_KEY"}
```

第二推荐的是`tavily`，这个工具是有`answer` `search_depth`等参数的，对于agent非常友好，大部分时候其他工具需要先调用`search`，然后从搜到结果的title中看哪个最相关，再去`fetch`，跟我们自己搜东西一样，但是`tavily`有深度提取总结答案的能力，所以很多时候只需要一次`advanced + answer`的`search`就够了，不再需要`fetch`了，注意这种搜索是算2个credits。这样1k个免费额度就只有500次搜索了，平均每天只有十几次，额度就比较紧张了，此外`tavily`和`exa`一样有1qps限流(免费额度)，这样如果同时触发两次搜索，第二次就被429了，比较尴尬。

当然也有解决方案：对于白嫖党，这里推荐一个方法，就是多注册几个`tavily`账号，`github` `google`登录就可以注册，使用qq邮箱、学校邮箱、同学帮忙等又可以多注册几个，（注意不要用mock email网站注册，账号会被封，别问我为啥知道），这样每个注册的账号可以拿到一个apikey。一个用完了，就可以换下一个，但是来回换也比较麻烦，可以写一个转发的服务，把这些key放到一个池子里，这个转发服务每次随机从池子里选一个key出来用，如果有10个key的话，就有1w/月，大概每天300次的平均搜索额度，绝大部分个人用户都够了，另外随机选key也很大程度避免了1qps的限制问题。可以直接部署这个[项目](https://github.com/sunwu51/tavily-proxy)到`cloudflare worker`或者参考这个思路，部署到其他没被墙serverless平台`netlify`,`deno`, `aws lambda`, `code run`等。

而同类型的`brave`和`linkup`从使用条件、价格和功能上稍微劣势，就没有那么推荐了。而对于`serp`就更不推荐了，虽然他们的整体响应时间更快，但是大部分的免费额度太少了，对agent也没有前面几个友好。

最后也推荐，纯免费的自己发起请求的爬虫类`mcp`，`duckduckgo-mcp`本地使用也没问题的，极少情况会触发`duckduckgo`的限流。另外还有一些基于`playwright`打开浏览器访问搜索引擎进行搜索，然后把结果返回的，这种更稳定，只不过占用资源较多，启动速度也较慢。

另外我个人写的`orz-mcp`也是通过爬虫`brave`和`duckduckgo`，然后做去重。`stdio`版本`npx -y orz-mcp`就是本地访问这两个搜索引擎爬取数据的。

也有`remote`版本，因为个人比较习惯配置`remote`版本(比较不占本地资源)，但是也会遇到请求qps高了被限流的问题，`brave`我懒得搞了，对于`duckduckgo`我则是用了5层fallback机制，有`netlify` `coderun` `lambda` `openworker` `spin`等多个代理分别去爬，直到有一个能爬到数据，所以相对来说还比较可靠，起码自己用肯定是没问题的。
