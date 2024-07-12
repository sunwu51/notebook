---
title: 注入任意react网站
date: 2024-07-12 23:00:00+8
tags:
    - 油猴
    - 插件
    - react
    - 前端
---
# 背景
事情是这样，公司的服务器登录使用的是`webshell`用的`xterm.js`框架在升级之前，在`window`上下文是有一些全局变量，像`ws`就是这个`webshell`的`WebSocket`对象。

之前基于这个`ws`对象，写了一些发送指令给服务器的油猴脚本，但是后来这个页面升级成`react` + `webpack`了，这样没有全局变量了。也就没法完成之前的工作了。
# 解法1 自行替换WebSocket
其实本质是要`WebSocket`对象，而这个对象是由全局函数`new WebSocket(url)`产生的。那么如果能对这个函数进行拦截，然后做相应的处理是不是就完事大吉。
```js
var OldWs = window.WebSocket;

function NewWs(url, protocols) {
    const wsInstance = OldWs(url, protocals);
    // 实现原来功能之后，把全局变量ws赋值
    window.ws = wsInstance;
    return wsInstance;
}
// 原型链 和 静态属性 都copy过来
NewWs.prototype = OldWs.prototype;
Object.setPrototypeOf(NewWs, OldWs);

window.WebSocket = NewWs;
```
# 解法2 Proxy增强WebSocket
与解法1一样思路的另一种解法，直接使用js中`Proxy`函数进行代理。
```js
const OldWs = window.WebSocket;
// 创建一个 Proxy 构造函数来拦截 WebSocket 的实例化
const NewWs = new Proxy(OldWs, {
    construct(target, args) {
        const wsInstance = new target(...args);
        // 将实例附加到全局变量 ws
        window.ws = wsInstance;
        return wsInstance;
    }
});

// 替换原生的 WebSocket 构造函数
window.WebSocket = NewWs;
```
`Proxy`显然更贴切一些，不需要处理原型链和属性，他的用法详细可参考[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)，`const p = new Proxy(target, handler)`。

这里我们只需要捕捉构造函数，所以只需要在hanler中配置`construct`，这个属性的定义可以[参考](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/construct)。

解法2算是解法1的优雅版本。
# 解法3 解析react组件
前面两个方案都只适用于对已知函数`WebSocket`的代理，但是实际我发现我还需要`xterm`中的`term`对象，来捕捉当前`webshell`中选中的文字，因为默认的`window.getSelection`无法获取shell中的选中文本，只能用`term.getSelection`。

这就只能获取到这个`term`对象了，他是一个`xterm`中定义的`Terminal`类型的对象，但是`xterm`已经整个被`WebPack`给打包到`bundle.js`中了，很难对他进行注入了。

这时候，我使用`React`的chrome组件发现当前页面结构非常简单，并且很容易就找到了`term`所在的组件，并且上面所需要的`WebSocket`实例也在这里面。

![img](https://i.imgur.com/nlmUw04.png)

那接下来就是如何从一个生产环境的react页面中，解析其中的组件了，这个问题显然抛给`GPT`在合适不过了，我询问`GPT`如何在已有的react页面中获取指定名字的组件对象，答案就出来了，稍作加工如下。
```js
//获取React根节点并遍历组件树
function getReactComponent(root, targetComponentName) {
    const reactInstance = root._reactRootContainer._internalRoot.current;

    function findcomponent(node) {
        if (node.elementType && 
            node.elementType.name === targetComponentName) {
            return node;
        }
        const children = node.child;
        while(children){
            const result = findComponent(children);
            if(result) return result;
            children= children.sibling;
        }
        return null;
    }
    return findComponent(reactInstance);
}

var root = document.getElementById("root");

var term = getReactComponent(root, "w").memoizedProps.terminal
var ws = term.websocket;
```
原来`react`应用渲染的`<div id="root"></div>`根节点上会追加一个`_reactRootContainer`的属性，通过这个属性就能把所有的react组件节点都遍历出来，估计react chrome插件就是这么干的。对于每个子节点的遍历，是通过`sibling`函数，类似`next`的作用；对于每个node的名字则是放到了`elementType.name`中；每个node的属性则是放到了`memoizedProps`注意不是`props`，后者是我们开发的时候的叫法。

这里还有个问题就是，`w`这个名字是打包的时候随机生成的一个简单hash值，他之后网站更新可能不叫`w`了，所以最好改成一些特征校验，比如说要找一个组件，组件的`memoizedProps.terminal != null`.
```js
// 根据条件获取组件
function getReactComponent(root, checkFn) {
    const reactInstance = root._reactRootContainer._internalRoot.current;

    function findcomponent(node) {
        if (checkFn(node)) {
                return node;
        }
        const children = node.child;
        while(children){
            const result = findComponent(children);
            if(result) return result;
            children= children.sibling;
        }
        return null;
    }
    return findComponent(reactInstance);
}
var root = document.getElementById("root");

var term = getReactComponent(root, node=>node.memoizedProps && node.memoizedProps.terminal).memoizedProps.terminal
var ws = term.websocket;
```
# 启发
通过解法3，给我打开了新世界的大门，之前写的一些油猴脚本，要么就是一些老式网站的增强，要么就是一些全局层面的函数。对于react页面，因为觉得被bundle和compress了，觉得不太能解剖了。结果不经意间问了gpt，发现原来是有解法的。

由此，对于很多工作中的内部管理系统的页面，基本都是`react`的，很多地方都可以进行增强了。后续有了新的感悟会更新到这里。