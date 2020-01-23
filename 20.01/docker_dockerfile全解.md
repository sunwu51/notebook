# Dockerfile
dockerfile是docker中非常重要的文件，用于定义镜像的构建方式。语法方式非常多（虽然常用的可能没那么多）。
# 基础用法
最基本的几个指令为FROM，RUN，COPY，ADD，CMD，ENTRYPOINT,WORKDIR
- FROM 表示基于哪个镜像构建
- RUN  表示运行shell命令
- COPY 表示复制文件到镜像中
- ADD  与COPY类似，稍有区别
- CMD  指定镜像的启动脚本
- ENTRYPOINT 与CMD类似，稍有区别
- WORKDIR 指定运行的主目录
```Dockerfile
FROM alpine
RUN echo 'hello'
COPY .  /code
WORKDIR /code
CMD ./code/server
```
ADD与COPY：ADD有COPY的所有功能，并且ADD的src可以是url。建议使用COPY，在不适用外部url的时候。

CMD与ENTRYPOINT：两者有继承属性，即子镜像没设置，则按照父镜像的来。ENTRYPOINT如果链上都没有设置，有默认值`/bin/sh -c`。CMD与ENTRYPOINT虽然功能上都可以作为入口，但是两者又可以组合使用，其作用如下表：
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/2001/cmd.png)

ENTRYPOINT非json则只用ENTRYPOINT，双JSON格式可以拼接。记住这两种就行，其他的不记也罢。（json一定是双引号）
```DOCKERFILE
FROM alpine
ENTRYPOINT ["echo"]
CMD ["123"]
```
WORKDIR是指定工作目录的，相当于cd到这个目录下，后面所有的RUN CMD ENTRYPOINT都是在这个目录下执行。如果没有该目录还会自动创建这个目录。
# 映射
```DOCKERFILE
FROM alpine
EXPOSE 80         # 暴露端口
VOLUME /usr/nginx # 映射文件
```
# 参数
ENV可以指定环境变量，ARG可以获取docker run指令中指定的参数，如果没有指定则是默认值

先来看ENV如下，结果为输出123。
```dockerfile
FROM alpine
ENV A=123
RUN echo $A > 1.txt
CMD cat 1.txt
```
再来看ARG，输出结果也是123。
```Dockerfile
FROM alpine
ARG A=123
RUN echo $A > 1.txt
CMD cat 1.txt
```

区别：ENV是运行时，ARG是构件时。ARG通过外部`docker build --build-arg A=1 --build-arg B=2`指令覆盖。ENV通过`docker run -e A=1 -e B=2`覆盖。ARG是构建时参数，只能在Dockerfile中生效，运行时则不存在，ENV是永久影响镜像。看个例子：运行时无法输出10，因为运行时ARG不存在，所以输出的是环境变量$A。
```Dockerfile
ARG A=10
CMD echo $A
```
同时使用,以ENV为准，结果是123
```dockerfile
ENV A=123
ARG A=456
RUN echo $A > 1.txt
CMD cat 1.txt
```
# 原数据
- 指定原数据：`LABEL a=10 b=20`
- 指定作者（弃用）：`MAINTAINER `用`LABEL maintainer="SvenDowideit@home.org.au"`替代
# OBBUILD
onbuild指令后面跟其他dockerfile指令，但是在当前镜像构建的时候不会执行，而在基于当前镜像的其他镜像构建的时候才会执行
```dockerfile
# 镜像名test1
FROM alpine
ENV A=1
ONBUILD ENV B=2
CMD echo "A = $A , B = $B"
```
```shell
$ docker run test1
A = 1 , B = 
```
另一个镜像test2：
```dockerfile
FROM test1
```
```shell
$ docker run test2
A = 1 , B = 2
```
# 其他
- STOPSIGNAL用于指定容器退出的信号
- HEALTHCHECK用于指定容器健康检查的配置
- SHELL用于指定脚本如windows镜像需要指定CMD /S /C