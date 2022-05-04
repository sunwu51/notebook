# vite
一个功能类似webpack的构建工具，但是比webpack要更快，配置更简洁。主要是因为直接使用了浏览器刚支持没多久的esm，即可以在浏览器`import/export`了。
# 超简单的配置
## 对于没有使用react/vue这样需要编译的语法的情况
项目代码在vite/vite1目录下
```shell
npm i -D vite
npm i --save jquery bootstrap
```
保证项目目录下有个index.html，通过module类型引入业务js文件
```html
<div id="root" class="container"></div>
<script type="module" src="./main.js"></script>
```
main.js
```js
import $ from "jquery";  // 引入jquery库
import 'bootstrap';      // 引入bootstrap的js库(bootstrap动画部分需要js)
import 'bootstrap/dist/css/bootstrap.min.css'; // 引入css文件

$('#root').text("Hello jQuery!");
```
然后运行vite就可以启动一个热编译的webserver了
```
npx vite
```
![image](https://i.imgur.com/pI37F8n.png)

通过build指令可以在dist目录得到一个index.html和css/js所在的asset目录。
```
npx vite build
```
## react
项目代码在vite/vite2目录下

index.html与原来基本不变，js改为jsx即可，默认vite将jsx认为是react文件
```html
<div id="root"></div>
<script type="module" src="./main.jsx"></script>
```
main.jsx
```jsx
import ReactDOM from "react-dom";
import React from "react";

ReactDOM.render(
  <h1>Hello, world!</h1>,
  document.getElementById('root')
);
```
![image](https://i.imgur.com/VG1JbdY.png)

引入antd
```
npm install --save antd
```
html代码不动，main.js入口文件需要引入css，只引入一次就可以，其他文件不需要再次引入，当然引入也没啥用，重复的就自动去掉了，然后引入antd的组件就可以用了。
```jsx
import ReactDOM from "react-dom";
import React from "react";
import 'antd/dist/antd.min.css'
import { Button } from 'antd';

ReactDOM.render(
  <Button type="primary">antd</Button>,
  document.getElementById('root')
);
```
![image](https://i.imgur.com/8zw7rNJ.png)

## vue
vite本来就是尤雨溪为了vue做的，集成肯定是无比丝滑，项目在vite/vite3目录.
html不需要改动。main.js中创建vue app.
```js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount("#root")
```
因为想单独写vue格式的文件，所以main.js又引入了App.vue。
```vue
<script>
export default {
  data(){
    return {count: 0}
  },
  methods: {
    increse(){
      this.count ++;
    },
  }
}
</script>

<template>
  <div>
    {{ count }}<button @click="increse">+</button>
  </div>
</template>
```

因为vue不是js jsx这种通用的文件格式，所以需要下载专门的插件来解析
```
npm i -D @vitejs/plugin-vue
```
然后需要配置vite.config.js如下
```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()]
})
```
![image](https://i.imgur.com/FrLLitx.png)

## lit
lit是基于原生webcomponent，其本身是不需要额外编译的，所以和jquery一样来使用即可，在vite1目录上直接改动。
```
npm i --save lit
```
html中加入lit的js文件，并使用lit中自定一个my-counter标签
```html
...
<script type="module" src="./lit.js"></script>
<my-counter/>
```
lit.js
```js
import { LitElement, css, html } from 'lit';


class MyCounter extends LitElement {
  static styles = css`
    button { width: 100px; height: 100px }
  `
  
  static properties = {
    count : {type: Number}
  }

  constructor() {
    super();
    this.count = 0;
  }
  render() {
    return html`
      <button @click="${()=>this.count++}">${this.count}</button>
    `
  }
}
customElements.define('my-counter', MyCounter)
```

![image](https://i.imgur.com/yejGscN.gif)

# 关于scss和ts的支持
scss和ts在vite中是默认就支持的，不需要配置loader。如果使用vscode会有些设置的告警，可以在vscode的setting中开启`experimentalDecorators`。

直接在js中`import './main.scss'`就可以引入scss文件，ts则直接写就行，正常import和script引入也可以。如果是vue中使用标签引入，则指定下lang就可以了。
