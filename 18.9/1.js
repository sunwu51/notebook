// // var http=require('http');
// // var fs = require('fs');
// // var staticPath ='/home/admin/htdocs';

// // var server=http.createServer(function(req,res){
// //     var path = req.url;

// //     // 安全问题
// //     if(path.includes('../')){
// //         res.end()
// //     }
// //     // 解析.js文件
// //     if(path.endsWith(".js")){
// //         // 指定静态目录 和 utf-8
// //         fs.readFile(staticPath + pathname,'utf-8',function(err,data){
// //             if(err){  /*没有这个文件*/
// //                 console.log('404');
// //                 res.end(); /*结束响应*/
// //             }else{ /*返回这个文件*/
// //                 res.writeHead(200,{"Content-Type":"text/html;charset='utf-8'"});
// //                 res.write(data);
// //                 res.end(); /*结束响应*/
// //             }
    
// //         })
// //     }
    
// // });
// // // 80端口启动
// // server.listen(80);



// function isO(a){
//     return typeof(a)=='object';
// }
// function isA(a){
//     return a instanceof Array;
// }

// function flatten(input){
//     var res ={};
//     if(isO(input)){
//         f("",input,res)
//     }
//     return res
// }
// function f(index,a,res){
//     if(isO(a)){
//         if(isA(a)){
//             for(var i in a){
//                 f(`${index}[${i}]`,a[i],res);
//             }
//         }else{
//             for(var k in a){
//                 f(`${index}.${k}`,a[k],res);
//             }
//         }
//     }else{
//         if(index.startsWith('.')){
//             index = index.substr(1);
//         }
//         res[index] = a; 
//     }
// }
// const input ={
//     a:1,
//     b:[1,2,{c:true},[3]],
//     d:{e:2,f:3},
//     g:null
// }
// console.log(flatten(input))
