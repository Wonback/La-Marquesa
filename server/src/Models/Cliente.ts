import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db';

export class Cliente extends Model {
  public id!: number;
  public nombre!: string;
  public telefono?: string;
  public email?: string;
}

Cliente.init(
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
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  { sequelize, tableName: 'clientes', timestamps: false }
);
