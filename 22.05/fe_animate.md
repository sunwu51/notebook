# animate.css
非常简单易用的css动画效果，只需要引入cdn，然后给dom添加class即可，class为`animate__animated animate__{动画名}`注意两个class，动画名有
```html
<link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
/>

<h1 class="animate__animated animate__bounce">hello</h1>
```

[官网](https://animate.style/)鼠标点击右侧效果即可查看，因为是css样式，所以默认就是html加载放动画，为了能在点击事件之后放动画，那就需要css来控制动态的给dom追加和删除class样式。[样例](./animate/index.html)

![image](https://i.imgur.com/hq0thRl.png)