const axios = require('axios');
const fs = require('fs');
const path = require('path');

const start = new Date().getTime();
let finished = 0;
for (var i=0; i<10000; i++) {
    axios.get('https://jsonplaceholder.typicode.com/comments')
        .then(res=>{
            fs.appendFile(path.join(__dirname, 'nodejs.txt'), res.data, () => {
                finished++;
                if (finished % 3000 === 0) {
                    console.log('finished:' + finished);
                } 
                if (finished === 10000) {
                    console.log("执行时间:" + (new Date().getTime() - start)); //执行时间:154546
                }
            });            
        })
}