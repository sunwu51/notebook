# 我的前端局限
重新写前端的时候，才发现我个人的前端知识有着巨大的漏洞。很多原理性的东西不懂，导致有些东西写的云里雾里，即使写出来了，也其实没有搞懂内部的逻辑。

尤其是各大框架提供了脚手架，事先配置好的`webpack`把各种东西都封装在内了，导致离开了脚手架，就很难自己独立写好前端了。

# 新知识的渴望
我还是很喜欢前端的快速进化的，作为一个写过asp、php和jsp，也写过jquery、lodash和bootstrap，还写过react、antd的前端开发者。我歌颂轻量简洁和快速，赞美强大、极客和原生。我多希望浏览器能支持更高级的ES2020语法规范，多希望不再需要复杂的编译和打包工具。但最终的统一到来前，是需要打好基础的，尤其是技术为什么出现，解决什么痛点，同质化产品有哪些，特点又是什么。试着去了解，去体会，去进步。

# 需要补充的基础
- `babel`与`swc`是如何工作的？他们把什么语法编译成了什么语法，如何编译依赖关系的？
- `webpack`与`vite`是如何工作的？他们怎么编译css/img等的依赖？
- 如何从`js`转变到`ts`，并更好的接受他？
- 如何自己配置一个`react`或者`lit`的`webpack`和`vite`配置？
- 各种前端的路由实现原理是什么？`vaadin`中`java`和`ts`。
- `shodow dom`是什么？原生性会不会成为以后的趋势？
# 1 babel与swc
通俗讲js编译器其实就是将高版本的JS语法规范降低到低版本。当然通过加一些插件可以实现`ts`和`jsx`以及`tsx`都可以作为转换源。编译器的应用场景不光是前端，他只是从一个版本的js语法翻译到另一个版本而已，也可以用来写后端nodejs的模块，因为nodejs只支持commonjs版本的语法，默认不支持export语法。

[Why you should use SWC (and not Babel)](https://blog.logrocket.com/why-you-should-use-swc/)

```
$ npm install --save-dev @babel/core @babel/cli @babel/preset-env @babel/preset-react
$ npm install --save-dev @swc/core @swc/cli
```

高版本js规范典型的语法有，async与await，let，箭头函数，import与export等。

## 1.1 babel
如果不指定配置的话，babel是不知道要翻译成哪个版本的js语法，直接编译发现还是高版本的语法。

![image](https://i.imgur.com/FxnKAkG.png)

所以需要项目目录下创建`babel.config.js`文件。
```js
const presets = [
  [
    "@babel/preset-env",
    {
      targets: {
        edge: "17",
        firefox: "60",
        chrome: "67",
        safari: "11.1",
      },
      useBuiltIns: "usage",
      corejs: "3.6.4",
    },
  ],
];

module.exports = { presets };
```
再次运行相同指令后，就能看到编译后的结果了
![image](https://i.imgur.com/uiToCva.png)

`对jsx编译`，react中的使用，将config中env预设，替换为react预设，其他都去掉就可以
```js
const presets = [
  [
    "@babel/preset-react"
  ],
];

module.exports = { presets };
```
![image](https://i.imgur.com/2z2EHaZ.gif)

只有编译还不够，因为react预设中`import`语法是原样输出的，而import的文件可能是自己的代码，也有可能是`node_modules`中下载的库，如何去把modules目录的文件打包过来，这就是打包工具的任务并不是`babel`要做的事情了，我们后面在看。
## 1.2 swc
swc是rust写的速度比babel快，babel采用了payfill的策略解决有些浏览器没有特定api的问题，swc则没有，swc的配置更加友好，默认配置下对之前的index.js进行编译如下。

![image](https://i.imgur.com/Hsx3ARM.png)

`对jsx编译`，效果与babel完全一致。
![image](https://i.imgur.com/ws3zYob.png)

babel与swc编译效果差别不大，主要是编译的速度、配置方式、以及对部分浏览器不支持的功能的补偿操作的不同，他们都是最基础的工具，是没办法只用他们组织react项目的，因为大型项目需要本地开发，依赖放到`node_modules`，如何将import的资源进行打包，就落到了打包工具的肩头上。
# 2 webpack与vite
## 2.1 webpack
```
npm install webpack webpack-cli --save-dev
```
上面的例子中，react是通过script标签引入的，工程化开发和打包如下
```
npm install --save react react-dom
npx webpack #注意默认是src/index.js为入口，dist/main.js为输出
```
react是既需要编译又需要打包的，我们先以不需要的编译的純打包的d3、lodash为例。

![image](https://i.imgur.com/fLlzDX1.png)

在html直接引入main.js

![image](https://i.imgur.com/3VgWUgN.png)

react：需要先编译，所以需要上面的babel作为loader对文件先进行编译在pack。最手动的方法就是babel react的入口js文件，然后对这个文件进行webpack。

```
npm install -D babel-loader @babel/core @babel/preset-react
```

添加`webpack.config.js`如下，
```js
const path = require('path');

module.exports = {
  output: {
    filename: 'bundle.js',
  },
  module: {
    rules: [{
      test: /\.js?$/, // 用正则来匹配文件路径，这段意思是匹配 js 或者 jsx
      exclude: /(node_modules|bower_components)/,
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-react']
      }
    }]
  }
};
```
编译src/index.js，并在html中引入最后集成的js文件
```
npx webpack
```
![image](https://i.imgur.com/CROMirZ.png)

到这还只是简单的配置，复杂的配置包括了bundle文件拆出多个chunk文件如何配置，css和style的loader怎么配置，静态资源loader怎么配置等等。
## 2.2 vite
vite是另一个打包工具，与webpack稍有不同的是，webpack是以单个js文件(默认src/index.js)为entrt-point，相当于是个root节点，找他的所有依赖。所以会导致我们改动任何一个文件，重新编译都是走整个树状依赖结构的编译。vite则是以html文件(默认index.html)为入口，在html中找到moudle类型的script标签，进行编译，vite在开发模式下是惰性编译的，且使用了go写的编译器速度快很多。

react:
```
npm i -D @vitejs/plugin-react
```
添加vite.config.js文件，
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()]
})
```
index.html中需要用module类型的script标签，然后文件默认需要是jsx后缀，否则不按照react去编译。
```html
<div id="root"></div>
<script type="module" src="/src/index.jsx"></script>
```
```
vite # 可以提供一个热部署的webserver
vite build # 可以编译打包
```