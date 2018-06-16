module.exports = {
  devServer: {
    proxy: (process.env.PROXY ? process.env.PROXY : 'http://localhost:3000')
  }
};