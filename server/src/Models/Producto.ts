import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db';
import { Receta } from './Receta';

export class Producto extends Model {
  public id!: number;
  public nombre!: string;
  public es_elaborado!: boolean;
  public precio!: number;
  // AGREGADOS:
  public descripcion?: string; 
  public stock!: number;

  public receta?: Receta;
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
    // AGREGADOS:
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  { sequelize, tableName: 'productos', timestamps: false }
);