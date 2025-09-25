import { Router } from 'express';
import { recetaController } from '../Controllers/recetaController';
import { authenticateJWT } from '../Middlewares/authMiddlewares';
import { authorizeRoles } from '../Middlewares/roleMiddlewares';

const router = Router();

router.post(
  '/',
  authenticateJWT,
  authorizeRoles('Admin'),
  async (req, res, next) => {
    await recetaController.crearReceta(req, res, next);
  }
);

router.get(
  '/',
  authenticateJWT,
  async (req, res, next) => {
    await recetaController.listarRecetas(req, res, next);
  }
);

router.get(
  '/:id',
  authenticateJWT,
  async (req, res, next) => {
    await recetaController.obtenerReceta(req, res, next);
  }
);

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('Admin'),
  async (req, res, next) => {
    await recetaController.actualizarReceta(req, res, next);
  }
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('Admin'),
  async (req, res, next) => {
    await recetaController.eliminarReceta(req, res, next);
  }
);

export default router;
