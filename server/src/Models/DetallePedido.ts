import { Model, DataTypes, BelongsToGetAssociationMixin } from 'sequelize';
import { sequelize } from '../db';
import { Pedido } from './Pedido';
import { Producto } from './Producto';

export class DetallePedido extends Model {
  public id!: number;
  public pedido_id!: number;
  public producto_id!: number;
  public cantidad!: number;
  public observaciones?: string;

  public Producto?: Producto;
  public getProducto!: BelongsToGetAssociationMixin<Producto>;
}

DetallePedido.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    pedido_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'pedidos', key: 'id' },
      onDelete: 'CASCADE',
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'productos', key: 'id' },
    },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    observaciones: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: 'detalle_pedidos', timestamps: false }
);

DetallePedido.belongsTo(Pedido, { foreignKey: 'pedido_id' });
Pedido.hasMany(DetallePedido, { foreignKey: 'pedido_id' });

DetallePedido.belongsTo(Producto, { foreignKey: 'producto_id' });
Producto.hasMany(DetallePedido, { foreignKey: 'producto_id' });
