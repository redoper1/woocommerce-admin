/**
 * External dependencies
 */
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const { get } = require( 'lodash' );
const path = require( 'path' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const { DefinePlugin } = require( 'webpack' );
const WebpackRTLPlugin = require( 'webpack-rtl-plugin' );
const FixStyleOnlyEntriesPlugin = require( 'webpack-fix-style-only-entries' );
const BundleAnalyzerPlugin = require( 'webpack-bundle-analyzer' )
	.BundleAnalyzerPlugin;
const MomentTimezoneDataPlugin = require( 'moment-timezone-data-webpack-plugin' );

/**
 * WordPress dependencies
 */
const CustomTemplatedPathPlugin = require( '@wordpress/custom-templated-path-webpack-plugin' );

const NODE_ENV = process.env.NODE_ENV || 'development';

// generate-feature-config.php defaults to 'plugin', so lets match that here.
let WC_ADMIN_PHASE = process.env.WC_ADMIN_PHASE || 'plugin';
if ( [ 'development', 'plugin', 'core' ].indexOf( WC_ADMIN_PHASE ) === -1 ) {
	WC_ADMIN_PHASE = 'plugin';
}
const WC_ADMIN_CONFIG = require( path.join(
	__dirname,
	'config',
	WC_ADMIN_PHASE + '.json'
) );
const WC_ADMIN_ADDITIONAL_FEATURES =
	( process.env.WC_ADMIN_ADDITIONAL_FEATURES &&
		JSON.parse( process.env.WC_ADMIN_ADDITIONAL_FEATURES ) ) ||
	{};

const externals = {
	'@wordpress/api-fetch': { this: [ 'wp', 'apiFetch' ] },
	'@wordpress/blocks': { this: [ 'wp', 'blocks' ] },
	'@wordpress/data': { this: [ 'wp', 'data' ] },
	'@wordpress/editor': { this: [ 'wp', 'editor' ] },
	'@wordpress/element': { this: [ 'wp', 'element' ] },
	'@wordpress/hooks': { this: [ 'wp', 'hooks' ] },
	'@wordpress/url': { this: [ 'wp', 'url' ] },
	'@wordpress/html-entities': { this: [ 'wp', 'htmlEntities' ] },
	'@wordpress/i18n': { this: [ 'wp', 'i18n' ] },
	'@wordpress/data-controls': { this: [ 'wp', 'dataControls' ] },
	tinymce: 'tinymce',
	moment: 'moment',
	react: 'React',
	lodash: 'lodash',
	'react-dom': 'ReactDOM',
};

const wcAdminPackages = [
	'components',
	'csv-export',
	'currency',
	'date',
	'navigation',
	'number',
	'data',
];

const entryPoints = {};
wcAdminPackages.forEach( ( name ) => {
	externals[ `@woocommerce/${ name }` ] = {
		this: [
			'wc',
			name.replace( /-([a-z])/g, ( match, letter ) =>
				letter.toUpperCase()
			),
		],
	};
	entryPoints[ name ] = `./packages/${ name }`;
} );

const wpAdminScripts = [
	'onboarding-homepage-notice',
	'onboarding-product-notice',
	'onboarding-product-import-notice',
	'onboarding-tax-notice',
	'print-shipping-label-banner',
];
wpAdminScripts.forEach( ( name ) => {
	entryPoints[ name ] = `./client/wp-admin-scripts/${ name }`;
} );

const webpackConfig = {
	mode: NODE_ENV,
	entry: {
		app: './client/index.js',
		ie: './client/ie.scss',
		...entryPoints,
	},
	output: {
		filename: ( data ) => {
			return wpAdminScripts.includes( data.chunk.name )
				? 'wp-admin-scripts/[name].js'
				: '[name]/index.js';
		},
		chunkFilename: 'chunks/[name].[chunkhash].min.js',
		path: path.join( __dirname, 'dist' ),
		library: [ 'wc', '[modulename]' ],
		libraryTarget: 'this',
	},
	externals,
	module: {
		rules: [
			{
				parser: {
					amd: false,
				},
			},
			{
				test: /\.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.js?$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'@babel/preset-env',
								{ loose: true, modules: 'commonjs' },
							],
						],
						plugins: [ 'transform-es2015-template-literals' ],
					},
				},
				include: new RegExp(
					'/node_modules/(' +
						'|acorn-jsx' +
						'|d3-array' +
						'|debug' +
						'|marked' +
						'|regexpu-core' +
						'|unicode-match-property-ecmascript' +
						'|unicode-match-property-value-ecmascript)/'
				),
			},
			{ test: /\.md$/, use: 'raw-loader' },
			{
				test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/,
				loader: 'url-loader',
			},
			{
				test: /\.s?css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						// postcss loader so we can use autoprefixer and theme Gutenberg components
						loader: 'postcss-loader',
						options: {
							config: {
								path: 'postcss.config.js',
							},
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sassOptions: {
								includePaths: [
									'client/stylesheets/abstracts',
								],
							},
							prependData:
								'@import "node_modules/@wordpress/base-styles/_colors.scss"; ' +
								'@import "node_modules/@wordpress/base-styles/_variables.scss"; ' +
								'@import "node_modules/@wordpress/base-styles/_mixins.scss"; ' +
								'@import "node_modules/@wordpress/base-styles/_breakpoints.scss"; ' +
								'@import "node_modules/@wordpress/base-styles/_animations.scss"; ' +
								'@import "node_modules/@wordpress/base-styles/_z-index.scss"; ' +
								'@import "_colors"; ' +
								'@import "_variables"; ' +
								'@import "_breakpoints"; ' +
								'@import "_mixins"; ',
						},
					},
				],
			},
		],
	},
	resolve: {
		extensions: [ '.json', '.js', '.jsx' ],
		modules: [ path.join( __dirname, 'client' ), 'node_modules' ],
		alias: {
			'gutenberg-components': path.resolve(
				__dirname,
				'node_modules/@wordpress/components/src'
			),
			// @todo - remove once https://github.com/WordPress/gutenberg/pull/16196 is released.
			'react-spring': 'react-spring/web.cjs',
			'@woocommerce/wc-admin-settings': path.resolve(
				__dirname,
				'client/settings/index.js'
			),
		},
	},
	plugins: [
		new FixStyleOnlyEntriesPlugin(),
		// Inject the current feature flags.
		new DefinePlugin( {
			'window.wcAdminFeatures': {
				...WC_ADMIN_CONFIG.features,
				...WC_ADMIN_ADDITIONAL_FEATURES,
			},
		} ),
		new CustomTemplatedPathPlugin( {
			modulename( outputPath, data ) {
				const entryName = get( data, [ 'chunk', 'name' ] );
				if ( entryName ) {
					return entryName.replace( /-([a-z])/g, ( match, letter ) =>
						letter.toUpperCase()
					);
				}
				return outputPath;
			},
		} ),
		new WebpackRTLPlugin( {
			filename: './[name]/style-rtl.css',
			minify: {
				safe: true,
			},
		} ),
		new MiniCssExtractPlugin( {
			filename: './[name]/style.css',
		} ),
		new CopyWebpackPlugin(
			wcAdminPackages.map( ( packageName ) => ( {
				from: `./packages/${ packageName }/build-style/*.css`,
				to: `./${ packageName }/`,
				flatten: true,
				transform: ( content ) => content,
			} ) )
		),
		new MomentTimezoneDataPlugin( {
			startYear: 2000, // This strips out timezone data before the year 2000 to make a smaller file.
		} ),
		process.env.ANALYZE && new BundleAnalyzerPlugin(),
	].filter( Boolean ),
};

if ( webpackConfig.mode !== 'production' ) {
	webpackConfig.devtool = process.env.SOURCEMAP || 'source-map';
}

module.exports = webpackConfig;
