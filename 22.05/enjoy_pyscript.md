# pyscript
pyscript允许在浏览器中写python代码，原理是使用了webassembly，可以将python代码编译成浏览器能直接解读的机器码，效率比js要高。

目前处于试验阶段，但是已经有很强的功能，github star也超过了10k，目前集成了numpy, pandas, scikit-learn，matplotlib等强大的python库。

# 上手
按照官网的引入方式，是直接引入js和css文件即可使用py-script标签，下面的print会直接输出到html页面中，print的作用就有点像后端的php程序的echo，这里py-script用了原生的webcomponent，注意不能直接print dom标签下面的h1是无效的，只会输出正文h1。
```html
<link rel="stylesheet" href="https://pyscript.net/alpha/pyscript.css" />
<script defer src="https://pyscript.net/alpha/pyscript.js"></script>
<py-script>
    num = 10
    print(num)

    html='<h1>h1</h1>'
    print(html)

    def add(a, b):
        return a + b
    print(add(1, 10))
</py-script>
```
需要下载pyodide.asm相关的文件，这俩文件都是3M+，所以页面会初始化较慢，可能要加载几秒钟，不建议在小型网站使用，可以用于特殊场景的网站，比如严重依赖python的库。
![image](https://i.imgur.com/zti12v0.png)

因为在html中tab会变得很怪，所以也可以使用src的方式引入py文件。
```html
<py-script src="xx.py"></py-script>
```
# 使用repl体验
`<py-env>`中可以指定引入的库，需要用`- numpy`这种类似yaml数组的写法。如果是自己的py文件则 
```
<py-env>
    - numpy
    - paths:
        - ./my.py
</py-env>
```

`<py-repl>`标签会创建一个类似Jupiter的文本编辑区域，可以像浏览器console一样，进行python编程体验。

![image](https://i.imgur.com/0xleHLY.gif)
# 与dom和js交互
`pyscript.write(domid, string)`类似innerText的功能。

`Element(domid).element`可以获取dom元素，是js-dom，可以使用`x.innerHtml=xxx`这样的属性赋值，提供了极高的编程灵活度。

`pys-onXxx`Xxx是事件名，例如`pys-onClick`属性可以给dom元素注册事件函数，需要指定python函数。

`console.log`是可以直接在py中使用的。
```html
<input id="i1"/>
<input id="i2"/>
<button id="btn" pys-onClick="click">add</button>
<h1 id="content"></h1>
<py-script>
    def add(a, b):
        return a + b
    def click(e):
        console.log(e)
        pyscript.write('content', add(10,10))
</py-script>
```

![image](https://i.imgur.com/OwS4vL3.gif)

py-script区域内，实际上是个非常mix的区域，不光可以写python，也整合了一定的js能力。例如可以直接使用console，如果要用js window上下文的变量，可以使用from js import来引入，不光可以引入函数还可以引入js中自定义的变量
```html
<script>var myv = {a: 10, b:x => console.log(x)}</script>
<py-script>
from js import JSON,parseInt, myV

v = JSON.parse('{"a":100}').a
print(v)
print(myv.a)
myv.b(myv.a)

n1 = Element('i1').element.value
n2 = Element('i2').element.value
print(n1)
print(n2)

print(n1+n2)

print(int(n1) + int(n2))

print(parseInt(n1) + parseInt(n2))
</py-script>
```