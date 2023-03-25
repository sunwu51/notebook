const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
});

const openai = new OpenAIApi(configuration);

async function test() {
    // const res = await openai.createChatCompletion({
    // model: "gpt-3.5-turbo",
    // messages: [{role: "user", content: "Hello world"}],
    // // stream: true,
    // });


    // res.data.on('data', data => {
    //     const lines = data.toString().split('\n').filter(line => line.trim() !== '');
    //     for (const line of lines) {
    //         const message = line.replace(/^data: /, '');
    //         if (message === '[DONE]') {
    //             return; // Stream finished
    //         }
    //         try {
    //             const parsed = JSON.parse(message);
    //             console.log(parsed.choices[0].text);
    //         } catch(error) {
    //             console.error('Could not JSON parse stream message', message, error);
    //         }
    //     }
    // });

    const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role: "user", content: "Hello world"}],
    });
    console.log(completion.data.choices[0].message);
}

test()