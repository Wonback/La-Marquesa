import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db';

export class Producto extends Model {
  public id!: number;
  public nombre!: string;
  public es_elaborado!: boolean;
  public precio!: number;
}

Producto.init(
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
    es_elaborado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  { sequelize, tableName: 'productos', timestamps: false }
);
