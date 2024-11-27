import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { encodeBase32LowerCase } from '@oslojs/encoding';

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