import { Request, Response } from 'express';
import { VehicleService } from './vehicle.service';
import {
  createVehicleSchema,
  listQuerySchema,
  purchaseSchema,
  restockSchema,
  searchQuerySchema,
  updateVehicleSchema,
} from './vehicle.schema';
import { parseObjectId } from '../../../lib/objectId';

export class VehicleController {
  constructor(private readonly service: VehicleService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const vehicle = await this.service.create(createVehicleSchema.parse(req.body));
    res.status(201).json(vehicle);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.service.find(listQuerySchema.parse(req.query)));
  };

  update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = parseObjectId(req.params.id, 'Vehicle');
    const vehicle = await this.service.update(id, updateVehicleSchema.parse(req.body));
    res.json(vehicle);
  };

  remove = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    await this.service.remove(parseObjectId(req.params.id, 'Vehicle'));
    res.status(204).send();
  };

  search = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.service.find(searchQuerySchema.parse(req.query)));
  };

  purchase = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = parseObjectId(req.params.id, 'Vehicle');
    const { quantity } = purchaseSchema.parse(req.body ?? {});
    res.json(await this.service.purchase(id, quantity));
  };

  restock = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = parseObjectId(req.params.id, 'Vehicle');
    const { quantity } = restockSchema.parse(req.body);
    res.json(await this.service.restock(id, quantity));
  };
}