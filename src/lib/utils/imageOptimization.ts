/**
 * Utilidades para optimización de imágenes
 * Image optimization utilities for performance
 */

/**
 * Genera un srcset responsivo para imágenes
 * Generate responsive image srcset
 */
export function generateSrcSet(baseUrl: string, widths: number[]): string {
	return widths.map((width) => `${baseUrl}?w=${width} ${width}w`).join(', ');
}

/**
 * Obtiene props optimizadas para elementos img
 * Get optimized image props for img elements
 */
export function getImageProps(src: string, alt: string) {
	return {
		src,
		alt,
		loading: 'lazy' as const,
		decoding: 'async' as const,
		srcset: generateSrcSet(src, [320, 640, 960, 1280]),
		sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
	};
}

/**
 * Genera dimensiones específicas para prevenir layout shift
 * Generate specific dimensions to prevent layout shift
 */
export function getResponsiveImageProps(
	src: string,
	alt: string,
	width: number,
	height: number
) {
	return {
		...getImageProps(src, alt),
		width,
		height,
		class: 'w-full h-auto'
	};
}
