import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate';
import { requireRole } from '../../..//middleware/requireRole';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

const router = Router();
const controller = new VehicleController(new VehicleService());
const adminOnly = requireRole('ADMIN');

router.use(authenticate); // every vehicle route requires a valid token

router.get('/', controller.list);
router.post('/', adminOnly, controller.create);

export { router as vehicleRouter };