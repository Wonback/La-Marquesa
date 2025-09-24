import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db';

export class Insumo extends Model {
  public id!: number;
  public nombre!: string;
  public stock!: number;
  public stock_minimo!: number;
}

Insumo.init(
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
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    stock_minimo: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  { sequelize, tableName: 'insumos', timestamps: false }
);
