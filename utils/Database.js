const fs = require("fs");
const Collection = require("./Collection.js");

class Database {
  constructor(name) {
    this.dbName = name;
    this.databasePath = `${__dirname}/./../database/${name}`;
    this.path = `./../database/`;
    this.isConnected = null;
    this.connect();
  }

  async createCollection(collection, schema) {
    try {
      //Check if collection exist
      const schemaContent = "module.exports=" + schema;
      const collectionFilePath = this.databasePath + "/" + collection + ".txt";
      const schemaFilePath =
        this.databasePath + "/" + collection + ".schema.js";

      fs.exists(collectionFilePath, (exists) => {
        if (!exists) {
          //if not exist create collection
          fs.appendFile(collectionFilePath, "", (err) => {
            if (err) return new Error(err.message);
          });
          fs.appendFile(schemaFilePath, schemaContent, (err) => {
            if (err) return new Error(err.message);
          });
        }
      });
      return new Collection(collection, schema);
    } catch (err) {
      console.log(err.message);
      return new Error(err.message);
    }
  }

  connect() {
    if (!fs.existsSync(this.databasePath)) {
      fs.mkdirSync(this.databasePath);
    }
    return this;
  }

  changeSchemaToString(schema) {
    const keys = Object.keys(schema);
    const dataTypes = [String, Number, Boolean, Object, Date];
    const dataTypesInString = ["String", "Number", "Boolean", "Object", "Date"];
    const realObject = {};

    for (const key of keys) {
      const type = schema[key];
      const index = dataTypes.indexOf(type);

      if (index === -1) {
        // Throw an error with a string message
        throw new Error("Schema is in invalid format");
        return;
      }

      realObject[key] = dataTypesInString[index];
    }
    return JSON.stringify(realObject);
  }

  Schema(schema) {
    const stringSchema = this.changeSchemaToString(schema);

    return stringSchema;
  }
}

function database(name, callback) {
  const database = new Database(name);
  if (!database) {
    const error = new Error({
      status: 500,
      message: "failed creating database",
    });
    callback(error);
  }
  callback();
  return database;
}

module.exports = database;
