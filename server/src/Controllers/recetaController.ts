import { RequestHandler } from 'express';
import { Receta } from '../Models/Receta';
import { DetalleReceta } from '../Models/DetalleReceta';
import { Producto } from '../Models/Producto';
import { Insumo } from '../Models/Insumo';

const recetaInclude = [
  {
    model: DetalleReceta,
    as: 'detallesReceta', // <--- CORRECTO
    include: [{ model: Insumo, as: 'insumo' }],
  },
  { model: Producto, as: 'producto' },
];

interface DetalleRecetaBody {
  insumo_id: number;
  cantidad: number;
}

interface RecetaBody {
  producto_id?: number;
  detalleRecetas?: DetalleRecetaBody[];
}

const crearReceta: RequestHandler<{}, any, RecetaBody> = async (req, res, next) => {
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

      const recetaCompleta = await Receta.findByPk(receta.id, { include: recetaInclude });
      res.status(201).json(recetaCompleta);
    } catch (err) {
      next(err);
    }
  };

const listarRecetas: RequestHandler = async (_req, res, next) => {
    try {
      const recetas = await Receta.findAll({ include: recetaInclude });
      res.json(recetas);
    } catch (err) {
      next(err);
    }
  };

const obtenerReceta: RequestHandler<{ id: string }> = async (req, res, next) => {
    try {
      const receta = await Receta.findByPk(req.params.id, { include: recetaInclude });
      if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });
      res.json(receta);
    } catch (err) {
      next(err);
    }
  };

const actualizarReceta: RequestHandler<{ id: string }, any, RecetaBody> = async (req, res, next) => {
    try {
      const receta = await Receta.findByPk(req.params.id);
      if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });

      const { producto_id, detalleRecetas } = req.body;

      if (producto_id) receta.producto_id = producto_id;
      await receta.save();

      if (detalleRecetas && detalleRecetas.length > 0) {
        await DetalleReceta.destroy({ where: { receta_id: receta.id } });
        for (const det of detalleRecetas) {
          await DetalleReceta.create({
            receta_id: receta.id,
            insumo_id: det.insumo_id,
            cantidad: det.cantidad,
          });
        }
      }

      const recetaActualizada = await Receta.findByPk(receta.id, { include: recetaInclude });
      res.json(recetaActualizada);
    } catch (err) {
      next(err);
    }
  };

const eliminarReceta: RequestHandler<{ id: string }> = async (req, res, next) => {
    try {
      const receta = await Receta.findByPk(req.params.id);
      if (!receta) return res.status(404).json({ message: 'Receta no encontrada' });

      await DetalleReceta.destroy({ where: { receta_id: receta.id } });
      await receta.destroy();

      res.json({ message: 'Receta eliminada correctamente' });
    } catch (err) {
      next(err);
    }
  };

export const recetaController = {
  crearReceta,
  listarRecetas,
  obtenerReceta,
  actualizarReceta,
  eliminarReceta,
};