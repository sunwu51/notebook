# alpine.js
Alpine.js 通过很低的成本提供了与 Vue 或 React 这类大型框架相近的响应式和声明式特性。
```html
<script src="//unpkg.com/alpinejs" defer></script>
 
<div x-data="{ open: false }">
    <button @click="open = true">Expand</button>
 
    <span x-show="open">
      Content...
    </span>
</div>
```
有15个attributes，6个properties，2个method组成
# attributes
# x-data
是个对象，指定一个数据作用范围是这个dom内，在这个dom内部其他指令中可以直接用变量的值。如果一个dom修改了值，另一个dom依赖这个值，则会自动刷新另一个dom。
# x-on
js表达式，绑定js事件，不需要接函数或者箭头函数，直接js表达式`x-on:click="alert(123)"`简写是`@click`
# x-show
布尔值是否显示该dom
# x-text/x-html
js表达式，dom的innerText/innerHtml
# x-transition
用于dom出现或消失的时候的过度动画效果，可以配合x-show使用
# 以上6个指令的使用案例
x-data中open和text可以在dom内其他指令中使用，相当于这个作用域内的变量。@click和x-text接js表达式，js表达式的值就是console中输入，然后回车显示的值。如果要使用字符串就需要再加引号。
```html
<div x-data="{ open: false, text: 'content' }">
    <button @click="open = !open">toggle</button>
    <div x-show="open" x-text="text" x-transition></div> 
</div>
```
# x-bind
`x-bind:[HTML属性]="[表达式]"`绑定dom的属性为一个变量的值，变量值变化属性跟着变化。简写为`:`。如果绑定style则是追加效果，见下例。
# x-model
用在`input`上或者含有value的元素上，将value与指定的变量bind。
# 以上两个指令的使用案例
```html
<div x-data="{content: ''}">
    <input x-model="content" placeholder="输入颜色"/>
    <span><h1 x-text="content" :style="{ color: content }" style="border: solid 1px black;"></h1></span>
</div>
```
# x-init/x-effect
两个钩子函数，一个是dom初始化调用的表达式，后者是表达式中的任意变量变化时调用。
# x-if/x-for
都只能在template标签中使用,且template需要保证内部只有一个根dom。前者是是否展示，是整个dom是否存在，并不是display:none。后者则是遍历数组展示用的。
# 以上四个函数的使用案例
```html
<!-- 加载完成，注册1s后展示template -->
<div x-data="{arr: [], open: false}" x-init="setTimeout(()=>open=true, 1000)">
    <!-- 点击按钮，1s后改变数组内的元素个数，使x-for渲染 -->
    <button @click="setTimeout(()=>arr= [...arr,'hello'], 1000)">async</button>
    <!-- 当arr发生变化时会打印，注意上面改成push是不会触发的 -->
    <div x-effect="console.log(arr)"></div>
    <template x-if="open">
        <!-- 注意template只能有一个根dom -->
        <div>
            <h1>数据展示：</h1>
            <template x-for="num in arr">
                <h3 x-text="num"></h3>
            </template>
        </div>
    </template>
</div>
```
# x-cloak
所修饰的dom会不显示，直到内部元素都Alpine初始化完成，用于一些加载很慢的dom，例如用await获取数据bind到属性中。
# x-ignore
所修饰的dom里的alpine指令全部失效。
# x-ref
与$ref配合，后面讲

# properties可以用在指令内的js表达式中
# $el与$ref
`$el`代表当前dom，`$refs.xx`代表含有属性`x-ref="xx"`的dom
# $watch
格式`$watch('open', value=> console.log('open = ' + value))`，监控变量的变化来触发自定义内容，常用于x-init中。

# 上述properties案例
```html
<div x-data="{txt:0}" x-init="$watch('txt', v=>console.log(v))">
    <button @click="txt+=1" x-ref="ref1">click1</button>
    <button @click="console.log($el.textContent, $refs.ref1.textContent)">click2</button>
</div>
```
# $dispatch与x-on
`@自定义事件`可以通过`$dispatch(自定义事件)`触发，可以用于不同alpine组件或者不同dom之间通信。

一定注意，如果通信的dom不存在父子关系是需要在事件中`.window`将事件注册到整个window。原理是父子dom事件通信是可以通过事件冒泡机制，父dom获取子dom的事件信息的。非父子则需要window作为桥梁
```html
<div x-data @custom-event1.window="console.log($event.detail)"></div>
<button x-data @click="$dispatch('custom-event1', 'Hello World!')">aaa</button>

<div x-data @custom-event2.window="console.log($event.detail)">
    <button x-data @click="$dispatch('custom-event2', 'Hello World!')">aaa</button>
</div>
```

# 小结
常见用法：
- x-data使得当前dom变身为一个alpine组件，在这里赋初值。
- x-init可以使用`await fetch`来获取初始化之后的数据。
- @click等事件也可以使用`await fetch`来和服务端交互。
- x-for x-text等可以做数据的展示。

特点：
alpine的特点是主要依赖写在dom上的属性，而不是在script标签中定义逻辑。

这种方式显然缺少灵活性，但是常见功能都有较好的封装，可以将复杂的函数定义放到script标签中。

