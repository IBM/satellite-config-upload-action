const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    app: './index.js'
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  node: {
    fs: 'empty'
  }
};