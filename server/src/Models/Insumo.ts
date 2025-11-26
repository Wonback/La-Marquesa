import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db';

export class Insumo extends Model {
  public id!: number;
  public nombre!: string;
  public unidad_medida!: string; // <--- AGREGADO
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
    unidad_medida: {  // <--- AGREGADO
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'u' // Por defecto 'unidades' si no se especifica
    },
    stock: {
      type: DataTypes.FLOAT, // Cambiado a FLOAT por si tienes 1.5 kg
      defaultValue: 0,
    },
    stock_minimo: {
      type: DataTypes.FLOAT, // Cambiado a FLOAT
      defaultValue: 0,
    },
  },
  { sequelize, tableName: 'insumos', timestamps: false }
);