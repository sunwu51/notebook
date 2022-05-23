# css动画
可以参考之前的gsap动画来看，css动画的支持是gsap的基础。
# transform
```css
.位移{
    transform: translate(12px, 50%);
    transform: translateX(2em);
    transform: translateY(3in);
}
.缩放{
    transform: scale(2, 0.5);
    transform: scaleX(2);
    transform: scaleY(0.5);
}
.旋转{
    transform: rotate(0.5turn);
    transform: rotate(90deg);
}
.倾斜从一个角度去看的侧视效果{
    transform: skew(30deg, 20deg);
    transform: skewX(30deg);
    transform: skewY(1.07rad);
}
.多个效果{
     transform: translate(30px, 20px) rotate(20deg);
}
```
# transform-box
有多种取值，但是没必要仔细阅读解释。只要记住，常规的dom元素，用fill-box就行。

比较复杂的svg元素，默认的box是viewport，那就是整个svg。

例如指定transform-origin是50% 50%，实际上是整个svg的中心而不是当前元素的中心点，需要手动设置为fill-box。


简言之，如果是在正常dom中其实不需要改这个值，就是符合预期的。如果是svg中一般是需要改为fill-box是符合预期的。

- view-box(default)
- border-box
- fill-box

# transform-origin
transform变换的原点，默认是center，如果出现了不符合预期的情况，基本都是由于transform-box导致的。
```css
/* 中心点，上下左右的中点(默认是center) */
transform-origin: center; 
transform-origin: 50%;

/* 左上角，其他四个角类似 */
transform-origin: top left; 

/* 上面中间 */
transform-origin: top center;

/* 其实还有个z轴，是第三个参数 */
transform-origin: 0 50% 10px;
```

# 动画
利用关键帧可以实现动画
```css
.rect{
    transform-box: fill-box;
    transform-origin: 0 0;
    animation: mymov 1s forwards;  /*animation 指定动画名和持续时间，结束后保持*/ 
}
@keyframes mymov{ /*动画通过关键帧来声明，可以直接声明100%的样式，0%默认对应的就是静态css效果*/
    100%{
        /* 这里可以指定任何css样式，例如width，backgroud等 */
        transform: rotate(45deg); 
    }
}
```

animation第一个参数指定动画，第二个指定时间，但是还有更多的参数。
```css
animation: animation-name animation-duration animation-timing-function animation-delay animation-iteration-count animation-direction animation-fill-mode animation-play-state
```
- timing-function: 默认是ease低速开始加速，然后减速。还支持linear、ease-in、ease-out、ease-in-out等
- delay: 延时执行，如1s，默认是0s，注意不是0，必须是0s，后面说为啥。
- iteration-count: 动画重复次数，infinity是无限循环
- direction: 动画方向normal正向，reverse反向，alternate正向然后反向回来，如果设置了次数一个来回算两次。
- animation-fill-mode: forwards使动画结束后样式保留，而不是复原。backwards复原。

为啥delay不能是0必须是0s，因为css是可以写部分参数的，只要顺序对就行。如果delay允许写0，也就是纯数字，那就和repeat纯数字混淆导致无法解析了。比如mov 1s 0就不知道0是delay0s还是repeat0次了，所以delay不能是0，必须写0s，这样mov 1s 0就能确定是0次repeat。
# transition
transition是一个非常简单的css属性，例如可以写 transition: 2s。这样如果这个元素，css样式有任何变化，都会变成2s的渐变效果，例如颜色变化，或者坐标变化，都会变成动画效果。配合hover非常简单而且实用。
