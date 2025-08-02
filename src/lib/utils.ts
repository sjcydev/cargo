import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { encodeBase32LowerCase } from "@oslojs/encoding";
import { toast as mainToast } from "svelte-sonner";
import { DateTime, Settings } from "luxon";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeString(input: string): string {
  return input
    .normalize("NFD")                 // Split letters and accents
    .replace(/[\u0300-\u036f]/g, '') // Remove all diacritic marks
    .toLowerCase();                  // Make it case-insensitive
}

export function capitaliseWord(word: string) {
  return word
    .split(" ")
    .map((w) => w[0].toUpperCase() + w.substring(1))
    .join(" ");
}

export function generateUserId() {
  // ID with 120 bits of entropy, or about the same as UUID v4.
  const bytes = crypto.getRandomValues(new Uint8Array(15));
  const id = encodeBase32LowerCase(bytes);
  return id;
}

export function toast({
  message,
  type,
  description,
  action,
}: {
  message: string;
  type: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  switch (type) {
    case "message": {
      return mainToast.message(message, { description });
    }
    case "success": {
      return mainToast.success(message);
    }
    case "info": {
      return mainToast.info(message);
    }
    case "warning": {
      return mainToast.warning(message);
    }
    case "error": {
      return mainToast.error(message);
    }
    case "action": {
      return mainToast(message, {
        action,
      });
    }
    default: {
      return mainToast(message);
    }
  }
}

export function generateBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

export async function getBase64FromUrl(url: string): Promise<string> {
  const response = await fetch(url);

  // Browser environment
  if (typeof window !== "undefined") {
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Server environment
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

Settings.defaultZone = "America/Panama";

export function formatCurrency(value: number): string {
  if (value === 0) return "$0";

  // For values under 1000, show full number
  if (Math.abs(value) < 1000) {
    return new Intl.NumberFormat("es-PA", {
      style: "currency",
      currency: "USD",
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  // For larger values, use compact notation with 2 decimal places
  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `$${formatter.format(value)}`;
}

export function formatFullCurrency(value: number): string {
  if (value === 0) return "$0";

  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getToday() {
  return DateTime.now().setZone("America/Panama");
}

export function dateToLocaleString(date: DateTime) {
  return date.setLocale("en-GB").toLocaleString();
}

export function getDateFromISO(iso: string) {
  return DateTime.fromISO(iso, { zone: "America/Panama" });
}

type DimensionsType = {
  imgWidth: number;
  imgHeight: number;
  maxWidth: number;
  maxHeight: number;
};

export function calculateDimensions({
  imgWidth,
  imgHeight,
  maxWidth,
  maxHeight,
}: DimensionsType) {
  const aspectRatio = imgWidth / imgHeight;
  let width = maxWidth;
  let height = maxHeight;

  if (imgWidth > imgHeight) {
    // Landscape image
    if (imgWidth > maxWidth) {
      width = maxWidth;
      height = maxWidth / aspectRatio;
    }
  } else {
    // Portrait image
    if (imgHeight > maxHeight) {
      height = maxHeight;
      width = maxHeight * aspectRatio;
    }
  }

  return { width, height };
}

export function formatCompactNumber(value: number): string {
  const formatter = Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  return formatter.format(value);
}

export function formatCompactCurrency(value: number): string {
  if (value === 0) return "$0";

  const formatter = Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  return `$${formatter.format(value)}`;
}

export function formatCompactPercentage(value: number): string {
  if (value === 0) return "0%";
  
  // For values under 1000, show with 1 decimal place
  if (Math.abs(value) < 1000) {
    return `${value.toFixed(1)}%`;
  }
  
  // For larger values, use compact notation
  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  });
  
  return `${formatter.format(value)}%`;
}
