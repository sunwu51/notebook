# mongodb
MongoDB是一个NoSQL数据库。
# 安装与配置
其安装过程非常简单，只需要到官网下载相应的操作系统版本就行，然后将bin目录添加到环境变量即可。
# 运行与连接
运行指令`mongod --dbpath=指定路径`。这里不加--dbpath参数默认会在`/data/db`目录存储，但需要先创建这个目录。

连接指令`mongo`可以直接连接本机27017端口。如果是其他server则可以通过`mongo ip:port`连接。
# 概念
## database
数据库，可以通过`show dbs`指令查看当前所有数据库，`use dbname`则进入某个数据库，这里和mysql的概念一致。默认MongoDB中有admin和local这两个数据库，一般我们不在这里直接存数据，而是自己创建创建不需要特殊的指令，直接use如果dbname不存在则会先创建。
## collection
集合，可以通过`show collections`指令查看所有集合，集合的概念类似于sql中的表概念，`db.createCollection('c1')`在当前db下创建c1集合。
## document
文档，文档的概念类似于sql中表的一行。不太一样的是sql中的行都需要有一样的字段结构，但是MongoDB是NoSQL所以字段是没有约束的。查看一个collection中的所有document的指令是`db.collectionname.find()`。find函数也可以传递多个参数，在后面详细介绍。
# 基本操作
先进入一个collection：`use test`>>`db.createCollection('c1')`,可选参数我用/**/中显示
## 增
```javascript
db.c1.insert({name:'xiaoming',age:29})
```
如果没有c1集合，这句话会先创建c1集合。
## 删
```javascript
db.c1.remove({age:29},/*false*/)//默认删除多行
```
删除age字段是29的，可选参数为justOne只删除一条，默认是删除所有符合条件的
## 改

```javascript
db.c1.update({'name':'xiaoming'},{$set:{'age':30}},/*false,false*/)//默认修改一行
```
更改名字为xiaomning的年龄改为30。注意可以传递2-4个参数，后两个参数默认值是false，分别代表如果当前没有符合条件的是否插入新的，以及是否应用于多行。
```javascript
db.c1.save({"_id" : ObjectId("56064f89ade2f21f36b03136"),"title" : "MongoDB"})
```
直接save一个document，需要有_id字段，这样会直接替换原来的该id的document。

## 查
```javascript
db.c1.find(/*query, fields, limit, skip, batchSize, options*/)
```
查，无参则是全部查询。条件json格式，查询列json格式(可以随便定一个值，不影响查询结果)，最多几条，跳过几条。分页参数也可以在find之后链式编程写，形如
```javascript
db.c1.find().skip(1).limit(2)
```
如果条件是true或Field是所有列，则写{}
# 条件的写法
在update delete和find中都有条件参数，这个条件上面的例子中都是`等于`而实际上会有大于小于等情况，而且上面的列子中多列关系是and关系实际上会有or，以及and or混合的情况。
##or条件
```javascript
{$or:[{"age":33},{"name": "xiaobai"}]}//$or:数组 数据间为或条件
```
```javascript
{$or:[{"age":33},{"name": "xiaobai"}],"father":"李刚"}//and or混合
```
# 正则
```js
{name:{$regex:/^liming[0-9]$/}}
```
## 大小比较条件
```javascript
{age:{$gt:5}}//$gt大于 年龄大于5
```
(>) 大于  `$gt`
(<) 小于  `$lt`
(>=) 大于等于 `$gte`
(<= ) 小于等于 `$lte`
num在[1，2，3]中`{num:{$in:[1,2,3]}}`
# 追加函数
`limit skip`已经介绍，`count`是求个数的，`sort(field:1)`按照列升序排列-1则是降序。