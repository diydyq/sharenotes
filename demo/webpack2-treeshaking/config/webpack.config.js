const path = require('path');

module.exports = {

     entry: './src/demo-mine.js',
    //entry: './src/demo-webpack.js',

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


