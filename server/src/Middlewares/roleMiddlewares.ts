import { Request, Response, NextFunction } from 'express';
import { JwtPayloadExtended } from './authMiddlewares';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user: JwtPayloadExtended = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (!allowedRoles.includes(user.rol)) {
      return res.status(403).json({ message: 'No tienes permiso para acceder a este recurso' });
    }

    next();
  };
};
