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

## 常用的className

## 派生

# 结合scss封装样式
