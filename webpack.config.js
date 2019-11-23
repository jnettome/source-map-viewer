const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: "development",
    entry: {
        'viewer': "./src/viewer/viewer.js",
        'worker': "./src/viewer/SourceWorker.js",
    },
    module: {
        rules: [
            {
                test: /\.css$|\.svg$/,
                use: ['raw-loader']
            }
        ]
    },
    plugins: [
        new CopyPlugin([
            { from: 'src/viewer/viewer.html', to: './index.html' },
        ]),
    ],
}