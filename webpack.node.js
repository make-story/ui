/**
 * Node.js 환경에서 사용하기 위한 모듈 빌드
 */
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    target: 'node', // Node.js 환경에서 사용하기 위한 빌드 (기본값: web)
    devtool: 'inline-source-map',
    externals: [
        nodeExternals()
    ],
    entry: {
        'util': '/src/util/index.js'
    },
    output: {
        filename: 'node/[name].js',
        path: path.resolve(__dirname, '../dist'),
        libraryTarget: 'commonjs2', // module.exports 방식으로 설정(commonjs2) - 기본값: 'var'
    },
    optimization: {
        minimize: false, 
    },
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        global: true
    }
}