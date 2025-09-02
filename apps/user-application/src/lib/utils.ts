import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const clickedTime = new Date(timestamp);
  const diffInSeconds = Math.floor(
    (now.getTime() - clickedTime.getTime()) / 1000,
  );

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
};

export interface GeoClick {
  latitude: number;
  longitude: number;
}

export interface GroupedGeoClick {
  latitude: number;
  longitude: number;
  count: number;
}

// Round coordinates to nearest mile (approximately 0.0145 degrees)
const roundToMile = (coord: number) => {
  const mileInDegrees = 0.0145;
  return Math.floor(coord / mileInDegrees) * mileInDegrees;
};

// Group clicks by rounded coordinates and count them
export const groupClicksByMile = (clicks: GeoClick[]): GroupedGeoClick[] => {
  const clickGroups = clicks.reduce(
    (acc, click) => {
      const key = `${roundToMile(click.latitude)}_${roundToMile(click.longitude)}`;
      if (!acc[key]) {
        acc[key] = {
          latitude: roundToMile(click.latitude),
          longitude: roundToMile(click.longitude),
          count: 0,
        };
      }
      acc[key].count++;
      return acc;
    },
    {} as Record<string, GroupedGeoClick>,
  );

  return Object.values(clickGroups);
};
