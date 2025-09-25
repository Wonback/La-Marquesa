import { Request, Response, NextFunction } from 'express';
import { Producto } from '../Models/Producto';

export const productoController = {
  crearProducto: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nombre, es_elaborado, precio } = req.body;
      const nuevoProducto = await Producto.create({ nombre, es_elaborado, precio });
      res.status(201).json(nuevoProducto);
    } catch (err) {
      next(err);
    }
  },

  listarProductos: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productos = await Producto.findAll();
      res.json(productos);
    } catch (err) {
      next(err);
    }
  },

  obtenerProducto: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
      res.json(producto);
    } catch (err) {
      next(err);
    }
  },

  actualizarProducto: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

      const { nombre, es_elaborado, precio } = req.body;
      await producto.update({ nombre, es_elaborado, precio });

      res.json(producto);
    } catch (err) {
      next(err);
    }
  },

  eliminarProducto: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

      await producto.destroy();
      res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  },
};
