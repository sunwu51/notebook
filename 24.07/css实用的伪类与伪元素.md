---
title: css实用的伪类与伪元素
date: 2024-07-17 20:19:00+8
tags:
    - 前端
    - css
    - 新特性
---
一个冒号开头的叫伪类（Pseudo-class），作用是一个修饰元素的`where`条件，例如：`h1:hover`是指被`hover`的`h1`元素；两个冒号叫伪元素（Pseudo-element），本质是一个真实存在的元素，例如：`h1::before`是h1的内容部分最前面添加一个元素，他没有真正的dom标签，但是是确实存在的元素。

# 伪类
伪类目前已经超过60个了，参考[mdn](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes)，这里列出最常使用的，和一些好用新加的伪类。

## 使用率最高的伪类
- `:active` a或button被鼠标按下的时候。
- `:checked` radio/checkbox/select被选中的时候。
- `:focus` 获得焦点的时候。
- `:focus-within` 焦点元素是自己或自己的子元素。
- `:disabled/:enabled` 被禁用、启用的元素。
- `:hover` 鼠标悬停
- `:first-child/:last-child/:nth-child()` 自己是作为长子、小儿子、第x个儿子。
- `:only-child` 自己是独子。

## 功能强大的组合伪类
- `:is()` 满足一些条件的元素，可以实现代码的简化，`is(div h1) is(span h2)`是四种组合。
- `:where()` 与is的不同就是where所有选择器优先级(特异性)是0，最低优先级，适用于需要应用样式但不想增加优先级的场景。
- `:not()` 不满足一些条件的元素。
- `:has()` 新特性中介绍

## 使用率不高但很有用的伪类
- `:in-range` input中如果定义了`min/max`属性，并且值在这个范围内的时候。
- `:invalid` input中输入了无效值的时候，例如上面range不符合的时候，再比如email type中非email格式文本。
- `:required` input有required属性的时候。
- `:empty` 没有children的元素。
- `:link` 没有visit过的a元素。

## 新特性
- `:dir([ltr | rtl])`元素的文本方向，ltr是从左到右，rtl是从右到左。
- `:has(selector)` 在元素内部有符合selecor条件的子元素时，该父元素的样式，通俗讲就是根据子元素选择父元素。

## 组合使用
`not` `is` `where` `has`等这些本身就是函数，可以和其他css选择器组合使用，这里有个理解的关键：**伪类也是一些where条件，但是要先满足前面的样式的情况下，再满足伪类才行。**

`.item:first-child`需要元素首先得具有`item`样式，然后再满足是父元素下的首个元素`:first-child`；

`.item :first-child`这个代空格的就不一样他其实是指`item`下的子元素，这个子元素必须是首个元素，而这个元素不需要有`item`样式；

下面展示了基本的用法，这个例子中有个重要的应用场景，就是用一个元素的状态`div2`被hover的时候，会导致`fixed`元素的隐藏和展示，这是之前需要用`js`才能实现的效果，现在css就可以胜任了。`has not`这两个伪类给css带来了新的可能。

<iframe src="https://sunwu51.github.io/HtmlPlaygroud/?js=eJwDAAAAAAE%3D&css=eJx9kEFLwzAUx%2B%2BFfocc7cBVr92nmW22BmtS0igVEQT1ICrbwbE5dpgwwYuKQ%2BbUgV9mSdeTX8E0qeuU6iWQl%2Fd%2Bv%2F%2BLXRHnt2JwhhjcEcMXPmt9zi7462Q%2BvRK9x7Tzwe%2FbFds0qlmD00A0YuuujwIPHJgGAC4JCHUAhV7NNA5NwzTsv4Hz6WUJExO2tgq2fpCbFEJcsOUkPz1OnodifCMlPtmD9BfKr0fyyB6sHEV2WYAwdMBmGAOPMFakrTZQDPNdQhIhhgh2gCrWshojoRzbCGN1o6jps%2BU9j6TUMotGLQPKrVUhfe8tHkZpv73otoqkWUg9YIHVDB6KwqC%2B7wBMMNSO%2Fwx8cKc2TfonojvhR9ffVt3BnzrJ6K3Uqn%2Bo3L0VEHdby78AQq7ftA%3D%3D&html=eJyzSckss%2BPlUgACGyBTITknsbjYVimzJDVXCSaeYWgHlDK00QcysArZ6ENMIWCCEaYJKEJIutMyK1JTYNph6sGCyBpg1oJpAJWyM1Q%3D" height="730"
        allow="clipboard-write"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-clipboard-write"></iframe>

