# gitlab runner部署细节优化
# 为什么要优化
CD和CI是分开的，CD更追求上线的速度。比如在高峰期想要启动更多的实例进行运行。传统的容器化部署解决了迅速启动和维护大量副本的问题，即规模化问题。但是却带来了IO上的问题，因为每个镜像可能是因版本的需要从Docker仓库拉取的，这就带来了大量的网络IO，部署的时候并没有想象中迅速，即docker启动是很快，但是拉取却很慢。
# 怎么优化
需要以IO问题作为切入点。以java项目为例：
## 1 mvn的IO优化
`mvn package`是打包的步骤，一般是必须要运行的一个步骤，如果这个过程完全运行在容器中，因为每个容器都是干净的，所以每次都要下载大量jar包。

这个问题，我们可以有两种解决方案，

第一是放弃容器环境，直接用实体机器的mvn环境打包，因为实体机的本地仓库会积累所以可以减少之后的构建。具体到gitlab-ci就是使用`shell`模式的runner，将一台装有maven的实体宿主机器作为runner运行。例如这样的配置
```yml
# .gitlab-ci.yml
job1:
  stage: build
  # 根据tag指定跑脚本的runner
  tags:
  - shell-mvn-runner
  script:
  - mvn package -Dmaven.test.skip=true -B
```

第二是将maven容器的本地仓库映射出来，类似于`docker run -v`的作用将外面的目录映射到里面，使每次可以重用下好的jar包。具体配置方式是在`/etc/gitlab-runner/config.toml`
```toml
[runners.docker]
  host = ""
  hostname = ""
  image = "ruby:2.1"
  privileged = false
  disable_cache = true
  volumes = ["/path/to/bind/from/host:/path/to/bind/in/container:rw"]
```
这样配置后，该runner就相当于docker run的-v参数将外面的目录挂载进去了。
参考链接[https://docs.gitlab.com/runner/configuration/advanced-configuration.html#volumes-in-the-runners-docker-section](https://docs.gitlab.com/runner/configuration/advanced-configuration.html#volumes-in-the-runners-docker-section)
## 2 docker的IO优化
在传统的方式上一般 
- 第一步要写个Dockerfile，将jar包考到一个java的镜像（如java:8)然后将镜像的CMD改成`java -jar ..`。
- 第二步 `docker build -t xxx .`将镜像构建出来。
- 第三步 `docker login  && docker push `将镜像上传到私有仓库。
- 第四步将这个镜像在部署环境（如k8s）拉取并部署。

在gitlab-ci时前三步一般是在dind（docker in docker）的环境中完成的，这样的话步骤二每次需要拉取一个java:8镜像，步骤三每次需要上传一个镜像(虽然上传时会有已有文件层不在传输，但是还是有很多校验过程)。

针对这个过程的IO我能想到的有以下几种优化：
- 1 不使用dind，而是直接用shell runner，在这台宿主机上安装docker环境。这样拉取就会因为累积而减少。主要优化的步骤二，但是shell模式会产生很多垃圾。多个仓库不好隔离（可以得到别人的镜像）。
- 2 不以镜像作为部署的最小单位，我们部署的其实是jar包，没有必要非得打包成镜像-上传-拉取-部署。我们只需要将jar包保存到一个pv上，然后直接到第四步，在java的镜像上将jar包目录映射进去，直接运行java -jar xxx就可以了。


# 对比
以前的yml
```yml
# .gitlab-ci.yml
image: docker:latest
services:
  - docker:dind
variables:
  DOCKER_DRIVER: overlay

stages:
  - build
  - package
  - deploy
  
maven-build:
  image: cr.d.xiaomi.net/wuyao/mimvn:v1
  stage: build
  script:
  - mvn package -Dmaven.test.skip=true -B
  artifacts:
    paths:
      - target/*.jar
  
docker-build:
  stage: package
  script:
  - wget http://v10-staging.git.n.xiaomi.com/wuyao/Dockerfiles/raw/master/mvn-spring-boot/Dockerfile
  - docker build -t cr.d.xiaomi.net/wuyao/demo .
  - docker login -u wuyao -p $DOCKER_TOKEN cr.d.xiaomi.net
  - docker push cr.d.xiaomi.net/wuyao/demo

deploy:
  stage: deploy
  image: cr.d.xiaomi.net/wuyao/kubectl:v1.7.6
  script: 
  - kubectl config set-credentials wuyao --token $TOKEN
  - kubectl config set-cluster c3-k8s --server https://c3-k8s.cc.d.xiaomi.net
  - kubectl config set-context wuyao@c3-k8s/wuyao --user wuyao --cluster c3-k8s --namespace wuyao
  - kubectl config use-context wuyao@c3-k8s/wuyao
  - sh -c kubectl delete -f http://v10-staging.git.n.xiaomi.com/wuyao/Dockerfiles/raw/master/mvn-spring-boot/deployment.yaml
  - kubectl create -f http://v10-staging.git.n.xiaomi.com/wuyao/Dockerfiles/raw/master/mvn-spring-boot/deployment.yaml

```
```yml
# .gitlab-ci.yml
stages:
- build
- deploy
job1:
  stage: build
  tags:
  - shell
  script:
  - mvn package -Dmaven.test.skip=true -B
  - mkdir -p /opt/nfs/wuyao/demo/$CI_COMMIT_SHA
  - cp ./target/*.jar /opt/nfs/wuyao/demo/$CI_COMMIT_SHA/
job2:
  stage: deploy
  tags:
  - docker
  image: cr.d.xiaomi.net/wuyao/kubectl:v1.7.6
  script: 
  - kubectl config set-credentials wuyao --token $TOKEN
  - kubectl config set-cluster c3-k8s --server https://c3-k8s.cc.d.xiaomi.net
  - kubectl config set-context wuyao@c3-k8s/wuyao --user wuyao --cluster c3-k8s --namespace wuyao
  - kubectl config use-context wuyao@c3-k8s/wuyao
  - apk --no-cache add openssl wget
  - wget http://v10-staging.git.n.xiaomi.com/wuyao/Dockerfiles/raw/master/mvn-spring-boot/deployment.yaml
  - sed -i "s%JARPATH%$CI_PROJECT_PATH/$CI_COMMIT_SHA%g" deployment.yaml
  - sh -c "kubectl delete -f deployment.yaml"
  - kubectl create -f deployment.yaml
```
例如这个配置，分为构建和部署，构建阶段用shell-runner运行mavn package。然后将jar包考到pv上（这里我用的nfs挂载）。然后部署阶段用docker-runner使用kubectl镜像，按照写好的k8s的yaml文件模板简单替换字符后，进行创建。
