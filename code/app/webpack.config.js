const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
  entry: ['./src/index.tsx'],
  output: {
    path: path.resolve(__dirname, 'dist/'),
    publicPath:"/",
    //assetModuleFilename: 'images/[name][ext]'
    assetModuleFilename: 'tectonicData/[name][ext]'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|geojson)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: ['ts-loader'],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                "targets": "defaults",
                "useBuiltIns": "usage",
                "corejs": 3.6
              }],
              "@babel/preset-react"
            ]
          }
        },
      },

      {
        test: /\.css$/,
        include: path.resolve(__dirname, 'src/'),
        oneOf: [
          {
            test: /\.module\.css$/,
            use: [
              "style-loader",
              {
                loader: "css-loader",
                options: {
                  modules: {
                    compileType: "module",
                    mode: "local",
                    localIdentName: "[name]_[hash:base64:5]--[local]",
                    exportLocalsConvention: "camelCase",
                  }

                }
              },
            ]
          },
          {
            use: ["style-loader", "css-loader"]
          }
        ],
      },



    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', ".module.css"],
    modules: [path.resolve(__dirname, 'src/'), "node_modules"]
  },
  devServer: {
    open: "/",
    // contentBase: [path.join(__dirname, 'dist/')],
    liveReload: true,
    compress: true,
    // writeToDisk: true,
    // watchContentBase: true,
    hot: true,
    port: 8080,
    static: {
      directory: path.join(__dirname, "dist/"),
      publicPath: "/"
    }
    // publicPath:"/"
},
  plugins: [
      new HtmlWebpackPlugin ({
        template: 'index.html',
      }),

      // new CopyWebpackPlugin({
      //   patterns: [
      //     {from: "src/components/tectonicData"}
      //   ]
      // })
  ]
};