# 伪元素
伪元素有20来个，但是很多都是试验性阶段，最常见的其实就是两个`::before`和`::after`，用来在元素前后添加元素，实现一些标记的功能。简单说几个可能会用到的其他伪类：
- `::file-selector-button` 上传文件的按钮的样式用这个。
- `::first-letter`首字母的样式用这个。
- `::first-line`首行样式用这个。
- `::selection`选中文本的样式用这个。
- `::backdrop`一般用于模态窗口，背景的样式用这个。
- `::-webkit-scrollbar`仅适用于webkit内核的浏览器，firefox不可用，滚动条的样式用这个。
## after/before的妙用
1 可以在元素前后添加元素，实现一些标记的功能，比如下拉下拉菜单的箭头，下面的例子中用`hover`和`click`两种方式的纯css实现了dropdown的效果，其中`click`方式有很多借鉴意义，他是巧妙使用了`label` + `checkbox`的`checked`状态，来实现了点击触发的逻辑。

<iframe src="https://sunwu51.github.io/HtmlPlaygroud/?js=eJwDAAAAAAE%3D&css=eJyNks9OAjEQxu%2Bb7DtM8AIkgAdO3YR36baFnWxpa7cLMcYLMTGGgxdPXvQBjDejRnwbWa4%2BgrCFhCwb5NZpvt%2F8%2BWZ6bShmL8Xb68%2FHvJjfrR5viuf35eIe2r0w6CZ6ImyHW224niq4CgOAKXKXEBii6zCtnFAuCoPrQ%2FEAKCF06IT13FZMoPH79PDdqIVIGR5HF0fRbpbHY6FyD3LMjKSXBGKpWbrl6hVKKxFtfozO0KFWBKyQ1OHEf0sxXDdwXr6dNrunoZyjGu3CMbUjVD7arzUAieVYvsuydExZOrI6V3xtpNSWwFm%2F34%2F8wGU8TdAJnykMem1YzT6Xt1%2B1m2ISWXrqpipiVCZ39XYcqonSrkkSmjVLjLBEsFTwVgskjYU8YeWVfJjVpxtsE%2F57B5VpPLXnM8tttnHTaFzjNqr3nl7kdGd1tcXD9k64sz%2FkYSK%2F&html=eJyzScpPqbTj5VIAApsMQ7uM%2FLLUoqfr5j3v25BSlF%2BQkl%2BeZ6MPFIeqSMksU0jOSSwutlUCq9SFKVKCqgCqSVTIKEpNs1VSVrJ71rTm2dZ1z%2BYvfT6n20Y%2FEaGmNAdmTHFpUm5qXilCP1A2J9MO2ZSnaye86J%2FztHfqy4U7FQxB5tjoA5UQqcGIVA3GGBps9EtzYCGgDwwCpPB63rTzaftuogIsOSczORtbgGXmFZSWKGSmAJVkpCZnJ%2BVXKCmUVBakIvP1EcpzEpNScxTS8ouQ5O0UIA6BBDXQlWBFwyq8bfTBSRUAIuLlkw%3D%3D" height="730"
                allow="clipboard-write"
                sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-clipboard-write"></iframe>

2 一些装饰性的元素，例如`camel-ui`中下拉框右上角有个烟囱的形状，就是使用`:before`伪元素充当的。

![img](https://i.imgur.com/Jr4ka0Y.png)

[代码](https://github.com/sunwu51/camel-ui/blob/main/src/components/Select/Select.css#L70)如下
```css
.select-container .listbox::before {
    content: '';
    position: absolute;
    top: -13px;
    right: 35px;
    width: 30px;
    height: 16px;
    background-color: white;
    border-left: 3px solid var(--w-indigo-dark);
    border-right: 3px solid var(--w-indigo-dark);
    border-radius: 1px;
}
```
# 小结
介绍了伪类和伪元素，大多数是比较常用的，这里着重学习`is` `has` `not`的用法，会让开发事半功倍。