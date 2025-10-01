import { Pedido } from './Pedido';
import { DetallePedido } from './DetallePedido';
import { Producto } from './Producto';
import { Cliente } from './Cliente';
import { Cobro } from './Cobro';
import { DetalleReceta } from './DetalleReceta';
import { Receta } from './Receta';
import { Insumo } from './Insumo';

export function applyAssociations() {
  DetallePedido.belongsTo(Pedido, { foreignKey: 'pedido_id', as: 'pedido' });
  Pedido.hasMany(DetallePedido, { foreignKey: 'pedido_id', as: 'detallePedidos' });

  DetallePedido.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
  Producto.hasMany(DetallePedido, { foreignKey: 'producto_id', as: 'detallesPedido' });

  Pedido.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
  Cliente.hasMany(Pedido, { foreignKey: 'cliente_id', as: 'pedidos' });

  Cobro.belongsTo(Pedido, { foreignKey: 'pedido_id', as: 'pedido' });
  Pedido.hasMany(Cobro, { foreignKey: 'pedido_id', as: 'cobros' });

  DetalleReceta.belongsTo(Receta, { foreignKey: 'receta_id', as: 'receta' });
  Receta.hasMany(DetalleReceta, { foreignKey: 'receta_id', as: 'detallesReceta' });

  DetalleReceta.belongsTo(Insumo, { foreignKey: 'insumo_id', as: 'insumo' });
  Insumo.hasMany(DetalleReceta, { foreignKey: 'insumo_id', as: 'detallesReceta' });

  Receta.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
  Producto.hasOne(Receta, { foreignKey: 'producto_id', as: 'receta' });
}
