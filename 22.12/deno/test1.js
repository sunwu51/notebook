import { readJSONFromURL } from 'https://deno.land/x/flat@0.0.15/mod.ts'

const data = await readJSONFromURL('https://jsonplaceholder.typicode.com/comments');

console.log(data.length);
