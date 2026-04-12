import { Router } from 'express';
import { authController } from '../Controllers/authController';
import { authenticateJWT } from '../Middlewares/authMiddlewares';
import { isAdmin } from '../Middlewares/isAdmin';

const router = Router();

router.post('/register', authenticateJWT, isAdmin, async (req, res, next) => {
  await authController.register(req, res, next);
});

router.post('/login', async (req, res, next) => {
  await authController.login(req, res, next);
});

export default router;
