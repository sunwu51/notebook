---
title: js语法的awk后续
date: 2025-01-30 15:18:00+8
tags:
    - awk
    - js
    - 解释器
---
# 背景
在之前的文章[js语法的awk](https://www.xiaogenban1993.com/blog/24.10/js%E8%AF%AD%E6%B3%95%E7%9A%84awk)中，我们讲过`awk`语法比较难记，想要一个能处理文本的工具，但是使用简单且常用的`js`语法。在之前的文章中，我使用了一种非常简单的“缝合”方式，即使用`rust`逐行读取文件，对每一行执行命令行输入的`js`代码，执行方式则是直接使用了`rust`的一个库`deno_core`，也就是`deno`这个运行时的核心库。

这个方式很好的解决了`awk`语法的难记问题，单也带来了一些性能的问题，这令我耿耿于怀，我们在之前的文章中，简单测试过性能，对于基础的大文件字符串求长度的场景下，与`awk`有10倍的性能差距，虽然后面发现正则场景下反而速度比较快，猜测是正则匹配的逻辑上有区别导致的，本质上执行过程应该还是有一个数量级的差距。

另外，在生产场景下，我尝试用这个工具，来进行超大日志文件（10GB）的处理，在处理的过程中，发现该程序占用的内存一直在1G左右。这个现象，显然是因为使用了`deno_core`作为解释器，而`deno_core`又是基于`v8`引擎，后者有完整的内存管理和垃圾回收机制，对于超大文件的处理，每一行都要在`v8`中赋值到一个变量上，所以内存占用至少要申请`10G`，当然在1G左右的时候，应该是达到了`v8`默认的堆内存GC阈值，触发了垃圾回收，导致整体处理时间非常慢。大概要慢2-3个数量级了，处理10g文件，对当前机器的资源占用也远超过`awk`。

![image](https://i.imgur.com/VPtOsGA.png)

`awk`内存一直占用很少，不到100M（甚至不到10M）。

![image](https://i.imgur.com/vGFxyG5.png)

`jtxt`内存会到`1.4G`然后gc后降低到`900M`然后再到`1.4G`来回循环。

![image](https://i.imgur.com/MQYCVfc.png)

在上面`10G`文件的简单长度统计中，`jtxt`以慢5倍的速度还长期占用了超过`1G`内存。

所以，我就思考了一下，`awk`为什么能够比`jtxt`快的同时占用资源还少？我先做了一个实验，直接用`nodejs`来读取文件，并统计字符数，结果发现，统计时间只有41s，内存占用也不到100M，只有83M。
```js :js_len.js
const fs = require('fs');
const readline = require('readline');

async function calculateTotalLineLength(filePath) {
  // 创建文件流
  const fileStream = fs.createReadStream(filePath);

  // 使用 readline 模块逐行读取文件
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity // 适用于 \r\n 和 \n 换行符
  });

  let totalLength = 0;

  // 逐行读取文件
  for await (const line of rl) {
    totalLength += line.length;
  }

  return totalLength;
}

// 使用异步函数来执行
(async function() {
  try {
    const filePath = './largefile.txt'; // 替换为你的文件路径
    const totalLength = await calculateTotalLineLength(filePath);
    console.log(`Total length of all lines: ${totalLength}`);
  } catch (err) {
    console.error('Error reading file:', err);
  }
})();
```


![image](https://i.imgur.com/8CiigmI.png)

![image](https://i.imgur.com/Cr7MJ7V.png)

那么，我们看到`nodejs`或者说`v8`直接运行js代码，时间就只有41s，与awk接近，而使用`deno`(本质也是v8)，逐行解释运行，时间就变成了3min+。这里我觉得有以下几点的差异：
- 1 直接运行有`字节码`与`JIT`等优化，而`jtxt`每行代码都是重新解释执行，没法优化。
- 2 字符串获取方式不同，直接运行是直接读文件得到的字符串，而`jtxt`是读取文件之后，用`var l = ` + `'...'`的形式将rust读取到的数据，再拼接成一个变量扔到v8去解释运行。`var`赋值语句的解释本身就是多出的一部分成本。
- 3 `nodejs`运行效率比`deno`高，都是`v8`引擎，但是上层实现上可能有差异。

# 优化1
针对第一点，我们可以修改`jtxt`代码，将我们的输入指令封装到一个全局函数中，接收变量`l`，每次只要把读取当前行的文本赋值给`l`，然后调用全局函数`process(l)`即可，这样`process(l)`是提前声明的全局函数，多次调用后`v8`会进行`jit`的优化，这样应该能解决问题1中的一部分痛点。

修改代码：

![image](https://i.imgur.com/TyLaQhd.png)

然而实际上效果如下，运行时间来到了200s，比原来220s强了一点点，但是整体还是离40s有很大差距。

![image](https://i.imgur.com/T7KB85o.png)

![image](https://i.imgur.com/TrVNVux.png)

针对第一点的优化收效甚微，而且内存问题没有解决。

# 优化2
上面可以看出字节码和`jit`的优化有限，那么可以猜测，主要的性能差距不在这里，那就有两种可能：
- 1 变量赋值这条语句的执行非常消耗性能。
- 2 同样是v8，node比deno在这个场景下强。

既然`nodejs`直接读取文件速度不慢，那么`nodejs`自身运行时嵌入一段`eval`函数执行代码，是不是就避免了`var`语句在`v8`中的解释运行了，因为`nodejs`读取的内容已经是一个变量了。同时也避开了`deno`直接用了`node`。

代码就是把之前的稍微改一下；
```js
const fs = require('fs');
const readline = require('readline');
const { program } = require('commander');

// 定义命令行选项
program
  .version('1.0.0')
  .argument('<logic>', '处理逻辑的 JavaScript 代码')
  .argument('[filename]', '要读取的文件名', null)
  .option('-b, --begin <code>', '初始化的逻辑代码')
  .option('-e, --end <code>', '结束后的逻辑代码')
  .parse(process.argv);

// 解析命令行参数
const options = program.opts();
const logic = program.args[0];
const filename = program.args[1];

var begin_func = function(){}, end_func = function(){}, 
    process_func = new Function('l', 'ctx', logic);
if (options.begin) {
    begin_func = new Function('ctx', options.begin);
}
if (options.end) {
    end_func = new Function('ctx', options.end);
}

// 预定义全局变量
var ctx = {
    n1: 0, n2: 0, n3: 0, s: '', arr: []
};

// 处理文件或标准输入
const processStream = (stream) => {
  begin_func(ctx);
  const rl = readline.createInterface({
    input: stream,
    output: process.stdout,
    terminal: false,
    crlfDelay: Infinity // 适用于 \r\n 和 \n 换行符
  });

  rl.on('line', (line) => {
    try {
        process_func(line, ctx);
    } catch (error) {
        console.error('Error processing line:', error);
    }
  });

  rl.on('close', () => {
    // 执行结束逻辑
    end_func(ctx);
  });
};

// 判断处理文件还是标准输入
if (filename) {
  const fileStream = fs.createReadStream(filename);
  processStream(fileStream);
} else {
  processStream(process.stdin);
}
```

然后竟然真的变快了，内存占用也变低了，没想到多一个赋值语句的`eval`竟然性能下降这么多。

![IMAGE](https://i.imgur.com/c6kwnWy.png)

![image](https://i.imgur.com/MQUvrG7.png)

# 小结
回头来看的话，原来的设想是基于`rust`作为宿主语言，可以在读文件和一些前期处理上有更好的性能，然后解释运行的部分在使用`deno`的`v8`引擎上，结果到头来发现，直接使用`nodejs`作为宿主语言反而更快，而且代码更简单，只不过使用起来比较麻烦需要`node`环境，或者`pkg`打包。打包之后的大小有`70M`还是比较大。

这里也可以直接试一下`deno/bun`实现类似的代码来对比一下三个运行时在读文件、解释运行、内存占用上性能的差距。也算是探索下到底是不是`deno`这个场景下有问题，这部分留到下一篇文章介绍了。