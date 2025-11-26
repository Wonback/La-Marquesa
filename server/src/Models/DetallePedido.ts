import { Model, DataTypes, BelongsToGetAssociationMixin } from 'sequelize';
import { sequelize } from '../db';
// No es estrictamente necesario importar Pedido aquí para la definición, 
// pero sí Producto para los tipos de TS.
import { Producto } from './Producto'; 

export class DetallePedido extends Model {
  public id!: number;
  public pedido_id!: number;
  public producto_id!: number;
  public cantidad!: number;
  
  // AGREGADOS (Faltaban estos dos para coincidir con tu Seed):
  public precio_unitario!: number;
  public subtotal!: number;
  
  public observaciones?: string;

  // Asociaciones para TypeScript
  public producto?: Producto;
  public getProducto!: BelongsToGetAssociationMixin<Producto>;
}

DetallePedido.init(
  {
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
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
    cantidad: { 
      type: DataTypes.INTEGER, // Ojo: Si vendes por peso (kg), usa DECIMAL(10,2)
      allowNull: false 
    },
    // AGREGADO: Precio histórico
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // AGREGADO: Total de la línea
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    observaciones: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
  },
  { sequelize, tableName: 'detalle_pedidos', timestamps: false }
);