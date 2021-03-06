require('dotenv').config()
const path = require('path');

const webpack = require('webpack');
const {
	WebpackTools: {
		MagentoRootComponentsPlugin,
		ServiceWorkerPlugin,
		MagentoResolver,
		PWADevServer
	}
} = require('@magento/pwa-buildpack');

const themePaths = {
	src: path.resolve(__dirname, 'src'),
	assets: path.resolve(__dirname, 'web'),
	output: path.resolve(__dirname, 'web/js'),
};

module.exports = async function(env) {
	const config = {
		context: __dirname, // Node global for the running script's directory
		entry: {
			client: path.resolve(themePaths.src, 'index.js')
		},
		output: {
			path: themePaths.output,
			publicPath: process.env.MAGENTO_BACKEND_PUBLIC_PATH,
			filename: '[name].js',
			chunkFilename: '[name].js'
		},
		module: {
			rules: [
				{
					include: [themePaths.src],
					test: /\.js$/,
					use: [
						{
							loader: 'babel-loader',
							options: { cacheDirectory: true }
						}
					]
				},
				{
					test: /\.css$/,
					use: [
						'style-loader',
						{
							loader: 'css-loader',
							options: {
								importLoaders: 1
							}
						}
					]
				}
			]
		},
		resolve: await MagentoResolver.configure({
			paths: {
				root: __dirname
			}
		}),
		plugins: [
			new MagentoRootComponentsPlugin(),
			new webpack.NoEmitOnErrorsPlugin(),
			new webpack.EnvironmentPlugin({
				NODE_ENV: env.phase,
				SERVICE_WORKER_FILE_NAME: 'sw.js'
			})
		]

	};
	if (env.phase === "development") {
		config.devServer = await PWADevServer.configure({
			publicPath: process.env.MAGENTO_BACKEND_PUBLIC_PATH,
			backendDomain: process.env.MAGENTO_BACKEND_DOMAIN,
			serviceWorkerFileName: process.env.SERVICE_WORKER_FILE_NAME,
			paths: themePaths,
			id: 'magento'
		});

		config.output.publicPath = config.devServer.publicPath;

		config.plugins.push(
			new ServiceWorkerPlugin({
				env,
				paths: themePaths,
				enableServiceWorkerDebugging: false,
				serviceWorkerFileName: process.env.SERVICE_WORKER_FILE_NAME
			})
		);
		config.plugins.push(
			new webpack.HotModuleReplacementPlugin()
		);
	} else if (env.phase === "production") {
		throw Error("Production configuration not implemented yet.");
	}
	return config;
}