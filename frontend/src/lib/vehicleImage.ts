export const DEFAULT_VEHICLE_IMAGE = '/images/cars/default.svg';

const SUV = '/images/cars/suv.jpg';
const COUPE = '/images/cars/coupe.jpg';
const ELECTRIC = '/images/cars/electric.jpg';

/** Vehicles have no image field, so a photo is chosen by category. */
const BY_CATEGORY: Record<string, string> = {
  sedan: '/images/cars/sedan.png',
  hatchback: '/images/cars/hatchback.png',
  suv: SUV,
  crossover: SUV,
  minivan: SUV,
  coupe: COUPE,
  convertible: COUPE,
  truck: '/images/cars/truck.jpg',
  electric: ELECTRIC,
  hybrid: ELECTRIC,
};

export const getVehicleImage = (category: string): string =>
  BY_CATEGORY[category.trim().toLowerCase()] ?? DEFAULT_VEHICLE_IMAGE;