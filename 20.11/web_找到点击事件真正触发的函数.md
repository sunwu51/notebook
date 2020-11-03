# 找到点击事件真正触发的函数
这个事情是这样子的，B站在已经看过的视频再次打开的时候，会有个提示上次看到的时间点，并且点击就可以直接跳到之前看到的时间点，如下图。

![Imgur](https://i.imgur.com/VyQGAob.png)

我想要知道点击之后触发了什么函数，导致的进度条的跳转，最简单的情况是`<a onclick="xx"></a>`onclick函数直接就定义在标签中，这种是很容易找到具体函数执行的内容的。

但是这里显然不是：

![image](https://imgur.com/U6MclpD.png)

dom中没有onclick，就可能是js中选出元素追加上的时间监听函数。

# 如何找到真正执行的函数
如下图，对页面所有的click时间进行断点，就可以捕捉到所有点击事件进入的函数。  
![image](https://imgur.com/qpooXVL.png)  
但这还不够，你会发现捕捉的函数一上来会进入chrome自带的一些js文件中，有时候还会进入到我们引入的一些框架内部，所以我们还需要排掉这些无关的js。

![image1](https://imgur.com/jOqvZR9.png)    
![image2](https://imgur.com/IZhi7bZ.png)  

通过正则的方式过滤掉一些chrome的js和框架js。

当然了，直接在某个脚本中右键也是可以过滤的。
![image](https://imgur.com/u72PAPL.png)

这样一下子就找到了点击后触发的逻辑了。
