// CSS 모듈 모킹
module.exports = {
  process() {
    return 'module.exports = {};';
  },
  getCacheKey() {
    return 'css-transform';
  }
};