# prettier
可以帮助监控代码风格，vscode中配置相关插件达到保存后，自动修改代码格式的效果。

安装
- prettier@^2.5.1
- eslint@^8.7.0
- @typescript-eslint/parser@^5.0.1 and typescript@^4.4.4 (Only for TypeScript projects)

```
npm i -D prettier eslint
```

# 配置自动格式化
1 .eslintrc.js
```js
module.exports = {
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
};
```
2 .prettierrc
```
{
  "semi": true,             // 结尾是否强制加;
  "singleQuote": false,     // 字符串是否用单引号
  "trailingComma": "none"   // 数组/属性最后一个元素后要不要强制加逗号
}
```
3 安装插件`Prettier ESLint`

![image](https://i.imgur.com/tf1Zl71.png)

4 .vscode/settings.json 焦点移动自动保存，保存后自动格式化，使用安装好的插件
```json
{
  "editor.defaultFormatter": "rvest.vs-code-prettier-eslint",
  "editor.formatOnPaste": false,
  "editor.formatOnType": false,
  "editor.formatOnSave": true,
  "editor.formatOnSaveMode": "file",
  "files.autoSave": "onFocusChange"
}
```

5 重启vscode生效