# openresty
openresty就是在nginx上预装了很多c和lua的模块，使得nginx更加强大。

通过重新学习如何使用这些模块，我们可以复习nginx的配置和重新认识nginx可以做什么扩展，以及扩展的原理。

# 准备
下载openresty，并将nginx.conf中用不到的注释内容先删掉，配置文件主要有三个块组成：
- 全局块 例如worker_processes指定进程数量，pid指定nginx进程id记录到哪个文件中。
- events 配置影响nginx服务器或与用户的网络连接。例如worker_connections每个进程的最大连接数，use选取哪种事件驱动模型处理连接请求例如epoll，是否允许同时接受多个网路连接，开启多个网络连接序列化等。
- http 配置http相关的服务，http全局中可以配置每个server默认的配置，例如default_type等，server可以配置多个。
```conf
worker_processes  1;
error_log  logs/error.log info; #日志输出级别调为info，默认是error

events {
  worker_connections  1024;
}

http {
  include       mime.types;
  default_type  application/octet-stream;
  sendfile        on;
  keepalive_timeout  65;
  server {
    listen       80;
    location / {
		  default_type text/html;
			echo "hello nginx";
    }
  }
}
```
配置文件改为上述格式后，`./nginx`或`./nginx -c conf/nginx.conf`。访问localhost，即可看到hello nginx字样。到这里就是个不错的开局了，还学会了echo模块的使用。

# 基本的nginx使用
对于nginx反向代理、tcp反向代理、host_name代理、负载均衡等配置可以直接参考[18.6/utils_nginx](/18.6/utils_nginx.html)。

# lua-nginx-module
openresty最重要的就是引入了lua，可以直接在nginx.conf中使用lua的代码块。下图显示了不同lua指令的生命周期，lua主要可以通过三种形式嵌入，以下图中的`init_by_lua`为例，`init_by_lua 'lua代码';`直接接lua字符串，用带引号引入，分好结束。`init_by_lua_block {lua代码}` 接lua代码块，这种形式是建议的写法，用来代替前者。
`init_by_lua_file filename.lua;` 接lua文件名，如果是相对路径的根路径是nginx运行时通过-p xx指定的路径。


