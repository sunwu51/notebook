# gsap
gsap是前端动画框架，与anime.js很像，但后来我研究了下发现他更强大。所以就放弃了anime。

gsap之前有很多个子框架（Tween和Timeline）组成，现在他们全都合为一个了（3.x版本），直接使用gsap这个对象就可以调用以前子框架里的方法了。cdn如下
```html
<script>https://cdnjs.cloudflare.com/ajax/libs/gsap/3.2.6/gsap.min.js</script>
```
# 1 Tweens补间
Tweens的方法也都在gsap这个对象里主要是以下三个
- gsap.to()
- gsap.from()
- gsap.fromTo()
例如
```js
//  id为id1的dom元素，右移111，持续时间为1s
gsap.to('#id1',{x:111,background:'red',duration:1});
```
上面注意到了第一个参数是个选择器，第二个参数是移动后的属性或样式，如上面的x，background，但是其实第二个参数里除了基础的样式，`还有一些gsap内定的参数`。第二个参数在官网被称作`vars`。

这里简单列出几个常用的vars属性

常用样式属性：
- xy 坐标
- rotation 旋转角度，不用单位默认是°
- scale 大小变换，1是原始大小
- fill svg填充色
- 等等

常用内置属性 官网叫做 Special Properties
- duration 动画持续时长，不用单位默认是s
- stagger 选择器选中多个dom时，动画每这么多个一组串行执行，若值为1则是挨个串行执行
- repeat 动画重复播放次数，-1是无穷次
- yoyo 配合repeat镜像播放
- 下面放个官方的截图
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/2004/gsap1.png)
## 1.1 Tween疑问1 from与to区别？
from与to函数接的参数相同，但是from规定了动画开始的属性，动画结束的属性则是当前css中定好的属性。to则是规定动画结束的属性，动画开始的属性是当前css中定义的属性。
## 1.2 Tween疑问2 to与fromto区别
fromTo是from与to的合体他的参数是`gsap.fromTo('.a',{开始属性},{结束属性})`且一般duration这些属性只在结束属性中去定义。
# 2 Timeline时间线
Tween是对选中的dom元素进行补间动画，是比较单元化的一种操作。例如平移是一个单元化的动画，而平移然后旋转然后放大，然后另一组元素延时1s进行变色，这一些列操作的组合，其实需要用到多个Tween进行编排，而这个编排工具就是`Timeline`。

例如如果只用补间来实现连续的三个动画，需要借助delay属性来进行编排：
```js
gsap.to("#id", {x: 100, duration: 1});
gsap.to("#id", {y: 50, duration: 1, delay: 1});      //wait 1 second
gsap.to("#id", {opacity: 0, duration: 1, delay: 2}); //wait 2 seconds
```
而如果使用时间线：
```js
var tl = gsap.timeline();
tl.to("#id", {x: 100, duration: 1});
  .to("#id", {y: 50, duration: 1});
  .to("#id", {opacity: 0, duration: 1});
```
！！ Timeline的to方法和gsap.to几乎是一样的，第一个参数是选择器，第二个是vars。Timeline可以连续调用to方法，讲多个动画串联起来。

Timeline的vars的特殊属性和Tween的大部分重合但稍有不同：

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/2004/gsap2.png)

## 2.1 Timeline的第三个参数
Timeline的to方法有第三个参数，是指定偏移时间的。例如
```js
// 第一个动画指定为1s后触发
tl.to("#id", {x: 100, duration: 1},1);
// 第二个动画指定为第一个动画结束1s后触发
  .to("#id", {y: 50, duration: 1},'+=1');
// 第三个动画指定为第二个动画结束前0.5s触发  
  .to("#id", {opacity: 0, duration: '-=0.5'});
```
小结：
- 1 开始后延时1s
- +=1 上个动画结束后延时1s
- -=1 上个动画结束前1s
- <1  上个动画开始后延时1s
- \>1  上个动画结束后1s
- <-1 上个动画开始前1s
- \>-1 上个动画结束前1s
- xxx 给当前这个动画添加标签
- xxx+=1 在xxx动画结束后1s

其实+=和>效果一样，我试了下确实是一样的:(，不知道为啥要这么设计，感觉一般就用大于号和小于号吧。
## 2.2 Timeline构造方法
`gsap.timeline()`上面的构造方法中是可以输入构造参数的。构造参数可以指定的属性就是上图中的这些属性。例如{repeat:3}就可以使动画重复3次。
## 2.3 Timeline自有的控制方法
- tl.pause();
- tl.resume();
- tl.seek(1.5);
- tl.reverse();






