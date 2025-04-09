import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

const DATABASE_HOST = process.env.DATABASE_HOST
const DATABASE_USERNAME = process.env.DATABASE_USERNAME
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD
const DATABASE_NAME = process.env.DATABASE_NAME
const PORT = process.env.PORT

const databaseInstance = mysql.createPool({
  host: DATABASE_HOST,
  user: DATABASE_USERNAME,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  port: PORT
})

export default databaseInstance