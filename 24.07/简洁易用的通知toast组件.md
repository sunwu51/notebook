---
title: 简洁易用的通知toast组件
date: 2024-07-03 19:52:00+8
tags:
    - 前端
    - 组件
    - react
    - toast
---
# 介绍
[react-hot-toast](https://react-hot-toast.com/)是一款非常容易集成的轻量可定制化风格的`toast`组件，非常适合用来集成到自己项目中。

官网做的非常好，把各种用法和效果都清晰的展现了出来，只需要三步，两行代码就能完成。

![image](https://i.imgur.com/kogruX5.png)

<iframe src="https://codesandbox.io/embed/xmqtg8?view=previe+%2B+weditor"
     style={{width:'100%', height: '500px', border: 0, borderRadius: '4px', overflow:'hidden'}}
     title="toast-demo"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

# 占位符内置功能
官网列出了两个重要属性，一个是通知弹出的位置，默认是`top-center`还可以改到其他地方，另一个就是`reverseOrder`默认是`false`，是反转弹出的顺序，一般放在下方的时候需要反转，比较符合人类习惯。

![image](https://i.imgur.com/Qolb3Zj.png)

```jsx
<Toaster
  position="top-left"
  reverseOrder={false}
/>
```

# 函数内置功能
上面的`toast(string)`方法生成一个有阴影和圆角的默认样式，并且会一段时间后自动消失，并且多个通知会进行排列。

除此之外，默认还提供了其他的预设样式，例如`toast.success(string)`就会有个绿色对号图标，而`toast(()=>{return jsx})`则可以渲染一个jsx组件。

![img](https://i.imgur.com/omIiPKi.gif)

注意：`toast(()=>jsx)`渲染的是内部的元素，整个通知容器还是固定样式，如果要修容器，就参考`Dark Mode`，在第二个参数中传入`style`或者`className`属性。

以上非常简单容易验证，可以在上面`codesanbox`中自行修改和体验。