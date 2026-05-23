---
title: CSP
date: 2026-05-12T20:24:00+08:00
tags:
  - CSP
  - 安全
---

# CSP
`CSP`(Content Security Policy)是一个安全性标准，用于防止跨站脚本攻击。

设置方式主要是两种，一种是`HTTP header`，另一种是`meta tag`。
```html
# header:
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';

# meta tag:
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; object-src 'none';"
/>
```

默认不设置的话，是不做任何限制，所有来源的资源都可以被加载。

# 格式与取值
csp有多个指令组成用分号隔开，最后一组后面也加分号结尾。每个指令有指令名和允许的来源组成。
```
指令名 允许来源;
```

指令名常见取值：
- `default-src`: 默认来源，是指其他没有专门设置的指令的默认值。
- `script-src`: js来源
- `style-src`: css来源
- `img-src`: 图片来源
- `font-src`: 字体来源
- `connect-src`: 连接来源(fetch xhr ws等api)
- `media-src`: 媒体来源
- `object-src`: 对象来源
- `frame-src`: iframe来源
- `frame-ancestors`: 允许当前页面被谁iframe嵌入
- `worker-src`: worker来源
- `manifest-src`: PWA manifest来源
- `base-uri`: 限制base标签
- `form-action`: 表单提交来源
- `upgrade-insecure-requests`: 自动升级到https协议
- `report-uri`: csp违规上报地址


常见source的取值：
- 当前域名：`'self'` 等价于 `https://www.example.com/*`
- 完全禁止：`'none'` 注意这里要加单引号因为是转有写法，下面的协议就不要加引号。
- 允许所有来源：`*`
- 允许某个协议：`https:`，`data:` `blob:`注意冒号
- 通配符： `*` `*.example.com` `*.example.com/path` `*.example.com:8080`
- 内联：`unsafe-inline`一般是针对内联js和css的控制，允许`html`中直接包含`script/style`标签。
- eval: `unsafe-eval`允许`eval`执行动态js。
- nonce：`nonce-random`随机生成一个nonce值，js标签中需要设定这个nonce值才被允许`<script nonce="randomNonceValue">...`，防止注入
- hash： `sha256-xxxx`允许加载指定hash值的资源，防止注入
- wasm：`wasm-unsafe-eval`这是js的策略取值，允许编译wasm文件

一个指令可以指定多个source，用空格隔开，例如
```
script-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';
```

# 插件
chrome插件的内置页面，可以通过配置文件中进行csp的配置，如果不配置默认等价于以下配置。
```json: manifest.json
 "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self';",
    "sandbox": "sandbox allow-scripts allow-forms allow-popups allow-modals; script-src 'self' 'unsafe-inline' 'unsafe-eval'; child-src 'self';"
  }
```

并且chrome插件规定了最低配置项如下，这是最宽松的配置方式，不能比这个规则更宽松，例如添加`unsafe-inline`是不允许的，即不能在插件页面中内联js标签。
```json
{
  // ...
  "content_security_policy": {
    "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';"
  }
  // ...
}
```

如果想要在插件的内置页面中再注入脚本或引用其他内容，可以使用`sandbox`，沙盒页面和普通页面都是普通的html，但是指定为沙盒页面之后，就不能再使用`chrome.xxx`的api了，这样做是为了防止插件脚本可以在沙盒页面中注入脚本，说白了。