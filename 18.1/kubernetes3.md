# k8s集群和文件创建资源
## 一、k8s集群搭建需要修改的点
之前是在单机条件下模拟了集群的情况，实际的集群情况我们还应该对配置有所修改，比如apiserver默认监听的是localhost，kubelet指向的apiserver地址也是localhost。我们来看下配置文件。
## 二、了解搭建的配置文件
路径为`/etc/kubernetes/` 
apiserver
```
# 绑定的IP地址，默认为127.0.0.1，如果要在集群中运行需要改为0.0.0.0
KUBE_API_ADDRESS="--insecure-bind-address=0.0.0.0"

# 元数据存储的etcd数据库地址
KUBE_ETCD_SERVERS="--etcd-servers=http://127.0.0.1:2379"

# service虚拟IP地址池
KUBE_SERVICE_ADDRESSES="--service-cluster-ip-range=10.254.0.0/16"

# 管理参数，去掉ServiceAccount项，防止出现api token认证错误
KUBE_ADMISSION_CONTROL="--admission-control=NamespaceLifecycle,NamespaceExists,LimitRanger,SecurityContextDeny,ResourceQuota"

# 额外的自定义参数
KUBE_API_ARGS=""
``` 
config
```
# 是对所有kube服务的全局配置，可以不进行修改
KUBE_LOGTOSTDERR="--logtostderr=true"

KUBE_LOG_LEVEL="--v=0"

KUBE_ALLOW_PRIV="--allow-privileged=false"

KUBE_MASTER="--master=http://master:8080"
```
controller-manager 和 scheduler
```
# 没有任何默认的参数即可
KUBE_API_ARGS=""
```
kubelet
```
# 绑定的ip
KUBELET_ADDRESS="--address=0.0.0.0"

# node名，在master端可以看到这个名字，默认叫127.0.0.1
KUBELET_HOSTNAME="--hostname-override=k8s-node-0"

# 指定apiserver
KUBELET_API_SERVER="--api-servers=http://master:8080"

# 指定监控pod的docker镜像，默认是红帽的一个镜像，如果内网部署不能联网，需要改成自己的仓库镜像地址
KUBELET_POD_INFRA_CONTAINER="--pod-infra-container-image=registry.access.redhat.com/rhel7/pod-infrastructure:latest"

# 额外的参数
KUBELET_ARGS=""
```
proxy
```
# 额外的参数
KUBELET_ARGS=""
```
注：如果修改了响应的配置，需要重启该应用，最后查看所有服务是否都启动了。
## 三、docker0互通
上面配置后其实还少一个重要的环节，就是多个node节点的docker容器互相是不通的。因为之前是在单机模式下模拟的只有一个docker0网卡，所以没有互通的问题。而如果集群情况下一定是多个node节点，每个node的docker容器之间是不通的。需要进行配置，例如OVS这种虚拟交换机方式，最简单的也可以添加路由。

即node1要添加转向node2中docker0网络的路由是，网关指向node2的物理网卡。node2则反过来，如果有n个node，则每个node需要添加n-1次。

- 配置每个node的docker0网络不要冲突  

`/etc/docker/daemon.json`  
node1上配置
```json
{
    "bip":"172.17.1.1/24"
}
```
node2上配置
```json
{
    "bip":"172.17.2.1/24"
}
```
重启docker，此时发现docker0的ip发生了如上改变。
- 添加路由规则
假如node1 ip为192.168.0.11，node2的ip为192.168.0.22
node1上添加
```
route add -net 172.17.2.0 netmask 255.255.255.0 gw 192.168.0.22
```
node2上添加
```
route add -net 172.17.1.0 netmask 255.255.255.0 gw 192.168.0.11
```
此时在node1上可以ping通node2的docker网卡即172.17.2.1，反之也可以。完成了docker0网卡的互通。

集群的其他细节和单机下就没什么区别了。
## 四、文件创建资源
之前通过`kubectl`在参数中直接创建了rc svc等资源，除了这种方式也可以通过文件的方式进行配置，然后指定文件创建资源。

