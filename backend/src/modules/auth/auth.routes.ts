import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const router = Router();
const controller = new AuthController(new AuthService());

router.post('/register', controller.register);
router.post('/login', controller.login);

export { router as authRouter };