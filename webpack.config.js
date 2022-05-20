/* eslint-env node */

import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import path from 'path';

const isProductionBuild = process.env.NODE_ENV === 'production';

const STYLE_NAME = 'application-[hash].css';
const SCRIPT_NAME = 'application-[hash].js';
const PAGE_TITLE = 'THX Deep Note';

const config = {
  mode: isProductionBuild ? 'production' : 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve((isProductionBuild ? './dist' : './build')),
    filename: SCRIPT_NAME
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: [{ loader: 'ts-loader' }], exclude: /(node_modules)/ },
      { test: /\.(png|jpg)$/, loader: 'url-loader', options: {limit: 8192} },
      { test: /\.s(a|c)ss$/, enforce: 'pre', use: ['sass-loader'] },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new HtmlWebpackPlugin({title: PAGE_TITLE, template: './src/index.html'})
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.module.scss', '.scss'],
    modules: [
      './node_modules',
      './src'
    ]
  }
};

if (isProductionBuild) {
  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: STYLE_NAME,
    })
  );
  config.output.publicPath = '/apps/gap-analysis-project/assets/';
  config.module.rules.push(
    { test: /\.module\.(css|sass|scss)$/, use: [MiniCssExtractPlugin.loader, { loader: 'css-loader', options: { modules: { localIdentName: '[hash:base64]' }}} ] },
    { test: /\.(css|sass|scss)$/, exclude: /\.module\.(css|sass|scss)$/, use: [MiniCssExtractPlugin.loader, { loader: 'css-loader'} ] }
  );
  config.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin()
    ],
  };
} else {
  config.devtool = 'eval-source-map';
  config.devServer = {
    port: 7879,
    host: '0.0.0.0',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  };
  config.output.publicPath = 'http://localhost:7879/';
  config.module.rules.push(
    { test: /\.module\.(css|sass|scss)$/, use: ['style-loader', { loader: 'css-loader', options: { modules: { localIdentName: '[local]__[hash:base64]' }}} ] },
    { test: /\.(css|sass|scss)$/, exclude: /\.module\.(css|sass|scss)$/, use: ['style-loader', { loader: 'css-loader' } ] },
  );
  config.plugins.push(
    new ReactRefreshWebpackPlugin()
  );
}

export default config;
