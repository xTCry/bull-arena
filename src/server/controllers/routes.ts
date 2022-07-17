import { Router } from 'express';

import apiRoutes from './api';
import dashboardRoutes from './dashboard';

const router = Router();

router.use('/api', apiRoutes);
router.use('/', dashboardRoutes);

export default router;
