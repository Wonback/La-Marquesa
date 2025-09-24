import { Model, DataTypes, HasManyGetAssociationsMixin } from 'sequelize';
import { sequelize } from '../db';
import { Cliente } from './Cliente';
import { DetallePedido } from './DetallePedido';

export class Pedido extends Model {
  public id!: number;
  public cliente_id!: number;
  public fecha_entrega!: Date;
  public estado!: string;

  // ⚡ Esta línea le dice a TS que Pedido puede tener detallePedidos
  public detallePedidos?: DetallePedido[];
  public getDetallePedidos!: HasManyGetAssociationsMixin<DetallePedido>;
}

Pedido.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cliente_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'clientes', key: 'id' } },
    fecha_entrega: { type: DataTypes.DATEONLY, allowNull: false },
    estado: { type: DataTypes.STRING(20), defaultValue: 'registrado' },
  },
  { sequelize, tableName: 'pedidos', timestamps: false }
);

Pedido.belongsTo(Cliente, { foreignKey: 'cliente_id' });
Cliente.hasMany(Pedido, { foreignKey: 'cliente_id' });

Pedido.hasMany(DetallePedido, { foreignKey: 'pedido_id', as: 'detallePedidos' });
