const mongoose = require('mongoose');

async function connectDb(uri, opts = {}) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    ...opts,
    serverSelectionTimeoutMS: opts.serverSelectionTimeoutMS ?? 8000,
  });
}

module.exports = { connectDb };
