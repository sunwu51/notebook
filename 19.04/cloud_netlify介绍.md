# netlify
`netlify`又是一个类似`firebase`或者`heroku`的平台了，如果想了解firebase可以查看18.8里的文章，如果想看heroku，可以查看19.04中的文章。我们在本文小结中会对三个平台进行详细的对比。
# 静态页面 >> 对标`firebase-host`
可以使用三种方式进行部署：1直接将含有index.html文件或者含有toml配置的文件夹拖拽。2使用cli用指令部署。3使用github项目地址部署。这里更倾向前两种。  

通过拖拽：  
![image](https://github.com/sunwu51/image/raw/master/1905/net1.gif)   
通过cli
```
$ npm install netlify-cli -g
$ netlify login
```
cli部署需要指明静态文件的目录名，因而需要创建一个配置文`netlify.toml`
```toml
[build]
    publish="dist"
```
开始部署，效果与之前一样。
```
$ netlify init
$ netlify deploy
```
!! 如果不确定部署之后的效果可以用`netlify dev`在本地启动看下效果。
# 函数功能 >> 对标`firebase functions`
修改配置文件（不修改默认是functions目录，这里改成func）
```toml
[build]
    publish="dist"
    functions="func"
```
创建函数
```bash
$ netlify functions:create hello
```
创建后在对应的func目录下生成一个js文件，如下  
![image](https://github.com/sunwu51/image/raw/master/1905/net2.png)  
其内容为：
```js
exports.handler = async (event, context) => {
  try {
    const subject = event.queryStringParameters.name || "World";
    return { statusCode: 200, body: `Hello ${subject}` };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
```
这个函数默认路径是`/.netlify/functions/hello/hello.js`，路径非常的长，所以可以在下面的路径代理功能中为函数路径设置代理。

这里使用的是AWS的lambda写法，event是http请求内容主要有path header body queryStringParameters等五个字段。
![image](https://github.com/sunwu51/image/raw/master/1905/net3.png)  
如果是form提交的`body`默认是base64编码后的，可以解码成"a=b&c=d"这样的字符串。而如果是json提交的则是没有base64编码的，直接是json字符串。
# 路径代理
前端项目经常会需要后台代理一下，来解决跨域问题，这里专门可以在静态目录下设置`_redirects`文件进行代理。例如
```
/json https://jsonplaceholder.typicode.com/todos/1
/json/* https://jsonplaceholder.typicode.com/todos/:splat
/baidu https://www.baidu.com 200
/api/hello /.netlify/functions/hello/hello.js 200
```
将/json的路径指向后面这个json实例接口。然后/json/xx会映射到后面这个路径，其中:splat被xx替代。然后是/baidu会转到百度首页，最后加的200则是修改状态码，默认是301网址跳转，加了200后，是后台拿取数据后以200状态返回，网址栏不跳。最后是对应自己的functions中的一条进行跳转。
# 小结
`netlify`相比`firebase`更轻量和易用，但是提供的功能也更少一些。主要功能就是静态页面和函数支持，没有提供数据库功能。而对比`heroku`则缺少数据库支持，函数部分必须按照lambda标准写。提供了身份认证功能，这个部分放到后面各种身份认证对比的文章中介绍。  
![image](https://github.com/sunwu51/image/raw/master/1905/net4.png)  



