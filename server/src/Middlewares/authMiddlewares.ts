import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayloadExtended {
  id: number;
  rol: string; // Ventas | Producción | Admin | cualquier rol que tenga Empleado
  nombre?: string;
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayloadExtended;
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};
