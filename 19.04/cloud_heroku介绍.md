# heroku
`heroku`与`firebase`的定位有点像，提供web服务的托管以及数据库。如果想了解`firebase`的功能可以参考`18.8`中的文章。
# 下载cli
通过[这个网址](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up)下载适合自己os的cli。
# 创建Nodejs项目
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
# 关联heroku
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

