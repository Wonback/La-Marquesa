import { Router } from 'express';
import { pedidoController } from '../Controllers/pedidoController';
import { authenticateJWT } from '../Middlewares/authMiddlewares';
import { authorizeRoles } from '../Middlewares/roleMiddlewares';

const router = Router();

// Crear pedido → solo Ventas o Admin
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('Ventas', 'Admin'),
  async (req, res, next) => {
    await pedidoController.crearPedido(req, res, next);
  }
);

// Listar todos los pedidos → cualquier usuario autenticado
router.get(
  '/',
  authenticateJWT,
  async (req, res, next) => {
    await pedidoController.listarPedidos(req, res, next);
  }
);

// Obtener pedido por id → cualquier usuario autenticado
router.get(
  '/:id',
  authenticateJWT,
  async (req, res, next) => {
    await pedidoController.obtenerPedido(req, res, next);
  }
);

// Actualizar estado del pedido → Producción o Admin
router.put(
  '/:id/estado',
  authenticateJWT,
  authorizeRoles('Producción', 'Admin'),
  async (req, res, next) => {
    await pedidoController.actualizarEstado(req, res, next);
  }
);

// Eliminar pedido → solo Admin
router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('Admin'),
  async (req, res, next) => {
    await pedidoController.eliminarPedido(req, res, next);
  }
);

export default router;
