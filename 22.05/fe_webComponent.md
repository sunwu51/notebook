# web component
# 背景
前端或者说web的演进过程大概就是，

从php这种服务端渲染+简单的页面布局，

发展到jquery/lodash等工具框架简化前端的日益复杂的场景，

再到移动互联网时代bootstrap/h5/css3响应式占据主流，

然后前端变得更重更复杂出现了前后端分离，或者说客户端渲染模式/单页应用/组件化开发。

组件化是一个必然的趋势，因为前端业务越来越繁杂，能将复杂的dom/js/css封装成一些成熟的组件，就能大大提高代码的复用，提高开发效率。所以react/vue/angular的核心概念都是组件，只要你学会了他们的组件怎么使用，你就学会了这个框架。然而不同的框架有着自己的组件声明语法和背后的实现逻辑，各大框架显然都是各自为战，组件不能互用，意味着你必须站队其中一个。比如你是react的坚定支持者，或者vue的忠实粉丝，也有可能你对两者都很熟悉，但是最终写项目的时候还是要做出选择。另一个令人头疼的问题是组件库，如果你是公司项目，那可能已经有内部的组件库，也就固定了必须用哪个框架。但是如果是自由项目，你发现一个很好看的组件库是基于react的，比如官方的antd组件库。但是你又是vue的粉丝，这时候就比较尴尬。（当然这是个例子，其实antd有民间的vue版本）

不过现在`Web Component`将要终结一切纷争，迎来最终的大一统，所有的第三方（非w3c）组织的框架，都要在`Web Component`面前黯然失色。他是W3C官方和谷歌微软等等公司一起拟定了新的组件规范。

# 愿景
原来写react的时候时常会想，我自己的Table组件用jsx写的是`<Table/>`，但是实际编译成浏览器支持的js后就会变成一系列dom支持的标签比如`<table>`等等的组合。
> 如果能真的在浏览器中自定义dom标签（组件）该有多好！

原来写前端项目的时候，都会经常使用`import/export`来引入自己的组件或者依赖中的组件，但是浏览器并不支持这个语法，编译js的过程变得非常复杂。
> 如果浏览器能原生支持`import/export`该有多好！

特大好消息，上述都已经在现代浏览器获得支持啦！`WebComponent`使得我们可以直接声明自己的标签贴到html代码中辣，`esm`的支持使得也可以用import直接引入第三方库啦。
# esm
先来说下esm的支持，例如我们可以这样引入第三方的库，比如jquery lodash d3的引入如下，注意script的type必须是module才支持import语法，然后是必须是esmodule版本的cdn库才可以。
```html
<div id="root"></div>
<script type="module">
  import $ from 'https://unpkg.com/jquery-es';
  import _ from 'https://unpkg.com/lodash-es'
  import * as d3 from 'https://unpkg.com/d3?module'
  d3.select("#root").style('color', 'red')
  $('#root').text('I am jquery and here is lodash ' + _.join([1,2,3]))
</script>
```
# HTMLElement与shadow DOM
WebComponent的规范主要是通过js对象HTMLElement和dom中的shadow dom来实现的。
```html
<script>
  // 通过extends HTMLElement，并在构造方法中，开启shadowDom，并追加自定义的标签即可实现，自定义的标签
  class MyC extends HTMLElement {
    constructor(){
        super();
        this.attachShadow({mode: 'open'});
        var d = document.createElement('div');
        d.innerHTML =`<p style='color:red'>This is content from custom component</p>`;
        this.shadowRoot.appendChild(d);
    }
  }
  // 将MyC这个组件注册到自定义的元素中，并命名为my-c标签，注意标签规范是小写，且必须有横线。
  customElements.define('my-c', MyC)
</script>
<my-c/>
```
可以在开发者模式中看到这个组件，确实使用的是my-c这个标签，并且内部有一个shadow root，其他元素都是挂在一个shadow root下面的。

