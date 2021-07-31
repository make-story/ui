const path = require('path');
const webpack = require('webpack');
const pkg = require('./package.json');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')

const ENTRY_INDEX = './src/index.js';

const isProduction = process.argv.indexOf('--mode=production') >= 0;
const minify = process.argv.indexOf('--minify') >= 0;

// 웹팩 기본 설정 
const defaultConfigs = {
	mode: isProduction ? 'production' : 'development',
	cache: false,
	resolve: {
		alias: {
			'@src': path.resolve(__dirname, './src/'),
		},
	},
	module: {
		rules: [
			// eslint, prettier
			/*{
				test: /\.js$/,
				exclude: /node_modules|dist/,
				loader: 'eslint-loader',
				enforce: 'pre',
				options: {
					configFile: './.eslintrc.js',
					failOnWarning: false,
					failOnError: false
				}
			},*/
			// babel
			{
				test: /\.js$/,
				exclude: /node_modules|dist/,
				loader: 'babel-loader?cacheDirectory',
				options: {
					envName: isProduction ? 'production' : 'development',
					rootMode: 'upward'
				}
			},
			// css
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader']
			},
			// image
			{
				test: /\.png$/i,
				use: 'url-loader'
			}
		]
	},
	output: {
		path: path.resolve(__dirname, minify ? 'dist/cdn' : 'dist'),
		filename: `ui-[name]${minify ? '.min' : ''}.js`,
		/*
		// 웹팩 내부에 JavaScript 다양한 모듈화 방식 추가!
		if(typeof exports === 'object' && typeof module === 'object')
			module.exports = factory();
		else if(typeof define === 'function' && define.amd)
			define([], factory);
		else if(typeof exports === 'object')
			exports["ui"] = factory();
		else
			root["ui"] = factory();
		*/
		library: ['ui'],
		libraryTarget: 'umd',
		libraryExport: 'default',
	},
	plugins: [
		new MiniCssExtractPlugin({
			moduleFilename: ({ name }) =>
				`toastui-${name.replace('-all', '')}${minify ? '.min' : ''}.css`
		}),
		new webpack.BannerPlugin({
			banner: [
				pkg.name,
				`@version ${pkg.version} | ${new Date().toDateString()}`,
				`@author ${pkg.author}`,
				`@license ${pkg.license}`
			].join('\n'),
			raw: false,
			entryOnly: true
		})
	],
	externals: [
		{
			codemirror: {
				commonjs: 'codemirror',
				commonjs2: 'codemirror',
				amd: 'codemirror',
				root: ['CodeMirror']
			}
		}
	],
	optimization: {
		minimize: false
	},
	performance: {
		hints: false
	}
};

// 파일 복사, 이동, 삭제 등
function addFileManagerPlugin(config) {
	const options = minify
		? [
			{
				delete: [

				]
			}
		]
		: [
			{
				delete: [

				]
			},
			{
				copy: [
					{ source: './dist/*.{js,css}', destination: './dist/cdn' }
				]
			}
		];

	config.plugins.push(new FileManagerPlugin({ onEnd: options }));
}

// 자바스크립트 코드를 난독화, debugger 구문을 제거 (웹팹 버전별 사용형태 다름)
// https://webpack.js.org/plugins/terser-webpack-plugin/
function addMinifyPlugin(config) {
	config.optimization = {
		minimizer: [
			new TerserPlugin({
				cache: true,
				parallel: true,
				sourceMap: false,
				extractComments: false
			}),
			new OptimizeCSSAssetsPlugin()
		]
	};
}

// 번들 시각화 도구 
function addAnalyzerPlugin(config, type) {
	config.plugins.push(
		new BundleAnalyzerPlugin({
			analyzerMode: 'static',
			reportFilename: `../../report/webpack/stats-${pkg.version}-${type}.html`
		})
	);
}

// DevServer
// https://webpack.js.org/configuration/dev-server/
function setDevelopConfig(config) {
	//config.module.rules = config.module.rules.slice(1); // eslint 제거
	config.entry = { 
		'index-dev': ENTRY_INDEX 
	};
	//config.output.publicPath = 'dist/';

	config.devtool = 'inline-source-map';
	config.devServer = {
		inline: true,
		host: '0.0.0.0',
		port: 9090, // 주의! 기본값 8080 은 톰캣과 충돌!
		disableHostCheck: true
	};
	config.plugins.push(new HtmlWebpackPlugin(), new HtmlWebpackPlugin({
		title: 'Webpack DevServer',
		// 브라우저에서 접근할 파일명
		// http://<devServer.host>:<devServer.port>/<output.publicPath>/<HtmlWebpackPlugin 옵션 filename>
		// http://0.0.0.0:8080/
		filename: 'index.html',
		// dev-server html 에 포함할 시용자 템플릿
		template: 'webpack-dev-server-template.html'
	}));
}

// 운영버전 빌드 
function setProductionConfig(config) {
	config.entry = {
		'index': ENTRY_INDEX 
	};

	//addFileManagerPlugin(config);
	if(minify) {
		addMinifyPlugin(config);
		//addAnalyzerPlugin(config, 'normal');
	}
}

if(isProduction) {
	setProductionConfig(defaultConfigs);
} else {
	setDevelopConfig(defaultConfigs);
}

module.exports = defaultConfigs;