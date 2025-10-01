import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db';
import { Receta } from './Receta';
import { Insumo } from './Insumo';

export class DetalleReceta extends Model {
  public id!: number;
  public receta_id!: number;
  public insumo_id!: number;
  public cantidad!: number;

  public detalleRecetas?: DetalleReceta[];
  public insumo?: Insumo;
}

DetalleReceta.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    receta_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'recetas', key: 'id' },
      onDelete: 'CASCADE',
    },
    insumo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'insumos', key: 'id' },
    },
    cantidad: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  { sequelize, tableName: 'detalle_recetas', timestamps: false }
);


