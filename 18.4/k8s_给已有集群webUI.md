# 给已有集群添加webUI
直接使用[这个yml](conf/k8s-dashboard.yml)，只需要修改31行`apiserver-host`指向自己的apiserver就行了。当然其中用到了gcr的镜像，需要配置docker代理，配置方式参考建立dns的那一节。
# 完成后界面如下
注意也可以切换不同的dashboard版本，进行适配。
![image](img/k8sui.jpg)