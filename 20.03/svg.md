# svg
svg可缩放矢量图，1999年提出并使用至今。相比canvas矢量图显示更细腻。但是对浏览器渲染也有着更大的压力，所以svg常用于静态的绘图展示，或者并不复杂的动画。而对于像游戏渲染等场景，则用canvas更为合适。
# 1 基本标签
svg符合dom标准也是标签的形式，使用标签来表示图形。常见的图形标签有
- circle圆形
- ellipse椭圆
- line直线
- polyline折线
- rect矩形
- polygon多边形
- path路径(类型折线但更为强大)
- text文本

注意：svg中的width和height是不需要写单位的，默认会使用用户单位：像素。但也可以用viewBox属性进行伸缩。
```html
<svg width="600" height="600">
    <!-- 圆心在10,10，半径是10的园 -->
    <circle cx="10" cy="10" r="10"/>

    <!-- 中心在30,30，x方向半径10，y方向半径30的椭圆 -->
    <ellipse cx="30" cy="30" ry="10" rx="30"/>

    <!-- 20,10 - 80,20的直线，注意一定要添加stroke的颜色，不然看不到这条线 -->
    <line x1='20' y1='10' x2='80' y2='20' stroke="black"/>

    <!-- 绘制一条折线，并填充黑色，所以这里画出的是三角形 -->
    <polyline points="0,50 50,50 50,100"/>    
    <!-- 将填充色设置为透明，边框设置为黑色，才会出现真正的折线 -->
    <polyline points="50,50 100,50 100,100" fill="transparent" stroke="black"/> 

    <!-- 左上角是10,100,宽和高都是100的矩形 -->
    <rect x='10' y='100' width='100' height='100'/>

    <!-- 和polyline几乎一样，只不过是会首尾相连，形成图形 -->
    <polygon points="10,210 210,250 210,300 20,300" fill="transparent" stroke="black"/>

    <!-- 一段文本 -->
    <text  x=110 y=200 style="font-size:90">这是一段文本</text>

    <!-- 路径和polyline很像，不过是M表示笔移动到，L表示划线到另一个点，小写l则表示相对移动 -->
    <path d='M 20,330 l 80,0 L 100,440' fill="transparent" stroke='black'/>
</svg>
```
# 2 path高级
上面展示了path中M和L还有l的作用，已经可以用来画直线了。补充下几个其他直线能用的
- M移动到绝对点，m移动到相对点
- L从上个点划线到绝对点，l相对划线
- H水平划线到绝对x坐标，h相对划线
- V垂直划线到绝对y坐标，h相对划线
- Z闭合一般放在最后

不过polyline也能实现相同的功能。path其实还可以画曲线--贝塞尔曲线。

三次贝塞尔函数
```
# 从上个点到xy画曲线，x1y1 x2y2是贝塞尔控制点。看图
C x1 y1, x2 y2, x y (or c dx1 dy1, dx2 dy2, dx dy)
```
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/2003/svg1.png)

俩曲线衔接的时候会出现棱角，一般需要连续画曲线（ps中钢笔工具就是在画贝塞尔曲线）使用S进行衔接
```
S x2 y2, x y (or s dx2 dy2, dx dy)
```
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/2003/svg2.png)

补充二阶贝塞尔，只有一个控制点
```
 Q x1 y1, x y (or q dx1 dy1, dx dy)
```
上述都可以到[mdn](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths)找到更详细的解释。

作为开发者其实不需要特别记住怎么画好贝塞尔曲线，因为一般都会使用工作来生成曲线。后面会讲各种设计工具。
# 3 非图形标签
```html
<!-- g分组类似于html中div -->
<g fill="red">
  <rect id = 'r1' x="0" y="0" width="10" height="10" />
  <rect x="20" y="0" width="10" height="10" />
</g>

<!-- use用于引用已存在的元素 -->
<use x=40 href='r1'/>
```
# 4 变换
```html
<!-- 平移变换 -->
<!-- 等价于x=30,y=40的正方形 ，可以写百分比，是占自身的百分比-->
<rect x="0" y="0" width="10" height="10"  transform="translate(30,40)"/>



<!-- 旋转变换，以30,40为圆心的 -->
<rect x="20" y="20" width="20" height="20" transform="translate(30,40)rotate(45)" />
<!-- 旋转变换，以00为圆心的 -->
<rect x="20" y="20" width="20" height="20" transform="rotate(45)" />

<!-- 缩放变换，以00位缩放中心 -->
<rect x="100" y="0" width="10" height="10"  transform="scale(0.8)"/>
```

# 5 svg的css
svg与dom共用大部分css，自己比较专属的css主要是fill填充颜色和stroke边框。上面其实已经展示了部分用法，下面列出一些svg元素的属性，`这些属性也可以作为css来写，他们的效果一样`。
```css
#p1{
   fill:'transparent';    透明色
   stroke:'black';        黑边
   stroke-dasharray: 20;  虚线每20像素空出20像素
   stroke-dashoffset: 20; 虚线开始的地方偏移20像素
   stroke-opacity: 0.5;   边缘透明度0-1之间，0就全透
   stroke-width: 5;       边缘宽度
   stroke-lincap: 'round'; 线头圆角化
   stroke-linjoin: 'round'; 两线衔接处圆角化
   ....
}
```
# 6 svg动画
svg本身就是dom元素，所以直接使用dom的动画方式就是可以的。所以动画分为css动画和一些动画框架实现的动画这两种。
## 6.1 dom动画
dom中动画是通过animation这个css属性实现的。语法如下：
```
animation: name duration timing-function delay iteration-count direction;
默认值为：none 0 ease 0 1 normal
```
例如我们写一个正方形的div的移动：
```html
<style>
    @keyframes move{
        from{left:0px}
        to{left:200px}
    }
</style>
<div style="width:100px;height:100px;background:red;position:relative;animation:move 5s infinite;"><div>
```
@keyframes来设定动画，from表示开始，to表示最终。这里定义了move动画是从最左到离左边200px。

animation:move 5s infinite; 指定了三个参数，分别是动画名name，持续时间duration，播放次数animation-iteration-count。等价于`animation:move 5s ease 0 infinite normal;`

timing-function取值可以是以下值：  
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/2003/svg4.png)

direction取值有两种normal、alternate，后者会对称的反向动画一遍。

然后开始svg的动画，svg中其他属性都是一样的。只是关键帧中的用法稍有区别。区别就是svg直接可以用transform和对应的变换即可。
```html
<style>
#r1{
	animation: move 5s;
}
@keyframes move
{
0% {transform:translate(0px,0px)}
100% {transform:translate(100px,0px)}
}
</style>
<svg>
	<rect id='r1' x=0 y=0 width=100 height=50 fill='red'/>
</svg>
```

!!! 需要掌握的几个小技巧：
- 1 让svg位于中心的css：left:50%; top:50%; transform:translate(-50%,-50%);
- 2 上面写法在svg内部元素设置到中心时要添加一条： transform-box:fill-box 来表示百分比是基于自身的百分比。
- 3 基于自身中心做旋转： transform-box:fill-box; transform-origin:center; transform:rotate(100);
## 6.2 利用框架绘制svg
animejs有几个svg的例子，不过比较简单。都是基于路径的https://animejs.com/documentation/#motionPath。
gsap也有针对svg的动画，这个稍微好用点，放到当前目录下svg/svg2.html下了，可以查看。


