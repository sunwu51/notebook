---
title: 为什么我不建议用deno和bun
date: 2024-10-13 15:34:00+8
tags:
    - node
    - deno
    - bun
    - runtime
    - js
---
最近`deno`发布了`2.0`版本，主键开始兼容`node`了，连同之前性能著称的`bun`。我们重新来对比下这三个js的运行时。大多数时候官方都会宣传自己的优点，只有真正使用的时候才会发现有很多缺点。我个人尤其在意的是与`node`的兼容性。像`deno`早期版本甚至完全不兼容`node`，也不能用`npm`已有的包，这显然不会被大众接受。

只有很好的兼容了`node`，才有可能被使用，如果不兼容`node`，我为什么要去学习一个新的小众的东西来替换呢？我觉得性能和易用性都不足以说服让我放弃`node`，因为选择`js`运行时更多的是为了简单通用，而不是性能，不然为什么不选择用`golang`呢。另外易用性上虽然`node`项目要添加很多配置`eslint` `tsconfig`等，但是简单项目本来也可以不配置，且目前主流框架的脚手架都会帮忙配置好。

# 包管理与下载的兼容
`node`采用`package.json`文件来进行包管理，使用`npm install`指令安装所有的依赖，依赖包的安装位置是当前目录下的`node_modules`目录。有一些下载更快的衍生下载工具`pnpm` `yarn`等，不作为本文的讨论范围。`deno`在2.0版本才兼容，使用`deno install`安装，但是安装的库不在`node_modules`目录，而是全局目录，为了多项目依赖共用。这一点上没兼容，但是并没有实质影响，也还好。`bun install`则是完全兼容了`node`的依赖安装。

我们以当前这个笔记项目为例来看下下载所有依赖需要多久。`node(npm10.8.2)`（版本v20.17.0）用时33s。

<AsciinemaPlayer src="https://asciinema.org/a/NjHvl2tU8VV7FjjoKubYyQ2RH.cast" options = {{theme: 'tango',autoplay: true,}}/>

`deno2.0.0`因为是下载node项目，所以需要从npm上下载包，而且都是v8运行时，最终下载时间比`node`更久是48s。

<AsciinemaPlayer src="https://asciinema.org/a/BrseceESdFhP5ifubSRulhQYJ.cast" options = {{theme: 'tango',autoplay: true,}}/>

`bun1.1.30`下载速度明显更快。

<AsciinemaPlayer src="https://asciinema.org/a/BrseceESdFhP5ifubSRulhQYJ.cast" options = {{theme: 'tango',autoplay: true,}}/>

# std库的兼容
写这样一段简单的js代码，用`bun` `deno`分别运行，会发现`deno`是不识别`require`的，导致无法正常运行，而`bun`本着尽量兼容`node`的思想，是能够正常运行的。
```js :js-test.js
var fs = require('fs');
var path = require('path');

var content = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');

console.log(content);
```
虽然`deno2`已经尽量去兼容`node`了，但是代码还是需要有改动，对于node的包要用`node:`前缀，而且需要用`import`引入，而非`require`。
```diff :js-test.js
-var fs = require('fs');
-var path = require('path');
+import fs from 'node:fs'
+import path from 'node:path'

+const __dirname = new URL('.', import.meta.url).pathname;

var content = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');

console.log(content);
```
虽然`deno`的改动令人沮丧，但是`bun`也并非完全兼容，当我用bun运行当前博客系统（next应用）的时候，会出现大量的下列报错。
```
NotImplementedError: worker_threads.Worker option "stderr" is not yet implemented in Bun.
NotImplementedError: worker_threads.Worker option "resourceLimits" is not yet implemented in Bun.
```
反倒是`deno`在运行`next`项目的时候并没有报错是正常运行的。

# 如何选择
我个人感觉抛开兼容性的问题，性能、编译、易用这些都是扯淡。所以我还是会使用`node`。如果是为了尝试下的话，我可能更愿意尝试下`deno`，因为他有免费的云平台，可以托管一些小的应用。`bun`，虽然性能确实很好，但实在是不想花时间来踩坑去用来部署服务.