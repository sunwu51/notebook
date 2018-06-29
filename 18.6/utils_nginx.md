# NGINX配置文件的细节
## 1 基本配置
默认情况下安装NGINX后配置文件大体是这样的。和功能直接相关的部分是server部分。
```bash
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       81;
        server_name  localhost;
        location / {
            root   html;
            index  index.html index.htm;
        }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    include servers/*;
}
```
listen 81就是监听的端口是81，下面的location则是匹配url用的。

`location /`的意思就是匹配所有情况了，会转到根目录为html的路径下，这里是相对路径可以改为绝对路径。index则是指定默认打开的文件名。

`location = /50x.html`就是指定了url就是/50x.html的时候返回的文件内容。

## 2 反向代理
url的跳转是我们经常用到的，在这种代理的配置中会有很多种情况，让我们来看看。
### 2.1 关于/
形式1：都没有/后缀
```
location /a {
    proxy_pass  http://localhost:1880;
}
```
上面的写法是满足url为 /a开头的，将域名替换为后面的
>/a  =>  http://localhost:1880/a  
/a/b=>  http://localhost:1880/a/b

这种写法是最简单的，实现的功能也是最常用的替换域名形式的，子网代理
<hr>

形式2：都有/后缀
```
location /a/ {
    proxy_pass  http://localhost:1880/;
}
```
上面的写法是将/a开头的url转到后面的url，并去掉/a  
>/a => http://localhost:1880  
/a/b => http://localhost:1880/b

### 2.2 关于匹配符
有时候我们想跳转的url很复杂，或者其他原因不好详细写出，但是满足一定的特性，这时候可以用正则匹配符。
```
location ~ \.php$ {
    proxy_pass  http://localhost:1880/;
}
```
上面的形式中`~`是指定不区分大小写的正则匹配形式，然后需要跟个空格。后面的正则表达式就比较简单了就是匹配`.php`这个字符串结尾的url。
~*是不区分大小写，一般不怎么用。!~是匹配不满足这个正则的url。
### 2.3 关于HOST代理
通过上面的反向代理，通过一个nginx服务就可以将多个子模块包括前后端都集中到一个服务器了。也顺带解决了跨域问题，因为nginx转发的是nginx作为一个客户端去请求的资源，没有域，也就没有跨域了。

但是就算这样我们可能还会遇到一些问题，比如/a代理到一部分页面资源，/b则是另一部分。然而写前端的人写的js的引用都是`src='/js/1.js'`这样可麻烦了，这个资源并不会去`/a/js/1.js`下去找，而是`/js/1.js`。这可怎么办呢？一般前端要用./而不是/引用。如果实在没有办法了就只能通过域名代理的方式了。

HOST代理，顾名思义，就是通过header中的HOST字段的不同，代理到不同的服务器上。例如www.a.com可以代理到资源a的机器上，www.b.com则是代理到b机器。我们要做的除了在nginx添加一条server配置，还要在dns上注册两个域名都指向我们的nginx服务器（测试的话该hosts文件也行）。

配置如下
```
   server {
        listen       81;
        server_name  www.a.com;
        location / {
            proxy_pass http://localhost:1880;
        }
    
    }
    server {
        listen       81;
        server_name  www.b.com;
        location / {
            proxy_pass http://localhost:8080;
        }
    }
```
这样配置后  
>http://www.a.com:81 ==> http://localhost:1880  
http://www.b.com:81 ==> http://localhost:8080  
ip或其他域名:81 ==> http://localhost:1880

如果不匹配的域名或者直接写ip:81,则按照配置文件顺序匹配前面的1880.
### 2.4 代理中的设置
参考[https://blog.csdn.net/a19860903/article/details/49914131](https://blog.csdn.net/a19860903/article/details/49914131)
```
proxy_set_header Host $http_host;  
proxy_set_header x-forwarded-for  $remote_addr;  
```
## 3 Tcp反向代理
```
stream {
    upstream test {
        server www.baidu.com:80 weight=2;
        server www.taobao.com:80 weight=2;
    }
    server {
        listen 82;
        proxy_connect_timeout 5s;
        proxy_timeout 5s;
        proxy_pass test;
    }
}
```
上面的stream配置是和原来配置文件中http平级的地方。设置tcp:82--->www.baidu.com:80 / www.taobao.com:80。权重都是2.
## 负载均衡
上面的tcp反向代理中weight部分就是负载均衡的设置了。不过普通的http代理如何负载均衡呢？
```
  upstream test 
    {
　　　　server 192.168.0.223:8080 weight=4 max_fails=2 fail_timeout=30s;
    　 server 192.168.0.224:8080 weight=4 max_fails=2 fail_timeout=30s;
    }
    server 
    {
        listen       80;        #监听端口    
        server_name  localhost;

        location / {
            proxy_pass http://test;    #转向test
        }
    }
```
通过上述配置将请求转到 http://test，test是事先设定好的upstream里面设置了负载均衡。