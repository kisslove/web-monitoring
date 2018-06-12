const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
// 对js代码进行混淆压缩的插件
const uglifyJSPlugin = new UglifyJSPlugin();
const webpack = require('webpack');

// 对babel的配置，内容同.babelrc文件
const babelOptions = {
    "presets": [
        ["env", {
            "targets": {
                "browsers": ["last 2 versions", "safari >= 7"]
            }
        }]
    ]
}
module.exports = {
    entry: ['babel-polyfill', './src/index.ts'],
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    // devtool: 'inline-source-map',
    // devServer: {
    //     contentBase: './dist'
    // },
    module: {
        rules: [{
            test: /\.ts(x?)$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: 'babel-loader',
                    options: babelOptions
                },
                {
                    loader: 'ts-loader'
                }
            ]
        }]
    },
    plugins: [
        uglifyJSPlugin,
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};