import { Router } from 'express';
import { productoController } from '../Controllers/productosController';
import { authenticateJWT } from '../Middlewares/authMiddlewares';
import { authorizeRoles } from '../Middlewares/roleMiddlewares';

const router = Router();

router.post('/', authenticateJWT, authorizeRoles('Admin'), productoController.crearProducto);

router.get('/', authenticateJWT, productoController.listarProductos);

router.get('/:id', authenticateJWT, productoController.obtenerProducto);

router.put('/:id', authenticateJWT, authorizeRoles('Admin'), productoController.actualizarProducto);

router.delete('/:id', authenticateJWT, authorizeRoles('Admin'), productoController.eliminarProducto);

export default router;
