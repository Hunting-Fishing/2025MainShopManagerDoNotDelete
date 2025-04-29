
/**
 * Utility functions for working with Amazon product links and data
 */

/**
 * Extracts the Amazon Standard Identification Number (ASIN) from an Amazon URL
 * This is useful for identifying unique products
 */
export const extractAmazonASIN = (url: string): string | null => {
  if (!url || !url.includes('amazon')) return null;
  
  // Try to extract ASIN from URL patterns
  let match;
  
  // Pattern: /dp/ASIN/
  match = url.match(/\/dp\/([A-Z0-9]{10})/);
  if (match) return match[1];
  
  // Pattern: /gp/product/ASIN/
  match = url.match(/\/gp\/product\/([A-Z0-9]{10})/);
  if (match) return match[1];
  
  // Pattern: /ASIN/
  match = url.match(/\/([A-Z0-9]{10})(?:\/|\?|$)/);
  if (match) return match[1];

  return null;
};

/**
 * Validate if a URL is a valid Amazon product link
 */
export const isValidAmazonLink = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check if it's an Amazon domain
    if (!hostname.includes('amazon.')) return false;
    
    // Check if it has an ASIN
    return !!extractAmazonASIN(url);
  } catch (e) {
    return false;
  }
};

/**
 * Generate a tracking parameter string for Amazon affiliate links
 */
export const generateAmazonTrackingParams = (campaignId: string = 'toolshop'): string => {
  const timestamp = Date.now();
  return `?tag=${campaignId}-20&linkCode=ll1&creativeASIN={ASIN}&creative=${timestamp}`;
};

/**
 * Clean and normalize an Amazon URL by removing unnecessary parameters
 */
export const cleanAmazonUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    
    // Keep only essential parameters
    const essentialParams = ['tag', 'linkCode', 'creativeASIN', 'creative'];
    const params = new URLSearchParams();
    
    for (const param of essentialParams) {
      if (urlObj.searchParams.has(param)) {
        params.set(param, urlObj.searchParams.get(param)!);
      }
    }
    
    // Rebuild URL
    urlObj.search = params.toString();
    return urlObj.toString();
  } catch (e) {
    return url;
  }
};

/**
 * Add affiliate tracking parameters to an Amazon URL
 */
export const addAffiliateTracking = (url: string, affiliateId: string = 'toolshop-20'): string => {
  if (!url || !isValidAmazonLink(url)) return url;
  
  try {
    const urlObj = new URL(url);
    const asin = extractAmazonASIN(url);
    
    if (asin) {
      urlObj.searchParams.set('tag', affiliateId);
      urlObj.searchParams.set('linkCode', 'll1');
      urlObj.searchParams.set('creativeASIN', asin);
      urlObj.searchParams.set('creative', Date.now().toString());
    }
    
    return urlObj.toString();
  } catch (e) {
    return url;
  }
};
