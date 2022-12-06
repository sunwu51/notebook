# deno使用与思考
下面是deno官网的介绍，deno就是一个js/ts/wasm的运行时，node的定位也是一个js/wasm运行时，也能通过一些马甲来运行ts。两者定位几乎一致。而且值得一提的是deno的作者就是node的作者，deno和node就是字母调整了下位置。

deno作者表示node尤其是node的包管理已经发展的非常凌乱，并且node对于模块化的语法`import`还有`ts`的默认支持等，都做的不够好。当然本质上还是有一些利益关系的，我们从deno后续主推的deno Deploy等看出deno的主攻方向。

![image](https://i.imgur.com/NW4pp5T.png)

# 语言与runtime
我们说`deno`和`node`都是js的`runtime`，所以`runtime`是什么呢？其实一个语言自身没办法运行需要有支持语言运行的runtime，例如机器上没有安装python那就没有办法运行py文件，没有安装jre也没有办法运行jar包，没有安装`node`/`deno`也没法运行js文件，因为那就是个文本。当然编译型语言也是类似，虽然`c/go`语言打包的二进制文件不需要系统安装环境就能运行，那是因为`crt`和`goruntime`已经打包到二进制文件里面了，故而运行时的环境在各种语言中都是必须的。

运行时提供了必要的函数库，例如我们使用`nodejs`中`fs`这个库访问文件，但是我们在浏览器中就没法引入`fs`模块，因为浏览器v8运行时环境并没有提供文件读写相关的功能，而`node`这个`runtime`提供了而已。

我们说自己会写`nodejs`，其实说的是熟悉js的语法，并且会使用`node`提供的`runtime`的库(`NodeSDK`)，和基于`NodeSDK`开发的其他库，比如`express`、`koa`等。

因而如果熟悉js的语法，再去使用deno或者node其实都是去熟悉如何使用SDK和第三方库而已。
# 先上手
官网步骤安装deno，然后vscode安装deno的俩依赖。

![image](https://i.imgur.com/vEFU51J.png)

然后使用runtime中提供的丰富的函数功能，比node的sdk要更丰富和好用一些，例如浏览器中支持的同样的函数，atob，console，websocket，fetch等等，都可以像在浏览器一样直接在deno runtime中使用。

![image](https://i.imgur.com/GvD4HjO.png)

此外对于socket和file也有专门的sdk，这里以文件为例。

![image](https://i.imgur.com/FzU7Elq.png)

这里使用返回值是`Promise`的，注意这里也体现出了deno出现比较晚，没有像nodejs一样，大量使用回调函数作为入参了，而是直接用了`Promise`，能很好的避免回调地域，通过await语法糖，让代码更简洁。

![image](https://i.imgur.com/FzLr7LU.png)

并且上图中我们尝试读文件的时候，运行时有个警告问是否允许读文件，可以添加`deno run --allow-read`来允许读文件，着另一方面说明deno是一个纯粹的沙盒环境，他就像是浏览器一样，具有高度的安全性和隔离性，所有的权限包括读写文件，网络以及读环境变量，等。都需要赋予这个程序才能使用，是非常安全的。

![image](https://i.imgur.com/yENSxo5.png)

# deno的包管理与npm
node的包管理工具`npm`可能比node还要成功，因为前端的快速发展，使得前端包管理也成为了一个迫切的问题，刚好npm是用来管理js包的，于是npm就顺理成章也成了前端的包管理工具。这一下子node就成了风口的猪，起飞了，于是前端也需要了解一点node，起码得会写个express吧，再后来SSR服务端渲染来了，node因为已经有了前端程序员的群众基础，理所当然成了服务端的运行时了。

说回到包管理工具，npm安装依赖的时候会放到`node_modules`目录下，经常这个目录会非常大，且默认node的项目是不共享依赖的，都是安装在自己的目录下，除非使用`-g`安装。

deno则是秉承把自己当做浏览器一样的沙盒运行的思想，所以包的引入也是像浏览器一样，通过url引入包。我们以`https://deno.land/x`包市场中最火的包之一的`flat`为例:
```js
import { readJSONFromURL } from 'https://deno.land/x/flat@0.0.15/mod.ts'

const data = await readJSONFromURL('https://jsonplaceholder.typicode.com/comments');

console.log(data.length); // 500
```
deno的模块平台也涌现出很多不错的包，但是相比npm还是差了很多，deno的热度也迟迟没有上去，这使得在`1.28`版本之后，deno正式宣布能直接引入`npm`包的稳定特性了。`npm`的包都是基于nodeSDK这个runtime开发的，要想直接在deno上运行，显然需要deno做很多兼容的实现。

写法：`npm:{package}[@version]`从npm repo中引入相关的包

![image](https://i.imgur.com/yFfjYhd.png)

官网说也可以通过cdn引入，例如`https://express@^4.18`，但是有些包像express引入后就运行失败，暂时还没研究明白是为啥。

此外deno还把node的标准库兼容式重写了一遍(大部分函数都实现了)，用法与node一致，下面用node和deno的sdk分别进行文件读取，故而如果不想放弃nodeSDK的写法，也可以这样使用。可以说deno团队发现了，node用户想迁移过来是比较难的，所以干脆自己来做兼容，使node程序员能无缝转过来。

![image](https://i.imgur.com/bA0pWaA.png)

# deps.js
这种用url引入的方式管理非常麻烦，可以说就是不管理了，啥时候import，啥时候现场指定url和版本了。比如使用了express，要更新版本的时候需要进入业务代码进行修改，且多个地方引用同一个包，要自己记得用同一个版本，非常费劲。目前最简单的策略就是自己创建个文件，可以叫`deps.js`，也可以随便起别的名字。

```js
//deps.js 引入上面提到的几个包
export * as fs from "https://deno.land/std@0.167.0/node/fs.ts";

export { readJSONFromURL } from 'https://deno.land/x/flat@0.0.15/mod.ts';

import express from "npm:express@^4.18";
export { express };
```
从deps.js中引入
```js
import {express,readJSONFromURL} from "./deps.js";


console.log(express)
const app = express();
app.get("/", async function (req, res) {
    const data = await readJSONFromURL('https://jsonplaceholder.typicode.com/comments');
    res.send(data);
});

app.listen(3000);
console.log("listening on http://localhost:3000/");
```

# deno本身是沙盒
本文其实一直在说deno提供的是一个沙盒环境，是安全的，隔离的，他就像是个单独的浏览器页面，不能随便访问硬盘，网络，甚至是环境变量，需要我们给他这个权限才行。

这里有人会有疑问，因为所接触的所有编程语言，还第一次看到这种自己编程还要给自己赋权才能访问资源的情况，和node的易用性相比，差了很多啊。另外这种像浏览器一样url引入包的管理方式显然不适合大型后端项目。

没错，deno本来也不致力于全能，deno就是很简单的定位，一个像浏览器一样的沙盒环境，运行逻辑也像浏览器一样需要隔离，需要安全，资源也通过url引入。可能你觉得不可理喻，但是deno在做的是一件关于云，或者说边缘云的事情。这才是deno的最终目的。很多人说deno不可能取代node，因为npm的积累，人员积累，前端这那的各种因素，而deno其实从一开始就没想过取代node，而是提供一个高度隔离的v8运行时，这对于边缘云，像serverless函数服务，网页hosting服务，来说是非常有用的。

相比于vm和容器技术来实现函数服务，v8运行时启动非常快，需要的运行时依赖非常少，deno甚至不需要build这一步，直接就run，而对于依赖的下载，也是非常快的。所以像阿里云买的函数serverless服务，或者render.com的web服务，一段时间不用一般是15-20分钟，就会休眠，当我们再去调用接口的时候，唤醒的过程长达30s。而V8的沙盒比这快的多，有多快呢。我们就来看下deno推出的deno deploy。
# deno Deploy
这是个云平台，我们可以随意发布属于自己的deno代码，该平台帮我们托管和运行，并提供一个域名，通过访问该域名就能运行我们的服务，看上去和lambda或者说serverless的函数服务一样。

打开deno.com注册账号，写一段实例代码，就能运行

![image](https://i.imgur.com/dtXJEqC.png)

一天没有访问了，当再次打开，可以看到是秒起(240ms)，几乎感觉不到

![image](https://i.imgur.com/zltS7M3.png)

以前heroku和render有些服务，为了能够一直保持服务运行，防止第一次访问慢的问题，被迫用了一些定时调用的平台，每过10分钟调用一下自己的服务，防止服务休眠，但显然不是一个好的解决方案，有了deno.Deploy，就不需要了，因为第一次调用的速度也非常快。

当然deno deploy的思路很好，这也是另一个迅猛发展的技术的一个缩影---wasm-wasi。因为denodeploy有一点局限的是，他只能写deno.js，对其他语言和运行时不友好，而wasm则可以做的更多，但是wasm还在发展中，获取明年会有像样的产品出来。