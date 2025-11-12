import { Router } from 'express';
import { recetaController } from '../Controllers/recetaController';
import { authenticateJWT } from '../Middlewares/authMiddlewares';
import { authorizeRoles } from '../Middlewares/roleMiddlewares';

const router = Router();

router.post('/', authenticateJWT, authorizeRoles('Admin'), recetaController.crearReceta);

router.get('/', authenticateJWT, recetaController.listarRecetas);

router.get('/:id', authenticateJWT, recetaController.obtenerReceta);

router.put('/:id', authenticateJWT, authorizeRoles('Admin'), recetaController.actualizarReceta);

router.delete('/:id', authenticateJWT, authorizeRoles('Admin'), recetaController.eliminarReceta);

export default router;
