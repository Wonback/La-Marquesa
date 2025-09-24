import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db';
import { Insumo } from './Insumo';

export class Alerta extends Model {
  public id!: number;
  public insumo_id!: number;
  public mensaje!: string;
  public fecha!: Date;
}

Alerta.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    insumo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'insumos', key: 'id' },
    },
    mensaje: { type: DataTypes.TEXT, allowNull: false },
    fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'alertas', timestamps: false }
);

Alerta.belongsTo(Insumo, { foreignKey: 'insumo_id' });
Insumo.hasMany(Alerta, { foreignKey: 'insumo_id' });
