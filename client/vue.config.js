module.exports = {
  devServer: {
    proxy: (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '')
  }
};