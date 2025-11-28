import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db';
import { Pedido } from './Pedido'; // Importar para TS si lo usas en associations

export class Cliente extends Model {
  public id!: number;
  public nombre!: string;
  public telefono?: string;
  public email?: string;
  // AGREGADOS:
  public direccion?: string;
  public localidad?: string;
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
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    // AGREGADOS:
    direccion: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    localidad: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },  
  },
  { sequelize, tableName: 'clientes', timestamps: false }
);