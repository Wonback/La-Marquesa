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
      { model: DetalleReceta, as: 'detallesReceta', include: [{ model: Insumo, as: 'insumo' }] },
    ],
  },
];

// 1. CORRECCIÓN: Agregamos descripcion y stock a la interfaz
interface ProductoBody {
  nombre: string;
  es_elaborado: boolean;
  precio: number;
  descripcion?: string; 
  stock?: number;
  receta?: { insumo_id: number; cantidad: number }[]; 
}

const crearProducto: RequestHandler<{}, any, ProductoBody> = async (req, res, next) => {
    try {
      // 2. CORRECCIÓN: Extraemos descripcion y stock del body
      const { nombre, es_elaborado, precio, descripcion, stock, receta } = req.body;

      // 3. CORRECCIÓN: Los pasamos al create
      const nuevoProducto = await Producto.create({ 
        nombre, 
        es_elaborado, 
        precio, 
        descripcion, 
        stock 
      });

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

      const { nombre, es_elaborado, precio, descripcion, stock, receta } = req.body;

      // Para productos elaborados, el stock se gestiona vía /producir y confirmación de pedidos
      const nuevoStock = producto.es_elaborado ? producto.stock : (stock ?? producto.stock);
      await producto.update({ nombre, es_elaborado, precio, descripcion, stock: nuevoStock });

      // Actualizar receta si es producto elaborado
      if (es_elaborado && receta) {
        let rec = await Receta.findOne({ where: { producto_id: producto.id } });
        if (!rec) rec = await Receta.create({ producto_id: producto.id });

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

const registrarProduccion: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const { cantidad } = req.body;

    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ message: 'La cantidad a producir debe ser mayor a 0' });
    }

    const producto = await Producto.findByPk(req.params.id, { include: productoInclude });
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

    if (!producto.es_elaborado) {
      return res.status(400).json({ message: 'Este producto no es elaborado y no requiere producción' });
    }

    if (!producto.receta?.detallesReceta || producto.receta.detallesReceta.length === 0) {
      return res.status(400).json({ message: 'El producto no tiene receta configurada' });
    }

    // Verificar stock de insumos
    for (const dr of producto.receta.detallesReceta) {
      const insumo = dr.insumo!;
      const cantidadNecesaria = dr.cantidad * cantidad;
      if (insumo.stock < cantidadNecesaria) {
        return res.status(400).json({
          message: `Stock insuficiente de '${insumo.nombre}'. Disponible: ${insumo.stock} ${insumo.unidad_medida}, necesario: ${cantidadNecesaria} ${insumo.unidad_medida}`,
        });
      }
    }

    // Descontar insumos y aumentar stock del producto
    for (const dr of producto.receta.detallesReceta) {
      const insumo = dr.insumo!;
      insumo.stock -= dr.cantidad * cantidad;
      await insumo.save();
    }

    producto.stock += cantidad;
    await producto.save();

    const productoActualizado = await Producto.findByPk(producto.id, { include: productoInclude });
    res.json({ message: `Producción registrada: +${cantidad} unidades de ${producto.nombre}`, producto: productoActualizado });
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
  registrarProduccion,
};