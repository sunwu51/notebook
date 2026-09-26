---
title: 如何创建住宅ip代理
date: 2026-09-26T23:00:00+08:00
tags:
  - vpn
  - mihomo
  - clash
  - 住宅ip
---
# 1 为什么要住宅ip代理
科学上网机场一般使用的是机房的共享的ip，这对于普通看视频刷网页没有问题，但是对于一些有特殊风控的服务，会限制机房ip的访问，甚至是将你的账号拉黑。

比如，`openai`和`anthropic`这样的ai公司，发现你是机房ip打过来的订阅账号的请求，可能（注意是可能）会把你的账号进行标记，`openai`会将模型降智到低端模型，提供差的服务，但用户浑然不知，`anthropic`则是非常严格的封号策略。

可以到[ippure](https://www.ippure.com/)和[cleanip](https://cleanip.io/)查看下你的当前ip或者手动输入ip的纯净度和信誉评分。

# 2 住宅ip怎么用
一般来说，你到各种住宅ip的平台购买住宅ip的时候，会有两种大的类型，一种是动态住宅ip，一种是静态住宅ip。顾名思义，动态ip就是会动态切换这个住宅ip的地址，而静态ip则是固定的一个ip出口。两种类型的计费方式不太一样，一般动态ip使用的是流量计费，一般是1美元到2美元每GB，永久有效；静态ip则是按照时间，每个月大概3美元到5美元，如果是独享的可能会贵一些。


## 2.1 住宅ip怎么连
这里推荐一个平台吧[1024proxy](https://api.1024proxy.com/share/rfv6hsw1p)，主

购买后一般会给`username:password:server:port`四组信息，可以直接作为`http`或`socks5`类型配置到`mihomo`中，参考上一篇文章的配置方式，但这仅限国外，如果是在国内，你的电脑的mihomo直接配置这个信息，一般是不会连上的，因为这些住宅ip的provider都是合规的，你直接配置就能用，那是机场，是违法行为，所以他们都对国内ip进行了直连的屏蔽，所以你还需要用之前文章提到的`dialer-proxy`的配置，用机场作为第一跳，跳出去之后再连接静态/动态的住宅ip。

当然了，机场的配置会是比较脆弱的环节，为啥呢？因为机场有可能会跑路，那节点都失效了，第一跳就没了，或者机场订阅链接要更新，机场节点不稳定，等等。这里直接推荐一种不用机场，直接用cloudflare的worker节点作为第一跳的方式。你需要注册一个cloudflare账号，并购买一个域名（我个人觉得域名这东西，每个开发者都应该有一个，他真的不贵一个com或org的域名，一年才10刀左右，相比你一个月的openai会员就至少20刀了）

准备好cloudflare账号和域名之后，你要到cloudflare中创建一个worker，代码如下，这样这个worker节点就是一个`vless`协议的节点了，他的作用是转发到你的住宅ip节点上。
```js
import { connect } from 'cloudflare:sockets';

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.headers.get('Upgrade') !== 'websocket' || url.pathname !== '/ws') {
      return new Response('ok');
    }

    const [client, ws] = Object.values(new WebSocketPair());
    ws.accept();
    ws.binaryType = 'arraybuffer';

    const early = decodeEarlyData(req.headers.get('sec-websocket-protocol'));
    console.log('[ws] open, early data bytes:', early ? early.length : 0);

    handle(ws, env, early);
    return new Response(null, { status: 101, webSocket: client });
  },
};

function handle(ws, env, early) {
  let writer = null;
  let started = false;
  let buffer = new Uint8Array(0);   // 攒够 VLESS 头之前的数据
  const pending = [];
  let upBytes = 0;
  let downBytes = 0;

  const onData = async (data) => {
    if (!data.length) return;                    // 忽略空帧
    if (writer) { upBytes += data.length; return writer.write(data); }
    if (started) { pending.push(data); return; }

    buffer = concat(buffer, data);
    if (buffer.length < 24) {
      console.log('[vless] header incomplete, buffered:', buffer.length);
      return;
    }
    started = true;

    const h = parseVless(buffer, env.UUID);
    console.log('[vless] header:', h ? `${h.host}:${h.port}` : 'PARSE_FAIL');
    if (!h) return ws.close();

    try {
      const sock = connect({ hostname: h.host, port: h.port });
      sock.opened.then(
        () => console.log('[tcp] connected to', `${h.host}:${h.port}`),
        err => console.log('[tcp] connect failed:', err.message),
      );

      const w = sock.writable.getWriter();
      ws.send(new Uint8Array([h.version, 0]));   // VLESS 响应头

      if (h.payload.length) { upBytes += h.payload.length; await w.write(h.payload); }
      for (const p of pending) { upBytes += p.length; await w.write(p); }
      writer = w;

      sock.readable
        .pipeTo(new WritableStream({
          write(chunk) { downBytes += chunk.length; ws.send(chunk); },
          close() {
            console.log('[tcp] remote closed, up:', upBytes, 'down:', downBytes);
            ws.close();
          },
        }))
        .catch(err => {
          console.log('[tcp] pipe error:', err.message, 'up:', upBytes, 'down:', downBytes);
          ws.close();
        });

      ws.addEventListener('close', () => {
        console.log('[ws] client closed, up:', upBytes, 'down:', downBytes);
        sock.close();
      });
    } catch (err) {
      console.log('[tcp] connect error:', err.message);
      ws.close();
    }
  };

  // 串行处理消息，保证 Blob 异步读取时不乱序
  let chain = Promise.resolve();
  ws.addEventListener('message', (e) => {
    chain = chain.then(async () => {
      let data;
      if (typeof e.data === 'string') data = new TextEncoder().encode(e.data);
      else if (e.data instanceof ArrayBuffer) data = new Uint8Array(e.data);
      else if (typeof e.data?.arrayBuffer === 'function') data = new Uint8Array(await e.data.arrayBuffer()); // Blob
      else data = new Uint8Array(0);

      if (!writer) console.log('[ws] msg type:', e.data?.constructor?.name, 'len:', data.length);
      await onData(data);
    }).catch(err => console.log('[ws] msg error:', err.message));
  });

  if (early) chain = chain.then(() => onData(early));
}

function decodeEarlyData(header) {
  if (!header) return null;
  try {
    const b64 = header.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    return Uint8Array.from(bin, c => c.charCodeAt(0));
  } catch {
    return null;
  }
}

function concat(a, b) {
  const r = new Uint8Array(a.length + b.length);
  r.set(a);
  r.set(b, a.length);
  return r;
}

function parseVless(buf, uuid) {
  const id = [...buf.slice(1, 17)].map(b => b.toString(16).padStart(2, '0')).join('');
  if (id !== uuid.trim().replace(/-/g, '').toLowerCase()) return null;
  let i = 18 + buf[17];                 // 跳过 addons
  if (buf[i++] !== 1) return null;      // 只支持 TCP
  const port = (buf[i] << 8) | buf[i + 1]; i += 2;
  const type = buf[i++];
  let host;
  if (type === 1) { host = buf.slice(i, i + 4).join('.'); i += 4; }
  else if (type === 2) { const n = buf[i++]; host = new TextDecoder().decode(buf.slice(i, i + n)); i += n; }
  else return null;
  return { version: buf[0], host, port, payload: buf.slice(i) };
}
```

然后到setting中添加一个变量UUID，值就是一个随机的UUID即可，网上可以搜uuid生成器生成一个，这就是当前server的密码。

![image](https://i.imgur.com/cLraxb5.png)

最后配置一个域名，注意不要用`vpn` `proxy`之类的域名，假装是个静态站点就好了，比如`web` `site` `static`等。

![image](https://i.imgur.com/dr3I4bz.png)


这样就配好了，现在你有两组信息了：
- 住宅ip的`username:password:server:port`
- cloudflare的`server:UUID` (server就是域名)

接下来到你的`mihomo`中可以添加配置了，如果你的mihomo只是为了用这一组住宅ip，你就直接这样配置：
```yaml :config.yaml
# 其他基础配置略过
# ...
proxies:
  - name: cf-worker
    type: vless
    server: 你的worker配置的域名
    port: 443
    uuid: xxx
    udp: false
    tls: true
    servername: 你的worker配置的域名
    client-fingerprint: chrome
    network: ws
    ws-opts:
      path: /ws
      headers:
        Host: 你的worker配置的域名
  - name: 住宅ip
    type: http
    server: 住宅ip的server地址 # 静态ip的话就是个ip地址
    port: 住宅ip的端口
    username: xxx
    password: xxx
    dialer-proxy: cf-worker   # 一定记得配置第一跳是cf-worker
  # 如果有多个可以继续配置

proxy-groups:
  - name: US-RESI
    type: select
    proxies:
      - 住宅ip

rules:
  # 简单示例，将openai，claude的域名配置为走住宅ip
  - DOMAIN-SUFFIX,ipinfo.io,US-RESI
  - DOMAIN-KEYWORD,openai,US-RESI
  - DOMAIN-KEYWORD,chatgpt,US-RESI
  - DOMAIN-KEYWORD,claude,US-RESI
  - DOMAIN-KEYWORD,anthropic,US-RESI
  - DOMAIN-SUFFIX,oaistatic.com,US-RESI
  - DOMAIN-SUFFIX,oaiusercontent.com,US-RESI
  # 其余规则接在后面，最后一条通常是 MATCH
  - MATCH,DIRECT
```

如果你是已经有了机场的订阅，没法直接改配置文件的话，可以添加全局扩展脚本，如下：

![image](https://i.imgur.com/t8cIckr.png)

```javascript
function main(config, profileName) {
  const worker = {
    name: 'cf-worker',
    type: 'vless',
    server: "你的worker配置的域名",
    port: 443,
    uuid: 'xxx',
    udp: false,
    tls: true,
    servername: '你的worker配置的域名',
    'client-fingerprint': 'chrome',
    network: 'ws',
    'ws-opts': { path: '/ws', headers: { Host: '你的worker配置的域名' } },
  };

  const resi = [
    {
      name: '住宅ip',
      type: 'http',
      server: 'xxx',
      port: xxx,
      username: "xxx",
      password: "xxx",
      'dialer-proxy': 'cf-worker',
    }
    // 如果有多个可以继续配置
  ];

  config.proxies = [worker, ...resi, ...(config.proxies || [])];

  config['proxy-groups'] = [
    { name: 'US-RESI', type: 'select', proxies: resi.map(p => p.name) },
    ...(config['proxy-groups'] || []),
  ];

  config.rules = [
    'DOMAIN-SUFFIX,ipinfo.io,US-RESI',
    'DOMAIN-KEYWORD,openai,US-RESI',
    'DOMAIN-KEYWORD,chatgpt,US-RESI',
    'DOMAIN-KEYWORD,claude,US-RESI',
    'DOMAIN-KEYWORD,anthropic,US-RESI',
    'DOMAIN-SUFFIX,oaistatic.com,US-RESI',
    'DOMAIN-SUFFIX,oaiusercontent.com,US-RESI',
    ...(config.rules || []),
  ];

  return config;
}
```
效果就是其他域名都还按照机场订阅的规则来匹配，而openai，claude的域名就走住宅ip了，哦对，需要时规则模式，而不是直连或全局模式。

