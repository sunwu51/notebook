# background
在前端有很多组件库，比如`antd`，`material-ui`等。但是这些库有一些问题，第一就是css样式改起来非常麻烦，一般也就放弃修改了，另一个问题就是，当我们引入`antd`的时候，实际上给编译后的js文件增加了几十甚至上百k的大小，因为有很多用不到的东西也会被打包，即使我们只是为了用`antd`中某一个组件。

例如我们在vite中创建antd的一个项目，在没有引入css的情况下
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import {Button} from 'antd'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Button>click</Button>
  </React.StrictMode>,
)
```
开发模式启动后发现加载`antd.js`是有`4M`的，当然开发模式下大一点倒是没什么，因为一般local机器开发速度比较快。但是我们build之后发现这个js文件仍旧有`200K+`大小，当我们去掉`antd`之后js文件大小是140K（虽然也很大，react这玩意自己有点大）

![image](https://i.imgur.com/yIkFebC.png)
# shadcn
`shadcn`按照自己的介绍，他并不是一个组件库，而是一堆组件，你可以按照需要把用得到的组件添加到自己的项目中（按需添加）。

shadcn是需要tailwind的，也就是默认你的项目是有安装tailwind的，如果不了解tailwind的话，可以先去学一下，在上一篇文章中介绍过相关的安装方式。
```shell
npm create vite shadcn-demo -- --template react
cd shadcn-demo
npm i
npm i tailwind postcss autoprefixer
```
修改`vite.config.js`来添加根目录的别名@
```js
...
  resolve: {
    alias: {
      '@': resolve('.')
    }
  }
...
```
添加`postcss.config.js`配置文件，指定引入的插件如下，这样可以在vite运行的时候，自动编译tw的css文件
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```
而对于`tailwind.config.js`我们不着急自己配置，通过下面方式进行引入`shadcn`，这个过程中自动创建`tailwind.config.js`。
```shell
npx shadcn-ui init
```
不过这个`tailwind.config.js`配置和我们的目录结构有点不一样可以手动修改下content的配置
```js
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
	],
```
这样`shadcn`的基础使用环境就完成了，基本上就是`react`+`tailwind`需要的一套环境，接下来我们添加组件。

```shell
npx shadcn-ui add button # 注意指定自己合适的目录
```
![image](https://i.imgur.com/IzExngN.png)

接下来就可以使用了，需要引入css和组件jsx/tsx文件如下。
```jsx
import '@/styles/globals.css'
import {Button} from '@/components/button'

function App() {
  return (
    <>
      <Button>click</Button>
    </>
  )
}
export default App
```
![image](https://i.imgur.com/MMmPZoV.png)

代码可以参考`shadcn-demo`目录

打包后发现总js大小166k，在147k的基础上增加了很少的量，基本是一些工具库`clsx`等的占用

![image](https://i.imgur.com/R2tYOAI.png)

所以`clsx tailwind-merge`这些库，还有封装的`lib`目录下的utils.ts的作用是什么呢.

其实是为了让组件支持多个className的合并，在已有的className的基础上，我们还可以追加className，这是之前很多组件库做的不太好的地方。

效果如下。

![image](https://i.imgur.com/iJvornX.png)