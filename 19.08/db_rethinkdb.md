# rethinkDB
rethinkDB之前是mongodb的竞争对手，后来公司经营问题倒闭了。贡献到开源社区了，然后慢慢发展至今。

rethinkDB也是nosql，注重实时性，类似于firebase的实时数据库，可以参考18年写的firebase的database的文章。
# 使用Docker安装
```
docker run -d -P --name rethink1 rethinkdb
```
端口介绍：28015是数据端口，29015集群相关端口，8080web端口
# WebUI直接操作
输入上面8080端口映射的端口，就可打开web页面，在web页面中可以创建数据库和表。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1908/rethinkdb.gif)

也可以在data explorer下操作数据库，类似sql，但是是reql。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1908/rethinkdb2.gif)
# 简单的ReQL介绍
```js
//查
r.table('table_name') // all
r.table('table_name').get(id)
//增，自动识别id字段作为主键
r.table('table_name').insert(json|array)
//删，按照id删除
r.table('table_name').delete(id)
//改
r.table('table_name').update({id:xx,xxxxxxxxx})
```
# 稍微复杂的ReQL
```js
// 选取部分字段pluck，filter条件过滤
//distinct去重，limit限定返回结果数目
//orderBy排序
r.table('person')
    .pluck('id','name')
    .filter({name:'吴尧'})
    .distinct()
    .limit(2)
    .orderBy(r.desc('age'));

// 分组选出每组最大id的整条数据
 r.table('person')
    .group("name")
    .max('id')
```
# ReQL几乎可以实现所有的SQL
[sql-reql对应表](https://rethinkdb.com/docs/sql-to-reql/javascript/)  

# 超高灵活度的条件查询
直接用js语言来表达条件
```js
 r.table('person').filter(r.js('(function (it) { return it.age > 24; })'))
```
# ！！！！实时监听数据变化
```js
r.table('person').filter(r.row('age').ge(22)).changes()
```
当特定的数据（可以是一条多条甚至整个表）发生变化，则触发回调，显示值的变动。

实时的特性是rethink一直吹的特性，虽然我也不知道他到底哪里牛逼了。（firebase和etcd也都有这种实时的通知功能，讲真的firebase的数据库是真的牛逼）
