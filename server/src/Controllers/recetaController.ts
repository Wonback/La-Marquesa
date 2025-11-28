import { RequestHandler } from 'express';
import { Receta } from '../Models/Receta';
import { DetalleReceta } from '../Models/DetalleReceta';
import { Producto } from '../Models/Producto';
import { Insumo } from '../Models/Insumo';

// Configuración del Include para que traiga (Receta -> Detalles -> Insumo) y (Receta -> Producto)
const recetaInclude = [
  {
    model: DetalleReceta,
    as: 'detallesReceta',
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
  nombre?: string;
  descripcion?: string;
  // CORRECCIÓN CRÍTICA: Debe llamarse 'detallesReceta' (plural) para coincidir con Angular
  detallesReceta?: DetalleRecetaBody[];
}

const crearReceta: RequestHandler<{}, any, RecetaBody> = async (req, res, next) => {
    try {
      // 1. Extraemos 'detallesReceta' (plural)
      const { producto_id, nombre, descripcion, detallesReceta } = req.body;

      const receta = await Receta.create({ 
        producto_id, 
        nombre, 
        descripcion 
      });

      // 2. Verificamos si llegó el array con el nombre correcto
      if (detallesReceta && detallesReceta.length > 0) {
        for (const det of detallesReceta) {
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

      // 3. Extraemos 'detallesReceta' (plural) también aquí
      const { producto_id, nombre, descripcion, detallesReceta } = req.body;

      await receta.update({
        producto_id,
        nombre,
        descripcion
      });

      // Lógica de DetalleRecetas
      if (detallesReceta) {
        // Borramos los viejos
        await DetalleReceta.destroy({ where: { receta_id: receta.id } });
        
        // Creamos los nuevos
        if (detallesReceta.length > 0) {
            for (const det of detallesReceta) {
            await DetalleReceta.create({
                receta_id: receta.id,
                insumo_id: det.insumo_id,
                cantidad: det.cantidad,
            });
            }
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