import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'

dotenv.config()

export const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  dialect: 'postgres',
  logging: false,
})
