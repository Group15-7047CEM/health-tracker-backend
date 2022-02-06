// Uncomment line below to load specific env file
require('dotenv').config({path: './.env'});

module.exports = {
  "development": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE_NAME,
    "host": process.env.DB_HOST,
    "dialect": process.env.DB_DIALECT,
    "seederStorage": process.env.DB_SEED_STORAGE,
    "seederStorageTableName": process.env.DB_SEED_TABLE_NAME
  },
  "test": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE_NAME,
    "host": process.env.DB_HOST,
    "dialect": process.env.DB_DIALECT,
    "seederStorage": process.env.DB_SEED_STORAGE,
    "seederStorageTableName": process.env.DB_SEED_TABLE_NAME
  },
  "production": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE_NAME,
    "host": process.env.DB_HOST,
    "dialect": process.env.DB_DIALECT,
    "seederStorage": process.env.DB_SEED_STORAGE,
    "seederStorageTableName": process.env.DB_SEED_TABLE_NAME
  }
}
