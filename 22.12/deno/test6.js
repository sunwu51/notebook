const p=Deno.run({ cmd: ["echo", "abcd"] });
//{ rid: 3, pid: 30393 }
const s = await p.status();
console.log(s)