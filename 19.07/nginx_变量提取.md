# nginx的变量提取
# 1 现象
playwithdocker或者coding中进行端口映射，获得一个域名，该域名其实访问的是80端口但是可以映射里面任意端口。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1907/nginx1.gif)

上图中知道这是根据域名中有一部分含有的参数来作为端口的。他的运行原理是
```
域名请求-->解析出服务器IP字段和port字段-->转发到http://ip:port
```
# 2 用nginx实现
分析了实现原理后，我们尝试用nginx自己实现下类似的功能。功能为：
- 访问： `http://xx.nginx.microfrank.top`
- 转至： `http://192.168.0.12:xx`
- xx是具体的端口数

首先需要修改域名xx.nginx.microfrank.top映射到nginx服务器所在的ip，如果只是测试，可以直接修改host文件。否则需要在域名管理页面添加记录`*.nginx`映射到自己的nginx服务器。

在`nginx.conf`添加一条server配置（原来的不用动）
```ini
     server {
        listen       80;
        server_name  *.nginx.microfrank.top;


        location / {
        	if ( $host ~* (.*)\.(.*)\.(.*)\.(.*) ) {
            	set $myport $1;
            }
            proxy_pass http://192.168.0.12:$myport;
#           proxy_set_header Host $host;
#           proxy_set_header X-Real-IP $remote_addr;
#           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
	}
```
首先是server_name通配符匹配出符合形式的域名，然后location中用正则组将host中的第1部分即端口部分过滤出来，最后转发只需要将变量拼接进字符串即可。

效果如下，访问特定域名，可以解析出域名中的端口并进行转发，得到端口对应的页面。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1907/nginx2.gif)

# 3 其他知识点
- nginx 的location中/的使用需要小心，可以参考之前的文章。
- server_name通配符只能用在头尾，如`*.a.com`和`a.b.*`其他形式可以用正则`~^a.(\d\d).b.com$`。
- !!!!! 域名服务中配置通配符，namecheap中可以直接配置`*.nginx`。但是不能`nginx.*`，这种形式叫泛域名解析。
