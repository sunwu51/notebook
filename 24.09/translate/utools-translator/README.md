# uTools Translator Plugin

This is an advanced translator plugin for uTools that provides both Google Translate and AI translation capabilities. It offers a user-friendly interface with left-right layout for input and dual translation output.

## Features

- Left-right layout with input on the left and translation results on the right
- Dual translation output: Google Translate and AI translation
- Automatic language detection
- Smart translation:
  - If input is Chinese, translates to English
  - If input is any other language, translates to Chinese
- Utilizes Google Translate API for accurate translations
- AI translation powered by https://api.siliconflow.cn/v1 (implementation required)

## Installation

1. Copy the `utools-translator` folder to your uTools plugin directory.
2. Restart uTools or refresh the plugin list.

## Usage

1. Open uTools and type "翻译" or "translate" to activate the plugin.
2. Enter the text you want to translate in the left text area.
3. The plugin will automatically detect the language:
   - If you enter Chinese text, it will be translated to English.
   - If you enter text in any other language, it will be translated to Chinese.
4. Translation results will appear automatically on the right side:
   - The top section shows the Google Translate result
   - The bottom section shows the AI translation result

## Adding a Logo

To add a logo to your plugin:

1. Create a 256x256 pixel image for your logo.
2. Save it as `logo.png` in the `utools-translator` directory.
3. Make sure the `logo.png` file is referenced correctly in the `plugin.json` file.

## Customization

You can customize the plugin by modifying the following files:

- `index.html`: Change the HTML structure
- `styles.css`: Modify the appearance
- `script.js`: Alter the translation logic or add new features
- `plugin.json`: Update plugin metadata or change activation keywords

## Important Note

- This plugin uses the unofficial Google Translate API. For production use, consider using an official translation API with proper authentication.
- The AI translation feature requires implementation. You need to replace the placeholder function in `script.js` with the actual API call to https://api.siliconflow.cn/v1.

Enjoy seamless bilingual translation with your enhanced uTools plugin!