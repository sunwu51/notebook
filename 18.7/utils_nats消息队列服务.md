# nats
# 简介
nats是高性能、轻量级消息队列，服务器，用go语言重写后，具有极强的性能。基于订阅发布的方式，支持快速的集群化。这么好用的服务，快来尝试下吧。
# 开始
用docker运行一个nats服务器
```shell
docker run -d -p 4222:4222 -p 8222:8222 nats:linux
```
# Js API 
```
npm i nats
```
```javascript
var NATS = require('nats');
var nats = NATS.connect();
 
setInterval(function(){
    nats.publish('foo', 'Hello World!');
},1000);

nats.subscribe('foo', function(msg) {
  console.log('Received a message: ' + msg);
});
```
# Java API
```xml
<dependency>
    <groupId>com.github.cloudfoundry-community</groupId>
    <artifactId>nats-client</artifactId>
    <version>0.6.4</version>
</dependency>
```
```java
import nats.client.*;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Nats nats = new NatsConnector().addHost("nats://localhost:4222").automaticReconnect(true).connect();
        //订阅
        Subscription subscription = nats.subscribe("foo");
        subscription.addMessageHandler(message-> System.out.println(message.getBody()));
        //发布
        while (true){
            Thread.sleep(1000);
            nats.publish("foo","Hello Java!");
        }
    }
}
```
是不是非常简单呢！
# Web扩展
如果能将消息队列直接传到网页，那在调试阶段会是件很不错的事情。刚好nats有这样的扩展，这里我封装好了docker。使用docker-compose运行如下yml文件，即可，这样在启动nats服务器之外，又启动了一个ws-tcp转换的插件，可以在网页端订阅/发布消息了。
```yml
version: '2'
services:
  nats:
    image: nats:linux
    ports:
    - 4222:4222
    - 8222:8222
  ws:
    image: sunwu51/ws-tcp-reply
    depends_on:
    - nats
    ports:
    - 4223:4223
    command: /ws-tcp-relay_linux_arm nats:4222
```
网页需要引入这个js文件
```html
<script type="text/javascript" src="https://cdn.rawgit.com/isobit/websocket-nats/master/dist/websocket-nats.min.js"></script>
```
此时会有一个全局变量NATS，他的用法和上面nodejs里的几乎一模一样，只不过这里连的端口改为4223.