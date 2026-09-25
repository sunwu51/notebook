---
title: mihomo配置学习
date: 2026-09-25T13:00:00+08:00
tags:
  - vpn
  - mihomo
  - clash
---

# 1 前言
`mihomo`是目前用的最多的vpn客户端，大多数机场也都是分发的`mihomo`格式的订阅链接为主，他的前身是`clash.meta`，最终自`clash`演进而来，不过`clash`已经被约谈，2023年停止更新了。`clash`派系是`yaml`配置格式，也是本文介绍的重点。其他的vpn比如`sing-box`、`v2rayn`等都是`json`格式，我们这里不做讨论。

`mihomo`配置的最简单形式如下：
```yaml
mixed-port: 7890                 # HTTP + SOCKS5 混合端口
allow-lan: false                 # 是否允许局域网设备连接
mode: rule                       # rule / global / direct
log-level: info                  # silent / error / warning / info / debug

proxies:                         # 节点配置
  - name: "一个socks5代理节点"
    type: socks5                 # 协议socks5/http/vmess/ss/ssr/trojan/vless/wireguard/anytls
    server: "11.1.1.111"
    port: 3000
    username: "xxxx" 
    password: "xxxxx"
    udp: false

proxy-groups:                    # 代理组配置（多个节点放到一个分组，方便切换）
  - name: "youtube分组"
    type: select
    proxies:
      - "一个socks5代理节点"

rules:                           # 规则配置（按照域名/ip 后缀/关键字等匹配后，指向特定分组）
  - DOMAIN-SUFFIX,google.com,DIRECT
  - DOMAIN-SUFFIX,youtube.com,youtube分组
```

# 2 基础配置
全局level的配置，主要是一些mihomo自身的配置，比如监听的端口，是否允许局域网连接。上面例子中已经列出了
```yaml
mixed-port: 7890                 # HTTP + SOCKS5 混合端口
allow-lan: false                 # 是否允许局域网设备连接
mode: rule                       # rule / global / direct
log-level: info                  # silent / error / warning / info / debug
```
如果允许局域网被其他机器连接，通常还需要有以下配置：
```yaml
allow-lan: true
authentication:              # 不配置的话，就是局域网裸奔
  - "alice:Passw0rd"
  - "bob:123456"             # 可以配多个账号:密码
skip-auth-prefixes:          # 这些来源 IP 免密
  - 127.0.0.1/8
  - ::1/128
```
如果想要配置多个端口，以及不同端口不同协议也是可以的，使用`listeners`配置项，但是一般不太会用到，这里不展开了。

`mihomo`还提供了一个rest接口的api，需要用的话，要在配置中开启：
```yaml
external-controller: 127.0.0.1:9090    # 只允许本机访问 0.0.0.0:9090允许局域网
secret: "一串随机密码"                  # API鉴权，不加就是裸奔
external-ui: ./ui                      # 可选：让内核直接托管网页面板
```

启动一个mihomo，最简单的方式就是直接用docker方式：
```bash
# -d 是指定config.yaml文件的路径
docker run --rm \
-p 17890:7890 -p 19090:9090 \
-v ./config.yaml:/config.yaml metacubex/mihomo \
-d /
```

为了避免和本机已有的7890等端口冲突，这里我映射到了17890和19090，接下来打开`http://127.0.0.1:19090`就可以看到UI了，这个ui和很多vpn客户端就已经非常相似了。

