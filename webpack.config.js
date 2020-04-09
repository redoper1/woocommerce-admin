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
const MomentTimezoneDataPlugin = require( 'moment-timezone-data-webpack-plugin' );
const TerserPlugin = require( 'terser-webpack-plugin' );

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
	'onboarding-menu-experience',
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
				? './dist/wp-admin-scripts/[name].js'
				: './dist/[name]/index.js';
		},
		path: __dirname,
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
			filename: './dist/[name]/style-rtl.css',
			minify: {
				safe: true,
			},
		} ),
		new MiniCssExtractPlugin( {
			filename: './dist/[name]/style.css',
		} ),
		new CopyWebpackPlugin(
			wcAdminPackages.map( ( packageName ) => ( {
				from: `./packages/${ packageName }/build-style/*.css`,
				to: `./dist/${ packageName }/`,
				flatten: true,
				transform: ( content ) => content,
			} ) )
		),
		new MomentTimezoneDataPlugin( {
			startYear: 2000,
		} ),
	],
	optimization: {
		minimize: NODE_ENV !== 'development',
		minimizer: [
			new TerserPlugin( {
				cache: true,
				parallel: true,
				terserOptions: {
					parse: {
						// We want terser to parse ecma 8 code. However, we don't want it
						// to apply any minification steps that turns valid ecma 5 code
						// into invalid ecma 5 code. This is why the 'compress' and 'output'
						// sections only apply transformations that are ecma 5 safe
						// https://github.com/facebook/create-react-app/pull/4234
						ecma: 8,
					},
					compress: {
						ecma: 5,
						warnings: false,
						// Disabled because of an issue with Uglify breaking seemingly valid code:
						// https://github.com/facebook/create-react-app/issues/2376
						// Pending further investigation:
						// https://github.com/mishoo/UglifyJS2/issues/2011
						comparisons: false,
						// Disabled because of an issue with Terser breaking valid code:
						// https://github.com/facebook/create-react-app/issues/5250
						// Pending further investigation:
						// https://github.com/terser-js/terser/issues/120
						inline: 2,
					},
					mangle: {
						reserved: [ 'translate' ], // @todo: Can we determine if we're generating i18n files?
						safari10: true,
					},
					output: {
						ecma: 5,
						comments: false,
						// Turned on because emoji and regex is not minified properly using default
						// https://github.com/facebook/create-react-app/issues/2488
						ascii_only: true,
					}
				},
			} ),
		],
	},
};

if ( webpackConfig.mode !== 'production' ) {
	webpackConfig.devtool = process.env.SOURCEMAP || 'source-map';
}

module.exports = webpackConfig;
