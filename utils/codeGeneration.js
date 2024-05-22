const length = 6;

module.exports.generateEmailVerificationCode = () => {
  let str = '';
  for (let i = 0; i < length; i++) {
    str += Math.round(Math.random() * 9);
  }
  return str;
}