![image](https://i.imgur.com/xRcK8EH.png)

可以看到默认是有一个代理节点的，就是DIRECT，也就是直连。
# 3 sniffer
`sniffer`嗅探是一个根据IP反向解析出域名的能力，一般这样配置
```yaml
sniffer:
  enable: true
  parse-pure-ip: true
  sniff:
    TLS:
      ports:
      - 443
    HTTP:
      ports:
      - 80
      override-destination: true
```
他在什么时候起作用呢？如果你使用的不是`tun`模式，并且还是用的`socks`协议，而不是`http`协议的时候，此时如果不配置嗅探就会发现：

```bash
$ curl -x socks5://127.0.0.1:7890  https://www.youtube.com -I
curl: (35) schannel: failed to receive handshake, SSL/TLS connection failed

$ curl -x http://127.0.0.1:7890  https://www.youtube.com -I
HTTP/1.1 200 Connection established
HTTP/1.1 200 OK
xxxxxxxxxxxxxx

$ curl -x socks5h://127.0.0.1:7890  https://www.youtube.com -I
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
xxxxxxxxxxxx
```

也就是`sock5`挂了，但是`http`和`sock5h`没问题，这是因为dns解析的位置不同，http代理的时候，客户端是把域名送到代理服务器，而socks5代理的时候，是在客户端dns解析完成之后，把ip发给代理服务器。这就导致如果你`mihomo`配置了`DOMAIN-SUFFIX,youtube.com,油管分组`的规则（我们后面会说rule），但是此时送过来的是ip地址，并不满足域名的规则，而油管的ip可能没有配置`rule`,最终变成了直连导致出错。

而`sniffer`嗅探就在这个时候起作用了，他会拿到ip之后发现端口是443，命中了规则，就去尝试解析ip的域名发现是油管，然后再走rule命中了正确的规则，于是就通了，所以在增加了嗅探之后上面的`socks5`也可以成功了。
```yaml
curl -x socks5://127.0.0.1:7890  https://www.youtube.com -I
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
xxxxxx
```

不过`sock5h`这个写法也可以不用嗅探他也会让dns解析发生在mihomo，和http类似，这也是现在很多客户端包括chrome走代理的时候其实用的是`socks5h`的原因，而嗅探大多数时候也不太需要配置了。但作为理解代理原理和流程的一个重要环节，这里依然要说一下。

# 4 tun

`tun`隧道、虚拟网卡模式，这是一个非常常用的模式，如果没有`tun`的话，`mihomo`只是一个代理服务器，最多就是配置为系统代理，也就是`HTTP_PROXY`、`HTTPS_PROXY`等环境变量配置，但是很多程序并不会读这个环境变量进行代理设置，还有很多程序用的不是http协议，而是基础的tcp或者其他上层协议，这就导致很多应用是无法使用代理服务器的。

而`tun`就是为了解决这一问题，直接抽象出一个虚拟网卡在本机，然后把所有的网络流量都走这张新的网卡，并劫持了所有的网络流量，这个可谓是比设置系统代理更好用更彻底的解决方案，不管你应用是否漏了`HTTP_PROXY`等环境变量的处理，还是没有用`http`协议，统统都要走网卡，而都会被`tun`抓住，进行处理。现在`tun`已经是一种非常主流的使用方式了。

```yaml
tun:
  enable: true
  stack: gvisor
  auto-route: true
  strict-route: false
  auto-detect-interface: true
  dns-hijack:
  - any:53
```

虚拟网卡底层有三种实现方式`stack`，建议用`gvisor`或`mixed`，先保证兼容性，调通了，再看看性能更好的`system`方案是否可行。
| 名称 | 描述 | 兼容性 |
| --- | --- | --- |
| system | 借用操作系统内核自带的 TCP/IP 协议栈 | 性能最好、CPU 占用低；在 Windows 上需要防火墙放行，部分环境下兼容性较差 |
| gvisor | 用户态协议栈（来自 Google 的 gVisor 项目） | 兼容性最好，不依赖系统网络栈；CPU 占用略高 |
| mixed | TCP 使用 system，UDP 使用 gvisor | 兼顾性能和兼容性 |

`auto-route`是否接管系统的网络流量，如果设为false，等于只放一张网卡，实际流量不走过来。

`strict-route`严格路由，最大限度避免有漏网之鱼的，一般不需要那么严格，保持false即可。

`auto-detect-interface`自动检测出口的网卡，因为虚拟网卡是拦截系统流量，最后流量还要从实体网卡出去，这里要设置为true会自动发现从哪里出去，比如可能是`eth0`。

`dns-hijack`是tun模式下拦截操作系统的dns解析，因为默认情况下开了tun就不需要再指定proxyServer地址了，那默认`curl google.com`就会走系统的dns解析，会有两个主要的问题
- 1 可能就会解析到污染的地址，ip就是错的
- 2 ip即使是对的，域名ip的映射并没有在mihomo缓存，tcp网络流量还是用的ip，如果不配置嗅探的话，还是和之前sock5一样走到错误的分组中。

所以一定要配置这个dns劫持，这里配置的是`any:53`，也就是本机任意ip的udp53端口作为dns服务器，后面会介绍这个要配合一个`dns`的配置。


# 5 dns
`dns`是配置一个自建的dns服务器，主要作用是用于`tun`模式的dns解析的系统操作的拦截。
```yaml
dns:
  enable: true
  listen: :53
  ipv6: true                # 是否解析域名的ipv6地址（需要本机有ipv6，否则没啥用）
  prefer-h3: false          # 是否prefer http3
  default-nameserver:       # 引导DNS，主要是解析其他Doh(dns on hppts)的域名用的
  - system                  # 系统原来的dns服务器
  - 8.8.8.8                 # 只能用ip格式，否则死锁了
  - 2400:3200::1
  - 2001:4860:4860::8888
  nameserver:                         # 默认dns，大部分都用这个来解析
  - 8.8.8.8                  
  - https://doh.pub/dns-query         # Doh的，这个域名就需要用default的解析
  - https://dns.alidns.com/dns-query
  proxy-server-nameserver:            # 代理节点的dns解析，节点也可能是域名格式，就会用这个解析
  - https://doh.pub/dns-query
  - https://dns.alidns.com/dns-query
  - tls://223.5.5.5
  direct-nameserver: []               # 直连时候的dns，没配则兜底到nameserver
  direct-nameserver-follow-policy: false

  respect-rules: false  # DNS 查询是否也按 rules 分流，没必要，false即可

  use-hosts: false        # 是否用hosts配置中的值覆盖
  use-system-hosts: false # 是否用系统hosts配置中的值覆盖


  enhanced-mode: fake-ip    # fake-ip/redir-host，fake-ip的话，后续的fake-xxx配置才生效
  fake-ip-filter:           # fake-ip模式下，过滤的域名，可以是域名或者ip
  - '*.lan'
  - '*.local'
  - '*.arpa'
  - time.*.com
  - ntp.*.com
  - time.*.com
  - +.market.xiaomi.com
  - localhost.ptlogin2.qq.com
  - '*.msftncsi.com'
  - www.msftconnecttest.com
  - mini.local
  fake-ip-filter-mode: blacklist  # filter是黑名单模式
  fake-ip-range: 198.18.0.1/16    # fake的ip都是这个网段的
  fake-ip-range6: fdfe:dcba:9876::1/64 # v6
```

上面的配置已经加了注释，大部分比较清晰了，只是后面的`fake-ip`可能比较困惑。其实`mihomo`的dns有`fake-ip`常见和`redir-host`两种模式，为啥有这两种呢？这和网络流程有关。

例如`curl google.com`，本质上是不需要我们本机做dns解析的，只需要把`google.com`直接送到代理节点（梯子）那边，代理节点会自己做dns解析的。但是操作系统的网络传输流程是固定的，先进行dns解析，然后向ip发包。

所以`redir-host`模式下，是先解析google的ip（用nameserver配置的dns），然后把`ip -- google.com`的映射记录到内存中，后面再发包的时候，会查出来是`google.com`，就明中分组，把域名格式的请求发送到proxy节点。核心思路就是需要mihomo自己缓存一个mapping，这样后续的ip发包能知道是哪个域名，这样比嗅探更稳。

但是`redir-host`下有个没啥用的操作就是本地的这个dns解析，其实`ip -- goolge.com`只需要记录一个假的占位符ip，比如0.0.0.1，这样后续发到0.0.0.1的包，映射回`google.com`就行了，proxy节点才是最终的dns解析。这就是`fake-ip`的思路，比如上面配置中，fakeip模式会给所有的域名都解析到`198.18.x.x`网段，这就是个假的ip并不是真的dns解析后的结果，这样省了第一次dns解析的时间，因为不需要正确的ip，所以能省了这个时间，但是我个人不建议用`fake-ip`，`fake`之后你会发现，你`ping www.google.com`返回的也是这个`198.18.x.x`，`redir-host`并没有多占用多少时间（多一次dns解析），因为dns解析本身也会缓存，只有第一次会稍慢一点。

# 6 proxies
`proxies`是每个代理的节点详情，例如
```yaml
proxies:
- name: "[Normal]Hong Kong 03"
  type: anytls
  server: zbbfxzui.znnfxzui.cc
  port: 3443
  password: xxxx
  udp: true
  sni: speedtest-hongkong-hk-normal-03.grandmacdn.cc
```
这部分大部分时候都是机场自己生成好的批量节点信息，其中`type`取值较多：
| type | 协议 | 特点 |
| --- | --- | --- |
| http / socks5 | 普通代理 | 明文、无混淆，一般只用于内网或链式代理的某一跳 |
| ss | Shadowsocks | 简单、快，机场最常用 |
| ssr | ShadowsocksR | 已经过时 |
| vmess | V2Ray 的协议 | 老牌协议，常配合 WebSocket + TLS |
| vless | VMess 的精简版 | 本身不加密，依赖 TLS 或 Reality，目前主流 |
| trojan | 伪装成 HTTPS | 必须使用 TLS |
| hysteria2 | 基于 QUIC（UDP） | 在网络质量差、丢包严重时速度优势明显 |
| tuic | 基于 QUIC | 和 hysteria2 类似 |
| wireguard | WireGuard VPN | 常用于连接 WARP 或自建的 WireGuard 服务 |
| anytls | 见下文 | 较新的协议(25年才有的) |
| ssh / snell / mieru | 其他协议 | 使用较少 |
| direct / dns | 特殊出站 | 自定义的直连出站 / 把流量交给 DNS 模块处理 |


不同协议要求配置的字段会有较大差异，这里不详细展开了，主要是其中的`server`和`port`，`password`这几项基本是必须的。

另外要说一下`http/socks5`协议可以作为下游的协议，并且同时也是`mihomo`对外透出的协议类型，主要用于内网，在某些网站购买的住宅ip也是这种简单协议，一般不要直接通过本地连接这种ip过去，因为socks5明文很容易被抓住，所以很多住宅ip是不允许直接从国内连过来，这就需要拨号模式，或者叫两跳。

```yaml
proxies:
  - name: "机场首跳"                         # 一个机场的节点
    type: anytls
    server: zbbfxzui.znnfxzui.cc
    port: 3443
    password: xxxx
    udp: true
    sni: speedtest-hongkong-hk-normal-03.grandmacdn.cc
  - name: "住宅出口"
    type: socks5
    server: "us.1024proxy.io"
    port: 3000
    username: "xxxx" 
    password: "xxxxx"
    dialer-proxy: "机场首跳"                 # 配置住宅节点的dialer-proxy是机场节点
    udp: false
```

这样配置后，住宅出口这个节点就会先用机场作为第一跳。


# 7 proxy-groups
代理节点分组，前面的proxy节点一个机场可能有50个，然后有些可以给youtube，有些可以给openai等等，这样为了更好的组织和管理就有了分组。
```yaml
proxy-groups:
  - name: "youtube分组"
    type: select                # 默认始终取第一个节点，除非通过ui或api改，所以不太适合自动化，
    proxies:
      - "香港01"
      - "香港02"
      - "美国01"
      - "美国02"

  - name: "openai分组"
    type: fallback              # 默认第一个可用的节点，然后每5min测试找到一个可用的节点
    url: https://www.gstatic.com/generate_204 # 测试到这个url是否可达
    interval: 300
    proxies:
      - "美国01"
      - "美国02"

  - name: "ins分组"
    type: url-test              # 取延迟最低的，翻墙常用的
    interval: 300               # 每5min测试一次
    tolerance: 50               # 新节点要比当前节点快 50ms 以上才会切换，避免频繁跳来跳去
    url: https://www.gstatic.com/generate_204 # 测试到这个url的延迟
    proxies:
      - "美国01"
      - "美国02"

  - name: 负载均衡              # 普通翻墙不太会用
    type: load-balance
    proxies: [香港01, 香港02, 香港03]
    url: https://www.gstatic.com/generate_204
    interval: 300
    strategy: consistent-hashing
```

分组主要起到一个好管理的作用，前面的`dialer-proxy`也可以指向分组名，而不是proxy名，这样如果分组本身又是`url-test`类型的话，就可以在链式vpn，第一跳选择延迟最低的节点，第二跳再走住宅出口ip了。

在`mihomo`的配置中，proxy节点name和，proxy-group的name在很多地方都是一样的地位。

# 8 rules
`rules`是对代理节点的规则配置，比如youtube.com的域名要走youtube分组，规则是数组，从上到下匹配，一般最后一条是`MATCH,漏网之鱼group`。
```yaml
rules:
  # 1 youtube.com 走youtube分组
  - DOMAIN-SUFFIX,youtube.com,youtube分组
  # 兜底
  - MATCH,漏网之鱼
```
DOMAIN相关的匹配方式如下，其中后缀和关键词用的最多
```yaml
- DOMAIN,www.google.com,X	#只匹配完全相同的域名
- DOMAIN-SUFFIX,google.com,X	#google.com 本身及其所有子域名
- DOMAIN-KEYWORD,youtube,X	#域名中包含这个关键词
- DOMAIN-WILDCARD,*.google.*,X	#通配符（* 匹配任意字符，? 匹配单个字符）
- DOMAIN-REGEX,^ads?\..*,X	#正则表达式
- GEOSITE,youtube,X	#使用 geosite 数据库中的分类
```
IP相关的有：
```yaml
- IP-CIDR,192.168.0.0/16,DIRECT	#IPv4 网段
- IP-CIDR6,2001:db8::/32,DIRECT	#IPv6 网段
- IP-SUFFIX,8.8.8.8/24,X	#按 IP 的最后几位匹配
- IP-ASN,13335,X	#按自治系统编号匹配（13335 是 Cloudflare）
- GEOIP,CN,DIRECT   #按 IP 所属国家或地区匹配
- GEOIP,CN,DIRECT,no-resolve # 来的是域名，则不解析出ip，直接跳过这条规则
```
还有进程、来源和端口、逻辑组合等规则，属于高级用法，且翻墙的话基本不太会用，这里不展开。

# 9 proxy-providers
`proxy-providers`是一些可以自定义代理节点的提供者，比如把某个机场作为一个供应商。

如下从url拉取节点列表（url的配置不止节点，这里只会拉取节点），然后缓存到本地`airport.yaml`，每天更新，并且根据过滤器过滤掉不合法的节点。
```yaml
proxy-providers:
  airport:
    type: http
    url: "https://sub.xxx/s/xxxxx"
    path: ./providers/airport.yaml
    interval: 86400
    proxy: DIRECT            # 下载订阅文件，用直连
    health-check:
      enable: true
      url: https://www.gstatic.com/generate_204
      interval: 300
      timeout: 5000
    filter: '(?i)(United States|Singapore|美国|新加坡|🇺🇸|🇸🇬|\bUS\b|\bSG\b)'
```
然后可以在分组里面用这个供应商，并改为`url-test`取这个机场的节点中最快的。
```yaml
proxy-groups:
  - name: "机场1"
    type: url-test
    use:
      - airport
    url: https://www.gstatic.com/generate_204
    interval: 300
    tolerance: 100
```

# 10 机场订阅该如何使用
机场的订阅链接的内容是一个完整的`config.yaml`的配置，至少包括了`proxies`节点，`proxy-groups`和`rules`，这是三个最终要的。有了这三个，基本能满足大部分人的科学上网了。

一般通过输入配置文件url就可以导入，而上面的`prxoy-providers`的配置方法，也可以不用依赖某一家机场的订阅，可以把多家机场都作为provider，自己来打平了编排这些node节点，比如挑两个机场中最快的一个节点。
