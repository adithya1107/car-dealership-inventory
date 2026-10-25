import { Request, Response } from 'express';
import { VehicleService } from './vehicle.service';
import { createVehicleSchema, listQuerySchema } from './vehicle.schema';

export class VehicleController {
  constructor(private readonly service: VehicleService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const vehicle = await this.service.create(createVehicleSchema.parse(req.body));
    res.status(201).json(vehicle);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.service.find(listQuerySchema.parse(req.query)));
  };
}