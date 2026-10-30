const mongoose = require('mongoose');

module.exports = async () => {
  if (global.__MONGOINSTANCE) {
    await mongoose.disconnect();
    await global.__MONGOINSTANCE.stop();
  }
};
