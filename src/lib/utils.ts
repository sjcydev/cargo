import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { encodeBase32LowerCase } from "@oslojs/encoding";
import { toast as mainToast } from "svelte-sonner";
import { DateTime, Settings } from "luxon";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export function generateBase64(file: Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

Settings.defaultZone = "America/Panama";

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
