const {WorkerData, parentPort} = require('worker_threads');

function fib(n) {
    return n<2? 1: fib(n-1) + fib(n-2);
}


var res = fib(40);

parentPort.postMessage(res)