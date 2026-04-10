/**
 * Resolves an image/asset URL, handling both absolute paths and relative paths from the backend.
 * 
 * @param {string} url - The URL or relative path to resolve
 * @returns {string|null} - The resolved absolute URL or null if no URL provided
 */
export const resolveImageUrl = (url) => {
    if (!url) return null;
    
    // If it's already an absolute URL (http/https) or a base64 string/blob, return as is
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
        return url;
    }
    
    // Default Backend API URL
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Strip trailing slash if present in base URL
    let base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    
    // If the base URL includes /api at the end, strip it for static assets
    // Since static files are usually served from the root, not the /api prefix
    if (base.endsWith('/api')) {
        base = base.slice(0, -4);
    }
    
    // Normalize path separators (fix backward slashes from Windows paths)
    const normalizedPath = url.replace(/\\/g, '/');
    
    // Ensure path starts with a single slash
    const finalPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    
    return `${base}${finalPath}`;
};
