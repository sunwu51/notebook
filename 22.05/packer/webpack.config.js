const path = require('path');

module.exports = {
  entry: './src/index.jsx',
  output: {
    filename: 'bundle.js',
  },
  module: {
    rules: [{
      test: /\.js[x]?$/, // 用正则来匹配文件路径，这段意思是匹配 js 或者 jsx
      exclude: /(node_modules|bower_components)/,
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-react']
      }
    }]
  }
};