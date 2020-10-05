const { connect } = require("mongoose");
const mongoose = require("mongoose");
const defaultFolder = require("./default.json");
const defaultString = defaultFolder.mongoUri;

const connectMongo = async () => {
  try {
    await mongoose.connect(
      defaultString,
      { useNewUrlParser: true },
      { useUnifiedTopology: true }
    );
    console.log("Mongo Connected");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = connectMongo;
