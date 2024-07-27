---
title: css中各类position的区别
date: 2024-07-21 13:41:00+8
tags:
    - css
    - 前端
    - position
---
# 基本介绍
`position`主要有5种，位置的确定要靠方向css `top` `left` `bottom` `right`以及`z-index`层高。
- `static`默认值，方向css和层高css属性均无效
- `relative`相对定位，方向css是相比于原来位置的移动，例如`top: 10px`是原来static位置往下移动10px。如果是百分比`top: 10%`是相对于父元素的高度的百分比，这一点很重要。
- `fixed`固定视图位置，方向css是相对于视图的位置，例如`top: 10px`始终位于可见范围距离最上方10px的位置。
- `sticky`粘性定位，与`fixed`类似，方向css是相对于视图的位置，不同的是`sticky`的方向偏移量是最小偏移的概念。例如`top: 10px`是指最小位于可见范围距离最上方10px的位置。如果当前位置在距离上方超过10px，那么就在当前位置不动，当小于10px的时候，才会固定在10px。
- `absolute`绝对定位，方向css是相对于最近的非static祖先元素的移动，例如`top: 10px`是相对于最近的非static祖先元素往下移动10px。注意相对定位和绝对定位是相比dom元素的偏移，而非视图。

<iframe src="https://sunwu51.github.io/HtmlPlaygroud/?js=eJwDAAAAAAE%3D&css=eJyFkc8OwiAMh%2B9L9g5cPGqmiZeZ%2BC4MKjY2dOmYuhjfXR3M%2BW%2BRE%2F2VfB%2BUhWEfNHoQtVUWj%2BqSZ%2Bq%2B9oBuH0q1LIr6vMmza54tmqADmuFEzQ0GZF%2BqmG9iXGlzcMKtt3PDxFIqepCc6C5hBOh%2B%2FgjfoKGTUIHrUq2i%2F1ET7MJbMOGqqIXk0lXD1IYfrqHz6loXs1RKfP36r8sJgE%2ByHZ7BRtPo6cOe0SuKfpvwsZggGxZNz8mjOXSf6Ji%2BsNNlp67KZMEL2w6I%2BJTQ4%2F9%2F%2F%2Fz4%2Blpbi949p3%2B9ASTdq%2BA%3D&html=eJyVVMtu2kAU3VfqP1jsK7LJzuVfCDgqKgEETpR0BUlDotRgRIN4GDekgZJGrU0kkjgGk4%2Fp3LG96i%2F0msHGtEVpvcBo5sw55957xvxWNnkQe%2FmCw4dPpva4RDpeKLyOJLIZMZ7KCPnIYnN1uyDGxVQiEmNv2tLdScvR%2BlCc%2FpxKxKg4oyPaGNud98Sq2JYGo1vEMDAfRZ6%2FkuaFNAL2hKUkx%2FlreNxWDNAfGSGqOCc38HAL1QuqDgIhYnWJYcKFCSflH8VDPEL1c%2Fr9CgyDAdLCtri5seQXs7nNDWSzz6%2BJWWUSjDngdJ4U51KCkmwPJ4HttUVsp%2FaFZLgCPhebr4FigtZxL%2B9c9XNQBMi6MyyhlH3TBPnqN%2Ft8NLdKxFwyJnr4jd5peBS6Jm3rYex6dwUcwNuDsD224mgzNITN8HoBNYn2HhbWmC%2FflLdrfUQcjGR0soHytHkPxbY39mnHncjEksmTSqXSsqtkNnRmj7QnwxeciAZWA7dwLvO2ELNPzDpVxiB%2FgIH1fAnxrUI2vSuupMRfsydqOCJkMnDVTyx26DQXzwsZcaWW4y6YDczWG3EnDcdH9rj3Lz1k2Q%2F38L9vQXiseSHExXHvXqUySWHfuT%2BD%2FhB%2FXbVHjDOvm5jOmgTlNnSvoVbFHCG1v6uEKfxbA3XJb83yApnVZHaHFctCjdQsoXWJpSHAOsMyKDMf9ZyEl8U51G7P4LTs3byWvpthBXOs%2B17U%2Fd0%2FdOG0jSeYKALXKy7g8xowdixw7FMQ1OYpfTXd5tiXIUbVd4qzgUoP0%2BkjQkJ4kUIDCcfA%2F89HFx%2FNX%2BBYnmE%3D" height="730"
                sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-clipboard-write"></iframe>

