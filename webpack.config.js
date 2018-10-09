/* eslint-env node */

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProductionBuild = process.env.NODE_ENV === 'production';

const STYLE_NAME = 'application-[hash].css';
const SCRIPT_NAME = 'application-[hash].js';
const PAGE_TITLE = 'THX Deep Note';

let config = {
  entry: './src/index.ts',
  output: {
    path: __dirname + (isProductionBuild ? '/dist' : '/build'),
    filename: SCRIPT_NAME
  },
  module: {
    rules: [
      { test: /\.(png|jpg|svg|woff)$/, loader: 'url-loader', options: {limit: 8192} },
      { test: /\.sass$/, enforce: 'pre', use: ['style-loader', 'css-loader', 'sass-loader'] },
      {
        test: /\.(j|t)sx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    browsers: 'ie >= 11'
                  }
                }
              ],
              '@babel/preset-typescript',
              '@babel/preset-react'
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              'react-hot-loader/babel'
            ]
          }
        }
      },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new HtmlWebpackPlugin({title: PAGE_TITLE, template: './src/index.html'})
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.sass'],
    modules: [
      './node_modules',
      './src'
    ]
  }
};

module.exports = config;
