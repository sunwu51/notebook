docker run [参数] 镜像名:版本 [运行的shell指令]
```bash
-d                           后台运行
-e MYSQL_ROOT_PASSWOR=123456 环境变量
-p 80:80                     端口映射
-it                          阻塞运行
-v /suzhu:/rongqi            文件[夹]映射
```
```bash
--link mysql:mysql           链接其他容器
--rm                         运行结束后自动销毁
--name                       指定容器运行后的名字
--restart always             机器重启后是否自动运行
```
