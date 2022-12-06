import * as fs from "https://deno.land/std@0.167.0/node/fs.ts";

fs.readFile('test4.js', 'utf8', function(err, data) {
  console.log("node:", data);
})

const data = await Deno.readTextFile('test4.js');
console.log("deno:", data);