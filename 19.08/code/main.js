var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

var express = require('express')
var app = express();
app.use(express.json())
app.use(express.urlencoded({extended:false}))



function insert(data){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("demo").insertOne(data, function(err, res) {
            if (err) throw err;
            console.log("文档插入成功");
            db.close();
        });
    });
}

function del(condition){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("demo").deleteMany(condition, function(err, res) {
            if (err) throw err;
            console.log("文档删除成功");
            db.close();
        });
    });
}

function getAll(callback){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("demo").find({}).limit(10).toArray(function(err, result) { // 返回集合中所有数据
            if (err) throw err;
            callback(result);
            console.log(result);
            db.close();
        });
    });
}

function getSome(condition,callback){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("demo").find(condition).limit(10).toArray(function(err, result) { // 返回集合中所有数据
            if (err) throw err;
            callback(result);
            console.log(result);
            db.close();
        });
    });
}

function update(condition,data){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("demo").updateMany(condition,data,function(err, result) {
            if (err) throw err;
            console.log(result);
            db.close();
        });
    });
}

function updateOne(condition,data){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("demo").updateOne(condition,data,function(err, result) {
            if (err) throw err;
            console.log(result);
            db.close();
        });
    });
}
console.log()
app.use(express.static('./public'))
app.get('/all',(_,res)=>{
    getAll(function(data){
        res.json(data);
    })
})
app.post('/some',(req,res)=>{
    getSome(req.body.condition,function(data){
        res.json(data);
    })
})
app.post('/insert',(req,res)=>{
    insert(req.body.data);
    res.send({status:0});
})
app.post('/del',(req,res)=>{
    del(req.body.condition);
    res.send({status:0});
})
app.post('/update',(req,res)=>{
    try{
        update(req.body.condition,req.body.data);
    }
    catch(e){
       
    } res.send({status:0});
})
app.post('/updateone',(req,res)=>{
    try{
        updateOne(req.body.condition,req.body.data);
    }catch(e){
        
    }res.send({status:0});
})

app.listen(process.env.PORT || 5000)
