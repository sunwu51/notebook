# 探究service
将同一个pod多个副本统一抽象化成service，通过一个clusterIP（serviceIP）+port映射出一个服务入口，自动实现负载均衡。这就是service。
## 1 理解三个IP
1 podIP  
指docker容器中ifconfig看到的IP地址，是docker虚拟化出的docker0网络内的一个IP地址  
2 clusterIP  
指创建一个service时，k8s为每个service分配的一个虚拟IP,该IP需要结合端口才有意义，收到的数据会负载均衡的转发到service下属的各个podIP上。所以集群时需要自己实现每台docker0网卡可以互访。  
3 nodeIP  
物理机器的实际ip地址，是真实存在的网卡。例如设置了nginx服务是主机30001端口映射80，则实际访问可能是  nodeIP:30001-->cluserIP:80-->podIP:80
## 2 负载均衡策略
默认是轮询，雨露均沾。通过设置`spec.sessionAffinity`为"clusterIP"可以变为会话保持策略，即每个客户端发起的请求都定向到相同的podIP上。
## 3 EndPoint
有时候service只是一个服务，比如已经存在的一个数据库服务，或者不受我们自己k8s掌控的服务。这种服务要想封装成service怎么办？设置无selector的service配合EndPoints：
```yml
---- service
apiVersion: v1
kind: Service
metadata:
  name: mysql
spec:
  ports:
  - port: 3306
  targetPort: 3306

---- endpoint
apiVersion: v1
kind: EndPoints
metadata:
  name: mysql
subsets:
- address:
  - IP: 1.1.1.1
  ports:
  - port: 3306
```
这样当，service中没有声明selector的时候会自动去找name相同的endpoints，然后向这个endpoint的指定ip:port做映射。
## 4 访问service
service访问另一个service，之前介绍过可以通过环境变量的方法或者更强大的dns服务器的方法。  
k8s集群以外访问service，可以通过service映射的nodePort进行访问，但是这种方式不适合客户直接访问服务，因为用户并不知道服务在哪个node上可获得，而且多个服务如果ip不同可能有跨域等问题，需要一个类似nginx一样的统一代理。k8s自带的解决方案是`Ingress`。