文件的格式是怎么样的呢？之前创建的deployment my-web可以通过edit指令查看实际生成的配置文件如下：
```yml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  annotations:
    deployment.kubernetes.io/revision: "2"
  creationTimestamp: 2018-01-29T13:58:35Z
  generation: 4
  labels:
    run: my-web
  name: my-web
  namespace: default
  resourceVersion: "6752"
  selfLink: /apis/extensions/v1beta1/namespaces/default/deployments/my-web
  uid: 7fe7ee08-04fc-11e8-8dc3-525400cb570b
spec:
  replicas: 1
  selector:
    matchLabels:
      run: my-web
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
    type: RollingUpdate
  template:
    metadata:
      creationTimestamp: null
      labels:
        run: my-web
    spec:
      containers:
      - image: nginx:1.7.9
        imagePullPolicy: Always
        name: my-web
        ports:
        - containerPort: 80
          protocol: TCP
        resources: {}
        terminationMessagePath: /dev/termination-log
      dnsPolicy: ClusterFirst
      restartPolicy: Always
      securityContext: {}
      terminationGracePeriodSeconds: 30
status:
  availableReplicas: 1
  conditions:
  - lastTransitionTime: 2018-01-29T14:09:54Z
    lastUpdateTime: 2018-01-29T14:09:54Z
    message: Deployment has minimum availability.
    reason: MinimumReplicasAvailable
    status: "True"
    type: Available
  observedGeneration: 4
  replicas: 1
  updatedReplicas: 1
```
我们来观察下这个文件，文件有5个大部分：  
>apiVersion  
必备，k8sapi版本号,kubectl api-versions可以查看当前k8s支持的api版本。

>kind  
必备，指定当前文件创建的是个什么类型的资源，值可以是Pod,ReplacationController,Deployment,Service等等资源类型。

>metadata  
必备，元数据指定资源的名字name，命名空间namespace，标签labels等基础信息，labels在指定资源的时候用处很大，一般pod中是必须要写的属性。

>spec
"说明书"，一般用来填写一些资源的指定信息。对于不同资源写法不一样，例如pod则填写容器信息containers，rc或deployment则填写副本数replicas，筛选器selector，pod母版template（template中填写pod的metadata和spec）

>status  
当前资源的状态，编写的时候是不需要自己写这一项的。

## 五、常见的资源声明文件
常见的pod资源声明的yml文件格式如下：
```yml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
  labels:
    hello: world
spec:
  containers:
  - name: mycon
    image: nginx
    ports:
    - containerPort: 80
    env:
    - name: HELLO
        value: 'WORLD'
```
![create pod](img/kube6.gif)  
常见的deployment文件：
```yml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: mydep
  labels:
    name: mydep
spec:
  replicas: 1
  selector:
    matchLabels:
      name: zzz
  template:
    metadata:
      labels:
        name: zzz
    spec:
      containers:
      - image: nginx
        name: mycon
        ports:
        - containerPort: 80
```
注：template指定的是pod信息，注意pod的name不能指定，只能继承自deployment。和这句bash效果基本一致（除了容器name在bash下是默认为mydep）
```
kubectl run mydep --image=nginx --port=80
```
![create deployment](img/kube7.gif)  
常见的RC yml文件
```yml
apiVersion: v1
kind: ReplicationController
metadata:
  name: myrc
  labels:
    name: myrc
spec:
  replicas: 1
  selector:
    name: xxx
  template:
    name: pod4myrc
    metadata:
      labels:
        name: xxx
    spec:
      containers:
      - image: nginx
        name: mycon
        ports:
        - containerPort: 80
```
注：和dep基本一样除了selector只能等式判断

常见的Service yml文件：
```yml
apiVersion: v1
kind: Service
metadata:
  name: mysvc
spec:
  ports:
  - port: 80
    nodePort: 30001
  selector:
    name: zzz
```
注:这里的selector是等式的，且只针对pod进行过滤。


