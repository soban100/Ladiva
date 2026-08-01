// Currency utility functions for PKR formatting

export const CURRENCY = {
  code: 'PKR',
  symbol: 'Rs.',
  name: 'Pakistani Rupee',
  locale: 'ur-PK'
};

/**
 * Format price in PKR with proper formatting
 */
export function formatPrice(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') {
    return `${CURRENCY.symbol}0`;
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return `${CURRENCY.symbol}0`;
  }

  return `${CURRENCY.symbol}${numericAmount.toLocaleString('ur-PK')}`;
}

/**
 * Format price with decimal places
 */
export function formatPriceDecimal(amount: number | string | null | undefined, decimals: number = 2): string {
  if (amount === null || amount === undefined || amount === '') {
    return `${CURRENCY.symbol}0.${'0'.repeat(decimals)}`;
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return `${CURRENCY.symbol}0.${'0'.repeat(decimals)}`;
  }

  return `${CURRENCY.symbol}${numericAmount.toFixed(decimals)}`;
}

/**
 * Parse PKR formatted price string back to number
 */
export function parsePrice(priceString: string): number {
  if (!priceString) return 0;
  // Remove currency symbol and commas, then parse
  const cleaned = priceString.replace(/Rs\.|RS|rs|PKR|pkr|,/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format large amounts (for revenue, totals)
 */
export function formatLargeAmount(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') {
    return `${CURRENCY.symbol}0`;
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return `${CURRENCY.symbol}0`;
  }

  // For large amounts, use compact notation
  if (numericAmount >= 100000) {
    return `${CURRENCY.symbol}${(numericAmount / 100000).toFixed(1)}L`;
  } else if (numericAmount >= 1000) {
    return `${CURRENCY.symbol}${(numericAmount / 1000).toFixed(1)}K`;
  }

  return `${CURRENCY.symbol}${numericAmount.toLocaleString('ur-PK')}`;
}

/**
 * Format discount percentage
 */
export function formatDiscount(discountPrice: number | null | undefined, originalPrice: number | null | undefined): string {
  if (!discountPrice || !originalPrice || originalPrice <= 0) {
    return '';
  }
  
  const discount = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  return discount > 0 ? `-${discount}%` : '';
}

/**
 * Calculate and format savings
 */
export function formatSavings(originalPrice: number | null | undefined, discountPrice: number | null | undefined): string {
  if (!originalPrice || !discountPrice || originalPrice <= discountPrice) {
    return '';
  }
  
  const savings = originalPrice - discountPrice;
  return `Save ${formatPrice(savings)}`;
}
