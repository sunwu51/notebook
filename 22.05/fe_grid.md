# grid
grid与flex以及float都用来布局，float的使用比较受限，所以用的比较少了。

flex注重的是单行/列维度的精修，如果wrap成多行也可以，并且自己有主轴方向，不一定是行。

grid主轴就是行x列，不会旋转90°，理解起来比较简单，侧重于2维网格。
# 常用属性介绍
```css
.container{
    grid-template-rows: 200px auto 300px; /* 指定每一行的高度，个数就代表了行数了 */
    grid-template-columns: 100px 200px auto; /* 指定每一列的宽度，个数就代表了列数了 */
    grid-template: none|grid-template-rows / grid-template-columns|grid-template-areas|initial|inherit; /* 可以是上面两个拼，也可以代替grid-template-areas */
    row-gap: 20px; /* 行距 */
    column-gap: 10px; /* 指定列距 */
    gap: 10px; /* 指定行距和列距，可以指定俩值，分别对应行列 */
    grid-auto-rows: 10px; /* 指定默认行高 */
    grid-auto-columns: 10px; /* 指定默认列宽 */  
    grid-auto-flow: row; /* 容器中的item以什么顺序放 row/column/row dense/column dense/dense 其中dense是稠密摆放 */
    grid-template-areas: 'myArea myArea'; /* 配合item中的grid-area指定名字来使用 */
    grid: none|grid-template-rows / grid-template-columns|grid-template-areas|grid-template-rows / [grid-auto-flow] grid-auto-columns|[grid-auto-flow] grid-auto-rows / grid-template-columns|initial|inherit;
}
.item{
     /* item 上的属性 */
    grid-row-start: 1; /* 当前item从第几行开始 */
    grid-row-end: span 3; /* 当前item跨度是几行 */
    grid-row: 3 / span 3; /* 上面缩写，从第3行开始到第6行结束 */
    grid-column-start: 1;
    grid-column-end: span 3;
    grid-column: 3 / span 3;
    grid-area: grid-row-start / grid-column-start / grid-row-end / grid-column-end | itemname;
    /*例如 2 / 1 / span 2 / span 3 就是指从第2行第1列，为左上占用是2行x3列的面积 默认auto / auto / auto / auto */
    /* 也可以指定名字，配合grid-template-areas使用*/
}
```
# justify和align相关
这部分和flex类似，但是解释起来就更容易了。主要有两种content和items两类。

如果我们把grid网格每一个网格空间叫瓦片，那么瓦片就是content，而瓦片里面放置的dom元素就是items。

justify就是元素的横向排布，就是x轴咋放，align就是纵向，y轴上咋放。

justify-content就是瓦片横着咋摆放，start就是从做到右挨着来，end就是从右到左了，center就是居中，evenly就是等距等等。

justify-items就是瓦片里面可能放了div h1 button等等dom元素，如果瓦片比dom要宽的话，那dom放到瓦片的左右什么位置呢，就是这个决定的，start就是放到瓦片的左边，以此类推。

align-content就是瓦片在纵向上如何摆放，start就是从上到下的挨着来，以此类推。

align-items就是瓦片内的dom在瓦片中的上下位置如何排放。


如果四个全都是center，那就代表了，瓦片是从中心向四周，瓦片内的dom是从瓦片中心。

flex是默认单行，所以align-content需要开启wrap才行，之前flex的文中也介绍了居中的两种方式。

1 wrap + justify-content: center + align-content/item: center
2 justify-content: center + align-items: center

grid因为默认就是多行所以就更简单了，如果只有一个元素那就是一个瓦片了，以下四种形式均可实现居中。

1 justify-xxx: center + align-xxx: center

这里看到有一种情况，也就是justify-align:center的情况是flex不能实现左右居中的，因为flex默认是1行n列的，而grid默认是1行1列，如果只有1列，那放到这一列的中间，那就是整个一行左右的中间了。

# 最佳实践
`grid`和`gap`是最常用在父容器上的，基本涵盖了所有的css样式。例如可以通过`grid: auto auto / auto auto auto;`指定2行3列的模板，然后`gap: 10px`指定行距和列距都是10px。

`grid-area`是最全的item属性，要记住语法是 行/列/行跨/列跨，很容易记错，默认值都是auto，span是跨的关键字。

下面这段用grid实现效果和之前的flex类似
```html
<div style="display: grid; grid: auto auto / auto auto; grid-auto-flow: column; justify-content: start; ">
    <div style="background-color: antiquewhite;">左上</div>
    <div style="background-color: blueviolet;">左下</div>
    <div style="background-color: saddlebrown; grid-area: 1 / 2 / span 2 / span 1;display: grid;align-items: center;">右侧</div>
</div>
```
![image](https://i.imgur.com/rDbgo9B.png)

之前flex实现
```html
<div style="display: flex;">
    <div style="display: flex; flex-flow: column;">
      <div style="background-color: rgb(77, 77, 29);"><p>左上</p></div>
      <div style="background-color: rgb(193, 146, 93);"><p>左下</p></div>
    </div>
    <div style="display: flex;align-items: center;background-color: rgb(93, 193, 170);">
      <div><p>右侧</p></div>
    </div>
</div>
```