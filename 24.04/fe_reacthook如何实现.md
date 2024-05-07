# react的hook是如何实现的
# useState
useState的用法如下，返回一个数组，数组的第一个元素是状态值，第二个元素是状态值的更新函数。

而组件的渲染都是需要运行组件这个函数本身的，那这里就会有一个问题，下面`useState`这一行，在每次组件渲染的时候都会重新运行，可这样的话，count是怎么拿到之前的状态值呢？
```js
function Component() {
    let [count, setCount] = useState(0);
    setCount(count + 1);
    return count;
}
```
秘密大概就是`useState`使用了数组来记录这些状态：
```js
// 首先有一个记录该组件多种状态信息的wrapper，主要就是有个arr数组
// 对应一个组件中多次useState
function wrapper() {
    let arr = [];
    let index = 0;
    function useState(initState) {
        let localIndex = index++;
        
        // 如果设置了初值
        if (arr[localIndex] === undefined && initState!== undefined) {
            arr[localIndex] = initState;
        }
        
        // setState修改当前下标的值
        function setState(newState) {
            arr[localIndex] = newState;
        }

        // 返回初值 和 setState函数
        return [arr[localIndex], setState];
    }
    function clearIndex() {
        index = 0;
    }
    return {useState, clearIndex};
}

let wr = wrapper();
let {useState, clearIndex} = wr;
function Component() {
    try {
        let [count, setCount] = useState(0);
        setCount(count + 1);
        return count;
    } finally {
        clearIndex();
    }
}
```

![image](https://i.imgur.com/5xMWBhM.png)

通俗点解释：在import引入useState的时候，其实就是执行了`wrapper`函数，创建了一个记录着数组变量的闭包对象，对于当前组件的所有状态值，都保存在这个数组中，第一次使用`useState`的代码对应数组的第0个元素，依次类推。

这其实就解释了为什么每次渲染是重新运行`Component()`，但是count还能像全局state一样保存，就是因为count是存到了wr这个对象中的，而wr对应的就是`import {useState} from 'react'`，在import的过程中，创建了这样一个匿名的对象来存储当前组件的状态值列表。

当然为了每次渲染之前index都能归零，所以有`clearIndex`这一步。
# useEffect
我们在上面的例子基础上添加：
```js
function wrapper() {
    let arr = [];
    let index = 0;
    function useState(initState) {
        let localIndex = index++;
        if (arr[localIndex] === undefined && initState!== undefined) {
            arr[localIndex] = initState;
        }
        function setState(newState) {
            arr[localIndex] = newState;
        }
        return [arr[localIndex], setState];
    }

    function clearIndex() {
        index = 0;
    }

    function useEffect(callback, deps) {
        let localIndex = index++;
        if (!deps) {
            setTimeout(callback, 0);
            return;
        }
        for(var i=0; i<deps.length; i++) {
            if (deps[i] != arr[localIndex][i]) {
                setTimeout(callback, 0);
                return;
            }
        }
    }
    return {useState, clearIndex, useEffect};
}

let wr = wrapper();
let {useState, clearIndex, useEffect} = wr;
function Component() {
    try {
        let [count, setCount] = useState(0);
        useEffect(()=>{console.log("effect")})
        setCount(count + 1);
        return count;
    } finally {
        clearIndex();
    }
}
```

![image](https://i.imgur.com/71XWpGm.png)

`useEffect`的执行是异步的，也就是说`useEffect`的回调函数会在下一个事件循环中执行，`setTimeout(0)`就是最简单的实现方式，而`useEffect`的依赖数组，其实就是当前组件的状态值列表，当状态值发生变化的时候，就会执行`useEffect`的回调函数。

`react`中`useEffect`的用法中还有一项是，callback的返回值是个函数，会在组件卸载的时候执行，用来清理一些状态值，这里我们就不模拟了，因为我们只是在了解数据的状态转移，并没有涉及到组件的渲染和卸载，这是react中另外一个话题。当然这个功能其实也不难，比如直接搞一个新的数组，用类似的方式来记录callback的返回值，当组件卸载的时候，遍历这个数组，执行其中的函数即可。

