// var fs = require('fs')
import fs from 'node:fs'

fs.writeFileSync('test.txt', "hello world");

console.log("OK")