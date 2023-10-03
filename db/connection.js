import { Sequelize } from 'sequelize'

// Crear instancia del objeto Sequealize

const db = new Sequelize(
    'wxexdfuy', // DB name
    'wxexdfuy', // Username
    'hu1YVtS3wOMaGOEcR97tjnBR1QW4Whq1', // Password
    {
        host: 'silly.db.elephantsql.com',
        dialect: 'postgres',
        logging: true
    })

    export default db
    