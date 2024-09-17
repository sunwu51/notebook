const sourceText = document.getElementById('sourceText');
const googleTranslatedText = document.getElementById('googleTranslatedText');
const aiTranslatedText = document.getElementById('aiTranslatedText');

let typingTimer;
const doneTypingInterval = 1000; // 1 second

sourceText.addEventListener('input', function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        translateTextGoogle();
        translateTextAI();
    }, doneTypingInterval);
});

async function translateTextGoogle() {
    const text = sourceText.value;
    if (!text) {
        googleTranslatedText.textContent = '';
        return;
    }

    try {
        // First, detect the language
        const detectResponse = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`);
        const detectData = await detectResponse.json();
        const detectedLang = detectData[2];

        // Determine target language based on detected language
        const targetLang = detectedLang === 'zh-CN' ? 'en' : 'zh-CN';

        // Perform the translation
        const translateResponse = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
        const translateData = await translateResponse.json();
        const translatedResult = translateData[0].map(item => item[0]).join('');

        googleTranslatedText.textContent = translatedResult;
    } catch (error) {
        console.error('Google translation error:', error);
        googleTranslatedText.textContent = '谷歌翻译出错，请稍后再试。';
    }
}

async function translateTextAI() {
    const text = sourceText.value;
    if (!text) {
        aiTranslatedText.textContent = '';
        return;
    }

    try {
        // Placeholder for AI translation
        // The actual implementation will be provided by the user
        // aiTranslatedText.textContent = 'AI 翻译功能尚未实现。请替换此函数以调用 https://api.siliconflow.cn/v1 API。';
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: 'Bearer xxx'
            },
            body: JSON.stringify({
                model: 'Qwen/Qwen2-57B-A14B-Instruct',
                messages: [
                    {
                        role: 'system',
                        content: '你是一个翻译助手，用户输入中文，你直接返回翻译的英文结果，用户如果输入非中文，你直接将其翻译为中文。不需要其他解释，只返回结果。'
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ]
            })
        };
        const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', options).then(response => response.json())
        aiTranslatedText.textContent = response.choices[0].message.content
    } catch (error) {
        console.error('AI translation error:', error);
        aiTranslatedText.textContent = 'AI 翻译出错，请稍后再试。';
    }
}

// Initialize uTools plugin
window.exports = {
    "translator": {
        mode: "none",
        args: {
            enter: (action) => {
                // This function will be called when the plugin is activated
                console.log('Translator plugin activated');
            }
        }
    }
};