# tailwind
tailwind是一个css的库，通俗讲他的主要作用是简写css样式，将一些css封装为className。例如`flex-1`代表`flex: 1 1 0%;`再比如`text-xs`代表`font-size: 0.75rem; line-height: 1rem;`。此外tailwind使用postcss、autoprefixer等作为编译的库，再生成最终的css的时候，一方面会自动添加`-webkit-`来适应多个浏览器，另一方面对于没有用到的样式则不会编译到css文件，例如只用到了`text-xs`没有用到`text-xl`就不会在最终的css文件中有后者。

# 对比Bootstrap
相比于`Bootstrap`，`tailwind`有不同的定位，Bootstrap对于特定的组件提供高度封装的样式，而`tailwind`的封装比较原生，大部分只是简单的缩写，相应的优点就是比较灵活。如果对于一个简单的原型系统，那么Bootstrap比tailwind更合适，如果是长期维护，或者有专门的ui设计的，那么tailwind或者原生css更合适。

例如对于按钮来说，`bootstrap`有专门的`btn`样式还有衍生的`btn-primary`、`btn-warning`等等。而对于`tailwind`则没有，需要自己来组合大量的class实现自己想要的展示效果。
```html
<button class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign in</button>
```

# 对比原生css
`tailwind`其实比较接近原生css，虽然有简写，但是还是要写很多代码，并且需要学习`tailwind`这些class的命名规范，需要去记，有一定的学习成本，如果只是轻度使用，那么不建议使用tailwind，有查tailwind的className的时间，已经自己用原生css写完了。如果是以后确定项目要大量使用或者自己决定以后以tailwind作为主要css样式的书写方式，则可以专门学一下tailwind。

# 开始使用
首先vscode需要安装tailwind的插件，这样会有智能提示。

`tailwind`官网给我们提供了很多种接入的方式，对不同的框架也有模板的创建方式，可以自己根据当前的框架来去官网查看。这里我们介绍三种方式：
- 使用cdn
- 原生接入
- vite接入
## 使用cdn
通过下面代码可以直接引入tailwind的cdn，官方不建议使用cdn可以在日常测试使用，不建议生产环境使用。`cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation`
```html
  <script src="https://cdn.tailwindcss.com"></script>
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    这是一个按钮
</button>
不建议使用cdn的一个重要原因是，`tailwind`的样式名是可以自己去定义的，并且对于用不到的样式名，是不需要再css文件中存在的，按需使用可以减小css文件体积。
```
## 原生接入
安装tailwind依赖，并用这个cli工具init初始化，此时会在项目根目录得到`tailwind.config.js`这样一个配置文件。
```shell
npm install -D tailwindcss
npx tailwindcss init
```
该配置文件默认的内容如下：
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
其中content部分需要手动修改，该部分是配置了哪些文件会用到`tailwind`，在后面用`cli`进行编译输出最终css文件的时候会扫描`content`指定的文件，看用到了哪些样式，只编译这些样式。

将content内容改为如下，则是代表会扫描`src`及其子目录下所有的`html`和`js`文件，如果是react项目可能还需要配置`jsx/tsx`等。
```js
 content: ["./src/**/*.{html,js}"],
```
然后接下来是在`css`文件中进行配置，例如`src/css/input.css`中
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
注意这里用到了`@tailwind`并且有三个取值，正常情况就把这三个都写上，他们都是有用的，虽然这个写法在css语法中是不存在的，但是我们最终不会直接用`input.css`这个文件，而是用过下面指令将其编译为最种的css文件。`--watch`是始终监听`content`配置的文件看用到了哪些`tailwind`的class进行实时编译。
```shell
npx tailwindcss -i ./src/css/input.css -o ./dist/css/output.css --watch
```
例如在`src/index.html`中这样写，上面的指令就会检测到用到了`bg-blue-500`等tw的classname
```html
<link rel="stylesheet" href="./css/output.css"/>
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    这是一个按钮
</button>
```
此时output.css中内容就包含了
```css
.rounded {
  border-radius: 0.25rem;
}

.bg-blue-500 {
  --tw-bg-opacity: 1;
  background-color: rgb(59 130 246 / var(--tw-bg-opacity));
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.font-bold {
  font-weight: 700;
}

.text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}

.hover\:bg-blue-700:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(29 78 216 / var(--tw-bg-opacity));
}
```
## vite接入
当然通过原生的方式已经生成`output.css`，已经进入开发者理解的范围内了，但如果我们用`vite`等打包工具开发项目时，往往需要一个热编译器，将`vue/react`的代码编译成js代码，此时如果还需要`tailwind`的客户端也热编译就比较麻烦，所以希望能集到一起。官网也提供了guide。

