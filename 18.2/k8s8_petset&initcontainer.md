# Pet Set 和init Container
# Pet Set/StatefulSet
有状态的pod，对于存储类的服务如mysql，不能按照无状态来处理，需要有状态的pod。
在1.5版本之后PetSet被改名为StatefulSet。
# StatefulSet
```yml
apiVersion: v1
kind: Service
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  ports:
  - port: 80
    name: web
  clusterIP: None
  selector:
    app: nginx  
---
apiVersion: apps/v1beta1 # 1.9里apps/v1可用，之前的版本可能还是要apps/v1beta1
kind: StatefulSet
metadata:
  name: web
spec:
  selector:
    matchLabels:
      app: nginx # has to match .spec.template.metadata.labels
  serviceName: "nginx"
  replicas: 3 # by default is 1
  template:
    metadata:
      labels:
        app: nginx # has to match .spec.selector.matchLabels
    spec:
      terminationGracePeriodSeconds: 10
      containers:
      - name: nginx
        image: nginx
        ports:
        - containerPort: 80
          name: web
        volumeMounts:
        - name: www
          mountPath: /usr/share/nginx/html
  volumeClaimTemplates:
  - metadata:
      name: www
      annotation: 
        volume.alpha.kubernetes.io/storge-class: anything
    spec:
      accessModes: [ "ReadWriteOnce" ]
      #storageClassName: my-storage-class 1.9中直接作为属性
      resources:
        requests:
          storage: 1Gi
```
这里volumeClaimTemplate是向PV申请资源的，需要管理员创建好PV，PV的部分就不展开讲了，可以[参考](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)以及[这](https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/)。statefulset可以创建多个副本，创建的时候podname-xxx中xxx不再是hash而是按照顺序从0自增，也是按照这个顺序创建，销毁则是反序销毁。如上设置的StatefulSet的name是web，就会创建pod为web-0,web-1，web-2这样三个pod。
# InitContainer
在pod中容器创建应用启动之前创建的容器，主要用来做一些预先的修改
```yml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
  annotations:
    pod.beta.kubernetes.io/init-containers: '[
        {
            "name": "init-myservice",
            "image": "busybox",
            "command": ["sh", "-c", "until nslookup myservice; do echo waiting for myservice; sleep 2; done;"]
        },
        {
            "name": "init-mydb",
            "image": "busybox",
            "command": ["sh", "-c", "until nslookup mydb; do echo waiting for mydb; sleep 2; done;"]
        }
    ]'
spec:
  containers:
  - name: myapp-container
    image: busybox
    command: ['sh', '-c', 'echo The app is running! && sleep 3600']
```
也常用在需要预先下载文件如运行wget指令下载到volumeMounts然后通过emptyDir: {}类型挂载到后续的Pod中。