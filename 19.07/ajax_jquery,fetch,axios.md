# jquery
```js
// 基本用法无参数get请求
$.ajax({
    url:"demo_test.txt",
    success:function(result){
        console.log(result);
    }
}
// 需指定方法则增加method字段
$.ajax({
    url:"demo_test.txt",
    method:"POST",
    success:function(result){
	console.log(result);
    }
}
// 有参数，则增加data字段，有请求头则增加headers字段，有错误处理增加error字段
// 默认是按照表单提交post方法，data中虽然是json但是提交时转成表单
$.ajax({
    url:"demo_test.txt",
    data:{a:10},
    success:function(result){
    	console.log(result);
    },
    error:function(xhr,status,error){
    	console.log(error);
    }
});
// data在post下是表单格式，在get下是querystring格式
// 通过以下方法指定为json格式[json格式本质就是body里是json字符串，头里是application/json]
$.ajax({
    url:"demo_test.txt",
    headers:{ contentType: "application/json"},
    method:"POST",
    data:JSON.stringify({a:10}),
    success:function(result){
	console.log(result);
    }
});
```
# fetch
```js
// fetch的post表单数据用法
fetch(url,{
    headers:{
         'content-type': "application/x-www-form-urlencoded"
    },
    method:"POST",
    body:"a=12&b=33",
})
.then(res=>res.json())
.then(data=>console.log(res))
.catch(e=>{})
// fetch的post json数据用法
fetch(url,{
    headers:{
         'content-type': "application/json"
    },
    method:"POST",
    body:JSON.stringify({a:100}),
})
.then(res=>res.json())
.then(data=>console.log(res))
.catch(e=>{})
```
# axios
```js
// axios默认是json类型的提交
axios({
    url:"http://localhost:99?x=1",
    method:"POST",
    data:{a:12}
})
.then(res=>console.log(res.data))
// 如果想改成form则需要修改headers和data格式
axios({
    url:"http://localhost:99?x=1",
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    data:"a=12&b=23"
})
.then(res=>console.log(res.data))

```

## 简写
JQuery的get和post可以简写：
```js
$.get(url,data,callback)  // querystring格式
$.post(url,data,callback) // x-www-form-urlencoded格式
```
axios的get/post/put/delete等等都可以简写
```js
axios.post(url,data).then(callback)
```
