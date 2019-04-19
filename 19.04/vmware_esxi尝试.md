# esxi
`esxi`是`vmware`的主推产品之一，他有另一个名字`vSphere`。普通用户对vm的`workstation`比较熟悉，这里说一下两者的区别。

`workstation`就是这个软件，
![image](https://github.com/sunwu51/image/raw/master/1904/workstation.jpg)，是创建虚拟机用的，经常在学习一些需要用`Linux`的软件的时候，就会用workstation创建ubuntu用啦。而ESXI其实不是一个软件，而是一个操作系统，直接安装在机器上，这个系统的作用是用来创建和管理其他虚拟机的。两者的运行区别如下。  
![image](https://github.com/sunwu51/image/raw/master/1904/ws1.jpg)  
# 安装
ESXI是操作系统因而可以直接在机器上安装，当然如果没有现成电脑，也可以把ESXI装到Workstation里，这样就是win10下运行workstation，workstation下运行esxi，esxi下运行虚拟机了。

首先还是下载这个安装包吧，是个iso的系统镜像，我们可软碟通很容易的制作esxi系统安装盘，这在workstation方式时并不需要，直接选择iso就可安装了。这里选择后者进行尝试。

初次安装时，选择合适的安装项，注意在要求输入root密码的时候，需要大小写和字符的密码才能通过。

进入系统，oh，只有个黑黄页面如下，看到这个页面说明已经安装并启动完成。  
![image](https://github.com/sunwu51/image/raw/master/1904/es1.jpg)  

初始配置可以通过F2进行配置，一般可以配置开启Shell、SSH，以及设定IP地址等选项。另外每次输入root密码，太麻烦，可以通过F2设置中的RESET选项，使密码为空。



# 使用
配置完成后就可以使用了，不过不是在这个黑黄页面，而是进入页面上所提示的http地址。浏览器输入网址进入后，可以看到一个和workstation有点像的页面。通过下面的步骤就可以创建一个虚拟机了。
![image](https://github.com/sunwu51/image/raw/master/1904/1.gif)    
# 小节
这里我已经创建了两个系统了，一个lede，一个ubuntu。他们都正常工作，不得不说esxi的使用方式还是比较简单的，更深入的探讨，等我租房子以后再仔细探索吧。