![image](https://i.imgur.com/w0EE1vP.png)

ngx模块和core模块默认就在init的时候require了，可以在lua代码块中可以直接使用ngx这个全局变量，`ngx.say`就可以实现与echo相同的效果，注意ngx.say和echo都是可以多次使用的，最后会一起返回给前端。
```conf
location / {
	default_type text/html;
	content_by_lua_block {
    ngx.say("hello lua")
    ngx.say("hello lua")
    ngx.log(ngx.INFO, "打印日志") -- 需要调整日志输出级别为info才行
    ngx.log(ngx.ERR, "打印错误日志")
  }
}
```

ngx中有很多常用属性，也是最常用的模块，[详细文档](https://github.com/openresty/lua-nginx-module)
- 基本的静态变量，例如请求方法，httpcode等
- uri编解码、base64编解码、md5等 
- 输出字符串类的，`say print log`
- 正则的re
- 系统类的time sleep(单位是s) exec等
- `var`、`ctx`和`shared`，var可以用来和c上下问的$xxx变量互通后面看例子，`ctx`则可以用来在不同的lua代码块之间传递变量，shared是多个进程共享的变量池。
- `req`、`redirect`、`ngx.location.capture`获取或修改请求内容，跳转和restclient请求其他路径。


# lua-resty-redis
[repo](https://github.com/openresty/lua-resty-redis) 

使用get和set
```
location /get/ {
	default_type text/html;
  content_by_lua '
    -- lua里面没有封装string.split函数,自己封一个
    local split = function (str, sep)
		  local sep, fields = sep or ",", {}
		  local pattern = string.format("([^%s]+)", sep)
		  str:gsub(pattern, function (c) fields[#fields + 1] = c end)
			return fields
		end
    
    -- 从path中取出get/后面的key列表，用，split得到数组 
    local keys = split(ngx.var.uri:match("/get/([%w,]+)"), ",")
    
    -- 连接redis，这个模块会自动复用连接池，不用担心会每次创建	
    local redis = require "resty.redis"
    local red = redis:new()
		local ok, err = red:connect("192.168.0.139", 6379)
		if not ok then
      ngx.say("failed to connect: ", err)
      return
    end
		
    -- 遍历数组get出每个key的值，并返回
    for i,k in pairs(keys) do
      local res, err = red:get(k)
      if err then
      	ngx.say(k, "get error")
      else
      	ngx.say(k,"=",res)
      end
    end';
}
		
location /set {
  default_type text/html;
  content_by_lua '
    -- 连接redis
    local redis = require "resty.redis"
    local red = redis:new()
    local ok, err = red:connect("192.168.0.139", 6379)
    if not ok then
      ngx.say("failed to connect: ", err)
      return
    end

    -- 拿querystring，并分别set到redis中
    local args = ngx.req.get_uri_args()
    for k, v in pairs(args) do
      local res, err = red:get(k)red:set(k, v)
      if err then
        ngx.say(k, " set error")
      else
        ngx.say(k, " set success")
      end
    end';
}
```
# lua-resty-mysql
```
location /mysql {
  content_by_lua '
  -- 建立连接
  local mysql = require "resty.mysql"
  local db, err = mysql:new()
  if not db then
    ngx.say("failed to instantiate mysql: ", err)
    return
  end
  local ok, err, errcode, sqlstate = db:connect{
    host = "127.0.0.1",
    port = 3306,
    database = "test",
    user = "root",
    password = "",
    charset = "utf8",
    max_packet_size = 1024 * 1024,
  }
  if not ok then
    ngx.say("failed to connect: ", err, ": ", errcode, " ", sqlstate)
    return
  end
  -- 执行sql，注意返回值res是个table，详细格式可以看下面图片，读和写的sql都是用这个来执行
  local res, err, errcode, sqlstate =
    db:query("select * from user order by id asc limit 1", 1)
  local cjson = require "cjson"
  ngx.say("result: ", cjson.encode(res))
  ';
}
```
![image](https://i.imgur.com/dI3J9jU.png)
# 自定义dns服务器
需要自己下载dns-server的库，这是openresty默认不带的，默认带的是client库。windows不支持udp监听，需要linux
```
stream{
    lua_package_path "/usr/local/openresty/lib/?.lua;;";
    server {
        listen 53 udp;
        set $proxy 0;
        content_by_lua_block {
            local server = require 'resty.dns.server'
            local sock, err = ngx.req.socket()
            local req, err = sock:receive()
            local dns = server:new()
            local request, err = dns:decode_request(req)
            local query = request.questions[1]
            ngx.log(ngx.INFO, "qname: ", query.qname, " qtype: ", query.qtype)
            local name = query.qname
            local localhost = "20.20.20.20" -- 这里可以替换为redis读取，此处写死了做demo
            if query.qtype == server.TYPE_A and name:find("%.tt$") then -- 处理.tt结尾的域名
                local err = dns:create_a_answer(query.qname, 600, localhost)
                local resp = dns:encode_response()
                local ok, err = sock:send(resp)
            else                                            -- 其他域名 走谷歌解析 8.8.8.8
                local resolver = require "resty.dns.resolver"
                local r, err = resolver:new{
                    nameservers = {"8.8.8.8", {"8.8.4.4", 53} },
                    retrans = 5,  -- 5 retransmissions on receive timeout
                    timeout = 2000,  -- 2 sec
                    no_random = true, -- always start with first nameserver
                }
                local answers, err, tries = r:query(name, nil, {})
	              local f = nil
                for i, ans in ipairs(answers) do
                    ngx.log(ngx.INFO, ans.name, " ", ans.address or ans.cname,
                        " type:", ans.type, " class:", ans.class,
                        " ttl:", ans.ttl)
                    if ans.type == server.TYPE_A  then
                        f = 1
                        local err = dns:create_a_answer(ans.name, 600, ans.address)
                    elseif ans.type == server.TYPE_CNAME then
                        f = 1
                        local err = dns:create_cname_answer(ans.name, 600, ans.cname)
                    end
                end
                if not f then
                    local err = dns:create_a_answer(query.qname, 600, nil)
                    local resp = dns:encode_response()
                    local ok, err = sock:send(resp)
                else
                    local resp = dns:encode_response()
                    local ok, err = sock:send(resp)
                end
            end
        }
    }
}
```
# 小结
ngx模块是最常用的模块了，如果不是需要额外的中间件的话，这个模块就够用了，除了github文档，也可以参考[这个文档](https://openresty-reference.readthedocs.io/en/latest/Lua_Nginx_API/)