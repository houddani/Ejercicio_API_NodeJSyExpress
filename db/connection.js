import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

// Creación de la instancia de Sequealize
const db = new Sequelize(
    process.env.DB_NAME, // DB name
    process.env.DB_USERNAME, // Username
    process.env.DB_PASSWORD, // Password
    {
        host: process.env.DB_HOSTNAME,
        dialect: process.env.DB_DIALECT,
        logging: true
    })

    export default db
