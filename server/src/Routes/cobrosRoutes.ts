import { Router } from 'express';
import { cobroController } from '../Controllers/cobrosController';
import { authenticateJWT } from '../Middlewares/authMiddlewares';
import { authorizeRoles } from '../Middlewares/roleMiddlewares';

const router = Router();

router.post(
  '/',
  authenticateJWT,
  authorizeRoles('Ventas', 'Admin'),
  async (req, res, next) => {
    await cobroController.crearCobro(req, res, next);
  }
);

router.get(
  '/',
  authenticateJWT,
  async (req, res, next) => {
    await cobroController.listarCobros(req, res, next);
  }
);

router.get(
  '/:id',
  authenticateJWT,
  async (req, res, next) => {
    await cobroController.obtenerCobro(req, res, next);
  }
);

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('Ventas', 'Admin'),
  async (req, res, next) => {
    await cobroController.actualizarCobro(req, res, next);
  }
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('Admin'),
  async (req, res, next) => {
    await cobroController.eliminarCobro(req, res, next);
  }
);

export default router;