以`vite + react`为例，使用react的模板先创建react项目
```shell
npm create vite@latest vite-t -- --template react
```

创建完成后目录如下，除了正常的`src`目录，静态文件的`public`目录，`vite`这个模板下`vite.config.js`中有配置react的plugin，别的就没什么改动了。

![image](https://i.imgur.com/hmLS2DZ.png)

安装`tw postcss autoprefixer`这些是tw必备的依赖，然后通过`init`初始化，和原生相比这里的`postcss`能帮我们解决一些css的编译问题，还能解决浏览器的`-webkit-`兼容的css生成。
```shell
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
接下来和原生一样的步骤，就是修改`tailwind.config.js`，修改`content`部分，因为是react项目，所以需要配置`jsx/tsx`等文件。

在已存在的`src/index.css`文件的最上方添加派生
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
...
```

修改`App.jsx`文件内容为，因为`main.jsx`已经引入了`index.css`所以不需要再次引入了，已经可以直接使用。
```jsx
function App() {
  return (
    <>
     <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        这是一个按钮
      </button>
    </>
  )
}
export default App
```
运行`npm run dev`得到如下页面。

![image](https://i.imgur.com/Mr93Ah7.png)

注意我们没有专门对`postcss`进行配置，就已经天然的在运行时编译了css文件，因为vite是出厂就支持`ts`、`scss`、`less`、`postcss`等，甚至不配置react的插件也是识别`jsx、tsx`文件的，所以只要配置了`postcss.config.js`这个文件，`vite`就会自动运行`postcss`。
# 语法介绍
## 1 常用的className

第一部分 盒模型与布局相关的：

1 `container` 响应式的容器宽度，只决定宽度，但是左对齐，如果要实现居中需要配合`mx-auto`
![image](https://i.imgur.com/EYedsyb.png)
2 `m` 是margin相关的，有一系列衍生class：
- m-0 也就是`margin: 0`，mx-0则是指横向的margin是0，my-0则是纵向，ml-0是左，mr-0是右，mt-0上，mb-0下，下面同样有xylrtb这些衍生用法。
- m-auto指auto的间隔，`mx-auto`可以用来居中
- m-px 指1px的距离
- m-0.5 指2px的距离，也即是`0.125rem` 1rem就是和html跟节点的字体大小相同，2rem就是2倍大小。 m-1 指4px的距离，即`0.25rem`
- m-1.5 m-2 m-2.5 m-3 m-3.5 m-4 以此类推，后面数x4就是px值
- 从4开始没有4.5这种小数值，只有整数取值，直到m-12
- m-12之后，step变为2，即m-13 15不存在
- m-16之后，step变为4，直到m-64
- m-64之后，step变为8，直到m-80
- m-80之后，step变为16，直到m-96
- m-[20px] 自定义margin距离，用[]将距离包起来，这个灵活度最高。

这里我们学到了，tw中对于方位的表示xytblr，m后的数字1代表的是4个像素，[]可以自定义数值而不用预设。

至于mx-13是不是存在，不需要单独记，插件会有自动提示，如下图，此外默认的提示在第一个字符串经常不触发，建议前面写个空格`className=" con"`这样能够触发，因为前面有个空格。

![image](https://i.imgur.com/xnV932a.png)

3 `p` 是padding相关的，与margin的用法可以说是完全对称的。

4 `border` 是边框相关的，有一系列衍生的class:
- border-x/y/r/l/t/b-0/2/4/8/[3px] 注意这里的248的单位是px，同样用[]自定义距离。
- border-transparent/black/white 也可以是可调的颜色浓度 `slate-{50/100/200.../900/950}` slate可以换为`stone石头黑`，`zink灰`，`gray灰色`,`red正红`，`amber琥珀红(暗红)`,`orange橘`,`yellow黄`,`lime酸绿`,`green正绿`,`emerald翠绿`,`teal蓝绿`,`cyan青`，`sky天空蓝`，`blue正蓝`，`indigo靛青`,`violet紫罗兰`,`purple正紫`,`fuchsia紫红`，`pink粉色`，`rose玫瑰`等。
- border-[#549354] 自定义颜色。
- rounded-s/e/r/l/t/b/tl/tr/bl/br-none/sm/md/lg/xl/2xl/3xl/full/[90px] 圆角

这里我们学到了颜色范式即对于颜色是通过 `{颜色名-浓度}` 来表示颜色的，而对于纯黑白和透明则没有浓度，也学到了对于宽度的另一种范式（m那里是数字表示像素宽度）但对于圆角这种本身不会有太多变化的范式就是`sm 不写 md lg xl 2xl 3xl`来做了几个分组。

5 `w`与`h`表示宽和高，衍生的一些列class：
- w/h-0/px/0.5....auto/[11px] 与m和p的基本一致。
- min-w/h-0/full/[22px]/... 这是最小宽度、高度
- max-w/h-0/full/[22px]/... 这是最大宽度、高度还有一些取值这里不列出了

6 position相关，直接class就用position的取值，如下列表

![image](https://i.imgur.com/8COlRJz.png)

上下左右z的位置调整：
- top/buttom/left/right-0/px/0.5/1....
- z-0/10/20/30...auto z层级

7 display相关，也是class直接用display的取值，例如`block`,`flex`, `grid`, `hidden`(对应display:none)

8 background相关，都是`bg-`开头的。
- `bg-{颜色表达如red-100}` 是调整颜色
- 其他的还有一些较少使用，比如图片，repeat等这里不列出了，用到了去看官网。

第二部分 文字

1 `font-`字体与字粗细
- `font-sans/serif/mono`三种预设的字体风格
- `font-thin/light/medium/black/...` thin是比较细，black是比较粗
- `leading-3/4/5/6...` 行距line-height

2 `text-`字体大小、对齐、颜色
- `text-xs/sm/base/lg/xl/2xl/3xl/4xl...9xl` 字体大小
- `text-center/left/right...` 对齐
- `text-{颜色表达}` 对应color

![image](https://i.imgur.com/BPs85P4.png)

第三部分 flex与grid

- `basis-0/1/2/.../96/auto` 对应`flex-basis`
- `flex-row/col/row-reverse/col-reverse` 对应`flex-direction`
- `flex-wrap/nowarp` 对应是否换行
- `grow` `grow-0` `shrink` `shrink-0` 用于item上，控制内部这个item是否跟着父容器放缩，默认是可缩不可放。
- `flex-1`: flex: 1 1 0% 放缩占比都是1，basis是0%
- `flex-auto` 放缩比1，basis是auto

> 插入一段对flex的小结，父容器用flex代表`display:flex`，然后每个元素如果想自动放缩就用`flex-1`即可。

- `grid-cols-{n}` 生成n列的栅格，不指定行数。等价于`grid-template-columns: repeat(n, minmax(0, 1fr));`
- `col-span-{n}` 指定当前item是跨度n列的。
- `grid-rows-{n}` 生成n行的栅格
- `row-span-{n}` 指定当前item跨度是n行的。
- `gap-x/y/不写-0/px/0.5/1/2...`指定gap大小。


- `justify-start/end/center/between/evenly/around/stretch` 横向瓦片间距= `justify-content`
- `justify-items-start/end/center/stretch` dom元素位于瓦片内的横向左右位置 = `justify-items`
- `justify-self-start/end/center/stretch` 每个瓦片单独调整自己的`justify-content`
- `content-start/end/center/stretch/around/between/evenly..` 纵向瓦片间距 = `align-content`
- `items-start/end/center/stretch..` dom元素位于瓦片内的上下相对位置 = `align-items`
- `self-start/end/center/stretch...` 每个瓦片自己调整自己的上下位置

第四部分 变换与动画
- `scale-x/y/不写-0/50/75/95/100/125/150`缩放
- `rotate-0/1/45/90/180..`旋转
- `translate-x/y/不写-0/px/0.5/1...`平移
- `origin-center/top/top-left...`变换的中心点
- `animate-`相关的用到再去官网查吧。

第五部分 其他
- `hover:bg-red-100`指定hover时候的样式，这是样式选择器的用法。
## 指令
配置在css中的类似注解的写法就是指令，例如`@tailwind base`。
- @tailwind 指定生成哪些`层`到最终css
- @layer 指定每一层对应的样式，例如`@layer base {h1 {font-size: 10000px}}` 就是指定base这一层中有个h1的样式是字体10000px
- @apply 使用tw中已有的样式在自定义样式内部例如`.my-class:{ @apply h-[300px] w-[400px] bg-black}`
# 结合scss封装样式
上面我们提到了`@apply`指令可以组合tw中已有的class到自定义class中，所以可以在css或者scss文件中遮掩写：[App.scss](tailwind-demo/vite-t/src/App.scss)
```scss
.btn {
  @apply w-[100px] bg-gray-600 text-center;
  color: red;
}
```
然后在`jsx`文件中直接引入，就可以使用`btn`这个自定义的classname了。
```jsx
import './App.scss';
...
<button className="btn">
```
如果想要模块化，scope化classname，也可以直接将文件名改为`App.module.scss`，然后jsx中修改为
```jsx
import styles from './App.module.scss';
...
<button className={styles.btn}>
```
此时className会被hash

![image](https://i.imgur.com/mbom7OZ.png)

这里可以参考当前目录下`tailwind-demo/vite-t`下的demo。