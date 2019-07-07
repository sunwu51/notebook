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