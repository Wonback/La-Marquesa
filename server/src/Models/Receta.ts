import { Model, DataTypes, HasManyGetAssociationsMixin } from 'sequelize';
import { sequelize } from '../db';
import { DetalleReceta } from './DetalleReceta';

export class Receta extends Model {
  public id!: number;
  public producto_id!: number;
  public nombre!: string; // Agregué nombre que faltaba en la clase pero estaba en el seed
  public descripcion!: string;

  // Definimos la asociación para TypeScript
  public detallesReceta?: DetalleReceta[];
  public getDetallesReceta!: HasManyGetAssociationsMixin<DetalleReceta>;
}

Receta.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    producto_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'productos', key: 'id' }, onDelete: 'CASCADE' },
    nombre: { type: DataTypes.STRING(100), allowNull: true }, // Opcional según tu lógica
    descripcion: { type: DataTypes.TEXT, allowNull: true }
  },
  { sequelize, tableName: 'recetas', timestamps: false }
);