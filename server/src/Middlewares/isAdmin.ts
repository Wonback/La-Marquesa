import { Request, Response, NextFunction } from 'express';
import { JwtPayloadExtended } from './authMiddlewares';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user: JwtPayloadExtended = (req as any).user;

  if (!user) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  if (user.rol !== 'Admin') {
    return res.status(403).json({ message: 'No tienes permisos de administrador' });
  }

  next();
};
