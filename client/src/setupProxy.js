const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app)  {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://chimay.science.uva.nl:8065',
            changeOrigin: true,
        })
    )
}
