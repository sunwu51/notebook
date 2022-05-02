# 吐槽各大前端框架
# 1 jquery
ajax用json请求的时候写法也太复杂了，什么年代了，能不能新增一个`$.ajaxByJson`方法封装一下？
```js
$.ajax({
    url:"demo_test.txt",
    headers:{ contentType: "application/json"},
    method:"POST",
    data:JSON.stringify({a:10}),
    success:function(result){
	console.log(result);
    }
});
```
# 2 react
这傻逼框架能不能先把库文件大小给缩小下，为啥人家vue库的代码实现了相同，甚至比你还多的功能，人家代码比你少那么多。你光一个`react-dom`就这么大，加上router、redux还有react自身，大的要命，我写个简单的后台页面，我自己的业务js代码还没有1k大，引个库是我的几百倍。

![image](https://i.imgur.com/6VjHx5E.png)

你这component语法能不能改友好一点，哦，你搞个`jsx`文件格式把三剑客语法都搞进来，你以为你狠幽默，用户很喜欢这么穿插着写吗，能不能学一学人家vue。你搞个`react`文件格式像vue一样简化下代码能不能行，这样读代码也方便，写代码也方便，比如我要在页面加个button我就只打开template标签，其他两个先关闭，这样coding页面也简洁。

![image](https://i.imgur.com/svH4RgR.png)
![image](https://i.imgur.com/fBSzCTg.png)

你能不能把router作为插件直接整合到`create-react-app`，我就纳闷大多数人开发难道不是都需要route组件吗，你非得让我自己下载，然后再去读route的文档回忆下怎么用。你直接集成一下，hello-word的demo直接套在route组件里，我一看代码也知道了基本用法，多省事啊，非得让我进行下面的手动安装，然后配置，让我多熟练下操作？
```
npm i --save react-router-dom
```
![image](https://i.imgur.com/nf5iv0O.png)

能不能好好优化下windows环境的开发，我上一次还能start，下一次就报一些莫名其妙的错误，真的很烦啊，我都不想用这个垃圾脚手架在windows上，以至于我不想再windows上写react，我经常需要`删除node_modules目录，重新npm i`来解决。

![image](https://i.imgur.com/Wi7PvtY.png)

# 3 vue
尤大你能不能再简化一下vue的基础结构，比如这个data函数，能不能改成一个属性，我每次写个data函数都是返回一个json对象，好傻啊。下面这一段每次都要写，能不能学一学svelte，不用用户去判断哪些是属于能触发页面re-render的，自动就能判断好。岂不是爽多了，你没发现人家svelte已经是最受欢迎的框架了吗。
```js
export default {
  data(){
    return {xxxx}
  }
}
```
![image](https://i.imgur.com/XLaa2qg.png)
# 4 lit
能不能把文档写的容易读一点，把重要的在一开始的概述里先讲一讲可好。能不能给个搭建基础环境的教程啊。上来根本就不知道怎么启动程序，能不能给个官方的脚手架工具啊，新手真的很不友好啊。
