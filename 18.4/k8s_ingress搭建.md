# ingress
一种基于nginx的反向http代理工具
# default-backend搭建
使用这个[default-endpoint.yml](conf/default-endpoint.yml)文件，这个default-backend其实是任意一个访问url /是404，/healthz是200的镜像都可以，命名空间可以是任意。
# ingress-rc搭建
网上有说ingress要搭建为daemonset这种资源的，但是实际上daemonset是在每个Node都会创建一份，而ingress代理其实只需要一个节点有就可以，之后全都由这一个节点来进行代理（可能比daemonset的形式并发应对要差一些）。

使用这个[ingress-rc.yml](conf/ingress-rc.yml)文件进行ingress rc的创建，注意文件最后指定了apiserver和default-backend-service（与上面声明的svc保持一致）。注意18行nodeName: k8s-node-0指定了这个pod必须运行在k8s-node-0这个节点上，这是为了之后使用。

或者如果不用rc而是使用daemonset的话，可以参考[ingress-daemon.yml](conf/ingress-daemon.yml),同样也是在最后指定好这俩参数。
# 效果
```
[root@centos ~]# kubectl get rc
NAME               DESIRED   CURRENT   READY     AGE
kube-dns-v9        1         1         1         8h
nginx-ingress-lb   1         1         1         2h
```
创建nginx的dep和svc
```
kubectl run test-ng --image nginx --port 80
kubectl expose deployment test-ng --target-port 80
```
按照下述文件创建ingress
```yml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: test-ng-ingress
spec:
  rules:
  - host: ng.test.com
    http:
      paths:
      - backend:
          serviceName: test-ng
          servicePort: 80
```
在自己的电脑上配置hosts文件将刚才我们指定的k8s-node-0的ip地址 和 上面这个域名`ng.test.com`做关联。如下
```
172.25.104.8    ng.test.com
```
所有工作都准备好了，在浏览器输入域名`ng.test.com`，即可看到nginx的页面啦  
![image](img/k8sing.jpg)