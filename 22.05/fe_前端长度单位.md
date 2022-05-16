# 长度单位
最熟悉的是px像素，电脑屏幕1080p的是1920x1080个像素，最常见的正文字体大小在12-18px左右。

但是px不是前端唯一的单位还有一些其他的单位，如下

![image](https://i.imgur.com/znkejF8.png)

绝对长度单位px/cm/mm/in/pt/pc如下。
# px
如果屏幕是1080p的，然后显示器高度假如是40厘米，那么1px物理世界对应的就是`40/1080`cm，所以相同分辨率不同大小的屏幕，1px代表的长度也会有不同，但是同一块屏幕1px就是定的。
# cm/mm/in/pt/pc
厘米 毫米和英寸，`1 in = 2.54 cm`

![image](https://i.imgur.com/vj88AVX.png)

相对的长度单位
# em
相对于当前元素内的文字大小，2em就是2倍字体大小的长度。如下，就代表行高是2倍字体大小。
```css
p {
  font-size: 16px;
  line-height: 2em;
}
```
# ch
`0`这个字符的宽度。
# rem
相对于根元素(html)的比例，1rem就是和html跟节点的字体大小相同，2rem就是2倍大小。
# vw/vh
1vw就是当前浏览器1%宽度。1vh就是当前浏览器1%的高度。100vh就是整个浏览器高度。
# %
父级元素的百分比
# vmin/vmax
1vmin就是1vm和1vh里比较小的那个，1vmax反之。

![image](https://i.imgur.com/7gYIG3o.png)