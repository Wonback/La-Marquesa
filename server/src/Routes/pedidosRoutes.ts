import { Router } from 'express';
import { pedidoController } from '../Controllers/pedidoController';
import { authenticateJWT } from '../Middlewares/authMiddlewares';
import { authorizeRoles } from '../Middlewares/roleMiddlewares';

const router = Router();

router.post(
  '/',
  authenticateJWT,
  authorizeRoles('Ventas', 'Admin'),
  async (req, res, next) => {
    await pedidoController.crearPedido(req, res, next);
  }
);

router.get(
  '/',
  authenticateJWT,
  async (req, res, next) => {
    await pedidoController.listarPedidos(req, res, next);
  }
);

router.get(
  '/:id',
  authenticateJWT,
  async (req, res, next) => {
    await pedidoController.obtenerPedido(req, res, next);
  }
);

router.put(
  '/:id', 
  authenticateJWT,
  authorizeRoles('Ventas', 'Admin'), 
  async (req, res, next) => {
    await pedidoController.actualizarPedido(req, res, next);
  }
);

router.put(
  '/:id/confirmar',
  authenticateJWT,
  authorizeRoles('Ventas', 'Admin'),
  async (req, res, next) => {
    await pedidoController.confirmarPedido(req, res, next);
  }
);

router.put(
  '/:id/estado',
  authenticateJWT,
  async (req, res, next) => {
    await pedidoController.actualizarEstado(req, res, next);
  }
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('Admin'),
  async (req, res, next) => {
    await pedidoController.eliminarPedido(req, res, next);
  }
);

export default router;