- `z-index`越大越靠上，相同写在后面的靠上；
- `relative`和`absolute`是相对于dom元素偏移，`fixed`和`sticky`是相对视图偏移；
- `relative`和`absolute`的偏移百分比是`unstatic parent`的百分比，`fixed`和`sticky`则是视图的；
- `relative`和`sticky`元素会保持原来dom元素的空间，`fixed`与`absolute`不占用空间；
# relative与translate
以下两种样式获得的效果是一样的，相对定位在原来基础上偏移`(10px,10px)`和直接平移`(10px,10px)`位置一致，并且两者都会占用原来dom元素的空间，可以说是完全一样。
```css
.a {
    position: relative;
    top: 10px;
    left: 10px;
}

.b {
    translate: 10px 10px;
}
```
有区别的是其他移动单位，百分比`top: 10%`，在`relative`中是相对于父元素的高度，在`translate`中是相对于自身的高度。例如想要让一个元素位于屏幕中央：
```css
.center {
    posiition: fixed;
    top: 50%;
    left: 50%;
    translate: -50%, -50%;
    /* transform: translate(-50%, -50%); */
}
```
# absolute与unstatic父元素
上面提到`absolute`与非static的父元素密切相关，但是给的demo中父元素是static，所以最后兜底是按照整个html来算的绝对位置，下面简单的例子展示了absolute相对于非static parent的位置。

```html
<h1>这是absolute相对于非static parent的例子</h1>
<div style="position: relative; height: 300px; background: #ccc">
      <h1>这是absolute相对于非static parent的例子</h1>
      <div style="position: absolute; top: 10px; left: 10px; background: #f00">
        距离父元素左上角10px
      </div>
</div>
```
![img](https://i.imgur.com/6vkSMUa.png)

在这个例子中，parent div采用了`relative`，因为没有方向css，所以和`static`的位置是一样的，但给子元素的`absolute`提供了定位锚点，所以不能忽略的。
# sticky与flex
粘性定位最常见的例子就是侧边栏，例如我的这个博客的右侧目录栏就是`sticky`的。侧边栏的布局通常都是和内容部分左右布局，并且大概率使用了`flex`布局。

例如布局可能是这样的：
```css
.title {
    width: 100%;
    font-size: 2rem;
}
.container {
    display: flex;
}
.content {
    width: 80%;
    height: 3000px;// 模拟很长的文章
}
.sider {
    width: 20%;
    position: sticky;
    top: 2px;
}
```
```html
<head>
    <div class="title">这是文章标题</div>
</head>
<main>
    <div class="container">
        <div class="content">这是文章内容</div>
        <div class="sider">
            <ul>
                <li>这是目录1</li>
                <li>这是目录2</li>
                <li>这是目录3</li>
                <li>这是目录4</li>
            </ul>
        </div>
    </div>
</main>
```
我们对`sider`使用了粘性位置，但是实际会发现并没有生效，这是一个常见的问题，非常有代表性：

![img](https://i.imgur.com/0NDXDqE.gif)

他的本质是因为，`flex`布局下每个元素默认会被拉伸，因为默认`align-items: stretch`，所以`sider`的高度也是3000像素，如下图.

![img](https://i.imgur.com/OOo8qmz.png)

需要修改，对齐为start对齐，即靠上对齐，如下。或者也可以修改`.sider`自己的对齐方式`.sider {align-self: flex-start;}`。
```css
.container {
    display: flex;
    align-items: flex-start;
}
```
![img](https://i.imgur.com/TlLE5bT.gif)

[playground](https://developer.mozilla.org/en-US/play?id=wLk85mluN0JIHmSDUe3qgAldEmNuugX6%2FA%2Fb4ZZBvpKlhl3IQL2s6OPCBRQJNDFkDV%2FqvmcaJeHkdlTs)