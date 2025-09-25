import { Router } from 'express';
import { productoController } from '../Controllers/productosController';
import { authenticateJWT } from '../Middlewares/authMiddlewares';
import { authorizeRoles } from '../Middlewares/roleMiddlewares';

const router = Router();

router.post(
  '/',
  authenticateJWT,
  authorizeRoles('Admin'),
  async (req, res, next) => {
    await productoController.crearProducto(req, res, next);
  }
);

router.get(
  '/',
  authenticateJWT,
  async (req, res, next) => {
    await productoController.listarProductos(req, res, next);
  }
);

router.get(
  '/:id',
  authenticateJWT,
  async (req, res, next) => {
    await productoController.obtenerProducto(req, res, next);
  }
);

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('Admin'),
  async (req, res, next) => {
    await productoController.actualizarProducto(req, res, next);
  }
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('Admin'),
  async (req, res, next) => {
    await productoController.eliminarProducto(req, res, next);
  }
);

export default router;
