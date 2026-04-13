import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db';

export class HistorialPedido extends Model {
  public id!: number;
  public pedido_id!: number;
  public estado_anterior!: string | null;
  public estado_nuevo!: string;
  public usuario_nombre!: string;
  public fecha!: Date;
}

HistorialPedido.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    pedido_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'pedidos', key: 'id' } },
    estado_anterior: { type: DataTypes.STRING(20), allowNull: true },
    estado_nuevo: { type: DataTypes.STRING(20), allowNull: false },
    usuario_nombre: { type: DataTypes.STRING(100), allowNull: false },
    fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'historial_pedidos', timestamps: false }
);
