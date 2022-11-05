# flex样式
看flex之前可以先看[grid](./fe_grid.html)的介绍，里面会有对`justify`和`align`的说明，在`flex`中也会用到。

在父级div上使用`display:flex`可以使得其内部元素如div等，紧凑排列。与grid用法类似。但是flex比grid更灵活也更复杂，我们可以认为默认情况下`flex`是一行多列的`grid`，并且列数无限，里面有多少个dom就有多少列。
```
display: flex;
```
这是默认的flex按照横向排列多个子元素。
![image](https://i.imgur.com/oZEe13u.png)
并且如果宽度不够，会自动适应缩小。
![image](https://i.imgur.com/ROembsn.png)
# 方向与换行
刚才默认方向是row横向，还可以取以下方向。`flex-direction`: row/column/row-reverse/column-reverse。例如在纵向上下排布东西的时候column也是常用的。

默认也是不换行的nowrap，可以设置为换行。换行激活后，超出宽度的不会自动缩放，而是换到下一行，当然至少要放一个元素，一个都放不下，那这个会缩进。`flex-wrap`: nowrap/wrap 配置一行满了是否换行，默认不换行，wrap改为换行。

![image](https://i.imgur.com/R8QjHQU.png)

# item中的弹性缩放
`flex`相比`grid`最灵活的就是他的缩放功能，刚才也看到了默认情况下就是有缩放的，其实目前看到的只有缩，没有放。缩放相关的由flex控制，如下，是三个css的集成，分别代表了缩放基准，缩和放。
```
flex: flex-basis flex-shrink flex-grow
```
flex-basis、flex-shrink、flex-grow缩放相关，是内部元素的样式而非父容器，grow是指如果元素默认宽度不够整行宽度的时候，放大以填满。shrink则是超出了整行宽度，缩小以填满。默认0代表不放缩，元素全是1代表全部等比放缩，不同值则是代表放缩比例不同。

这组属性与width、min-width、max-width、wrap息息相关。

grow如果全是1，则宽度填满，并且每个元素的扩大的部分是等比的，例如下面都是扩大了150px，如果是其他数也是长大的部分是按照比例

![image](https://i.imgur.com/Sqgy2iM.png)

![image](https://i.imgur.com/UVFTtnM.png)

如果是0，则不进行扩张。

![image](https://i.imgur.com/E9mnvoE.png)

shrink是缩小，是总宽度比容器宽度要大的时候会起作用，所以和grow并不矛盾，但是缩放不是按照像素而是按照缩小的比例，如下图。

![image](https://i.imgur.com/RJPO19Z.png)

basis是基准，会覆盖width的基础设定，但是最小宽度默认是内部元素需要能盛放下的宽度。如下basis设置为100后，所有元素宽度变为100，因而如果使用放缩功能不要使用width，而是使用basis。

![image](https://i.imgur.com/nl6LyfA.png)

basis可以分别设置成不同的值，grow还是按照放大的像素成设定的比例，shrink还是按照缩小的像素占basis的百分比成设定的比例。

![image](https://i.imgur.com/pEBwxVz.gif)

上述看出width的作用优先级较低，是会被basis grow等覆盖。但是`min-width`和`max-width`仍是最高优先级，可以通过设定这两者来使得放缩的时候保持一个宽度的范围，防止过度缩放影响观感。
# 对齐
justify-content，justify-item，align-item这三个与grid中是一个意思。可以先去看下grid中的介绍，
- content代表flex布局中瓦片的排列，item则代表瓦片中的dom元素的对齐，
- justify代表主方向 与direction有关，默认就是横向；align就代表主方向垂直方向咯。

注意我们align-content也就是纵向上的棋盘排放方式，默认flex是nowrap不换行的话，该属性是没有作用的，因为就一行，就是放到最上面的。只有wrap后，`align-content`才代表纵向上棋盘的

# 详细配置
flex详细配置如下，第一个值是默认值(flext-start可简写为start)
- `flex-flow`: `flex-direction` `flex-wrap`
- `flex-direction`: row/column/row-reverse/column-reverse
- `flex-wrap`: nowrap/wrap 配置一行满了是否换行，默认不换行
- `place-content`: `align-content` `justify-content`
- `align-content`: stretch/flex-start/center/flex-end/space-around/space-between/space-evenly
- `justify-content`: flex-start/flex-end/center/space-between/space-around/space-evenly 元素如何排列
- `align-items`: stretch/flex-start/flex-end/baseline
- `flex`: `flex-basis` `flex-shrink` `flex-grow`
- `flex-basis`: 放缩的基准值
- `flex-shrink`: 缩小比例
- `flex-grow`: 放大比例


# 案例
flex能实现的一些常用案例（上面花里胡哨的其实很多都不是特别常用）

## 1 内部单个元素居中显示[两种方式]
一种是认为只有一行nowrap，然后该行高度是整个容器，此时将每个元素放到行的中央即可，align-items:center
```html
<div style="height:400px; backgroud: green; 
    display: flex; justify-content: center; align-items: center">
    <h1>hello world</h1>
</div>
```
另一种思路是可以有多行wrap(其实只有一行)，将第一行的维度设置到赤道center。align-content: center; flex-wrap: wrap
```html
<div style="height:400px; backgroud: green; 
    display: flex; justify-content: center; align-content: center; flex-wrap: wrap">
    <h1>hello world</h1>
</div>
```
![image](https://i.imgur.com/q8rtFAl.png)
## 2 卡片对齐排列
含有内容的卡片，默认大小取决于内容多少，但为了美观需要每行按照最大的高度对齐，宽度则设置为固定。

父容器flex wrap即可，内部卡片需要设置width来固定宽度即可，因为默认的align-items是stretch填充整行高度，而整行的高度取决于最高的一个元素。
```html
<style>
  .container{
    display: flex;  
    flex-wrap: wrap; 
  }
  .item{
    width: 300px;
    background: green;
    margin: 10px;
  }
  p{
    font-size: 50px;
    margin: 0px
  }
</style>
<div class="container">
  <div class="item"><p>ad s a f d s h i u a f h d s u i a f u d s af d s a f d s a f d sa f ds a f </p></div>
  <div class="item"><p>ad s a f</p></div>
  <div class="item"><p>ad s a f</p></div>
  <div class="item"><p>ad s a f d s h i u a f h d s</p></div>
</div>
```
![image](https://i.imgur.com/k28olBS.png)

如果想每个元素按照自己的内容高度，那只需要在container中增加`align-items:start`

![image](https://i.imgur.com/lcaTbs2.png)

## 3 卡片对齐2
上述卡片对齐场景，希望能按照比例放缩卡片，并且为了美观，需要设置最小不能小于200px，最大不能大于500px，在这个范围内希望尽量满足一行3个元素。

需要设置basis是33%，但是因为有margin所以会导致不够，所以搞个margin为0的div套一下。然后设置最大最小的宽度。

```html
<style>
  .container{      
    display: flex;  
    flex-wrap: wrap; 
  }
  .item{
    min-width: 200px;
    max-width: 500px;
    margin: 10px 0 ;
    flex: 33% 0 0;
  }
  .item > div{
    background: green;
    margin: 10px;
    height: 100%;
  }
  p{
    font-size: 50px;
    margin: 0px
  }
</style>
<div class="container">
  <div class="item"><div><p>ad s a f d s h i u a f h d s u i a f u d s af d s a f d s a f d sa f ds a f </p></div></div>
  <div class="item"><div><p>ad s a f</p></div></div>
  <div class="item"><div><p>ad s a f</p></div></div>
  <div class="item"><div><p>ad s a f d s h i u a f h d s</p></div></div>
</div>
```
一开始2000+px因为max500px所以能放4个，缩小到2000以内，此时只能放3个，再缩小到1500以内，开始缩小
![image](./flex/chrome_7C9CTPTSp7.gif)

默认没有设置grow和shrink的比例，如果设置了，最后一行的宽度不会和上面对齐。

![image](https://i.imgur.com/ft2v8Z0.png)

# 3 瀑布流布局
![image](https://i.imgur.com/PE3P1Fu.png)

# 4 多行与单行对齐样式
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
![image](https://i.imgur.com/15Eyaiz.png)