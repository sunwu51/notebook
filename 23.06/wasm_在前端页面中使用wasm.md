# 前端wasm
对于前端嵌入wasm的介绍，可以直接参考[mdn](https://developer.mozilla.org/zh-CN/docs/WebAssembly)。这里主要介绍通过C语言和Rust编译为前端可用的wasm模块。
# C
需要安装`Emscripten`环境，这个环境提供基于`llvm`的前端部分，利用llvm编译出wasm格式的文件，并且配套的引入到html的js文件也会同时生成。
```shell
$ git clone https://github.com/emscripten-core/emsdk.git
$ cd emsdk
$ ./emsdk install latest
$ ./emsdk activate latest
$ source ./emsdk_env.sh
```
安装完成后，可以使用`emcc`指令来编译c文件了。
```c
// hello.c
#include <stdio.h>

int main(int argc, char ** argv) {
  printf("Hello World\n");
}
```
直接将hello.c文件转为前端
```shell
$ emcc hello.c -s WASM=1 -o hello.html
```
此时在当前目录生成了`html`,`js`和`wasm`文件，我们打开html效果如下

![image](https://i.imgur.com/pWHqqoC.png)

这是最简单的测试demo，不过大多数情况，我们使用wasm是要做一些复杂的数学计算或者编解码，这时候我们不是直接运行`main`函数而是给html环境去提供函数的。此时需要修改`hello.c`的内容，例如我们如果想要一个斐波那契函数。
```c
#include <emscripten/emscripten.h>

EMSCRIPTEN_KEEPALIVE 
int fib(int n) {
  if (n <= 1) return 1;
  return fib(n - 1) + fib(n - 2);
}
```
使用`EMSCRIPTEN_KEEPALIVE`来标识下该函数是需要作为emcc的输出的，然后通过`emcc hello.c -s WASM=1 -o hello.html`编译出wasm。

在引入`hello.js`后会有一个全局变量`Module`有当前wasm中声明的函数，只不过是带下划线`_fib`
![image](https://i.imgur.com/HLR1X7J.png)

也可以使用自己的js来引入wasm
```js
async function loadWasm(){
    let response = await fetch('hello.wasm');
    let bytes = await response.arrayBuffer();
    let wasmObj = await WebAssembly.instantiate(bytes);
    window.wasm_fib = wasmObj.instance.exports.fib;
}
loadWasm();
```
然后我们定义一个js版本的fib函数来对比两者的性能差距
```js
function fib(n) {
    return n<2? 1: fib(n-1) + fib(n-2);
}
// 测试wasm的fib 40的计算时间
console.time(1)
wasm_fib(40)
console.timeEnd(1)

// 测试js的fib 40的计算时间
console.time(2)
fib(40)
console.timeEnd(2)
```
然后发现wasm被吊打

![image](https://i.imgur.com/N0uDWN7.png)

这是因为emcc编译的优化级别默认是最低的，可以添加`-O3`来将Optimization的level调到最高的3.
```shell
$ emcc hello.c -O3 -s WASM=1 -o hello.html
```
然后修改`hello.html`
```html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <script src='hello.js'>
    </script>
    <script>
      function fib(n) {
        return n<2? 1: fib(n-1) + fib(n-2);
      }
      // 等1s等wasm加载完成，hello.js是异步的
      setTimeout(function() {
        var wasm_fib = Module._fib;
        // 测试wasm的fib 40的计算时间
        console.time(1)
        wasm_fib(40)
        console.timeEnd(1)

        // 测试js的fib 40的计算时间
        console.time(2)
        fib(40)
        console.timeEnd(2)
      }, 1000);
    </script>
</body>
</html>
```
此时再查看运行效率，发现`wasm`已经比js快很多了

![image](https://i.imgur.com/iWBIpEU.png)

# Rust
rust是wasm支持最好的语言之一，所以也不能少了rust的demo。
```shell
$ cargo install wasm-pack # wasm-pack会帮忙打包wasm是辅助工具
$ cargo new --lib rust-wasm && cd rust-wasm
$ cargo add wasm_bindgen # wasm_bindgen是要用到的库 
```
这里大家可能有个疑惑就是rustup的target list里面是有`wasm-xxx-xxx`的目标输出的，也就是rustup自己有wasm的toolchain，为什么需要下载wasm-pack这个打包工具。这是因为后者更加方便，且后者在build的时候也是会下载`wasm-unknown-unknown`这个工具链的。

修改`src/lib.rs`文件内容如下，因为默认的模板中有add这个函数，我们就直接拿来用，只需要在这个函数上面加一行宏`#[wasm_bindgen]`，就完成了。
```rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add(left: usize, right: usize) -> usize {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
```
接下来修改`Cargo.toml`，不修改的话，后面也会提示你去修改。
```
...
[lib]
crate-type=["cdylib"]
```
开始编译
```shell
$ wasm-pack build --target web
```
编译结果是生成一个`pkg`目录里面有`js`,`wasm`文件，不过没有html文件，接下来在`pkg`创建`index.html`
```html
<script type="module">                                                      
        import init, { add } from "./rust_wasm.js";    
        init().then(() => {
          //init完成后，add函数才能用                                                       
          alert(add(1, 4)) // 5
        });                   
</script>    
```
我们来加一个fib函数试试，rust-wasm的运行效率。
```rs
...
#[wasm_bindgen]
pub fn fib(n: u32) -> u32 {
    if n < 2 
    { 1 } 
    else
    {fib(n-1) + fib(n-2)}
}
```
```html
<script type="module">                                                    
  import init, { fib } from "./rust_wasm.js";    
  init().then(() => {
    function js_fib(n) {
        return n<2? 1: js_fib(n-1) + js_fib(n-2);
    }
    // 测试wasm的fib 40的计算时间
    console.time(1)
    fib(40)
    console.timeEnd(1)

    // 测试js的fib 40的计算时间
    console.time(2)
    js_fib(40)
    console.timeEnd(2)
  });                              
</script> 
```
结果与c的差不多，都是从1s优化到600多ms。

![image](https://i.imgur.com/rTz8XzI.png)

注意如果在rust的函数中使用`print`宏，实际不会在html的console中打印，因为并没有做这个映射。
# wasm在前端的主要应用场景
wasm本质和js一样，都是定义了一些函数，但wasm运行效率更高，换言之更快，因为wasm是一种比js更low level的binary format。当然这只限于计算型，对于IO其实没有区别，甚至wasm中并没有对fetch等功能的支持，也就是说wasm主要就是对纯的数学计算提高js运算效率的。

数学计算，对应哪些场景呢？上面的斐波那契就是一种数学计算，类似的还有在绘图场景中各种曲线的计算，比如贝塞尔曲线，曼德勃罗特曲线（如下图）；

![image](https://i.imgur.com/DC7PIPl.png)

此外对于编解码也是纯计算的场景，比如最简单的字符串utf8编码，对字节流的base64编码，音视频的mp3、h264等编码，我测试了base64编码的wasm效率(1s)是要高于直接用`Base64.js`编码的效率的(1.4s)，wasm中使用rust的base64的库.

![image](https://i.imgur.com/vLErx8N.png)

目前对于视频的编解码ffmpeg工具也有了wasm版本，但是实际用下来觉得，音频的编码速度还可以接受（毕竟音频小），视频的编码效率太慢了远低于native的ffmpeg，可以去[https://ffmpegwasm.netlify.app/#installation](https://ffmpegwasm.netlify.app/#installation)体验。



