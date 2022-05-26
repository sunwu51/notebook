# 二级域名
baidu.com就是一级域名，zhidao.baidu.com就是二级域名。如果自己有多个服务，但是只有一个域名，有两种方式可以实现转发。
- 1 改路径，比如baidu.com/image是图片的服务器，baidu.com/zhidao是知道的服务器。
- 2 二级域名，image.baidu.com指向图片服务器，zhidao.baidu.com指向知道的服务器。

因为申请域名申请的都是1级域名，2级可以自由配置，通过二级域名可以很好的区分不同的域，但是直接配置二级域名的A记录，需要我们的服务分别是有公网ip的，这显然不太现实，那如何实现动态的代理这种二级域名呢？

# 如何实现动态代理
以play with docker为例，通过特定的前缀写法就可以将自己的实例的上的端口的服务暴露出来。


这首先需要配置通配符的二级域名`*.一级域名`指向一个总的nginx服务器。这里我们用dns-proxy来模拟dns服务器，假装自己买了frank.com这个域名，并配置`*.frank.com`指向`localhost`

创建config.json如下，下载对应平台的二进制[工具文件](https://github.com/sunwu51/dns-proxy/releases/tag/v1.1.0)到同一目录。
```json
{
  "port": 53,
  "host": "127.0.0.1",
  "logging": "dnsproxy:query,dnsproxy:info",
  "nameservers": [
    "8.8.8.8"
  ],
  "servers": {},
  "domains": {
    "*.frank.tt": "127.0.0.1"
  },
  "hosts": {
    "devlocal": "127.0.0.1"
  },
  "fallback_timeout": 300,
  "reload_config": true
}
```

修改本机dns服务器指向127.0.0.1，到此为止，*.frank.tt

加下来下载[openresty](http://openresty.org/cn/download.html)，修改nginx.config文件
```nginx
location / {
	default_type text/html;
	set $proxy "";
    rewrite_by_lua '
		local h = ngx.var.host
		local dot = h:find("%.")
		local prefix = h:sub(1,dot-1)
		if prefix == "a" then
			ngx.var.proxy="127.0.0.1:3000"
		else
			ngx.var.proxy="127.0.0.1:5500"
		end
    ';
	proxy_pass http://$proxy$uri;
```
注意lua和nginx语法，其中ngx.var可以获取或者设置nginx配置文件上下文的$xxx变量，非常实用。

将a.frank.kk代理到本机3000端口的服务，将其他代理到5500端口的其他服务。

效果：访问a.frank.kk能代理到3000端口的一个vite网页，至此实现了不同二级域名可以通过lua脚本动态代理到自己的任何后端服务。

![image](https://i.imgur.com/zp7hQ4U.png)

# 补充
nginx上下文可以直接使用的变量
```
名称	说明
$arg_name	请求中的name参数
$args	请求中的参数
$binary_remote_addr	远程地址的二进制表示
$body_bytes_sent	已发送的消息体字节数
$content_length	HTTP请求信息里的"Content-Length"
$content_type	请求信息里的"Content-Type"
$document_root	针对当前请求的根路径设置值
$document_uri	与$uri相同; 比如 /test2/test.php
$host	请求信息中的"Host"，如果请求中没有Host行，则等于设置的服务器名
$hostname	机器名使用 gethostname系统调用的值
$http_cookie	cookie 信息
$http_referer	引用地址
$http_user_agent	客户端代理信息
$http_via	最后一个访问服务器的Ip地址。
$http_x_forwarded_for	相当于网络访问路径
$is_args	如果请求行带有参数，返回“?”，否则返回空字符串
$limit_rate	对连接速率的限制
$nginx_version	当前运行的nginx版本号
$pid	worker进程的PID
$query_string	与$args相同
$realpath_root	按root指令或alias指令算出的当前请求的绝对路径。其中的符号链接都会解析成真是文件路径
$remote_addr	客户端IP地址
$remote_port	客户端端口号
$remote_user	客户端用户名，认证用
$request	用户请求
$request_body	这个变量（0.7.58+）包含请求的主要信息。在使用proxy_pass或fastcgi_pass指令的location中比较有意义
$request_body_file	客户端请求主体信息的临时文件名
$request_completion	如果请求成功，设为"OK"；如果请求未完成或者不是一系列请求中最后一部分则设为空
$request_filename	当前请求的文件路径名，比如/opt/nginx/www/test.php
$request_method	请求的方法，比如"GET"、"POST"等
$request_uri	请求的URI，带参数
$scheme	所用的协议，比如http或者是https
$server_addr	服务器地址，如果没有用listen指明服务器地址，使用这个变量将发起一次系统调用以取得地址(造成资源浪费)
$server_name	请求到达的服务器名
$server_port	请求到达的服务器端口号
$server_protocol	请求的协议版本，"HTTP/1.0"或"HTTP/1.1"
$uri	请求的URI，可能和最初的值有不同，比如经过重定向之类的
```
