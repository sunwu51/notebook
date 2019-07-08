# nginx知识点整理
# 1 location 路径
# 1.1 四个优先级
`=` 、 `^~` 、`~`（或`~*`）、直接字符串。
```
# 1
location =/a/b/c{
    echo "=/a/b/c 等于，最高优先级";
}

# 2
location ^~/a/b{
    echo "^~/a/b /a/b开头的，次高优先级";
}

# 3 注意$和{间要空开，不然会认为是变量
location ~^/\w/\w/\w$ {
    echo "正则，第三优先级";
}

# 4
location /a{
    echo "/a /a开头的，优先级最低"
}
```
判定规则：
- 1 高优先级先匹配
- 2 同一优先级多个匹配，则按照匹配程度高的来
- 3 如果长度也相同，则按照前后书写顺序

**规则1测试：**
- /a/b/c => 匹配1234，生效1
- /a/b/d => 匹配234，生效2
- /a/x/y => 匹配34，生效3
- /a/x   => 匹配4，生效4

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1907/nginx1.png)  

**规则2测试：**

添加配置
```
# 5
location ^~/a/b/d{
    echo "^~/a/b/d /a/b/d开头的，次高优先级";
}
```
同样进行上述四个url的测试，结果出现细微差别，如下，证明了同一级别是匹配程度越高的生效
- /a/b/d => 匹配2345，生效5

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1907/nginx2.png)
  
**规则3测试：**

添加配置：
```
# 6
location ~^/\d/\d/\d$ {
    echo "d数字正则";
}
# 7
location ~^/[0-9]/[0-9]/[0-9]$ {
    echo "0-9数字正则";
}
```
- /1/2/3 匹配367且匹配程度相同，生效3
- /1/2/3 将7规则写在最上面，则生效7

## 1.2 路径中的/
```
location /a{
    proxy_pass http://ip;
}
location /b/{
    proxy_pass http://ip/;
}
```
效果：
- /a/x ->  http://ip/a/x;
- /b/x ->  http://ip/x;

# 2 http相关参数
内置的变量参考[http://nginx.org/en/docs/http/ngx_http_core_module.html#arg_name](http://nginx.org/en/docs/http/ngx_http_core_module.html#arg_name)，这里列出最常用的
```
1 $http_xxx  请求头中xxx字段如$http_content_type，注意下划线与小写
2 $arg_xxx   路径中的查询参数xxx，如$arg_username
3 $request_method 请求方法如“GET”
```
# 3 变量与正则
- 正则直接通过~进行是否匹配的判断，如果正则中含有组则匹配后的每个组用$1,$2...表示(没有$0)。if直接可以判断匹配
- `set $xxx xxx;`进行变量赋值
- 变量与字符串拼接直接写在里面即可，如果变量出现在中间可以用`'aaa'$a'aaa'`这种形式，或者aaa${a}aaa，nginx对$很敏感，这也是前面正则部分用$时需要和`{`空开的原因。
```
if ( $host ~* (.*)\.(.*)\.(.*)\.(.*) ) {
    set $myport $1;
}
proxy_pass http://192.168.0.12:$myport;
```
# 4 负载均衡
```
upstream group1{
    server 192.168.0.12:80;
    server 192.168.0.12:81;
}
server{
    ....
    location /f {
        proxy_pass http://group1;
    }
}
```
默认的分配策略是轮流来↓。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1907/nginx3.gif)

修改策略：
- weight 权重，每个server后面加权重，会按照比例分配
- backup 备份，当其他所有server挂了，会分配到这台
- 其他还有一些参数，可以自行了解
# 5 rewrite与proxy_pass
两者都用于跳转，rewrite跳转指定匹配的路径和新的路径，proxy_pass代理。rewrite通过正则可以实现proxy_pass，但是做代理proxy_pass写法更简单。

这里主要介绍下rewrite:
```
rewrite   <regex>   <replacement>   <flag>;
```
flag四种形式：
```
last或不写：跳转后继续匹配其他location
break：终止匹配 
redirect：302临时重定向，浏览器地址跳转(不写域名则端口会变成80)
permanent：301永久重定向，浏览器地址跳转（端口会变成80）
```
对以下配置进行测试：
```
location /re{
    if(arg_a){
        rewrite ^ /a/b/c;
    }
    if(arg_b){
        rewrite ^ /a/b/d break;
    }
    if(arg_c){
        rewrite ^ http://192.168.0.12:82/a/b redirect;
    }
    if(arg_d){
        rewrite ^ http://192.168.0.12:82/a/x permanent;
    }
}
```
测试结果如下：  
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1907/nginx3.png)

其中break那一条是404，因为跳转后不再匹配了，一般用于转到静态文件，或者其他域名。  
# 6 运行周期
`nginx`的运行周期分为11个阶段（有点多）。
```
- post-read:     读取请求内容
- server-rewrite:写在server范围内的rewrite执行
- find-config:   寻找符合条件的location
- rewrite:       写在location范围内的rewrite执行
- post-rewrite:  rewrite执行完成
- pre-access:    访问检查前
- access:        访问检查
- post-access:   访问检查后
- try-files:     try-files配置项执行
- content:       内容输出阶段
- log:           记录日志
```
你可能会有疑问，问啥有几个阶段要分别记录xx前/xx时/xx后，这是因为有些插件的执行时机是要在这些关键时间节点的。举个例子：比如使用了`access_by_lua`，则这部分代码是在access阶段进行的，如果有个请求对用户名密码进行了编码，而因为历史原因不能在这部分代码修改。则可以使用其他插件在pre-access阶段进行解码处理。

从几个阶段中，我们可以看出最重要的三个部分是：rewrite、access和content。这三个部分在lua插件中也分别对应了rewrite_by_lua、access_by_lua和content_by_lua。关于更多插件的使用将会在下一篇openresty中讲解。