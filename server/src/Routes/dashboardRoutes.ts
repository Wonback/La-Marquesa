import { Router } from 'express';
import { dashboardController } from '../Controllers/dashboardController';
import { authenticateJWT } from '../Middlewares/authMiddlewares';

const router = Router();

router.get('/stats', authenticateJWT, dashboardController.getStats);

export default router;
