import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db';

export class Empleado extends Model {
  public id!: number;
  public nombre!: string;
  public rol!: string;
}

Empleado.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    rol: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  { sequelize, tableName: 'empleados', timestamps: false }
);
