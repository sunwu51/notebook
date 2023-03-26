const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);
openai.createTranscription(
  fs.createReadStream("测试.m4a"),
  "whisper-1"
).then(resp=>{
    console.log(resp.data)
}).catch(console.error);

