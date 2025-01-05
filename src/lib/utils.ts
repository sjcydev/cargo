import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { encodeBase32LowerCase } from "@oslojs/encoding";
import { toast as mainToast } from "svelte-sonner";

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
