import { Request, Response, NextFunction } from 'express';
import { Cliente } from '../Models/Cliente';
import { Producto } from '../Models/Producto';
import { Pedido } from '../Models/Pedido';
import { Cobro } from '../Models/Cobro';
import { DetallePedido } from '../Models/DetallePedido';
import { sequelize } from '../db';

export const dashboardController = {
  getStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Contadores Básicos
      const totalClientes = await Cliente.count();
      const totalProductos = await Producto.count();
      const totalPedidos = await Pedido.count();
      
      const cobros = await Cobro.findAll();
      const totalIngresos = cobros.reduce((sum, cobro) => sum + Number(cobro.monto), 0);

      const pedidosPendientes = await Pedido.count({ where: { estado: 'registrado' } }); // Ojo con los nombres de estados
      const pedidosEntregados = await Pedido.count({ where: { estado: 'entregado' } });

      // 2. Pedidos Recientes (Últimos 5)
      const recentOrdersRaw = await Pedido.findAll({
        limit: 5,
        order: [['fecha_entrega', 'ASC']], // Los próximos a entregar
        where: { estado: ['registrado', 'confirmado', 'en producción'] }, // Solo activos
        include: [{ model: Cliente, as: 'cliente' }]
      });

      const recentOrders = recentOrdersRaw.map(p => ({
        id: p.id,
        cliente: p.cliente?.nombre || 'Anónimo',
        total: 0, // Aquí podrías sumar los detalles si tuvieras el total en la tabla
        estado: p.estado,
        fecha: p.fecha_entrega
      }));

      // 3. Productos Top (Más vendidos) - Consulta compleja simplificada
      // Traemos todos los detalles y calculamos en memoria (más seguro si no eres experto en SQL raw)
      const detalles = await DetallePedido.findAll({
        include: [{ model: Producto, as: 'producto' }]
      });

      const productMap = new Map<string, { nombre: string, cantidad: number, ingresos: number }>();

      detalles.forEach(d => {
        if (!d.producto) return;
        const current = productMap.get(d.producto.nombre) || { nombre: d.producto.nombre, cantidad: 0, ingresos: 0 };
        current.cantidad += d.cantidad;
        current.ingresos += Number(d.subtotal);
        productMap.set(d.producto.nombre, current);
      });

      // Convertir a array, ordenar por cantidad y tomar los top 5
      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      res.json({
        totalClientes,
        totalProductos,
        totalPedidos,
        totalIngresos,
        pedidosPendientes,
        pedidosEntregados,
        recentOrders, // <--- AGREGADO
        topProducts   // <--- AGREGADO
      });
    } catch (err) {
      next(err);
    }
  }
};