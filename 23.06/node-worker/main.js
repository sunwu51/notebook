const { resolve } = require('path');
const { Worker } = require('worker_threads')

var start = new Date().getTime();

var rootTask = new Promise((resolve, reject) => {
    var counter = 0;
    for (var i=0; i<10; i++) {
        var s = new Date().getTime();
        var worker = new Worker('./worker.js');
        worker.on('message', function(data) {
            counter++;
            console.log(`耗时${new Date().getTime() - s},结果${data}`);
            if (counter == 10) {
                resolve('finish');
            }
        });
        worker.on('error', function(error) {
            reject(error);
        })
    }
});


rootTask.then(() => {
    console.log("总耗时：", new Date().getTime() - start);
})

