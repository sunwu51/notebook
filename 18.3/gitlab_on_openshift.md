# gitlab on openshift
# 1 安装
在官方gitlab仓库找到，openshift安装gitlab的yaml配置[https://gitlab.com/gitlab-org/omnibus-gitlab/blob/master/docker/openshift-template.json](openshift-template.json)
## 1.1 问题一：storage创建失败
在我们的集群中管理员只设置了一种存储类型就是`gluster-heketi`，而上面的配置中没有配置任何类型所以需要在所有kind=PersistentVolumeClaim的spec子项中添加一条`"storageClassName": "slow",`如下
```yml
   {
      "kind": "PersistentVolumeClaim",
      "apiVersion": "v1",
      "metadata": {
        "name": "${APPLICATION_NAME}-redis-data"
      },
      "spec": {
        "accessModes": [
          "ReadWriteOnce"
        ],
        "storageClassName": "gluster-heketi",
        "resources": {
          "requests": {
            "storage": "${REDIS_VOL_SIZE}"
          }
        }
      }
    },
```
## 1.2 问题二 RedHat证书不存在无法拉取镜像
向leader申请在节点上安装证书后镜像拉取没有问题
## 1.3 问题三 openshift下容器不能用root用户
gitlab-ce的镜像中必须使用root权限，这导致无法在openshift中搭建，gitlab官网对此作出的说明是，强行给这个容器root权限，但是这种操作被部门的人拒绝了，于是直接给了k8s集群进行搭建。