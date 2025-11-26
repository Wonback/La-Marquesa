import { Router } from 'express';
import { dashboardController } from '../Controllers/dashboardController';

const router = Router();

router.get('/stats', dashboardController.getStats);

export default router;
