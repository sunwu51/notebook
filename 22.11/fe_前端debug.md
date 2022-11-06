# 前端项目debug
这篇文章中将讨论如何debug以下几个项目场景
- 1 webpack + react (create-react-app)
- 2 vite + react (最轻量的react用法)
- 3 vite + lit (my favorite)
# 万能debug方法，直接浏览器debug
直接在浏览器上的调试方式，在react的chrome开发插件的支持下，进入查看源码在这可以打断点。
![image](https://i.imgur.com/rorDXN2.gif)
# creat-react-app
创建项目，该项目在当前目录的`my-react-app1`下，react版本当前是`^18.2.0`
```
npx create-react-app my-react-app1
cd my-react-app1
npm start
```
在vscode上debug，需要添加`.vscode/launch.json`文件，内容如下，该文件的意思是，在vscode debug中添加了一个配置，名为`Launch Chrome`，他的作用是打开`localhost:3000`并且会关联当前项目根目录来做`debug`，launch并不负责启动`npm start`，故需要我们先npm start之后再launch。
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000", // 改为自己的目标 url
      "sourceMaps": true,
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```
一定记得先运行`npm start`让页面先起来，再debug

![image](https://i.imgur.com/JiKq7Ub.gif)

vscode launch的方式，会新启动一个chrome匿名用户，不能用原来的cookie和插件，这一点比较坑。
![image](https://i.imgur.com/MSFZDYt.png)


# vite + react
```
npm create vite
// ...选择react + js + 项目名 my-react-app2
cd my-react-app2
npm i
npx vite
```
跟webpack的一模一样，只需要改下url的端口就行了，我这里vite启动的`http://localhost:5173`，改完后和上面create-react-app效果一样。

![image](https://i.imgur.com/NOikpvn.png)

# vite + lit
Lit也是一样的做法。
![image](https://i.imgur.com/xDPKBkZ.png)

# gitpod

