// db.js
const mongoose = require('mongoose')
const connection = {}

module.exports = async () => {
  if (connection.isConnected) {
    console.log('=> using existing database connection')
    return
  }

  console.log('=> using new database connection')
  const db = await mongoose.connect(process.env.MONGO_STRING, {useNewUrlParser: true, useUnifiedTopology: true});
  connection.isConnected = db.connections[0].readyState
}