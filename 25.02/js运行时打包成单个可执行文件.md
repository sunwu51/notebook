---
title: js运行时打包成单个可执行文件
date: 2025-02-01 13:31:01+8
tags:
    - node
    - deno
    - bun
    - 可执行文件
---
虽然工作中使用的是`java`，但是`nodejs`是我最常用的语言，主要是因为更加轻量，并且有不错的性能。对于快速验证和原型项目来说，`nodejs`还是非常不错的。比如写解释器使用`js`大大节省了时间，并且`js`的部分功能还可以直接在浏览器中运行，非常方便。

但是`node`有个问题，需要安装`node`环境，这一点上就比`python`要差，后者一般在`linux`和`macos`上是预装的，尤其是当我写了个`node`脚本或者小工具，如果其他人想要使用的话，就需要安装`node`环境。一个不错的方案是，直接把`node`和程序打包成一个可执行文件，虽然`node`环境可能本身有几十兆大小，但最终如果可用的话，也是个不错的方案。

# nodejs打包
很多年前就使用过打包工具`pkg`，一个由`vercel`开源的项目，只需要`pkg main.js`即可完成打包。但遗憾的是，这个项目`vercel`停止了维护，最新的版本也只能支持到`node 18`版本。但社区有人继续维护了新的分支，比如`@yao-pkg/pkg`。我在项目中多次使用这个工具，他目前能支持最新的node版本，还在维护中。
```bash
$ npm install -g @yao-pkg/pkg
$ pkg main.js
```
pkg默认会编译三个操作系统的可执行文件，可通过-t单独指定，如下将`macos`架构换成`arm64`版本
```bash
$ pkg -t node20-linux-x64,node20-macos-arm64,node20-win-x64 main.js
```
但是吧，这个工具交叉编译的时候，尤其是跨cpu架构编译，会有一些奇怪的问题，很多时候不可用，例如有时候会直接报错。

![image](https://i.imgur.com/RGQFWaB.png)

还有一种报错如下，显示无法编译成字节码也是个比较老的问题了，在网上也能搜到一些别人的解决方案[这篇文章](https://blog.csdn.net/weixin_45930223/article/details/143181013)，其实原因都没有很清楚，并且很多时候没法解决，这个`warn`日志打印后，还是可以编译出文件，文件实际是无法正常运行的。

![image](https://i.imgur.com/e6FBsrq.png)

除了`pkg`还有另外一些三方的工具比如`nexe`，而`nexe`需要一些额外的配置，比如`gcc`等，就更加麻烦了。

在`node 20+`版本后，node官方提供了打包的方式，`sea`(Single Executable Application)。

还是以上面这个项目（sunwu51/mocha）为例，首先安装`esbuild`，将我们所有的内容`bundle`打包到一个文件中。因为默认的`sea`不会对三方依赖打包。

```bash
$ esbuild main.js --bundle --platform=node --outfile=bundle.js
```
接下来的步骤参考[官网](https://nodejs.org/download//release/v20.1.0/docs/api/single-executable-applications.html)。创建一个`sea.config.json`文件，内容如下：
```json :sea.config.json
{
    "main": "bundle.js",
    "output": "sea-prep.blob"
}
```
将`bundle.js`打包成二进制文件`sea-prep.blob`
```bash
$ node --experimental-sea-config sea-config.json
```
注意得到的`sea-prep.blob`文件并不是可以直接执行的文件，只是当前代码的`blob`格式，接下来我们要把这个`blob`文件和`node`合并成一个文件，这里是`linux`指令，在`win、macos`上还需要修改签名，可以参考官网步骤。
```bash
# 把node复制一份到当前目录，大概有100M
$ cp $(command -v node) myapp

# 把blob文件合并到myapp
$ npx postject myapp NODE_SEA_BLOB sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

# 运行最终产物
$ ./myapp
```
最后得到的`myapp`文件就是单个可执行文件了，只能说官网的这个方法更加麻烦。

综上在`node`下，其实没有很完美的能既简单又稳定成功的打包方案，`pkg`比较简单，但是经常有失败的情况，`nexe`比较稳定，但是需要一些额外的配置，`sea`目前比较稳定，但是需要手动编译，并且需要手动合并文件，而且只能支持当前平台。
# bun打包
`bun`基本是兼容`node`的另一个用`zig`+`JavaScriptCore`的js运行时，以高性能为目标。在`bun`中，可以直接使用`bun`命令打包成可执行文件，并且支持`macos`、`linux`、`win`平台。[官方文档](https://bun.sh/docs/bundler/executables)

```bash
# 最简单的在输出当前系统下的myapp文件
$ bun build ./main.js --compile --outfile myapp

# 指定输出平台
$ bun build --compile --target=bun-windows-x64 ./main.js --outfile myapp

# 支持的平台
# bun-linux-x64 bun-linux-arm64 bun-windows-x64 bun-darwin-x64 bun-darwin-arm64

# 建议添加的参数minify缩小体积，sourcemap打印错误信息是原始文件行号
# bytecode预编译成字节码而不是运行时编译
$ bun build --compile --minify --sourcemap --bytecode ./main.js --outfile myapp
```

`bun`打包非常简单而且非常快，而且他是号称完全兼容`node`，例如一个`node`项目，直接`bun`打包成可执行文件，然后运行，基本可以和`node`一样，而且他打包出来的跨平台、跨cpu的包是确实能用的，非常稳定简单可靠。

但是`bun`目前我发现的唯一的一个问题是，偶尔一些包下不能完全兼容，即`node main.js`运行没问题，但是`bun main.js`运行可能就报错了，如下代码`bun`就会报错。
```js
var request = require('sync-request');
```
估计是这个`sync-rpc`的库是基于`v8`引擎写的底层代码，而`bun`的底层引擎是`JavaScriptCore`，所以不兼容，不过这种算是极少数情况，大多数都是兼容的。
```
Timed out waiting for sync-rpc server to start (it should respond with "pong" when sent "ping"):
```

此外，`bun`还有个缺点是打包的大小比`node + pkg`大一些，在无三方依赖，非常简单的程序在linux下打包`node`用`pkg`打包是`70M+`，用`sea`是`110M+`，用`bun`是`90M+`。

# deno打包
`deno`并不兼容`nodejs`，这使得我大多数时候不会选择`deno`，但是他也是默认支持交叉编译的
```bash
# 当前系统下编译
$ deno compile main.js

# 指定平台编译
$ deno compile --target x86_64-pc-windows-msvc main.ts
```
`deno`支持的编译目标如下：
| OS | Architecture | Target |
|----|--------------|--------|
| Windows | x86_64 | x86_64-pc-windows-msvc |
| macOS | x86_64 | x86_64-apple-darwin |
| macOS | ARM64 | aarch64-apple-darwin |
| Linux | x86_64 | x86_64-unknown-linux-gnu |
| Linux | ARM64 | aarch64-unknown-linux-gnu |


