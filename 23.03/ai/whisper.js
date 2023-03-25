const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: '',
});
const openai = new OpenAIApi(configuration);
openai.createTranscription(
  fs.createReadStream("C:/Users/sunwu/Documents/录音/录音 (2).m4a"),
  "whisper-1"
).then(resp=>{
    console.log(resp)
}).catch(console.error);

