// Performance monitoring utility
export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    }).catch(err => {
      // Fallback for environments where web-vitals might fail or not be present
      console.warn('Web Vitals import failed', err);
    });
  }
};

export const logPerformance = () => {
  // Simple logger if web-vitals isn't used, or to augment it
  if (window.performance) {
    const navEntry = performance.getEntriesByType('navigation')[0];
    if (navEntry) {
      console.log(`Load Time: ${Math.round(navEntry.loadEventEnd)}ms`);
      console.log(`DOM Content Loaded: ${Math.round(navEntry.domContentLoadedEventEnd)}ms`);
    }
  }
};