
/**
 * Validates if a URL is a valid Amazon product link
 * @param url The URL to validate
 * @returns boolean indicating if it's a valid Amazon product link
 */
export function isValidAmazonLink(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Check if it's an Amazon domain
    if (!parsedUrl.hostname.includes('amazon.')) {
      return false;
    }
    
    // Check typical Amazon product URL patterns
    const isProductPage = 
      parsedUrl.pathname.includes('/dp/') || 
      parsedUrl.pathname.includes('/gp/product/') ||
      parsedUrl.pathname.includes('/exec/obidos/ASIN/');
      
    return isProductPage;
  } catch (error) {
    return false; // Not a valid URL
  }
}

/**
 * Extracts Amazon ASIN from a product URL
 * @param url The Amazon product URL
 * @returns The ASIN if found, otherwise null
 */
export function extractAmazonASIN(url: string): string | null {
  if (!isValidAmazonLink(url)) return null;
  
  try {
    // Extract ASIN from common Amazon URL formats
    const asinRegex = /(?:\/dp\/|\/gp\/product\/|\/ASIN\/|\/exec\/obidos\/ASIN\/)([A-Z0-9]{10})/i;
    const match = url.match(asinRegex);
    
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

/**
 * Builds a clean Amazon affiliate link with tracking ID
 * @param url The original Amazon URL
 * @param trackingId The affiliate tracking ID
 * @returns A cleaned affiliate link
 */
export function buildAmazonAffiliateLink(url: string, trackingId: string): string {
  if (!isValidAmazonLink(url)) return url;
  
  try {
    const asin = extractAmazonASIN(url);
    if (!asin) return url;
    
    // Parse the URL to get the domain
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    
    // Build a clean affiliate link
    return `https://${domain}/dp/${asin}?tag=${trackingId}`;
  } catch (error) {
    return url;
  }
}

/**
 * Adds Amazon affiliate tracking parameter to a URL if it's a valid Amazon link
 * @param url The original URL
 * @param trackingId The affiliate tracking ID
 * @returns The URL with affiliate tracking
 */
export function addAffiliateTracking(url: string, trackingId: string = 'yourtag-20'): string {
  if (!isValidAmazonLink(url)) return url;
  
  try {
    // Check if URL already has query parameters
    const hasQueryParams = url.includes('?');
    const separator = hasQueryParams ? '&' : '?';
    
    // Add the tracking ID
    return `${url}${separator}tag=${trackingId}`;
  } catch (error) {
    return url;
  }
}
