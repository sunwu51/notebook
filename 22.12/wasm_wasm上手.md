# wasm与wasi
之前的文章中花了很大的篇幅去讲wasm的前因后果，以及对wasm未来的展望，而本篇则是亲自上手，来体验下wasm的使用。当然我们还是要分开去体验，一个是web端的wasm一个是服务端的wasi，两者并不相同，wasi包括了一些OS的syscall，可以用来写服务端。
# 1 浏览器加载网上写好的wasm
在[wat2wasm](https://webassembly.github.io/wabt/demo/wat2wasm/)点击download就可以把`addTwo`这个函数的wasm文件下载下来，名为`test.wasm`，我们在同一目录下创建`index.html`，两个文件都在当前目录的`wasm/pureJs`目录下，可自行查看。在html文件中加载wasm文件，方式如下，即加载后通过浏览器内置的WebAssembly实例化，并取出里面的函数，这里我将addTwo注册到全局了，后续我们可以在console中使用addTwo。
```html
    <script>
        fetch('./test.wasm').then(res=>res.arrayBuffer()).then(buf=>{
            WebAssembly.instantiate(buf).then(res =>{
                var exports = res.instance.exports;
                console.log(exports);// exports={addTwo: function}
                window = {...window, ...exports};
            });
        });
    </script>
```
![image](https://i.imgur.com/GiNQpFg.png)

运行来看addTwo已经变成js上下文可以调用的一个函数，并且也具有js的灵活性，例如多传或少传参数也自适应。

稍微解释一句wat是wasm二进制格式的一种文本描述，两种格式可以无损互转，在浏览器中预览wasm文件内容是wat格式的，是自动转的。

好的，目前我们看到了wasm文件可以被浏览器加载，虽然写法稍显麻烦，但是也比较固定，抄过来就好了。那接下来我们要看下如何自己生成wasm文件。

# 2 使用rust写一个前端wasm
wasm是一种规范，很多语言都已经实现了这种规范，所以可以用很多语言来写wasm，我们先来看rust。

官方有个[教程](https://rustwasm.github.io/docs/book/game-of-life/introduction.html)，但是这个教程非常长，实现的是一个网页游戏，也非常复杂，我们把部分内容简化。

安装必要的工具`wasm-pack`和`cargo-generate`
```
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

cargo install cargo-generate
```
用wasm-pack提供的模板创建项目，过程中会询问项目名，这里我写的是`wasm-fe-demo`，会创建同名文件夹，创建rust项目
```
cargo generate --git https://github.com/rustwasm/wasm-pack-template
```
这是个`lib`库查看lib.rs文件内容如下，发现有一个greet函数是alert了一些信息，我们先不管代码的含义，直接把他编译成wasm文件试试。

![image](https://i.imgur.com/6D8h7Ko.png)

```
wasm-pack build --release --target web
```
输出日志如下，可以看到把生成的文件放到pkg这个目录下了，我们打开看看都有啥，发现有几个js文件和一个wasm文件，还有对应的package.json，可以看出把写前端项目的这一套都帮我们搞了一下。
```
[INFO]: Checking for the Wasm target...
info: downloading component 'rust-std' for 'wasm32-unknown-unknown'
info: installing component 'rust-std' for 'wasm32-unknown-unknown'
 18.8 MiB /  18.8 MiB (100 %)  15.2 MiB/s in  1s ETA:  0s
[INFO]: Compiling to Wasm...
   Compiling proc-macro2 v1.0.47
   Compiling unicode-ident v1.0.5
   Compiling quote v1.0.21
   Compiling syn v1.0.105
   Compiling log v0.4.17
   Compiling wasm-bindgen-shared v0.2.83
   Compiling cfg-if v1.0.0
   Compiling bumpalo v3.11.1
   Compiling once_cell v1.16.0
   Compiling wasm-bindgen v0.2.83
   Compiling wasm-bindgen-backend v0.2.83
   Compiling wasm-bindgen-macro-support v0.2.83
   Compiling wasm-bindgen-macro v0.2.83
   Compiling console_error_panic_hook v0.1.7
   Compiling wasm-fe-test v0.1.0 (/root/code/wasm-fe-test)
[INFO]: Installing wasm-bindgen...
[INFO]: Optimizing wasm binaries with `wasm-opt`...
[INFO]: Optional fields missing from Cargo.toml: 'description', 'repository', and 'license'. These are not necessary, but recommended
[INFO]: :-) Done in 1m 01s
[INFO]: :-) Your wasm pkg is ready to publish at /root/code/wasm-fe-test/pkg.
```
我们上面明明自己写几行就能引入wasm，咋还帮我们创建这老些东西呢。我们直接用上面的方法在index.html中引入下这个wasm试试。发现报错了，这个原因大概是前端的wasm有几种，前面的比较基础的是有export的，而这里的没有export，不过一般这种会专门生成js文件，用这个js文件加载wasm即可，这也就是为啥pkg目录多个文件的原因。

![image](https://i.imgur.com/BNEml2D.png)

![image](https://i.imgur.com/IllKPv8.png)

我们创建index.html和index.js，分别如下非常简单，然后打开index.html就可以了，效果如图，甚至还使用了前端的alert函数。
```html
<!--index.html-->
<script type="module" src="./index.js"></script>
```
```js
// index.js
import init, { greet } from "./wasm_fe_test.js";

init().then(()=>{
    console.log("加载完成开始运行greet函数")
    greet()
})
```
![image](https://i.imgur.com/xdU5qZl.png)

通过观察js文件的内容和我们之前加载的方式，对比报错我们发现，他这个js文件比我们自己加载addTwo的例子有所不同的是instantiate方法传了第二个参数import，这个import本质上是把js中的函数给引入进去，有点像动态链接库了，因为引入的名称和写法非常特殊，所以需要给我们生成，因而也就建议使用他给的这个js文件，而不是自己手动引入了。其他具体的wasm-bindgen的更多用法和例子[参考](https://rustwasm.github.io/wasm-bindgen/examples/hello-world.html)

![image](https://i.imgur.com/jVN0lLM.png)

对于该程序，我们还可以稍微改动，尝试传入参数和使用console打印，对lib.rs做如下改动。
```rs
... 
...
#[wasm_bindgen]
extern {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    log(format!("Hello, {}", name).as_str());
}
```
然后index.js中修改为，如果greet函数没有传入字符串，或者没传参是会报错的，而如果多传参数则不会。
```js
import init, { greet } from "./wasm_fe_test.js";

init().then(()=>{
    console.log("加载完成开始运行greet函数")
    greet("wasm")
    window.greet = greet;
})
```


到这里我们用rust和相关工具链制作了一个wasm程序，并在前端运行了起来，似乎马上就可以大展身手，修改下greet函数，或者同时注册其他函数，来看看效果了。但是先不要着急，有些话需要说在前面。web端的wasm是一个很封闭的沙盒环境，因而对于很多功能是无法运行的，例如IO，线程，访问环境变量，获取用户信息，等等，凡是涉及到系统调用的基本都无法完成。

那他的用途是什么呢？

是计算密集型函数的平替，例如figma这样的前端绘图网站，视频、游戏、cg的渲染等，需要的是大量的数学计算，比如画贝塞尔曲线的计算，视频编码运算等等，这样的数学计算用js这种解释型语言是很慢的，用wasm高速运行后返回结果给js，性能就得到很大提升。这也是前端wasm的主要发展方向。
# 3 使用golang写一个前端的wasm
wasm是一种规范几十种语言都可以写wasm，他就像java的class规范一样，只要满足这个格式规范，那都可以在浏览器中去运行。那我们换一种语言，golang，为啥是golang呢，因为golang的wasm工具比较完善，算是仅次于rust和.net吧。

这里参考这篇[文章](https://golangbot.com/webassembly-using-go/)，我们快速过一下流程。

写一个简单的helloworld程序，然后通过build指令得到wasm文件，之后将goroot中的一个js文件拷过来用于web加载自己打包的wasm文件用。`GOOS=js GOARCH=wasm go build -o test.wasm test.go`

![image](https://i.imgur.com/o3zcuJB.png)

index.html文件内容如下，wasm_exec.js主要是使用Go这个对象，来run加载的wasm。
```html
<script src="./wasm_exec.js"></script>
<script>
    const go = new Go();
    WebAssembly.instantiateStreaming(fetch("./test.wasm"), go.importObject).then((result) => {
        go.run(result.instance);
    });
</script>
```
注意这里我们go语言中使用的明明是`fmt.Print`，而浏览器中用console.log去平替了，这得益于go的wasm帮我们做了力所能及的替换。当然目前程序有个小问题就是我们只能`run` main函数，如果想要写一个不立即执行的函数，例如`addTwo`，那就需要稍微复杂的写法，这里不展开了，可以参考这篇[文章](https://golangbot.com/webassembly-using-go/)后半部分。
# 4 wasmedge加载网上写好的wasm
上面其实都是在讲浏览器加载wasm，wasm逐渐发展成一种后端的规范wasi，也衍生出很多wasm的后端runtime，例如wasmedge，wasmtime，wasmer等等，这里以wasmedge为例，看看wasm如何在这种runtime中运行。

从wasmEdge项目的example目录下载`qjs.wasm` [下载连接](https://github.com/WasmEdge/WasmEdge/blob/master/examples/js/qjs.wasm)，注意啊不能用其他几个runtime他们的qjs.wasm，因为各个runtime现在的规范还没有统一，还不像各个jre那么成熟，很多函数不兼容，所以他们的`wasm`有所不同。

![image](https://i.imgur.com/ktyel8l.png)

这里的qjs就是quick js，是一个轻量级js运行环境，能运行js程序，这里就是在运行test.js这个文件，注意`--dir`参数是运行时这个沙盒和外部的目录映射，都是`.`也就是都是映射当前路径，他这个映射的顺序有点迷和docker的-v刚好相反，docker的是先宿主机后容器。

# 5 使用rust写一个后端wasm
这里直接用之前写的一个小程序[zlib_file_inflate](https://github.com/sunwu51/zlib_file_inflate)是解压zlib文件的，代码没几行都在main.rs中。使用这个程序的原因是他有文件读写还有控制台交互。

我们先准备一个zlib文件吧，用刚才rust repo中引入的库，就可以顺手创建一个zlib文件，当然也可以直接到当前目录的wasm/zlib目录下找到提供好的`1.zlib`文件。
```rs
let bys = miniz_oxide::deflate::compress_to_vec_zlib(b"hello world!", 3);
fs::write("1.zlib", bys);
```
解压文件的小程序用法就是`./decompress 1.zlib`就可以解压`1.zlib`为`1`并存到相同目录下。而使用wasmEdge运行如下图，需要`cargo b --relase --target wasm32-wasi`构建成wasi目标格式，最后target目录下会有wasm的文件。然后通过wasmEdge来运行，这里需要指定`--dir .:.`就是将目录映射进去，因为wasmEdge是一个沙盒runtime，是没有访问外部文件的权限的，他自己的沙盒世界里文件系统就是空的，有点像docker容器。我们把当前目录映射进去，他就可以操作了。

![image](https://i.imgur.com/dPDLPNM.png)

从图中看出`1.zlib`文件已经解压出来，内容是`hello world!`。

到这我们用wasmEdge跑了一个具有文件读写能力的wasm-wasi程序，也许你会有疑问，我们直接运行rust程序就能搞定的事，为啥要换个格式，然后用wasmEdge来运行呢。而且有了这一层抽象，肯定没有rust这种native的程序效率高啊。那如果我说把程序在宿主机运行和在docker里运行哪个效率高，答案肯定也是宿主机，那还要docker干啥呢？

这俩问题答案是一样的，主要就是隔离与扩展。这种沙盒环境互相隔离，自己独享一套文件系统，一套网卡的端口，而且cpu和内存资源是可以限制的。
```
--gas-limit
                Limitation of execution gas. Upper bound can be specified as --gas-limit
                `GAS_LIMIT`.
// 是限制cpu资源的，gas的定义参考https://ewasm.readthedocs.io/en/mkdocs/determining_wasm_gas_costs/


--memory-page-limit
                Limitation of pages(as size of 64 KiB) in every memory instance. Upper bound
                can be specified as --memory-page-limit `PAGE_COUNT`.
// 是限制内存的页数，一页64k，1000页是64M
```

此外，如果你又想跃跃欲试，想把自己的rocket-web程序，直接打包成wasi来运行，就会发现又碰壁了。wasi的socket规范与rust中的并不完全一致，因而不能直接用。不同的wasm-runtime也都在封装自己的网络库。如果要在wasmedge使用网络相关的库，可以去关注下他们的CTO [juntao](https://crates.io/users/juntao)的crate，他有专门封装wasmedge中能使用的世面的一些流行的网络库`reqwest`、`hyper`、`tokio`、`mysql`等等，用法基本与原来一致，大部分只需要替换依赖中包的坐标，少部分要修改下参数。

这是另一个runtime wasmtime下的一个回复，wasi中网络部分的接口还并不完善，目前11月份的时候merge了一个网友的repo作为提议，https://github.com/WebAssembly/wasi-sockets。但是很是很新，所以说目前各家要想玩网络，其实需要自己先按照自己的想法去实现。

![image](https://i.imgur.com/ViZSs8o.png)

这里展示下使用`hyper`这个web框架的demo程序，可以看到网络端口的监听不需要赋权限，直接在runtime中就能监听，直接对应的宿主机的8080端口，curl可以获取到数据。

![image](https://i.imgur.com/F6zhFNV.png)

# 6 使用golang写一个后端wasm
这里参考了这篇[文章](https://www.wasm.builders/jennifer/golang-to-wasi-part1-il)，首先go的默认构建工具还没有支持wasi规范的wasm，所以需要借助`tinygo`这个构建工具，这个工具本身也可以替换`go build`是另一种构建器。安装参考[官网](https://tinygo.org/getting-started/install/)

我们直接把web wasm测试golang的时候的hello world程序，拿来生成一份wasi的版本的。

![image](https://i.imgur.com/XIH1ux5.png)

```
// 直接运行
wasmedge test_wasi.wasm
```
![image](https://i.imgur.com/RzWRE7j.png)


因为wasmedge的重心都放在了rust，目前wasmedge这个runtime没有提供golang版本的网络库的支持，同时如果使用了网络相关的库，再进行build也会返回`Killed`。

# 7 其他
spin是一个很好的工具，能够启动和管理wasm程序，他基于wasmtime这个运行时，并提供了自己的http包，可以简单快速的开发http程序，他就像是vercel等云平台提供的serveless函数服务的一个缩影：通过一个管理平台管理很多wasm的应用。