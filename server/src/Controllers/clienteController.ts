import { Request, Response, NextFunction } from 'express';
import { Cliente } from '../Models/Cliente';

export const clienteController = {
  listarClientes: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientes = await Cliente.findAll();
      res.json(clientes);
    } catch (err) {
      next(err);
    }
  },

  obtenerCliente: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id);
      if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
      res.json(cliente);
    } catch (err) {
      next(err);
    }
  },

  crearCliente: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nombre, telefono, email } = req.body;
      const nuevoCliente = await Cliente.create({ nombre, telefono, email });
      res.status(201).json(nuevoCliente);
    } catch (err) {
      next(err);
    }
  },

  actualizarCliente: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id);
      if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

      const { nombre, telefono, email } = req.body;
      await cliente.update({ nombre, telefono, email });
      res.json(cliente);
    } catch (err) {
      next(err);
    }
  },

  eliminarCliente: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id);
      if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

      await cliente.destroy();
      res.json({ message: 'Cliente eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  }
};
