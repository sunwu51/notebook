# heroku
`heroku`与`firebase`的定位有点像，提供web服务的托管以及数据库。如果想了解`firebase`的功能可以参考`18.8`中的文章。
# 基本用法
## 1 下载cli
通过[这个网址](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up)下载适合自己os的cli。
## 2 创建Nodejs项目
```bash
$ mkdir test
$ npm init -y
$ npm install --save express
```
编辑index.js，一定要注意web服务监听的端口**必须是process.env.PORT**
```javascript
var app = require('express')()

app.get("/",(req,res)=>{
    res.send('hello world')
})

const PORT = process.env.PORT || 5000

app.listen(PORT)
```
修改package.json中的script项，因为Nodejs类型的项目在heroku默认启动脚本是npm start
```json
"scripts": {                                
    "start":"node index.js"
}                                                    
```
然后通过`npm start`可以在本地5000端口看到服务
整个过程动图：    
![image](https://github.com/sunwu51/image/raw/master/1904/hero1.gif)  
## 3 关联heroku
```bash
# 登录，弹出浏览器进行登录
$ heroku login
# 创建git项目
$ git init
$ git add .
$ git commit -m "first commit"
# 关联heroku项目(实质上将git的远程仓库设置为heroku的仓库)
$ heroku create
$ git push heroku master
# 打开部署好的网址
$ heroku open
```
整个动图过程如下，注意！node_module文件夹其实不用上传的，nodejs项目会自动根据package.json下载依赖，这里应该加个.gitignore更好  
![image](https://github.com/sunwu51/image/raw/master/1904/hero2.gif)  

注意：如果不是新创建项目。而是想clone已经存在的heroku项目则使用
```bash
# 类似于git clone
$ heroku git:clone -a xxx
```

以上就是最基本的web应用的部署了，heroku还有其他的部署方式，像zeit一样，他也有docker方式的部署（需要本地Docker环境这里不展开说了）。
# add-on数据库支持
em...heroku其实官方提供三种数据存储服务redis、postgres和kafka，虽然有免费的套餐，但是要绑定信用卡先（即使免费）。我绑定了信用卡，然后将项目中添加了redis实例,hobby-dev是免费的plan。  
```bash
$ heroku addons:create heroku-redis:hobby-dev
```
![image](https://github.com/sunwu51/image/raw/master/1904/hero3.gif)   
然后使用nodejs访问redis，先安装依赖`npm install --save redis`,对index.js进行修改，添加如下代码  
> 注！：环境变量`REDIS_URL`记录了本项目的redis地址，一定不要写错。
```js
var client = require('redis').createClient(process.env.REDIS_URL);

app.get("/set",(req,res)=>{
	client.set("date", new Date());
    res.send('ok')
})
app.get("/get",(req,res)=>{
    client.get("date", function (err, reply) {
		if(!err){
			console.log(reply); 
			res.send(reply)
		}
	});
})
app.get("/del",(req,res)=>{
    client.del("date");
    res.send('ok')
})
```
添加上面代码后，重新提交git改动，并push代码，然后部署后效果如下  
![image](https://github.com/sunwu51/image/raw/master/1904/hero4.gif)  
# docker方式部署
heroku支持docker方式来部署，需要当前机器安装好docker。其原理为本地build，然后上传到heroku的一个镜像仓库。然后将容器发布（运行）。

主要步骤为：先在web创建APP，本地创建文件夹，初始化git，然后remote绑定到APP。
```bash
# 登录镜像仓库
heroku container:login
```
然后再当前目录下写代码，和Dockerfile。注意一定要有dockerfile。
```bash
# 这条指令=docker build + docker push
heroku container:push web
# 注意web关键字不能改成别的
heroku container:release web
```


# 小结
heroku工作方式如下，nodejs中默认执行npm install和npm start，其他项目要自己去了解下。  
![image](https://github.com/sunwu51/image/raw/master/1904/hero.jpg)  

该平台还算是比较好用，我们对比firebase看下他的优缺点吧。  

优点是：
- cli可以流畅登录，firebase登录总遇到问题。
- 提供的数据库更实用，firebase只提供实时数据库。
- 部署后网站国内可以访问，firebase因为是谷歌的不能访问。

缺点是：
- 功能只有web服务和数据库，没有firebase丰富。
- 指令比较复杂，还利用了git仓库，没有firebase封装的好，后者操作更简单。
- 虽然部署后的地址可以访问，但是管理页面经常（国内网）上不去。
- 一开始访问总是会卡半天，类似zeit需要重新部署，用户体验较差
![image](https://github.com/sunwu51/image/raw/master/1904/hero2.png)  