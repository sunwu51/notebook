# GraphQL
GraphQL是一种类似Rest接口的查询数据的方式，主要的不同在于，Rest接口是服务端定好的数据格式，客户端只能获取定好的数据格式。比如服务端返回User类型的json数据，那user的name和age还有email字段，都将返回。但是有时候客户端只想获取user的name字段，此时age和email就冗余了。我们来看个效果图体验下graphQL：
![image](img/1.gif)
# 误区
这里先把误区放在前面讲，因为很多人第一次看到graphql，就以为可以大大简化服务端的开发，这是最大的误区，其实graphql只是在请求和返回字段的时候进行的优化，根本不涉及服务端的service层和dao层，所以graphql的引进，只是增加了后台的代码，并不会减少。graphql的定位是为了前端或者移动端找想，减少网络流量和前端不需要的字段。
# 从一个简单的Nodejs应用开始
```
npm inint -y
npm install --save express express-graphql graphql faker
```

server.js
```javascript
var express = require('express')
var expressGraphql = require('express-graphql')
var app = express()
const{
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = require('graphql')
const faker =require('faker')
//*********** 创建100个user组成的数组作为查询的数据源
const users = [];
for(var i=0;i<100;i++){
    var it = {
        id: i,
        name:faker.name.findName(),
        age:faker.random.number(),
        email:faker.internet.email(),
    }
    users.push(it)
}

//********* 定义schema，这个非常重要
const RootQuery = new GraphQLObjectType({
    name:'userQuery',
    fields:{
        user:{
            type:new GraphQLObjectType({
                name:'user',
                fields:{
                    id:{type:GraphQLInt},
                    name:{type:GraphQLString},
                    age:{type:GraphQLInt},
                    email:{type:GraphQLString}
                }
            }),
            args:{
                id:{type:GraphQLInt}
            },
            resolve(parentValue,args){
                return users.filter(it=>it.id==args.id)[0];
            }
        }
    }
})
const schema = new GraphQLSchema({
    query: RootQuery
})

//******** 暴露出graphql接口
app.use('/user',expressGraphql({
    schema:schema,
    graphiql:true

}))

app.listen(4000)
```
重点介绍下schema的声明方式，它本身是个`GraphQLSchema`类型，该类型中指定一个query，query为一个对象类型，需要设置name和fields字段。

name是为了和其他的查询分开，一般一个url只有一个查询。fields则是该url的查询中可以查几种数据类型，比如这里只有一个字段user，则该url就只能查user这一种数据，如果再加一个user2，就能查user2的数据。下面是对应关系图，你可以修改相应的地方，看界面上的变化。  

![image](img/1.jpg)
# 