![image](https://i.imgur.com/L8Q0Ez9.png)

shadow dom就像是一个黑盒，shadow内部任何变量、css样式都不与全局dom共享，这是很重要的一点，因为大多数情况下，例如我们声明一个`.my-style`样式，那么他的作用域默认就是全局的。shadow却能进行隔离，其实这也不是什么特别新的技术，其实有个远古的标签iframe就有类似功能，他能引入其他页面，并保持其他页面内部的变量样式等独立，也有个类似的#document。

![image](https://i.imgur.com/qCKPTJF.png)

react/vue好像也能限定css样式的作用域，他们也是用了shadow吗？并不是，他们的实现原理本质上都是将css在编译的时候改了名字，改成一个具有唯一标识的乱码的名字来实现的。

![image](https://i.imgur.com/Pa6LH1T.png)

# Lit
上面的`web component`声明方式比较麻烦。一方面是各种公逻辑包括html排布要写到constructor内部调理不太清晰，另一方面是dom状态改变重新渲染等逻辑需要自己重新绘制，所以就有了对`web component`的继承实现和简化的`lit`，这里需要注意的是`lit`与react等不同，他只是在原生webcomponent提供一些语法糖和逻辑优化，并不是创建只有自己这个框架才能用的组件！！这一点很重要。

```js
<script type="module">
  import {LitElement, html} from 'https://cdn.skypack.dev/lit-element';

  class MyElement extends LitElement {
    static properties = {
      name: {type: String},
    };

    constructor() {
      super();
      this.name = 'World';
    }

    render() {
      return html`
      <h1>Hello, ${this.name}</h1>
      `;
    }
  }
  customElements.define('my-element', MyElement);
</script>
<my-element name="张三"></my-element>
```

# properties & attributes
Attributes are key value pairs defined in HTML on an element.
```html
<div id="myDiv" foo="bar"></div>
```
```js
const myDiv = document.getElementById('myDiv');
console.log(myDiv.attributes);
console.log(myDiv.getAttribute('foo'));
```
Properties are key-value pairs defined on a javascript object.
```js
const myDiv = document.getElementById('myDiv');

myDiv.foo = 'bar';
```

dom中的attribute必须是数字、字符或者bool值，这使得如果传输json对象或者数组数据的时候受阻，lit的解决方案是：传`JSON.stringify(*)`内部自动会将attribute转换为property，并且如果是json字符串的会转回js对象/数组，根据properties的声明。

还是上面hello word的例子，如果穿的是对象，则可以声明为Object类型，并传递jsonstring即可，此时会做自动的转为json对象操作。
```js
<script type="module">
  import {LitElement, html} from 'https://cdn.skypack.dev/lit-element';

  class MyElement extends LitElement {
    static properties = {
      person: {type: Object},
    };

    constructor() {
      super();
      this.person = {name: 'World', age: 0};
    }

    render() {
      console.log(this.person)
      return html`
      <h1>Hello, ${this.person.age} years old ${this.person.name}</h1>
      `;
    }
  }
  customElements.define('my-element', MyElement);
</script>
<my-element person='{"name":"张三","age":11}'></my-element>
```
# re-rend
初次渲染之后，经常还有异步的再次渲染，比如点了个按钮之类的事件，要触发页面变动，在lit中只需要修改properties中定义的key的值，就可以自动触发页面重新渲染，且不会触发整个页面的渲染，自动只触发最小范围的dom的渲染。

这是一个例子：[连接](https://lit.dev/playground/#project=W3sibmFtZSI6InNpbXBsZS1ncmVldGluZy5qcyIsImNvbnRlbnQiOiJpbXBvcnQge2h0bWwsIGNzcywgTGl0RWxlbWVudH0gZnJvbSAnbGl0Jztcbi8vIOabtOaWsHRleHTvvIzmraTml7bkuI3mtonlj4rliLBncmVldOe7hOS7tuWxnuaAp-eahOWPmOWMlu-8jOWboOiAjOS4jeS8muinpuWPkWdyZWV05pu05pawXG5cbmV4cG9ydCBjbGFzcyBTaW1wbGVHcmVldGluZyBleHRlbmRzIExpdEVsZW1lbnQge1xuICBzdGF0aWMgc3R5bGVzID0gY3NzYHAgeyBjb2xvcjogYmx1ZSB9YDtcblxuICBzdGF0aWMgcHJvcGVydGllcyA9IHtcbiAgICBuYW1lOiB7dHlwZTogU3RyaW5nfSxcbiAgfTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubmFtZSA9ICdTb21lYm9keSc7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgYWxlcnQoJ2dyZWV0ICcrIHRoaXMubmFtZSArJyByZW5kZXInKVxuICAgIHJldHVybiBodG1sYDxwPkhlbGxvLCAke3RoaXMubmFtZX0hPC9wPmA7XG4gIH1cbn1cbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnc2ltcGxlLWdyZWV0aW5nJywgU2ltcGxlR3JlZXRpbmcpO1xuZXhwb3J0IGNsYXNzIFQgZXh0ZW5kcyBMaXRFbGVtZW50IHtcbiAgc3RhdGljIHByb3BlcnRpZXMgPSB7XG4gICAgbmFtZTE6IHt0eXBlOiBTdHJpbmd9LFxuICAgIG5hbWUyOiB7dHlwZTogU3RyaW5nfSxcbiAgICB0ZXh0OiB7dHlwZTogU3RyaW5nfSxcbiAgfTtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm5hbWUxID0gJ1NvbWVib2R5JztcbiAgICB0aGlzLm5hbWUyID0gJ1NvbWVib2R5JztcbiAgICB0aGlzLnRleHQgPSBcInRleHRcIjsgICAgXG4gIH1cbiAgX3VwZGF0ZU5hbWUxKGUpIHtcbiAgICB0aGlzLm5hbWUxID0gXCJmcmFuazFcIjtcbiAgfVxuICBfdXBkYXRlTmFtZTIoZSkge1xuICAgIHRoaXMubmFtZTIgPSBcImZyYW5rMlwiO1xuICB9XG4gIF91cGRhdGVUZXh0KGUpIHtcbiAgICB0aGlzLnRleHQgPSBcInN0clwiO1xuICB9XG4gIHJlbmRlcigpIHtcbiAgICBhbGVydCgnc3QgcmVuZGVyJylcbiAgICByZXR1cm4gaHRtbGA8ZGl2PlxuICAgICAgICAgPGgzPnRleHQgaXMgdXNlZCBpbiBzLXQgZG9tLCBuYW1lIGlzIHVzZWQgaW4gcy10LnNpbXBsZS1ncmVldGluZyBkb208L2gzPlxuICAgICAgICAgPGJ1dHRvbiBAY2xpY2s9XCIke3RoaXMuX3VwZGF0ZVRleHR9XCI-X3VwZGF0ZVRleHQ8L2J1dHRvbj5cbiAgICAgICAgIDxidXR0b24gQGNsaWNrPVwiJHt0aGlzLl91cGRhdGVOYW1lMX1cIj5fdXBkYXRlTmFtZTE8L2J1dHRvbj5cbiAgICAgICAgIDxidXR0b24gQGNsaWNrPVwiJHt0aGlzLl91cGRhdGVOYW1lMn1cIj5fdXBkYXRlTmFtZTI8L2J1dHRvbj5cbiAgICAgICAgIDxwPiR7dGhpcy50ZXh0fTwvcD5cbiAgICAgICAgIDxzaW1wbGUtZ3JlZXRpbmcgbmFtZT1cIiR7dGhpcy5uYW1lMX1cIj48L3NpbXBsZS1ncmVldGluZz5cbiAgICAgICAgIDxzaW1wbGUtZ3JlZXRpbmcgbmFtZT1cIiR7dGhpcy5uYW1lMn1cIj48L3NpbXBsZS1ncmVldGluZz4gXG4gICAgICAgICA8L2Rpdj5gO1xuICB9XG59XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ3MtdCcsIFQpO1xuXG5cbiJ9LHsibmFtZSI6ImluZGV4Lmh0bWwiLCJjb250ZW50IjoiPCFET0NUWVBFIGh0bWw-XG48aGVhZD5cbiAgPHNjcmlwdCB0eXBlPVwibW9kdWxlXCIgc3JjPVwiLi9zaW1wbGUtZ3JlZXRpbmcuanNcIj48L3NjcmlwdD5cbjwvaGVhZD5cbjxib2R5PlxuPCEtLSAgIDxzaW1wbGUtZ3JlZXRpbmcgbmFtZT1cIldvcmxkXCI-PC9zaW1wbGUtZ3JlZXRpbmc-IC0tPlxuICA8cy10Pjwvcy10PlxuPC9ib2R5PlxuIn0seyJuYW1lIjoicGFja2FnZS5qc29uIiwiY29udGVudCI6IntcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwibGl0XCI6IFwiXjIuMC4wXCIsXG4gICAgXCJAbGl0L3JlYWN0aXZlLWVsZW1lbnRcIjogXCJeMS4wLjBcIixcbiAgICBcImxpdC1lbGVtZW50XCI6IFwiXjMuMC4wXCIsXG4gICAgXCJsaXQtaHRtbFwiOiBcIl4yLjAuMFwiXG4gIH1cbn0iLCJoaWRkZW4iOnRydWV9XQ)
# 生命周期
钩子函数：
- `constructor`构造函数，创建组件对象的时候会调用。
- `connectedCallback`创建shadow并挂载完成了时会调用，可以用来添加事件注册，比如整个组件的对外的focus、click等事件。
- `disconnectedCallback`从dom中删除的时候调用，可以用来删除事件的注册。防止内存泄漏。
- `attributeChangedCallback`属性发生变化的时候调用，该方法默认逻辑就是properties发生变化就会re-rend。`You rarely need to implement this callback.`

# slot与template
`<slot></slot>`标签用在render的html里，用于表示里面的其他元素，和this.children功能类似。
`<template></template>`标签用于声明一个模板的dom，不会被渲染，但是可以通过该dom的.content方法获取内部的html文本，作用没有slot大。
# 好用的组件库的使用方法
像react有antd等组件库一样，webcomponent现在也有一些组件库，将来肯定越来越多，希望antd也能出一版webcomponent版本的组件库。

web component的组件库，基本上不需要使用npm来管理包，可以回归到jquery年代的直接html引入cdn库即可，然后在html中直接使用自定义组件的标签即可。

当然也可以使用npm安装依赖后组织项目和本地打包，这个我们后面再说。
## a.微软的fluent
第一位选手就是来自微软的[fluent](https://developer.microsoft.com/zh-cn/fluentui#/get-started/webcomponents)，[repo](https://github.com/microsoft/fluentui)。顺带一提fluent也有react的版本。29个组件，常用的form、button、input代码和样式如下：
![image](https://i.imgur.com/a6rDm7N.png)

## b.IBM的carbon-web-components
第二位选手是来自IBM的[carbon](https://web-components.carbondesignsystem.com/?path=/story/introduction-welcome--page)，[repo](https://github.com/carbon-design-system/carbon-web-components)。风格非常"欧美捞逼"，各种组件都很硬朗，棱角分明的。组将数44个，粗略看了下很多组件没有像antd那样的深度逻辑，比如table组件，就只是样式。

![image](https://i.imgur.com/0VT5FLP.gif)

## c.material-components-web
material-ui不多说了，算是和bootstrap齐名的框架了。[repo](https://github.com/material-components/material-components-web)，也没有table组件。

![image](https://i.imgur.com/qtl8OMb.png)
## d.shoelace
[repo](https://github.com/shoelace-style/shoelace)来自民间开源组织，文档比较详细，也给了和react vue的解决方案，样式比较舒服。组件高达50+。但是比较坑的是没有table相关的组件，搞不懂为啥，其他的样式还都挺好看的，也很不错，而且一直在更新中。

![image](https://i.imgur.com/Hw0YhAA.png)
## e.ui5-webcomponents
[ui5-webcomponent](https://sap.github.io/ui5-webcomponents/playground/getting-started)扁平化风格，有点像jquery-easy-ui

![image](https://i.imgur.com/5lyOQuo.png)

## f.adobe的spectrum-web-components
[官网](https://opensource.adobe.com/spectrum-web-components/getting-started/)adobe软件内的风格样式的web组件。

![image](https://i.imgur.com/izTpsaq.png)

## g.kor
[官网](https://kor-ui.com/introduction/welcome)

![image](https://i.imgur.com/4N3NXGs.png)

## h.wired components
[官网](https://wiredjs.com/showcase.html)手绘风格的线条ui，缺点是组件不是很多，适合简单网页。

![image](https://i.imgur.com/w2WvxGo.png)

## i.clever components
[官网](https://www.clever-cloud.com/doc/clever-components/?path=/story/%F0%9F%8F%A0-home-readme--page)

![image](https://i.imgur.com/x3DXatn.png)

## j.vscode-webview-elements
[官网](https://bendera.github.io/vscode-webview-elements/pages/getting-started/) vscode风格的组件

![image](https://i.imgur.com/mFarhgu.png)

![image](https://i.imgur.com/VkvVBhA.png)
