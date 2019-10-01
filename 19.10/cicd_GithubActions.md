# GitHub actions
GitHub自带的CICD工具，将来会取代Travis。目前需要申请加入公测才能用，还是beta阶段。
# 快速开始
可以通过actions按钮可以快速创建流程，原理是创建了个main.yml文件。可以选择已经给出的模板，也可以自定义如下图。
![uaeNSH.gif](https://s2.ax1x.com/2019/10/02/uaeNSH.gif)

默认的流程文件如下，从中其实可以了解到，配置文件分三个重要部分：
- name决定当前流程的名字
- on决定触发流程的时机
- jobs决定具体执行的流程

```yml
name: CI

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: Run a one-line script
      run: echo Hello, world!
    - name: Run a multi-line script
      run: |
        echo Add other actions to build,
        echo test, and deploy your project.
```
上述配置的含义为，在push代码的时候触发任务。任务中有一个，且名为build，其基于Ubuntu-latest系统，执行了下载代码，和两段shell语句。
# 配置文件详细介绍
下面分别展开介绍on和jobs的详细解释。
## 1 on
```yml
# push代码时触发，是个数组目前可以有push pull_request这俩元素
on: [push]

# 指定特定分支branches和特定路径paths下的代码提交才触发
on:
  push:
    branches:
    - master
    paths:
    - src/*

# 指定定时触发任务，目前支持cron表达式
on:
  schedule:
  - cron: '* * * * *'
```
## 2 jobs
```yml
name: CI
on: [push]
# jobs下可以有多个job，比较特殊的是每个job是个属性，而非数组元素
jobs:
  # 每个job至少有runs-on和steps两个元素，env是可选项格式是元素形式
  job1:
    runs-on: ubuntu-latest
    env:
      A: aaa
      B: bbb
    # steps是具体步骤，每一步都作为一个数组元素
    steps:
    - run: echo hello
    - run: echo hello2
```
目前runs-on支持8个系统版本，[参考链接](https://help.github.com/en/articles/workflow-syntax-for-github-actions#jobsjob_idruns-on)

## 3 jobs.&lt;job_id&gt;.steps
```yml
# 上面讲了steps是个数组，每个元素一步
...

steps:
- run: echo hi #run是普通的shell脚本

- name: 这是描述性的文字 # 可以指定name属性
  run: |          # 使用|可指定多行字符串
    echo hi
    echo hi2

# uses可以指定特定的代码仓库定好的流程
- uses: actions/checkout@v1  #这是官方写好的下载代码并cd进去的流程
- uses: actions/setup-node@v1  #这是官方写好的准备好nodejs环境的流程
  with:
    node_version: 9 # 在该流程说明中声明可以指定的参数(不指定也有默认值)
```
> 中间小结
上面的用法已经涵盖了基础用法，在大多数时候就已经够用了例如node常用流程可以这么写
```yml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: actions/setup-node@v1
      with:
        node_version: 8
    - run: |
        npm install
        npm run test
```

## 4 使用docker jobs.container
默认提供的系统环境可能不够方便，要知道容器时代的CICD不支持docker的话，使用起来就不是很自由了。现在的ci工具基本都支持docker了。

actions可以在runs-on下面再写container元素来使后面的指令运行在容器中，如下因为指定了`node:8` 容器，后面的脚本会输出8.xxx版本，说明后面的步骤都是运行在容器环境中了。
```yml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    container:
      image: node:8
    steps:
    - uses: actions/checkout@v1
    - uses: actions/setup-node@v1
      with:
        node_version: 8
    - run: |
        node -v 
```
container中可以指定prots、volumes、env，甚至可以通过options参数指定任意任意`docker run`参数，[参考](https://docs.docker.com/engine/reference/commandline/create/#options)
## 5 使用服务 jobs.job1.services
docker可以提供运行环境，也可以提供附属服务，例如数据库服务，nginx服务等
```yml
name: ci
on: [push]
jobs:
  job1:
    runs-on: ubuntu-latest
    services:
      nginx:
      image: nginx
        ports:
        - 8080:80
        env:
          NGINX_PORT: 80
       redis:
       image: redis
       ports:
       - 6379/tcp
     steps:
     - run: curl localhost:8080
```
# 深度探究
## ① 并不简单的ubuntu-latest
`ubuntu-latest`不只是Ubuntu那么简单，这个系统下安装了所有支持的语言和docker，docker-compose等等，例如下面的配置可以打印出各种语言和工具的版本，就是最直接的证据，证明了这个系统不简单。

甚至在看了setup-node仓库后，我发现这里面并没有下载nodejs，而是从系统中指定出特定版本，由此可知，这个系统中应该有各种语言的多个版本。
```yml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - run: |
        echo $PATH
        node -v
        npm -v
        python --version
        java -version
        go version
        mvn -version
        docker version
        docker-compose -v
        git version
```
## ② container |  uses: docker:// |  services
1 container指令实际执行的shell： 
![uae400.png](https://s2.ax1x.com/2019/10/02/uae400.png)  
![uaeokT.png](https://s2.ax1x.com/2019/10/02/uaeokT.png)

干的事情主要是:
- 创建个桥接网络，指定名字为github_network_xxxx
- 创建个容器是指定好的景象和参数，并有大量默认参数，几乎把能用到的文件夹都映射进去了。注意修改了entrypoint是tail -f这可以防止容器退出。

网络是桥接的还不能直接访问外面。没有设置为host模式，我猜想是想要实现隔离，不用docker0。
2 use://docker 
例如下面配置会执行失败，因为uses docker，这是运行了docker pull + run(下图shell)，run后alpine就结束了，不像上面改了entrypoint，所以目前完全搞不懂这个设定有毛用。
```yml
jobs:
  build:

    runs-on: ubuntu-latest
    
    steps:
    - uses: docker://alpine
    - run: |
        apk add curl
        curl https://www.baidu.com
```
![uaex76.png](https://s2.ax1x.com/2019/10/02/uaex76.png)

3 services  
![uamptO.png](https://s2.ax1x.com/2019/10/02/uamptO.png)   
![uamSAK.png](https://s2.ax1x.com/2019/10/02/uamSAK.png)

services跟container有点像，但又不一样，执行内容如下：
- 创建一个桥接网络
- 利用该网络启动容器，并制定端口映射（如果有）
- 如果指定了文件映射，应该还有文件相关的指令，图中没有文件映射就没有了

如果同时指定services和container，则他们容器都挂在一个网络下，并且services可以直接用对应的名字作为域名访问。参考[这个提交]（https://github.com/sunwu51/ActionsDemo/commit/1e9086253c7ceb01af24c6ce676f966c881dc336/checks?check_suite_id=247189648）












