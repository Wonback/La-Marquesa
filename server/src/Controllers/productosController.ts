import { RequestHandler } from 'express';
import { Producto } from '../Models/Producto';
import { Receta } from '../Models/Receta';
import { DetalleReceta } from '../Models/DetalleReceta';
import { Insumo } from '../Models/Insumo';

const productoInclude = [
  {
    model: Receta,
    as: 'receta',
    include: [
      // CORRECCIÓN AQUÍ: 'detallesReceta'
      { model: DetalleReceta, as: 'detallesReceta', include: [{ model: Insumo, as: 'insumo' }] },
    ],
  },
];

interface ProductoBody {
  nombre: string;
  es_elaborado: boolean;
  precio: number;
  receta?: { insumo_id: number; cantidad: number }[]; 
}

const crearProducto: RequestHandler<{}, any, ProductoBody> = async (req, res, next) => {
    try {
      const { nombre, es_elaborado, precio, receta } = req.body;

      const nuevoProducto = await Producto.create({ nombre, es_elaborado, precio });

      if (es_elaborado && receta && receta.length > 0) {
        const nuevaReceta = await Receta.create({ producto_id: nuevoProducto.id });
        for (const item of receta) {
          await DetalleReceta.create({
            receta_id: nuevaReceta.id,
            insumo_id: item.insumo_id,
            cantidad: item.cantidad,
          });
        }
      }

      const productoConReceta = await Producto.findByPk(nuevoProducto.id, { include: productoInclude });
      res.status(201).json(productoConReceta);
    } catch (err) {
      next(err);
    }
  };

const listarProductos: RequestHandler = async (_req, res, next) => {
    try {
      const productos = await Producto.findAll({ include: productoInclude });
      res.json(productos);
    } catch (err) {
      next(err);
    }
  };

const obtenerProducto: RequestHandler<{ id: string }> = async (req, res, next) => {
    try {
      const producto = await Producto.findByPk(req.params.id, { include: productoInclude });
      if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
      res.json(producto);
    } catch (err) {
      next(err);
    }
  };

const actualizarProducto: RequestHandler<{ id: string }, any, Partial<ProductoBody>> = async (req, res, next) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

      const { nombre, es_elaborado, precio, receta } = req.body;
      await producto.update({ nombre, es_elaborado, precio });

      // Actualizamos receta si es producto elaborado
      if (es_elaborado && receta) {
        let rec = await Receta.findOne({ where: { producto_id: producto.id } });
        if (!rec) rec = await Receta.create({ producto_id: producto.id });

        // Borramos detalles anteriores y agregamos los nuevos
        await DetalleReceta.destroy({ where: { receta_id: rec.id } });
        for (const item of receta) {
          await DetalleReceta.create({
            receta_id: rec.id,
            insumo_id: item.insumo_id,
            cantidad: item.cantidad,
          });
        }
      }

      const productoConReceta = await Producto.findByPk(producto.id, { include: productoInclude });
      res.json(productoConReceta);
    } catch (err) {
      next(err);
    }
  };

const eliminarProducto: RequestHandler<{ id: string }> = async (req, res, next) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

      const rec = await Receta.findOne({ where: { producto_id: producto.id } });
      if (rec) {
        await DetalleReceta.destroy({ where: { receta_id: rec.id } });
        await rec.destroy();
      }

      await producto.destroy();
      res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  };

export const productoController = {
  crearProducto,
  listarProductos,
  obtenerProducto,
  actualizarProducto,
  eliminarProducto,
};