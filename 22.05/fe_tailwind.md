# tailwind
# installation
```
npm i -D tailwindcss
npx tailwindcss init #此时创建了一个tailwind.config.js文件
```
默认的config文件如下
```js
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
进行简单的修改
```js
content: ['./*.html'],
```
然后修改package.json增加一个npm脚本
```js
"scripts": {
    "watch": "npx tailwindcss -i ./input.css -o ./css/output.css --watch"
}
```
以上的作用就是tailwindcss客户端会检测当前目录html文件中引用了哪些css样式，如果引用了才会编译到output.css文件中。如果没使用任何样式，默认编译出的output.css只含有tag的样式，没有class样式。

一般开发项目需要watch运行，保证实时的能把css编译到output。

创建index.html引入output.css文件。【目录./tailwind-demo】

```
npm watch
```
# 常用样式
# 1 盒模型
`w-{num}` = `width: { num*4px }` num支持 0-4 with step 0.5, 5-12 with step 1。最多是到`w-96`，12到96的步长一直变化，可以在写的时候开启tailwind插件来提示看是不是有对应的num，96代表384px，是小屏幕sm的大小。

`w-{分数}` = `width: xx%`分数支持分母是2/3/4/5/6/12

`w-full` = `width: 100%`

`w-screen` = `width: 100vw` 沾满屏幕

`min-w-xx` 最小宽度，xx不像w-，只支持 min-w-0, min-w-full 等少数几个。

`max-w-xx` 最大宽度，支持的写法多一些，可以适配多种屏幕。

![image](https://i.imgur.com/JP4jvnt.png)
![image](https://i.imgur.com/hlnFqe4.png)


`h-`与`w-`用法一致也是支持到96，然后也支持分数。`h-screen`沾满屏幕高度。

`min-h-`与`min-w-`用法一致，但是`max-h-`不一样，因为对于高度没有大小屏的设定，所以没有sm那些，为了弥补这部分max的缺失，增加了`max-h-{num1-96}`

`p-{num}` p可以换位pl,pr,pt,pb,px,py 是padding的距离，num同样是96以内的。

`m-{num}` m可以换位ml,mr,mt,mb,mx,my 是margin的距离，num同样是96以内的。

`space-x-{num}`和`space-y-{num}`是指该元素内部的子元素的样式是margin多少num。

`border-{solid/dashed/dotted/none}`边框是实线、虚线、点、没有。

`border` 1px宽度 `border-{0/2/4/8}` 2代表2px，因为border这8px太大了。`border-{x/y/l/r/t/b}-{0/2/4/8}`方向。与之相同的是`outline`，在border外侧，写法与border一样，只不过不支持只写`outline`，也不支持方向。

`rounded`圆角4px，`rounded-{md/lg//xl/2xl/3xl}` `rounded-{xylrtb}-{同左}` md是6px，后面越来越大。

`divide-{x/y}`分割线，默认就是1px，`divide-{color}-{num}`与border一致，`divide-solid/dashed..`也是。

`shadow`等于`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);` 直接用就行，也可以加lg xl 2xl。一般不需要加。`shadow-{color}`调整颜色，一般不需要调。

`opacity-{0/5/10/20...100}`不透明度

`bg-{color}`背景色。


经常出现的不同屏幕大小的默认设定，该设定可以再config.js中修改。

![image](https://i.imgur.com/pA73sup.png)


# 文字
只介绍最基本的，大小，行高，颜色，居中和溢出。
`text-{xs/sm/base/lg/xl/2xl...9xl}` 其中base是16px，lg是18px，从左到右依次增大。

`leading-{none/3...10}`line-height行高3就是12px，10就是40px。

`text-{left/right/center/justify}` 等价于text-align，对齐方式。

`text-{transparent/white/black}`透明色、白色、黑色。

`text-{常见颜色}-{num}`，num从50,100,200一直到900，代表颜色从浅到深，600左右是常见的颜色。

`truncate`超出直接截断，`truncate ...`超出替换为...。

# 整体布局
`container`与bootstrap的类似。

`float-left/right/none`float.

`clear-left/right/both`clear float用的

`hidden`display:none

# flex
`basis-{num/分数}` flex-basis长度

`flex-{row/col/row-reverse}` flex-direction方向

`flex-{wrap/nowarp}`换行

`flex-1`	flex: 1 1 0%;

`flex-auto`	flex: 1 1 auto;

`grow` flex-grow:1 `grow-0` 0, shrink对称的。

`order-1...12` order: 1--12

`justify-[items]-{start/end/center/between/evenly/around}`

`justify-[items/self]-{start/end/center/between/evenly/around}`

`[content/items/self]-{start/end/center...}` align-content/ align-items/ align-self

