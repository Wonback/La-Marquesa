import { Router } from 'express';
import { insumoController } from '../Controllers/insumoController';
import { authenticateJWT } from '../Middlewares/authMiddlewares';
import { authorizeRoles } from '../Middlewares/roleMiddlewares';

const router = Router();

router.post(
  '/',
  authenticateJWT,
  authorizeRoles('Admin'),
  async (req, res, next) => {
    await insumoController.crearInsumo(req, res, next);
  }
);

router.get(
  '/',
  authenticateJWT,
  async (req, res, next) => {
    await insumoController.listarInsumos(req, res, next);
  }
);

router.get(
  '/:id',
  authenticateJWT,
  async (req, res, next) => {
    await insumoController.obtenerInsumo(req, res, next);
  }
);

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('Admin'),
  async (req, res, next) => {
    await insumoController.actualizarInsumo(req, res, next);
  }
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('Admin'),
  async (req, res, next) => {
    await insumoController.eliminarInsumo(req, res, next);
  }
);

export default router;
