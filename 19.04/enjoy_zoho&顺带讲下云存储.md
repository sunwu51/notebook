# SaaS平台zoho 与 云存储
zoho（卓豪）是一个耕耘多年的SaaS平台，提供了大量的企业化软件。

当然作为个人用户，很多功能对个人用处不是很大，本文介绍部分有趣的个人也能用的功能。主要有建站工具Site和在线办公Docs以及数据分析工具analytics
# sites
快速建站工具   
![image](https://github.com/sunwu51/image/raw/master/1904/zoho1.gif)

# analytics
BI工具，入口：[https://analytics.zoho.com.cn/](https://analytics.zoho.com.cn/)  
![image](https://github.com/sunwu51/image/raw/master/1904/zoho3.gif)  

# docs
zoho docs和onedrive的docs或者google docs类似，提供了两个功能：1 云存储，2 在线的表格word幻灯片。  
![image](https://github.com/sunwu51/image/raw/master/1904/zoho2.gif)  

# 云存储
云存储工具有很多，这里选几个典型的。
## 1 onedrive
onedrive目前是综合来讲比较好的，优点：win10自带，国内直接可用。缺点：免费空间5G，有时候同步很慢，网页版巨慢。
## 2 google-drive
google-drive界面比较美观，对比onedrive来讲，优点在于空间更大15G免费，缺点则在于国内连不上，不适合大部分用户。
## 3 nextCloud
开源的云盘工具，还算不错，速度取决于自己，目前我在用。
运行方式：
```
// 快速尝试
docker run -d -p 8080:80 nextcloud
```
如果要关注文件和数据的存储，不放到docker中，则可以通过[https://hub.docker.com/_/nextcloud](https://hub.docker.com/_/nextcloud)提供的映射方法来运行。
## 4 filebrowser
开源的文件管理工具，将服务端的某个目录映射出来，web界面的方式管理里面的文件。建议使用二进制文件的方式运行，从[这里](https://github.com/filebrowser/filebrowser/releases)下载。

![image](https://github.com/sunwu51/image/raw/master/1904/filebrowser.gif)  
