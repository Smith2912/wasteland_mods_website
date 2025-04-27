/**
 * Client utility functions to improve client-side behaviors
 */

/**
 * Handles font preload warnings by marking fonts as used
 * Prevents "preloaded with link preload was not used within a few seconds" warnings
 */
export function handleFontPreloads() {
  if (typeof window === 'undefined') return;
  
  // Only run this once
  // @ts-ignore - Intentional global state
  if (window.__FONTS_HANDLED) return;
  
  // Find all preloaded font resources
  const preloads = document.querySelectorAll('link[rel="preload"][as="font"]');
  
  // Create a small invisible div to force font usage
  const div = document.createElement('div');
  div.style.opacity = '0';
  div.style.position = 'absolute';
  div.style.pointerEvents = 'none';
  div.style.visibility = 'hidden';
  div.style.width = '0';
  div.style.height = '0';
  
  // Add text with each font to ensure the browser recognizes usage
  preloads.forEach((preload) => {
    const fontUrl = preload.getAttribute('href');
    if (fontUrl) {
      const fontName = fontUrl.split('/').pop()?.split('-')[0] || 'font';
      const span = document.createElement('span');
      span.style.fontFamily = `"${fontName}", sans-serif`;
      span.textContent = '.';
      div.appendChild(span);
    }
  });
  
  // Add to body if it exists, otherwise add an event listener for when it does
  if (document.body) {
    document.body.appendChild(div);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(div);
    });
  }
  
  // Mark as handled
  // @ts-ignore - Intentional global state
  window.__FONTS_HANDLED = true;
}

/**
 * Initializes client-side utilities that should run on every page
 */
export function initClientUtils() {
  handleFontPreloads();
} 