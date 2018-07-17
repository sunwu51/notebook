var fs = require('fs')
var res={}
fs.readFileSync('a.js').toString().split("\n").forEach(it=>{
    it.split(' ').forEach(i=>{
        res[i]===undefined?res[i]=0:res[i]++;
    })
})
console.log(res)