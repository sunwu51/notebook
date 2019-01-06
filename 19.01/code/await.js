const fs = require('fs')

async function read(){
    return new Promise((resolve,reject)=>{
        setTimeout(function(){
            fs.readFile('./_config.yml',function(err,data){
                resolve(data.toString())
            })
        },2000);
    })
}
async function main1(){
    let x = await read();
    console.log(x);
    let y = await read();
    console.log(y);
    
}
async function main2(){
    let x = await read();
    console.log(x);
    let y = await read();
    console.log(y);
    
}
main1();
main2();
