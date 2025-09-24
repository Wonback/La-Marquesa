import { Router } from 'express';
import { clienteController } from '../Controllers/clienteController';
import { authenticateJWT } from '../Middlewares/authMiddlewares';
import { isAdmin } from '../Middlewares/isAdmin';  
const router = Router();

// Listar clientes → Ventas y Admin
router.get('/', authenticateJWT, async (req, res, next) => {
  await clienteController.listarClientes(req, res, next);
});

// Obtener cliente por ID → Ventas y Admin
router.get('/:id', authenticateJWT, async (req, res, next) => {
  await clienteController.obtenerCliente(req, res, next);
});

// Crear cliente → Ventas y Admin
router.post('/', authenticateJWT, async (req, res, next) => {
  await clienteController.crearCliente(req, res, next);
});

// Actualizar cliente → Ventas y Admin
router.put('/:id', authenticateJWT, async (req, res, next) => {
  await clienteController.actualizarCliente(req, res, next);
});

// Eliminar cliente → solo Admin
router.delete('/:id', authenticateJWT, isAdmin, async (req, res, next) => {
  await clienteController.eliminarCliente(req, res, next);
});

export default router;
