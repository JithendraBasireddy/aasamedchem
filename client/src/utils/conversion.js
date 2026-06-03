/**
 * Helper to convert quantity inputs to their database base units (grams, milliliters, or items)
 * @param {number|string} quantity 
 * @param {string} unit 
 * @returns {number}
 */
export const convertToBaseUnit = (quantity, unit) => {
  const q = parseFloat(quantity);
  if (isNaN(q) || q <= 0) return 0;

  switch (unit) {
    case 'kg':
    case 'L':
      return q * 1000; // Kilograms -> Grams, Liters -> Milliliters
    case 'g':
    case 'mL':
    case 'item':
    default:
      return q;
  }
};

/**
 * Formats pricing decimals into standard INR currency strings (e.g. ₹1,250.50)
 * @param {number|string} amount 
 * @returns {string}
 */
export const formatINR = (amount) => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(value || 0);
};
