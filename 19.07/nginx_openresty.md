# openresty
# 1 什么是openresty
`openresty`=`nginx`+很多插件
# 2 openresty与nginx的使用区别
openresty和nginx没有区别，配置文件格式也是一样。启动openresty的docker，进入`/usr/local/openresty/nginx/conf`可以找到`nginx.conf`这就是配置文件了，这个文件引用了`/etc/nginx/conf.d/*.conf`，因而docker的映射文件只需要映射后者即可。

默认有个`/etc/nginx/conf.d/default.conf`这个conf文件是以server开始的。
# 3 能用openresty做什么不一样的
## 3.1 获取请求内容(url,method,header,queryString/body)
对于http请求，我们一般有请求路径，请求方法，请求头，请求参数（查询参数、内容参数）四个重要的要素，ngx中可以分别获取这些信息。而对于http响应，主要是响应头的一些修改（如：跨域）。
```lua
location /test2{
    default_type 'text/html';
    set $myvar "100";
    content_by_lua_block {

        -- 1 say/print方法与echo插件效果相同(say换行，print不换行)
        ngx.say('<h2>test2</h2>')
        ngx.print("<h3>test2</h3>\n")

        -- 2 请求的内容
        -- 请求头，路径，请求方法
        ngx.say(ngx.req.raw_header())-- 所有请求头（\n隔开每个）
        ngx.say(ngx.req.get_headers()['Host'])-- 单个请求头，方法返回值是lua table类型
        ngx.say(ngx.var.uri) --路径借助var，下面会讲 
        ngx.say(ngx.req.get_method()) --方法

        -- 查询字符串
        -- 下面这段是规范的代码处理了异常和数组形式的参数
        local args,err= ngx.req.get_uri_args()
        for key, val in pairs(args) do
            if type(val) == "table" then
                ngx.say(key, ": ", table.concat(val, ", "))
            else
                ngx.say(key, ": ", val)
            end
        end
        -- 简略形式
        ngx.say(ngx.req.get_uri_args()['a'])
        

        -- 请求体
        ngx.req.read_body()  -- explicitly read the req body
        -- 表单形式
        ngx.say(ngx.req.get_post_args()['age'])
        -- 文本形式（json）
        local data = ngx.req.get_body_data()
        if data then
            ngx.say("body data:")
            ngx.print(data)
            return
        end
        

        -- 3 ngx.var调用lua外作用范围的变量
        ngx.say(ngx.var.myvar)         --100
        ngx.say(ngx.var.http_host)     --http_xxx即头部，192.168.0.12:82
        ngx.say(ngx.var.query_string)  --a=10&b=20
        ngx.say(ngx.var.arg_a)         --10
        ngx.say(ngx.var.request_method)--GET
    }
}
```
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1907/openresty2.jpg)
## 3.2 修改请求内容
在到达服务前有时候需要对请求内容进行一些修改，例如去掉一些敏感的请求头，解码某些参数等。
```lua
--修改方法
ngx.req.set_method(ngx.HTTP_GET)
--修改路径(第2参数默认是false，代表是否jump)
ngx.req.set_uri("/foo",false)
--修改uri参数
ngx.req.set_uri_args("a=3")
ngx.req.set_uri_args({a=3})
--修改请求头
ngx.req.set_header("Content-Type", "text/css")
ngx.req.set_header("Content-Type", nil)
```

## 3.3 字符串分析与处理
在上一篇中，已经在nginx用到了字符串的正则处理，和组的使用，以及如何拼接字符串。如下
```
if ( $host ~* (.*)\.(.*)\.(.*)\.(.*) ) {
    set $myport $1;
}
proxy_pass http://192.168.0.12:$myport;
```
openresty自带了正则处理的函数：
```lua
local m, err = ngx.re.match("hello, 1234", "([0-9])[0-9]+")
 -- m[0] == "1234"
 -- m[1] == "1"
if m then
    --xxxxxxxxxxxxx
else
    if err then
        ngx.log(ngx.ERR, "error: ", err)
        return
    end
    ngx.say("match not found")
end
```
lua的字符串连接：
```lua
local a="ddd"
local b="ggg"
local c=a..b         --c="dddggg"
```

## 3.4 跳转
对标nginx的rewrite，并且在rewrite阶段（复习上一篇11个阶段），一般写在rewrite_by_lua_block中，主要有exec和redirect两个函数（还有个子请求的 res= ngx.location.capture(uri, options?)这里不展开讲了）。
```ini
# 等价于 rewrite ^ /x?a=10&b=20; 
return ngx.exec("/x","a=10&b=20")

# 等价于 rewrite ^ /x permanent;
return ngx.redirect("/x",301)

# 等价于 rewrite ^ /x redirect;
return ngx.redirect("/x",302)

## 上面加 return 的原因是函数本身不返回，如果下面继续写exec会按照后面的执行。
```
# 4 IO插件
这里以redis插件为例：
```lua
location /red{
    content_by_lua_block {
        local redis = require "resty.redis"
        local red = redis:new()
        red:connect("192.168.0.12", 6379)
        local v = ngx.req.get_uri_args()['set']
        if v then
            red:set("k",v)
            ngx.say("set ok")
        else
            v = red:get("k")
            ngx.say(v)
        end
    }
}
```
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1907/nginx4.png)

使用nginx记录用户token，在access阶段进行验证，是一种常见的思路。