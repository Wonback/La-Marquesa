import { Request, Response, NextFunction } from 'express';
import { Receta } from '../Models/Receta';
import { DetalleReceta } from '../Models/DetalleReceta';
import { Producto } from '../Models/Producto';
import { Insumo } from '../Models/Insumo';

export const recetaController = {
  // Crear receta con sus detalles
  crearReceta: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { producto_id, detalleRecetas } = req.body;

      const receta = await Receta.create({ producto_id });

      if (detalleRecetas && detalleRecetas.length > 0) {
        for (const det of detalleRecetas) {
          await DetalleReceta.create({
            receta_id: receta.id,
            insumo_id: det.insumo_id,
            cantidad: det.cantidad,
          });
        }
      }

      const recetaCompleta = await Receta.findByPk(receta.id, {
        include: [
          { model: DetalleReceta, as: 'detalleRecetas', include: [Insumo] },
          { model: Producto },
        ],
      });

      res.status(201).json(recetaCompleta);
    } catch (err) {
      next(err);
    }
  },

  // Listar todas las recetas
  listarRecetas: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recetas = await Receta.findAll({
        include: [
          { model: DetalleReceta, as: 'detalleRecetas', include: [Insumo] },
          { model: Producto },
        ],
      });
      res.json(recetas);
    } catch (err) {
      next(err);
    }
  },

  // Obtener una receta específica
  obtenerReceta: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const receta = await Receta.findByPk(req.params.id, {
        include: [
          { model: DetalleReceta, as: 'detalleRecetas', include: [Insumo] },
          { model: Producto },
        ],
      });
      if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });
      res.json(receta);
    } catch (err) {
      next(err);
    }
  },

  // Actualizar receta (incluye detalles)
  actualizarReceta: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const receta = await Receta.findByPk(req.params.id);
      if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });

      const { producto_id, detalleRecetas } = req.body;

      // actualizar el producto asociado si lo mandan
      if (producto_id) receta.producto_id = producto_id;
      await receta.save();

      if (detalleRecetas && detalleRecetas.length > 0) {
        // borrar detalles anteriores y recrearlos
        await DetalleReceta.destroy({ where: { receta_id: receta.id } });
        for (const det of detalleRecetas) {
          await DetalleReceta.create({
            receta_id: receta.id,
            insumo_id: det.insumo_id,
            cantidad: det.cantidad,
          });
        }
      }

      const recetaActualizada = await Receta.findByPk(receta.id, {
        include: [
          { model: DetalleReceta, as: 'detalleRecetas', include: [Insumo] },
          { model: Producto },
        ],
      });

      res.json(recetaActualizada);
    } catch (err) {
      next(err);
    }
  },

  // Eliminar receta
  eliminarReceta: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const receta = await Receta.findByPk(req.params.id);
      if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });

      await receta.destroy();
      res.json({ message: 'Receta eliminada correctamente' });
    } catch (err) {
      next(err);
    }
  },
};
