# flex样式
在服级div上使用`display:flex`可以使得其内部元素如div等，紧凑排列。
```
display: flex;
```
flex详细配置如下，第一个值是默认值(flext-start可简写为start)
- `flex-flow`: `flex-direction` `flex-wrap`
- `flex-direction`: row/column/row-reverse/column-reverse
- `flex-wrap`: nowrap/wrap 配置一行满了是否换行，默认不换行
- `align-content`: ormal/center/flex-start/flex-end/space-around/space-between/stretch
- `justify-content`: normal/center/flex-start/flex-end/space-between/space-around/space-evenly 元素如何排列
- `align-items`: normal/flex-start/flex-end/stretch/baseline
- `flex`: `flex-basis` `flex-shrink` `flex-grow`
- `flex-basis`: 放缩的基准值
- `flex-shrink`: 缩小比例
- `flex-grow`: 放大比例

![image](https://i.imgur.com/rFM1r26.png)
# 解释
1 flex-direction就是排列方向，又叫主方向，默认是横向。flex-warp就是超过屏幕后是不是要换行。

