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
是个对象，指定一个数据作用范围是这个dom内，在这个dom内部其他指令中可以直接用变量的值。
# x-on
js表达式，绑定js事件，不需要接函数或者箭头函数，直接js表达式`x-on:click="alert(123)"`简写是`@click`
# x-show
布尔值是否显示该dom
# x-text/x-html
js表达式，dom的innerText/innerHtml
# x-transition
用于dom出现或消失的时候的过度动画效果，可以配合x-show使用
# 以上指令的使用案例
x-data中open和text可以在dom内其他指令中使用，相当于这个作用域内的变量。@click和x-text接js表达式，js表达式的值就是console中输入，然后回车显示的值。如果要使用字符串就需要再加引号。
```html
<div x-data="{ open: false, text: 'content' }">
    <button @click="open = !open">toggle</button>
    <div x-show="open" x-text="text" x-transition></div> 
</div>
```
# x-bind
`x-bind:[HTML属性]="[表达式]"`绑定dom的属性为一个变量的值，变量值变化属性跟着变化。
# x-model
用在`input`上或者含有value的元素上，将value与指定的变量bind。