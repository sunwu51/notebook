# flex样式
在服级div上使用`display:flex`可以使得其内部元素如div等，紧凑排列。
```
display: flex;
```
flex详细配置如下，第一个值是默认值(flext-start可简写为start)
- `flex-flow`: `flex-direction` `flex-wrap`
- `flex-direction`: row/column/row-reverse/column-reverse
- `flex-wrap`: nowrap/wrap 配置一行满了是否换行，默认不换行
- `place-content`: `align-content` `justify-content`
- `align-content`: stretch/flex-start/center/flex-end/space-around/space-between
- `justify-content`: flex-start/flex-end/center/space-between/space-around/space-evenly 元素如何排列
- `align-items`: stretch/flex-start/flex-end/baseline
- `flex`: `flex-basis` `flex-shrink` `flex-grow`
- `flex-basis`: 放缩的基准值
- `flex-shrink`: 缩小比例
- `flex-grow`: 放大比例

![image](https://i.imgur.com/rFM1r26.png)
# 解释
查看[demo](./flex/flex-show.html)

1 flex-direction就是排列方向，又叫主方向，默认是横向。flex-warp就是超过屏幕后是不是要换行。

如果设定了内部元素的width，但是配置了nowrap也是会被压缩，而不会变滚轮。但是设置了height则超出页面就会变滚轮。因为默认div的高度是无限高的，可以通过设置外部div的height可以使item换列。

![image](https://i.imgur.com/z9Dq7RG.gif)

设置外部div height为700px后

![image](https://i.imgur.com/zzZ5Dyw.png)

2 justify-content是主方向的排列方式，start就是紧凑的从开始方向排列，end反之，center就是居中排列，space-between是第一个和最后一个元素靠边中间的均匀分布，另外两个的解释则如下

![image](https://i.imgur.com/3ofXZzM.png)

注意只有空间允许才会有空隙的调整资格，如果空间都不够，就只能紧凑排列。

![image](https://i.imgur.com/lKNFm8w.gif)

3 align-items与align-content是垂直方向元素对齐调整，注意两者需要wrap，否则只有单行的概念，align-content无效。其中align-content是整个这一行跟其他行的对齐方式，是以行为操作单位的。align-items是每一行的各个元素为操作单位，例如：content是end就表示，从最下面开始第一行。然后items是start则表示这一行的元素都是贴着行的最上排列的。

注： baseline在div中等于start，不用管，基本用不上。

![image](https://i.imgur.com/lUsXx1T.gif)

4 flex-basis、flex-shrink、flex-grow缩放相关，如果不设置基线，并且nowrap，那么缩放会按照shrink和grow的比例来。