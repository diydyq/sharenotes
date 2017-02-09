const path = require('path');

module.exports = {

     entry: './src/test.js',
    //entry: './src/example.js',

    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: 'my-first-webpack.bundle.js'
    },

    module: {
        rules: [
            {test: /\.(js|jsx)$/, exclude: /node_modules/, use: 'babel-loader'}
        ]
    }
};


