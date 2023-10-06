# 该怎么写前端
前端从最初`html + js + css`到现在`vue + react + angular`等框架的发展，代码量和复杂度都大幅增加，对于一个前端开发来说,如何更好的组织和编写代码是一个长期需要思考的问题。

# 为什么前端离普通开发者越来越远
其实大多数的开发者最初都是学过前端的开发的，简单的页面也都是信手拈来。但最近这些年，发现前端变天了，项目的复杂度已经远超当年的`jquery + bootstrap`时代。是什么改变了前端呢，那一定是少不了以下几个答案：`nodejs + npm`、`webpack`、`react`、`vue`、`typescript`。我们可能会埋怨`react`、`vue`、`svelte`这些框架把自己的一些特殊的语法引入到了前端，污染了`js`，例如`jsx`。但是其实归根结底，不是`react`的问题，我们可以不用`react`就不需要使用jsx语法。问题的本质还是在于，前端的依赖管理和打包流程。

以前的依赖只需要用cdn把一个个的js和css文件引入，开发者很直观的知道引入了这些依赖，会发生的事情，例如引入`jquery.min.js`，就知道我可以在js的上下文中使用`$`这个申请的函数了，但现在我们所有的依赖通过`npm`安装到本地`node_modules`目录下，然后在自己的js文件中通过`import`这个原来并不属于js中的表达式来引入这些依赖，而因为浏览器中并不识别这种引入依赖的方式，所以需要一个`builder`的角色把`import`进来杂七杂八的东西给打包成一个`bundle.js`文件。

所以两个时代的前端开发者最大的gap其实是在依赖和构建工具。

假如我们还是通过cdn引入react，也不存在构建工具（当然react提供了这样的构建好的js文件，只不过有性能问题不用于生产环境），其实老一辈的开发者也并不排斥`react`这些新的框架，只会把他当做是和`jquery`一样的工具库，我用不到可以不引入。

# 维护问题与看不见的魔法
现在的前端项目经常存在一些维护的问题，不说别的，就单单是让你将5年前的一个`react`项目，在本地重新运行起来，可能都是不小难度的事情，比如`npm install`可能就采坑无数。而如果是早期的项目，要在本地运行，几乎轻而易举，因为早期项目只要引用的依赖文件都在，浏览器都是向前兼容的，双击打开，一气呵成。

因为早期项目没有魔法，所以更加亲切，我们可以在浏览器中调试，在元素视图找到对应的dom。而现在的项目被打包工具赋予了太多的魔法，浏览器中无法找到局部的变量，也很难进行调试。

# 我的思考
我学过很多前端的框架的语法，用过很多打包工具，尝试过很多代码的写法。有一些自己的建议，想简单分享。

首先我并不喜欢类似`npm`这种包管理的项目形式，个人还是喜欢`jquery`时代，尤其是大多数时候我自己的小项目，几千行代码，用个什么`react`+`webpack`+...真是杀鸡用牛刀了。但是个人的项目也想用一些ui框架，比如一些组件库，大多数组件库为了适应时代，往往都基于`react/vue`了，问题又绕了回来，使得简单的`mini site`也需要去引入构建工具构建项目。怎么办呢？

如果你是要开发公司的项目，大家可能都是用的公司的技术栈，那不管是`react`还是`vue`，`webpack`还是`vite`，直接用着就可以了，因为公司的项目不是自己说了算。

如果是自己的页面，比如我自己的页面，大多数不是一个复杂的系统，基本就是一到两个页面就能承载的功能，那我当然还是希望不要引入过多的第三方框架。

**如果设计原型系统**

可以先看一下，能不能用`web-components`的一些框架，例如[wired-element](https://github.com/rough-stuff/wired-elements/tree/master)、[material-components-web](https://unpkg.com/browse/material-components-web@0.27.0/dist/)、[vaddin](https://vaadin.com/docs/latest/components/button)以及[shoelace](https://shoelace.style/components/animated-image)来完成原型系统。因为`web-components`是浏览器原生支持的组件写法，所以可以直接通过cdn引入js就可以在html中使用这些组件，整体开发习惯和原来用`jquery+bootstrap`基本一致，不需要依赖管理和打包工具。

下面这个js的写法有没有回归jquery的感觉
```html
<div class="item" id="combo"></div>
<script>
    var list = ['1-gadsg', '2-sadfasd'];
    var html = list.map((item, index)=>`<wired-item value="${index}">${item}</wired-item>`).join('\n');

    html = `<wired-listbox id="listbox" selected="0">${html}</wired-listbox>`;

    // 模拟个异步更新页面的功能
    setTimeout(()=>{
        var combo = document.getElementById('combo');
        combo.innerHTML = html;
    }, 3000);
</script>
```

当然了，可能新时代的人们不太适应这种写法，还是习惯数据驱动，那么可以引入Lit，或者简单的引入`alpine.js`。
```html
<div class="item" id="combo"></div>
<script>
    var list = ['1-gadsg', '2-sadfasd'];
    var html = list.map((item, index)=>`<wired-item value="${index}">${item}</wired-item>`).join('\n');

    html = `<wired-listbox id="listbox" selected="0">${html}</wired-listbox>`;

    // 模拟个异步更新页面的功能
    setTimeout(()=>{
        var combo = document.getElementById('combo');
        combo.innerHTML = html;
    }, 3000);
</script>
```


**如果上面的不满足条件**

如果这些组件库并不能满足条件，例如需要一个日历组件，并没有在这些库中找到合适的，只找到了react的一个日历库比较合适。或者严重依赖`antd`里提供的某些组件。这就属于实在没有办法，只能通过打包工具来和`react`来组织项目了。又或者简单的`web component`不满足条件，仍需要额外的开发自己的component。

这些情况下，也尽量不要用`create-react-app`这种脚手架工具，因为引入的额外功能实在太多了，此时使用`esbuild`或者`vite`进行项目打包即可。vite的步骤就是在`index.html`中添加`type=module`的`script`标签，`vite build`即可打包完成。`esbuild`更原生，直接指定js文件进行打包即可。`esbuild main.js --bundle --outfile=out.js`
