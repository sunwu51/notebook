# webpack
使用cli
```shell
webpack index.js --output main.js
```
webpack配置文件四个最基本的属性entry、output、optimization、module，分别表示入口文件，出口文件，插件（原plugins）和加载器。
## 1 entry和output
指定入口和输出文件
```js
module.exports = {
    entry:"./src/index.js",
    output:{
        path:"./dist",
        filename:"main.js"
    }
}
```
多入口文件,[name]是entry1/entry2的占位符
```js
module.exports = {
    entry:{
        entry1:"./src/index1.js",
        entry2:"./src/index2.js",
    },
    output:{
        path:__dirname+'/dist',
        filename:"[name].bundle.js"
    }
}
```
# 2 optimization插件
以splitChunks为例（原来的commonchunk插件），用来将多个入口文件中公共的部分单独剥离出去，减少冗余。

更多插件可以查看官网https://webpack.js.org/plugins/
```js
module.exports = {
    entry:{
        entry1: './1.js',
        entry2: './2.js',
    },
    output:{
        path:__dirname+'/dist',
        filename:'[name]-bundle.js'
    },
    optimization: {
        splitChunks: {
          // include all types of chunks
          chunks: 'all'
        }
    }
}
```
# 3 module
loader的作用是在js中import其他文件的时候用来解析加载，即默认import只能引入js文件，如果想把css引入则需要专门的加载器，jsx也需要专门的加载器，sass也是，等等。

以style-loader和css-loader为例，css-loader加载css文件，纯文本，style-loader将加载进来的纯文本以style标签的形式嵌入html中.必须把style-loader写在前面。

更多加载器可以查看官网https://webpack.js.org/loaders/
```js
module.exports = {
    entry:{
        entry1: './1.js',
        entry2: './2.js',
    },
    output:{
        path:__dirname+'/dist',
        filename:'[name]-bundle.js'
    },
    module:{
        rules:[
            {
                test:/\.css$/,
                use: ['style-loader', 'css-loader'],
            }
        ]
    }
}
```
注意loader有先后顺序，一般是从后往前的编译加载,例如scss文件加载器如下
```js
 use: ['style-loader','css-loader','sass-loader'],
```
顺序是scss文件先通过sass-loader编译成css，再通过css-loader加载成文本，最后通过style-loader变成style标签放到html中。
# ex1 高阶用法1 cdn加载库
通过cdn加载库，减少打包后js文件的大小，externals中key就是import from 'key'的key，如此处的jquery，而value是window上下问的全局变量，此处是$.
```js
module.exports = {
    entry:{
        entry1: './1.js',
        entry2: './2.js',
    },
    output:{
        path:__dirname+'/dist',
        filename:'[name]-bundle.js'
    },
    externals:{
        jquery:'$'
    }
}
```
# ex2 高阶用法2 按需加载