# html中样式的生效顺序
以前经常遇到想重新设置css，结果总是不成功，逼不得已只能修改对应元素的style属性才成功。今天仔细探索下css的生效顺序。

首先直接写在元素上的style属性肯定是最高优先级的，这一点不用怀疑。
# css基本优先级(单层选择器)
id选择器 > 类选择器 > dom选择器
>解释：如果css文件中对一个dom的css有id类和dom三种描述，并且有重复的style属性，则以上面的优先级依次生效。

同一种选择器下，写在后面的生效。

# 混合
实际上选择器并不是单一的，可能有多层设置多重混合。
##  不同的选择器有多层
```html
<div id="main" class="root1">
    <div id="smain" class="root2">
        <div id="cmain"class="root3">
            <p id="p">Hello</p>
        </div>
    </div>
</div>
```
### 1 先看描述准确度
先看描述切确程度，定位到元素本身的优先，例如下面。即使有多个id，但锁定的是div，而p只有类描述，那p中文字也是红色
```css
#smain #cmain{
    color: yellow;
}
p{
    color: red;
}
```
如果都没有定位到元素本身则更近的优先：例如id虽然比类优先级高，但是root3修饰的div离p更近，所以p中是红色。
```css
#smain{
    color: yellow;
}
.root3{
    color: red;
}
```
### 2 再看id选择器个数
若准确度相同，则看多层描述中id选择器的个数，个数多的优先.
例如下面虽然#smain p好像没有后面的描述的详细，但是含有1个id选择器（大于后者0个），所以p文字是黄色。
```css
#smain p{
    color: yellow;
}

.root1 .root2 .root3 p{
    color: red;
}
```
再比如下面，这个非常经典！！！虽然后者直接#p锁定了p但是按照上述规则，前者是俩id选择器，所以优先级更高。
```css
#smain #cmain p{
    color: yellow;
}
.root1 .root2 .root3 #p{
    color: blue
}
```

### 3 id选择器个数相同，则看类选择器规则同上

### 4 类选择器个数相同，则看dom选择器规则同上

### 5 dom选择器个数也相同
写在后面的优先生效
大于号不影响上述规则，结果仍为黄色，2写在后面生效
```css
#cmain>p{
    color: green;
}
#cmain p{
    color: yellow;
}
```
# important
实在搞不定用important关键字提高到最高优先级。
```css
p{
    color: gray!important
}
```
