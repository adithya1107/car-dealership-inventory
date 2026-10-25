import { DEFAULT_VEHICLE_IMAGE, getVehicleImage } from '../../lib/vehicleImage';

interface VehicleImageProps {
  category: string;
  alt: string;
  className?: string;
}

/** Category-based photo with a graceful fallback if the file is missing. */
export function VehicleImage({ category, alt, className }: VehicleImageProps) {
  return (
    <img
      src={getVehicleImage(category)}
      alt={alt}
      loading="lazy"
      className={className}
      onError={(e) => {
        const img = e.currentTarget;
        if (!img.src.endsWith(DEFAULT_VEHICLE_IMAGE)) img.src = DEFAULT_VEHICLE_IMAGE;
      }}
    />
  );
}