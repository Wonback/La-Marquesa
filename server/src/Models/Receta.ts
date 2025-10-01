import { Model, DataTypes, HasManyGetAssociationsMixin } from 'sequelize';
import { sequelize } from '../db';
import { Producto } from './Producto';
import { DetalleReceta } from './DetalleReceta';

export class Receta extends Model {
  public id!: number;
  public producto_id!: number;

  //Esto dice que Receta puede tener detalleRecetas
  public detalleRecetas?: DetalleReceta[];
  public getDetalleRecetas!: HasManyGetAssociationsMixin<DetalleReceta>;
}

Receta.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    producto_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'productos', key: 'id' }, onDelete: 'CASCADE' },
  },
  { sequelize, tableName: 'recetas', timestamps: false }
);

