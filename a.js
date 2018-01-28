var fs=require('fs')

var m={};
var htstr="";

process.argv.forEach(function (val, index, array) {
    var arr=val.split('/')
    if(arr.length==3){
        if(!m[arr[1]])m[arr[1]]=[];
        m[arr[1]].push({txt:arr[2],href:val});   
    }
});

for(var it in m){
    var str="<h3><b>"+it+"</b></h3><hr/>"
    var tmp=m[it]
    for(var i in tmp){
        console.log(i)
        str+="<p><a href='"+tmp[i]["href"]+"'>"+tmp[i]["txt"]+"</a></p>"
    }
    htstr+=str;
}
htstr="<div id=\"content\" class=\"container\"><h3>目录</h3>"+htstr+"</div>"
fs.writeFileSync('./index.html',fs.readFileSync('./index.html').toString().replace(/<div id="content"([\s\S])*\/div>/gm,htstr));
