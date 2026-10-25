import { NotFoundError } from '../errors/AppError';

const OBJECT_ID = /^[a-f\d]{24}$/i;

/** Returns the id if it is a valid MongoDB ObjectId, otherwise throws a 404.
 *  Prisma would otherwise throw "Malformed ObjectID" and produce a 500. */
export function parseObjectId(id: string, resource = 'Resource'): string {
  if (!OBJECT_ID.test(id)) throw new NotFoundError(`${resource} not found`);
  return id;
}