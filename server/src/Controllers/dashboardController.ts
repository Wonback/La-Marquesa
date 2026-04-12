import { Request, Response, NextFunction } from 'express';
import { QueryTypes, literal } from 'sequelize';
import { Cliente } from '../Models/Cliente';
import { Producto } from '../Models/Producto';
import { Pedido } from '../Models/Pedido';
import { DetallePedido } from '../Models/DetallePedido';
import { Insumo } from '../Models/Insumo';
import { sequelize } from '../db';

export const dashboardController = {
  getStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Contadores básicos en paralelo
      const [totalClientes, totalProductos, pedidosPendientes, pedidosEntregados] = await Promise.all([
        Cliente.count(),
        Producto.count(),
        Pedido.count({ where: { estado: ['registrado', 'confirmado', 'en producción', 'listo'] } }),
        Pedido.count({ where: { estado: 'entregado' } }),
      ]);

      // 2. Ingresos totales + ingresos del mes en un solo query
      const [ingresosResult] = await sequelize.query<{ total: string; mes: string }>(
        `SELECT
           COALESCE(SUM(monto), 0) AS total,
           COALESCE(SUM(CASE WHEN DATE_TRUNC('month', fecha) = DATE_TRUNC('month', NOW()) THEN monto ELSE 0 END), 0) AS mes
         FROM cobros`,
        { type: QueryTypes.SELECT }
      );
      const totalIngresos  = Number(ingresosResult?.total || 0);
      const ingresosDelMes = Number(ingresosResult?.mes   || 0);

      // 3. Cobros pendientes: pedidos 'listo' sin cobro registrado
      const [cobrosPendientesResult] = await sequelize.query<{ count: string }>(
        `SELECT COUNT(*)::int AS count
         FROM pedidos p
         LEFT JOIN cobros c ON c.pedido_id = p.id
         WHERE p.estado = 'listo' AND c.id IS NULL`,
        { type: QueryTypes.SELECT }
      );
      const cobrosPendientes = Number(cobrosPendientesResult?.count || 0);

      // 4. Breakdown de pedidos por estado
      const estadosRaw = await sequelize.query<{ estado: string; count: string }>(
        `SELECT estado, COUNT(*)::int AS count FROM pedidos GROUP BY estado`,
        { type: QueryTypes.SELECT }
      );
      const estadosPedidos = estadosRaw.reduce((acc, row) => {
        acc[row.estado] = Number(row.count);
        return acc;
      }, {} as Record<string, number>);

      // 5. Próximas entregas (5 más urgentes con estado activo)
      const recentOrdersRaw = await Pedido.findAll({
        limit: 5,
        order: [['fecha_entrega', 'ASC']],
        where: { estado: ['registrado', 'confirmado', 'en producción', 'listo'] },
        include: [
          { model: Cliente, as: 'cliente' },
          { model: DetallePedido, as: 'detallePedidos' }
        ]
      });
      const recentOrders = recentOrdersRaw.map(p => ({
        id: p.id,
        cliente: p.cliente?.nombre || 'Anónimo',
        total: (p as any).detallePedidos?.reduce((sum: number, d: any) => sum + Number(d.subtotal), 0) ?? 0,
        estado: p.estado,
        fecha: p.fecha_entrega
      }));

      // 6. Top 5 productos más vendidos (GROUP BY en SQL, sin traer todo a memoria)
      const topProductsRaw = await sequelize.query<{ nombre: string; cantidad: string; ingresos: string }>(
        `SELECT p.nombre,
                SUM(dp.cantidad)::int AS cantidad,
                SUM(dp.subtotal)      AS ingresos
         FROM detalle_pedidos dp
         JOIN productos p ON p.id = dp.producto_id
         GROUP BY p.id, p.nombre
         ORDER BY cantidad DESC
         LIMIT 5`,
        { type: QueryTypes.SELECT }
      );
      const topProducts = topProductsRaw.map(p => ({
        nombre:   p.nombre,
        cantidad: Number(p.cantidad),
        ingresos: Number(p.ingresos),
      }));

      // 7. Insumos con stock bajo o agotado
      const insumosStockBajoRaw = await Insumo.findAll({
        where: literal('"stock" <= "stock_minimo"'),
        order: [['stock', 'ASC']],
        attributes: ['id', 'nombre', 'stock', 'stock_minimo', 'unidad_medida'],
      });
      const insumosStockBajo = insumosStockBajoRaw.map(i => ({
        id:            i.id,
        nombre:        i.nombre,
        stock:         i.stock,
        stock_minimo:  i.stock_minimo,
        unidad_medida: i.unidad_medida,
      }));

      res.json({
        totalClientes,
        totalProductos,
        totalIngresos,
        ingresosDelMes,
        pedidosPendientes,
        pedidosEntregados,
        cobrosPendientes,
        estadosPedidos,
        recentOrders,
        topProducts,
        insumosStockBajo,
      });
    } catch (err) {
      next(err);
    }
  }
};
