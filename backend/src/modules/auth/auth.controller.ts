import { Request, Response } from 'express';
import { loginSchema, registerSchema } from './auth.schema';
import { AuthService } from './auth.service';

/** HTTP layer only: parse input, call the service, shape the response. */
export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const input = registerSchema.parse(req.body);
    const user = await this.service.register(input);
    res.status(201).json({ user });
  };

    login = async (req: Request, res: Response): Promise<void> => {
    const input = loginSchema.parse(req.body);
    res.status(200).json(await this.service.login(input));
  };
}