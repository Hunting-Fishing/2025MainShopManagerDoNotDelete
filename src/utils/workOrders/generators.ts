
/**
 * Work order ID and reference generators
 */

/**
 * Generate a work order reference number
 */
export const generateWorkOrderReference = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `WO-${timestamp}-${random}`;
};

/**
 * Generate work order number
 */
export const generateWorkOrderNumber = (prefix: string = 'WO'): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const time = Date.now().toString().slice(-4);
  
  return `${prefix}-${year}${month}${day}-${time}`;
};
