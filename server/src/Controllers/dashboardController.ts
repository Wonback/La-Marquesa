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
      // ── 1. Contadores base ────────────────────────────────────────────────
      const [totalClientes, totalProductos, pedidosPendientes, pedidosEntregados] = await Promise.all([
        Cliente.count(),
        Producto.count(),
        Pedido.count({ where: { estado: ['registrado', 'confirmado', 'en producción', 'listo'] } }),
        Pedido.count({ where: { estado: 'entregado' } }),
      ]);

      // ── 2. Ingresos: mes actual, mes anterior, semana actual y anterior ───
      const [ingresosResult] = await sequelize.query<{
        total: string; mes: string; mes_anterior: string;
        semana_actual: string; semana_anterior: string;
      }>(
        `SELECT
           COALESCE(SUM(monto), 0) AS total,
           COALESCE(SUM(CASE WHEN DATE_TRUNC('month', fecha) = DATE_TRUNC('month', NOW()) THEN monto ELSE 0 END), 0) AS mes,
           COALESCE(SUM(CASE WHEN DATE_TRUNC('month', fecha) = DATE_TRUNC('month', NOW()) - INTERVAL '1 month' THEN monto ELSE 0 END), 0) AS mes_anterior,
           COALESCE(SUM(CASE WHEN fecha >= DATE_TRUNC('week', NOW()) THEN monto ELSE 0 END), 0) AS semana_actual,
           COALESCE(SUM(CASE WHEN fecha >= DATE_TRUNC('week', NOW()) - INTERVAL '1 week'
                             AND fecha < DATE_TRUNC('week', NOW()) THEN monto ELSE 0 END), 0) AS semana_anterior
         FROM cobros`,
        { type: QueryTypes.SELECT }
      );
      const totalIngresos        = Number(ingresosResult?.total          || 0);
      const ingresosDelMes       = Number(ingresosResult?.mes            || 0);
      const ingresosMesAnterior  = Number(ingresosResult?.mes_anterior   || 0);
      const ingresosSemanaActual = Number(ingresosResult?.semana_actual  || 0);
      const ingresosSemanaAnterior = Number(ingresosResult?.semana_anterior || 0);

      // ── 3. Ticket promedio del mes ────────────────────────────────────────
      const [ticketResult] = await sequelize.query<{ ticket: string }>(
        `SELECT COALESCE(AVG(monto), 0) AS ticket FROM cobros
         WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', NOW())`,
        { type: QueryTypes.SELECT }
      );
      const ticketPromedio = Number(ticketResult?.ticket || 0);

      // ── 4. Cobros pendientes ──────────────────────────────────────────────
      const [cobrosPendientesResult] = await sequelize.query<{ count: string }>(
        `SELECT COUNT(*)::int AS count FROM pedidos p
         LEFT JOIN cobros c ON c.pedido_id = p.id
         WHERE p.estado = 'listo' AND c.id IS NULL`,
        { type: QueryTypes.SELECT }
      );
      const cobrosPendientes = Number(cobrosPendientesResult?.count || 0);

      // ── 5. Pedidos del mes (via historial) ────────────────────────────────
      const [pedidosMesResult] = await sequelize.query<{ count: string }>(
        `SELECT COUNT(*)::int AS count FROM historial_pedidos
         WHERE estado_nuevo = 'registrado'
         AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', NOW())`,
        { type: QueryTypes.SELECT }
      );
      const pedidosDelMes = Number(pedidosMesResult?.count || 0);

      // ── 6. Tasa de completitud del mes ────────────────────────────────────
      const [tasaResult] = await sequelize.query<{ tasa: string }>(
        `SELECT ROUND(
           COUNT(CASE WHEN p.estado = 'entregado' THEN 1 END)::numeric /
           NULLIF(COUNT(*), 0) * 100, 1
         ) AS tasa
         FROM pedidos p
         JOIN historial_pedidos h ON h.pedido_id = p.id AND h.estado_nuevo = 'registrado'
         WHERE DATE_TRUNC('month', h.fecha) = DATE_TRUNC('month', NOW())`,
        { type: QueryTypes.SELECT }
      );
      const tasaCompletitud = Number(tasaResult?.tasa || 0);

      // ── 7. Tiempo promedio de producción (confirmado → listo, en horas) ──
      const [tiempoResult] = await sequelize.query<{ horas: string }>(
        `SELECT ROUND(AVG(EXTRACT(EPOCH FROM (h2.fecha - h1.fecha)) / 3600)::numeric, 1) AS horas
         FROM historial_pedidos h1
         JOIN historial_pedidos h2 ON h2.pedido_id = h1.pedido_id AND h2.estado_nuevo = 'listo'
         WHERE h1.estado_nuevo = 'confirmado'`,
        { type: QueryTypes.SELECT }
      );
      const tiempoPromedioProduccion = tiempoResult?.horas != null ? Number(tiempoResult.horas) : null;

      // ── 8. Pedidos que vencen hoy y pedidos vencidos ──────────────────────
      const [[hoyResult], [vencidosResult]] = await Promise.all([
        sequelize.query<{ count: string }>(
          `SELECT COUNT(*)::int AS count FROM pedidos
           WHERE fecha_entrega = CURRENT_DATE AND estado NOT IN ('entregado')`,
          { type: QueryTypes.SELECT }
        ),
        sequelize.query<{ count: string }>(
          `SELECT COUNT(*)::int AS count FROM pedidos
           WHERE fecha_entrega < CURRENT_DATE AND estado NOT IN ('entregado')`,
          { type: QueryTypes.SELECT }
        ),
      ]);
      const pedidosVencenHoy = Number(hoyResult?.count || 0);
      const pedidosVencidos  = Number(vencidosResult?.count || 0);

      // ── 9. Breakdown por estado ───────────────────────────────────────────
      const estadosRaw = await sequelize.query<{ estado: string; count: string }>(
        `SELECT estado, COUNT(*)::int AS count FROM pedidos GROUP BY estado`,
        { type: QueryTypes.SELECT }
      );
      const estadosPedidos = estadosRaw.reduce((acc, row) => {
        acc[row.estado] = Number(row.count);
        return acc;
      }, {} as Record<string, number>);

      // ── 10. Próximas entregas (5 más urgentes) ────────────────────────────
      const recentOrdersRaw = await Pedido.findAll({
        limit: 5,
        order: [['fecha_entrega', 'ASC']],
        where: { estado: ['registrado', 'confirmado', 'en producción', 'listo'] },
        include: [
          { model: Cliente, as: 'cliente' },
          { model: DetallePedido, as: 'detallePedidos' },
        ],
      });
      const recentOrders = recentOrdersRaw.map(p => ({
        id: p.id,
        cliente: p.cliente?.nombre || 'Eventual',
        total: (p as any).detallePedidos?.reduce((sum: number, d: any) => sum + Number(d.subtotal), 0) ?? 0,
        estado: p.estado,
        fecha: p.fecha_entrega,
      }));

      // ── 11. Top 5 productos más vendidos (mes, año, histórico) ──────────────
      const topProductsQuery = (filtro: string) => `
        SELECT p.nombre,
               SUM(dp.cantidad)::int AS cantidad,
               SUM(dp.subtotal)      AS ingresos
        FROM detalle_pedidos dp
        JOIN productos p ON p.id = dp.producto_id
        JOIN pedidos pe ON pe.id = dp.pedido_id
        ${filtro}
        GROUP BY p.id, p.nombre
        ORDER BY cantidad DESC
        LIMIT 5`;

      const [topMesRaw, topAnoRaw, topHistoricoRaw] = await Promise.all([
        sequelize.query<{ nombre: string; cantidad: string; ingresos: string }>(
          topProductsQuery(`WHERE DATE_TRUNC('month', pe.fecha_entrega) = DATE_TRUNC('month', NOW())`),
          { type: QueryTypes.SELECT }
        ),
        sequelize.query<{ nombre: string; cantidad: string; ingresos: string }>(
          topProductsQuery(`WHERE DATE_TRUNC('year', pe.fecha_entrega) = DATE_TRUNC('year', NOW())`),
          { type: QueryTypes.SELECT }
        ),
        sequelize.query<{ nombre: string; cantidad: string; ingresos: string }>(
          topProductsQuery(''),
          { type: QueryTypes.SELECT }
        ),
      ]);

      const mapTop = (rows: { nombre: string; cantidad: string; ingresos: string }[]) =>
        rows.map(p => ({ nombre: p.nombre, cantidad: Number(p.cantidad), ingresos: Number(p.ingresos) }));

      const topProducts       = mapTop(topHistoricoRaw); // backward compat
      const topProductsMes    = mapTop(topMesRaw);
      const topProductsAno    = mapTop(topAnoRaw);
      const topProductsHistorico = mapTop(topHistoricoRaw);

      // ── 12. Clientes más frecuentes (top 5) ───────────────────────────────
      const clientesFrecuentesRaw = await sequelize.query<{
        nombre: string; total_pedidos: string; ingresos: string;
      }>(
        `SELECT c.nombre,
                COUNT(p.id)::int AS total_pedidos,
                COALESCE(SUM(co.monto), 0) AS ingresos
         FROM clientes c
         JOIN pedidos p ON p.cliente_id = c.id
         LEFT JOIN cobros co ON co.pedido_id = p.id
         GROUP BY c.id, c.nombre
         ORDER BY total_pedidos DESC
         LIMIT 5`,
        { type: QueryTypes.SELECT }
      );
      const clientesFrecuentes = clientesFrecuentesRaw.map(c => ({
        nombre: c.nombre,
        totalPedidos: Number(c.total_pedidos),
        ingresos: Number(c.ingresos),
      }));

      // ── 13. Pedidos en estado 'listo' sin cobrar ──────────────────────────
      const pedidosSinCobrarRaw = await sequelize.query<{
        id: string; cliente: string; monto_estimado: string;
      }>(
        `SELECT p.id,
                COALESCE(c.nombre, 'Eventual') AS cliente,
                COALESCE(SUM(dp.subtotal), 0) AS monto_estimado
         FROM pedidos p
         LEFT JOIN cobros co ON co.pedido_id = p.id
         LEFT JOIN clientes c ON c.id = p.cliente_id
         LEFT JOIN detalle_pedidos dp ON dp.pedido_id = p.id
         WHERE p.estado = 'listo' AND co.id IS NULL
         GROUP BY p.id, c.nombre`,
        { type: QueryTypes.SELECT }
      );
      const pedidosSinCobrar = pedidosSinCobrarRaw.map(p => ({
        id: Number(p.id),
        cliente: p.cliente,
        montoEstimado: Number(p.monto_estimado),
      }));

      // ── 14. Insumos con stock bajo ────────────────────────────────────────
      const insumosStockBajoRaw = await Insumo.findAll({
        where: literal('"stock" <= "stock_minimo"'),
        order: [['stock', 'ASC']],
        attributes: ['id', 'nombre', 'stock', 'stock_minimo', 'unidad_medida'],
      });
      const insumosStockBajo = insumosStockBajoRaw.map(i => ({
        id: i.id,
        nombre: i.nombre,
        stock: i.stock,
        stock_minimo: i.stock_minimo,
        unidad_medida: i.unidad_medida,
      }));

      // ── 15. Ingresos por mes (últimos 12 meses) ───────────────────────────
      const ingresosPorMesRaw = await sequelize.query<{
        mes: string; ingresos: string; cantidad: string;
      }>(
        `SELECT TO_CHAR(DATE_TRUNC('month', fecha), 'YYYY-MM') AS mes,
                COALESCE(SUM(monto), 0) AS ingresos,
                COUNT(*)::int AS cantidad
         FROM cobros
         WHERE fecha >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
         GROUP BY DATE_TRUNC('month', fecha)
         ORDER BY mes ASC`,
        { type: QueryTypes.SELECT }
      );
      const ingresosPorMes = ingresosPorMesRaw.map(r => ({
        mes: r.mes,
        ingresos: Number(r.ingresos),
        cantidad: Number(r.cantidad),
      }));

      // ── 16. Pedidos creados por día (últimos 30 días, via historial) ──────
      const pedidosPorDiaRaw = await sequelize.query<{ dia: string; cantidad: string }>(
        `SELECT DATE(fecha)::text AS dia, COUNT(*)::int AS cantidad
         FROM historial_pedidos
         WHERE estado_nuevo = 'registrado'
         AND fecha >= NOW() - INTERVAL '30 days'
         GROUP BY DATE(fecha)
         ORDER BY dia ASC`,
        { type: QueryTypes.SELECT }
      );
      const pedidosPorDia = pedidosPorDiaRaw.map(r => ({
        dia: r.dia,
        cantidad: Number(r.cantidad),
      }));

      res.json({
        // Existentes
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
        topProductsMes,
        topProductsAno,
        topProductsHistorico,
        insumosStockBajo,
        // Nuevos
        ingresosMesAnterior,
        ingresosSemanaActual,
        ingresosSemanaAnterior,
        ticketPromedio,
        pedidosDelMes,
        tasaCompletitud,
        tiempoPromedioProduccion,
        pedidosVencenHoy,
        pedidosVencidos,
        clientesFrecuentes,
        pedidosSinCobrar,
        ingresosPorMes,
        pedidosPorDia,
      });
    } catch (err) {
      next(err);
    }
  },
};
