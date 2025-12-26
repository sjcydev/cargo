/**
 * Utilidades de monitoreo de rendimiento
 * Performance monitoring utilities for Core Web Vitals
 */

/**
 * Monitorea los Core Web Vitals y los registra en la consola
 * Track Core Web Vitals and log them to console
 */
export function trackWebVitals() {
	if (typeof window === 'undefined') return;

	// First Contentful Paint (FCP)
	try {
		const paintObserver = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (entry.name === 'first-contentful-paint') {
					console.log('FCP:', entry.startTime.toFixed(2), 'ms');
					// Aquí puedes enviar a un servicio de analytics
					// sendToAnalytics('FCP', entry.startTime);
				}
			}
		});
		paintObserver.observe({ entryTypes: ['paint'] });
	} catch (e) {
		// Paint timing not supported
	}

	// Largest Contentful Paint (LCP)
	try {
		const lcpObserver = new PerformanceObserver((list) => {
			const entries = list.getEntries();
			const lastEntry = entries[entries.length - 1];
			console.log('LCP:', lastEntry.startTime.toFixed(2), 'ms');
			// sendToAnalytics('LCP', lastEntry.startTime);
		});
		lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
	} catch (e) {
		// LCP not supported
	}

	// Cumulative Layout Shift (CLS)
	try {
		let clsValue = 0;
		const clsObserver = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				// Only count layout shifts without recent user input
				if (!(entry as any).hadRecentInput) {
					clsValue += (entry as any).value;
					console.log('CLS:', clsValue.toFixed(4));
					// sendToAnalytics('CLS', clsValue);
				}
			}
		});
		clsObserver.observe({ entryTypes: ['layout-shift'] });
	} catch (e) {
		// Layout shift not supported
	}

	// First Input Delay (FID) / Interaction to Next Paint (INP)
	try {
		const fidObserver = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				const fid = (entry as any).processingStart - entry.startTime;
				console.log('FID:', fid.toFixed(2), 'ms');
				// sendToAnalytics('FID', fid);
			}
		});
		fidObserver.observe({ entryTypes: ['first-input'] });
	} catch (e) {
		// FID not supported
	}

	// Time to First Byte (TTFB)
	try {
		const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
		if (navigationEntry) {
			const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
			console.log('TTFB:', ttfb.toFixed(2), 'ms');
			// sendToAnalytics('TTFB', ttfb);
		}
	} catch (e) {
		// Navigation timing not supported
	}
}

/**
 * Registra métricas de rendimiento cuando la página se carga
 * Log performance metrics when page loads
 */
export function logPageLoadMetrics() {
	if (typeof window === 'undefined') return;

	window.addEventListener('load', () => {
		setTimeout(() => {
			const perfData = performance.timing;
			const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
			const connectTime = perfData.responseEnd - perfData.requestStart;
			const renderTime = perfData.domComplete - perfData.domLoading;

			console.log('Performance Metrics:');
			console.log('Page Load Time:', pageLoadTime, 'ms');
			console.log('Connect Time:', connectTime, 'ms');
			console.log('Render Time:', renderTime, 'ms');

			// Enviar a analytics si es necesario
			// sendToAnalytics('PageLoad', { pageLoadTime, connectTime, renderTime });
		}, 0);
	});
}
