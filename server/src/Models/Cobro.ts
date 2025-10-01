import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db';
import { Pedido } from './Pedido';

export class Cobro extends Model {
  public id!: number;
  public pedido_id!: number;
  public fecha!: Date;
  public monto!: number;
  public metodo_pago!: string;
}

Cobro.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    pedido_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'pedidos', key: 'id' },
    },
    fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    metodo_pago: { type: DataTypes.STRING(50), allowNull: false },
  },
  { sequelize, tableName: 'cobros', timestamps: false }
);


