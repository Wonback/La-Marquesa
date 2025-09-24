import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Usuario } from '../Models/Usuario';
import bcrypt from 'bcrypt';

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nombre, email, password } = req.body;

      if (!nombre || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
      }

      const existe = await Usuario.findOne({ where: { email } });
      if (existe) return res.status(400).json({ message: 'Email ya registrado' });

      const nuevoUsuario = await Usuario.create({ nombre, email, password });
      res.status(201).json({ message: 'Usuario registrado', usuario: { id: nuevoUsuario.id, nombre, email } });
    } catch (err) {
      next(err);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ message: 'Email y contraseña son obligatorios' });

      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

      const valido = usuario.validarPassword(password);
      if (!valido) return res.status(401).json({ message: 'Contraseña incorrecta' });

      const token = jwt.sign(
        { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
        process.env.JWT_SECRET as string,
        { expiresIn: '8h' }
      );

      res.json({ message: 'Login exitoso', token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
    } catch (err) {
      next(err);
    }
  }
};
