# svg小结
# 1 元素小结
- circle圆形 cx cy r
- ellipse椭圆 cx cy rx ry
- line直线    x1y1 x2y2
- polyline折线 points
- rect矩形    x y width height
- polygon多边形  points
- path路径(类型折线但更为强大) d
- text文本
# 2 大小单位小结
svg根元素可以指定width height并且可以不带单位；也可以带单位px，并配合使用viewBox指定缩放。

指定一个宽高比200:100，并指定映射到2000x1000px的视图中，注意这里刚好是同比例的，也可以是不同比例，比如1000x1000px也是可以的，这样会被拉扁。`带单位的则确切的指定大小`。
```html
<!-- viewBox指定左上角和宽高 -->
<svg width='2000px' height='1000px' 
viewBox='0 0 200 100'></svg>
```
# 3 属性
- x y 一般是图形左上角的坐标
- width height 宽高
- fill 填充色 opacity 透明度(0-1)
- stroke边框色 stroke-width边框宽 stroke-opacity边框透明度
- stroke-dasharray虚线 stroke-dashoffset虚线偏移量
- transform-origin旋转和缩放中心 可以指定为`center`、`50%,50%`这种
- transform-box上面参数的50%是基于哪个box，view-box|fill-box|border-box分别为svg元素|当前元素瓤子|当前元素壳子
- transform(xxx)变换，具体有translate坐标变换，scale/scaleX/scaleY大小变换，rotate旋转角。

上述属性绝大多数可以直接作为svg中元素的属性，也可以作为style。
# 4 动画
css绘制动画，通过`animation`和`@keyframes`。animation用法：`animation: name duration timing-function delay iteration-count direction;`，参数不必全部都有，一般有动画名name和持续时间duration俩就够了。

@keyframe中可以用百分比来设置开始和结束的样子，里面写的都是style中的属性，svg的话就可以写3中提到的属性，例如写个大小变化的如下：
```css
.e{
    animation: move 1s ease 1s 2 alternate
}
@keyframes move{
    0%{ transform(scale(1))     }
    100%{ transform(scale(1.5)) }
}
```

<hr>

除了css设置动画，还可以使用js和相关框架，例如gsap。通过下面的cdn可以引入gsap。
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.2.6/gsap.min.js"></script>
```
一般常用时间线来绘图，下面的例子就是时间线的使用方式，使用连续的to函数调用，将两个动画串联起来。效果是.css这个元素，0-1s 向左移动10,1-2s向右移动10.`注意这里的x是相对移动，而原生svg一般是绝对位置，两者一定区分开！！！`
```js
const t1 = gsap.timeline();

// selector,属性,[delay]
t1.to('.css1',{duration:1,x:-10})
    .to('.css1',{duration:1,x:0})
```
注意：to的第三个参数如果不设置就是顺序执行，即默认第三个参数其实就是duration的值。

delay除了设置为固定的时间数值，还有一些高级写法：
- 1 从开始延迟1s开始执行
- "+=1" 从上一个动画结束后延时1s执行
- "-=1" 从上一个动画结束前1s执行

属性对象的key非常多，比较重要的有
- duration设置持续时间单位是s
- delay延时比预期开始时间再延后时间和第三个参数有点重复，但其实不完全一样
- onStart/onComplete开始/完成时回调的函数(还有很多事件)
- repeat重复次数
- reversed对称执行
- yoyo和上面类似也是对称，但是必须配合repeat使用，完成多次执行间的补间动画的，最后一次不会补
- xy相对移动，rotate/scale相对旋转/缩放 opacity颜色 strokeDashoffset等等(驼峰转大写)
- attr可以设置一些不支持的css属性例如：attr:{cx:10,cy:10} 默认只支持xy，cxcy就可以这样写。

旋转和缩放中心，在gsap中和原生svg也不一样，后者是transform-origin和transform-box来设置的。而gsap默认中心时图形的(0,50%)点，可以通过下面的方式进行重设，注意啦，重设时候的center默认就是当前元素的center而不是整个svg的center。
```js
gsap.set('.line line',{transformOrigin:"center"})

gsap.set('.line .line-three',{transformOrigin:"right buttom"})
```