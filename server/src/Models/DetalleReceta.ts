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

DetalleReceta.belongsTo(Receta, { foreignKey: 'receta_id' });
Receta.hasMany(DetalleReceta, { foreignKey: 'receta_id' });

DetalleReceta.belongsTo(Insumo, { foreignKey: 'insumo_id' });
Insumo.hasMany(DetalleReceta, { foreignKey: 'insumo_id' });
