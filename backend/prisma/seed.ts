import 'dotenv/config';
import { hashPassword } from '../src/lib/password';
import { prisma } from '../src/lib/prisma';

const vehicles = [
  { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 2_400_000, quantity: 8 },
  { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 3_500_000, quantity: 5 },
  { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 2_900_000, quantity: 3 },
  { make: 'Honda', model: 'Civic', category: 'Sedan', price: 2_600_000, quantity: 6 },
  { make: 'Honda', model: 'CR-V', category: 'SUV', price: 3_300_000, quantity: 4 },
  { make: 'Honda', model: 'Fit', category: 'Hatchback', price: 1_700_000, quantity: 0 },
  { make: 'Ford', model: 'F-150', category: 'Truck', price: 4_500_000, quantity: 4 },
  { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 4_200_000, quantity: 2 },
  { make: 'Tesla', model: 'Model 3', category: 'Electric', price: 4_000_000, quantity: 3 },
  { make: 'Tesla', model: 'Model Y', category: 'Electric', price: 4_800_000, quantity: 0 },
  { make: 'BMW', model: '3 Series', category: 'Sedan', price: 4_600_000, quantity: 2 },
  { make: 'BMW', model: 'X5', category: 'SUV', price: 6_500_000, quantity: 1 },
  { make: 'Hyundai', model: 'Tucson', category: 'SUV', price: 2_900_000, quantity: 7 },
  { make: 'Hyundai', model: 'i20', category: 'Hatchback', price: 1_300_000, quantity: 9 },
  { make: 'Mazda', model: 'MX-5', category: 'Convertible', price: 3_200_000, quantity: 1 },
];

async function main(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@dealership.test').toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'Admin123!';

  await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN' },
    create: { email, passwordHash: await hashPassword(password), role: 'ADMIN' },
  });

  // Only seed vehicles into an empty table, so re-running is safe.
  if ((await prisma.vehicle.count()) === 0) {
    await prisma.vehicle.createMany({ data: vehicles });
  }

  console.log(`Seeded. Admin login: ${email} / ${password}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());