const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const SPEECH_REGION = 'japaneast'
const SPEECH_KEY = '32a7078c166e48ffa881cbb166d719cf'

app.use(cors());

app.get('/tts', (req, res) => {
    let text = req.query.text;
    axios({
        url: `https://${SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, 
        method: 'POST',
        headers:{
            'Ocp-Apim-Subscription-Key': SPEECH_KEY,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
        },
        data: `<speak version='\''1.0'\'' xml:lang='\''en-US'\''>
            <voice xml:lang='\''zh-CN'\'' xml:gender='\''Female'\'' name='\''zh-CN-YunxiNeural'\''>
                ${text}
            </voice>
        </speak>`
    }).then(r => {
        let b = r.data;
        // 设置响应头
        res.setHeader('Content-Type', b.type);
        res.setHeader('Content-Length', b.size);

        // 将 Blob 数据发送到客户端
        res.end(Buffer.from(b.buffer));
    })
})

app.listen(4000)