import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Vehicle } from '../../api/types';
import { VehicleCard } from './VehicleCard';

const vehicle: Vehicle = {
  id: 'v1',
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  price: 2_400_000,
  quantity: 3,
  createdAt: '',
  updatedAt: '',
};

function setup(overrides: Partial<React.ComponentProps<typeof VehicleCard>> = {}) {
  const handlers = { onPurchase: vi.fn(), onEdit: vi.fn(), onRestock: vi.fn(), onDelete: vi.fn() };
  render(<VehicleCard vehicle={vehicle} isAdmin={false} {...handlers} {...overrides} />);
  return handlers;
}

describe('VehicleCard', () => {
  it('shows the name, formatted price and stock', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Toyota Corolla' })).toBeInTheDocument();
    expect(screen.getByText('$24,000')).toBeInTheDocument();
    expect(screen.getByText(/3 in stock/i)).toBeInTheDocument();
  });

  it('calls onPurchase with the vehicle when Purchase is clicked', async () => {
    const { onPurchase } = setup();
    await userEvent.click(screen.getByRole('button', { name: /purchase/i }));
    expect(onPurchase).toHaveBeenCalledWith(vehicle);
  });

  it('disables the button and reads "Out of Stock" when quantity is zero', () => {
    setup({ vehicle: { ...vehicle, quantity: 0 } });
    expect(screen.getByRole('button', { name: /out of stock/i })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /^purchase/i })).not.toBeInTheDocument();
  });

  it('hides admin controls from regular users', () => {
    setup({ isAdmin: false });
    expect(screen.queryByRole('button', { name: /edit|restock|delete/i })).not.toBeInTheDocument();
  });

  it('shows admin controls and wires their callbacks for admins', async () => {
    const { onEdit, onRestock, onDelete } = setup({ isAdmin: true });

    await userEvent.click(screen.getByRole('button', { name: /edit toyota corolla/i }));
    await userEvent.click(screen.getByRole('button', { name: /restock toyota corolla/i }));
    await userEvent.click(screen.getByRole('button', { name: /delete toyota corolla/i }));

    expect(onEdit).toHaveBeenCalledWith(vehicle);
    expect(onRestock).toHaveBeenCalledWith(vehicle);
    expect(onDelete).toHaveBeenCalledWith(vehicle);
  });
});