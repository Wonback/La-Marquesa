import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: 'postgres',
  logging: false, // opcional para no llenar la consola
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production'
      ? {
          require: true,
          rejectUnauthorized: false, // necesario para Railway o Heroku
        }
      : false,
  },
});
