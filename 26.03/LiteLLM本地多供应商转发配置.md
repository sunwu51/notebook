---
title: LiteLLM本地多供应商转发配置
tags:
  - litellm
  - 转发
  - 网关
  - 配置
date: 2026-03-14T12:00:00+08:00
---

# LiteLLM本地多供应商转发配置

## 前言
这篇记录一下如何用`LiteLLM`在本地配置多个转发供应商，并通过`fallback`机制保证可用性。核心是维护一个`config.yaml`，把对外模型名、下游接口协议和兜底关系都写清楚。

## config.yaml示例
下面是可直接参考的配置模板：

```yaml: config.yaml
general_settings:
  disable_database: true
  disable_analytics: true
  disable_sessions: true
  debug: true
  log_level: "DEBUG"
  log_verbose: true

litellm_settings:
  drop_params: true

model_list:
  - model_name: gpt-5.4
    litellm_params:
      model: openai/responses/gpt-5.4
      api_base: "https://xxx/v1"
      api_key: "sk-xxx"
      extra_headers:
        Accept-Encoding: identity

  - model_name: gpt-5.4-back
    litellm_params:
      model: openai/responses/gpt-5.4
      api_base: "https://xxx"
      api_key: "sk-xxx"
      extra_headers:
        Accept-Encoding: identity

  - model_name: claude-sonnet-4-6
    litellm_params:
      model: anthropic/claude-sonnet-4-6
      api_base: "https://xxx"
      api_key: "sk-xxx9"
      extra_headers:
        Accept-Encoding: identity

  - model_name: claude-sonnet-4-6-back
    litellm_params:
      model: anthropic/claude-sonnet-4-6
      api_base: "https://xxx"
      api_key: "sk-xxxx"
      extra_headers:
        Accept-Encoding: identity

router_settings:
  forward_client_headers_to_llm_api: true
  fallbacks:
    - gpt-5.4: ["gpt-5.4-back"]
    - claude-sonnet-4-6: ["claude-sonnet-4-6-back"]

  num_retries: 0
  allowed_fails: 2
  cooldown_time: 60
  timeout: 10
```

## 关键字段说明
- `model_name`是对外暴露给客户端调用的模型名。
- `litellm_params.model`决定LiteLLM如何调用下游供应商接口。
- `api_base`是否需要以`/v1`结尾取决于你的转发平台实现，有的平台要求`/v1`，有的平台不需要，建议到自己的转发平台文档或控制台确认。
- `extra_headers`用于添加额外请求头。示例里的`Accept-Encoding: identity`用于禁止压缩响应，便于抓包查看真实内容。
- `extra_headers`里也可以追加其他头，例如`User-Agent`。有些下游供应商只放行特定客户端时可以这样配置：
  - `User-Agent: codex_cli_rs/0.112.0 (Windows 10.0.19045; x86_64) WindowsTerminal`
  - `User-Agent: claude-cli/2.1.41 (external, cli)`
- 当`litellm_params.model`为`openai/responses/...`时，会按`responses`接口转发到下游，下游实际收到的模型名是`openai/responses/`后面的部分。  
  以上面配置为例，下游收到的模型名是`gpt-5.4`。
- 当`litellm_params.model`为`openai/...`时，会按`chat/completions`接口转发到下游。
- 当`litellm_params.model`为`anthropic/...`时，会按`messages`接口转发到下游。

## 对外接口暴露行为
- LiteLLM对外会同时提供`chat/completions`和`messages`接口。
- 如果下游模型配置里使用了`openai/responses/...`，LiteLLM也会额外提供`responses`接口。

## fallback机制说明
`router_settings.fallbacks`可以配置模型兜底关系，例如：

```yaml
fallbacks:
  - gpt-5.4: ["gpt-5.4-back"]
  - claude-sonnet-4-6: ["claude-sonnet-4-6-back"]
```

这表示当`gpt-5.4`对应的转发供应商异常或不可用时，会自动切换到`gpt-5.4-back`，避免单点故障影响正常使用。
同理，`claude-sonnet-4-6`异常时会自动切换到`claude-sonnet-4-6-back`。

## 安装与启动
先安装`LiteLLM Proxy`相关依赖（官方`Proxy`快速开始使用这个安装方式）：

```bash
pip install "litellm[proxy]"
```

然后在`config.yaml`同级目录启动代理：

```bash
litellm --config config.yaml --port 6043
```

启动后即可通过本地`6043`端口调用对应的`chat/completions`、`messages`（以及配置了`openai/responses/...`时的`responses`）接口。

## 抓包调试配置（可选）
如果需要抓包查看LiteLLM发给下游供应商的实际请求内容，可以配合`Charles`或其他抓包工具使用。

先在抓包工具中开启`HTTPS`抓包功能，通常会提供一个本地代理端口，例如`9999`。  
然后在启动LiteLLM之前，先设置代理环境变量。Windows `PowerShell/pwsh`使用`$env:`写法，`macOS/Linux`一般使用`export`。

Windows `PowerShell/pwsh`示例：

```powershell
$env:HTTPS_PROXY = "http://localhost:9999"
```

`macOS/Linux`示例：

```bash
export HTTPS_PROXY="http://localhost:9999"
```

如果抓包工具使用了自签名证书，还需要让LiteLLM进程信任该证书。可以把从`Charles`等工具导出的`pem`证书保存到本地，然后设置对应环境变量。

Windows `PowerShell/pwsh`示例：

```powershell
$env:SSL_CERT_FILE = "C:\Users\me\Desktop\code.pem"
```

`macOS/Linux`示例：

```bash
export SSL_CERT_FILE="/Users/me/Desktop/code.pem"
```

最后再启动LiteLLM：

```bash
litellm --config config.yaml --port 6043
```

这样LiteLLM请求会先走本地抓包代理，并且能正确通过`TLS`校验，便于查看完整请求与响应内容。
