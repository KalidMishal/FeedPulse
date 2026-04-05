import { Router } from 'express';
import { login, initAdmin } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/init', initAdmin); // Secret route to init the first admin

export default router;
