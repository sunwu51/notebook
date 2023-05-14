# web worker
前面说过了service worker，一个独立运行的线程，作用于多个符合scope条件的页面，主要用来做资源的缓存用。而web worker就比较容易理解，他就是一个页面可以专门为自己创建的一个后台线程，可以做一些脏活累活。

service worker的生命周期非常长，甚至页面关闭了，service worker都还在运行，但是是单例的。而web worker生命周期是伴随当前页面的，更容易控制。
# 如何使用
原生的`Worker`和serviceworker用法类似，都是指定一个js文件，注册为worker线程去执行。

然后通过`message`事件和`postMessage`方法，接收和发送消息给worker线程，terminate方法关闭线程。
```js
const worker = new Worker('worker.js')

worker.addEventListener('message', (e)=>{
    console.log("来自worker的数据", e.data);
})

document.getElementById("btn").addEventListener("click", function() {
    worker.postMessage('Greeting from Main.js');
})

// worker.terminate()

```

相对应的在`worker.js`中用法类似
```js
self.addEventListener('message', e => {
    self.postMessage(e.data); // 将接收到的数据直接返回
});
```
# 在worker中引入其他js
在worker中我们如果要用一些js的库，因为不能访问window作用域的变量，所以没法用主页面的js，需要通过如下，专门的写法来引入js。当然需要注意的是如果我们引入的库，有操作dom的行为，是会失败的，因为worker中this不是window。web worker引入脚本可以是跨域的。
```js
importScripts('test.js');
```
# 使用场景
web worker非常适合第三方的插件脚本的加载和使用，例如google的广告脚本，会在广告展示和播放过程中发送beacon，这种第三方的脚本就可以用上面worker的`importScript`来进行导入。并在需要发送beacon的时候通过postMessage传给worker线程，由worker来做发送数据的活。
# 框架
`partytown`是一个基于web worker的框架，有兴趣可以去看一下。