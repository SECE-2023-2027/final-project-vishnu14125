/**
 * Quote utility functions for the Quote Calendar app
 */

/**
 * Validate quote data
 */
export function validateQuote(quote) {
  const errors = {};
  
  if (!quote.text || quote.text.trim().length === 0) {
    errors.text = 'Quote text is required';
  } else if (quote.text.length > 1000) {
    errors.text = 'Quote text must be less than 1000 characters';
  }
  
  if (!quote.author || quote.author.trim().length === 0) {
    errors.author = 'Author is required';
  } else if (quote.author.length > 200) {
    errors.author = 'Author name must be less than 200 characters';
  }
  
  if (!quote.date) {
    errors.date = 'Date is required';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(quote.date)) {
    errors.date = 'Date must be in YYYY-MM-DD format';
  }
  
  if (quote.category && quote.category.length > 50) {
    errors.category = 'Category must be less than 50 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Clean and format quote text
 */
export function formatQuoteText(text) {
  if (!text) return '';
  
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/([.!?])\s*([a-zA-Z])/g, '$1 $2'); // Ensure space after punctuation
}

/**
 * Clean and format author name
 */
export function formatAuthor(author) {
  if (!author) return '';
  
  return author
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\b\w/g, char => char.toUpperCase()); // Title case
}

/**
 * Get quote categories
 */
export function getQuoteCategories() {
  return [
    'general',
    'motivation',
    'wisdom',
    'love',
    'success',
    'life',
    'inspiration',
    'humor',
    'friendship',
    'happiness',
    'peace',
    'growth',
    'courage',
    'gratitude',
    'dreams'
  ];
}

/**
 * Truncate quote text for display
 */
export function truncateQuote(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > maxLength * 0.8 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Generate quote permalink
 */
export function getQuotePermalink(date) {
  return `/quote/${date}`;
}

/**
 * Generate quote sharing text
 */
export function getShareText(quote) {
  return `"${quote.text}" - ${quote.author}`;
}

/**
 * Generate quote for social media sharing
 */
export function getSocialShareText(quote, date) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `Today's quote (${formattedDate}): "${quote.text}" - ${quote.author}`;
}

/**
 * Search quotes by text or author
 */
export function searchQuotes(quotes, searchTerm) {
  if (!searchTerm || searchTerm.trim().length === 0) return quotes;
  
  const term = searchTerm.toLowerCase().trim();
  
  return quotes.filter(quote => 
    quote.text.toLowerCase().includes(term) ||
    quote.author.toLowerCase().includes(term) ||
    (quote.category && quote.category.toLowerCase().includes(term))
  );
}

/**
 * Filter quotes by category
 */
export function filterQuotesByCategory(quotes, category) {
  if (!category || category === 'all') return quotes;
  
  return quotes.filter(quote => quote.category === category);
}

/**
 * Sort quotes by different criteria
 */
export function sortQuotes(quotes, sortBy = 'date', order = 'desc') {
  const sorted = [...quotes].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.date) - new Date(b.date);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'text':
        return a.text.localeCompare(b.text);
      case 'category':
        return (a.category || '').localeCompare(b.category || '');
      default:
        return 0;
    }
  });
  
  return order === 'desc' ? sorted.reverse() : sorted;
}

/**
 * Get quote statistics
 */
export function getQuoteStats(quotes) {
  const stats = {
    total: quotes.length,
    categories: {},
    authors: {},
    averageLength: 0,
  };
  
  let totalLength = 0;
  
  quotes.forEach(quote => {
    // Category stats
    const category = quote.category || 'general';
    stats.categories[category] = (stats.categories[category] || 0) + 1;
    
    // Author stats
    stats.authors[quote.author] = (stats.authors[quote.author] || 0) + 1;
    
    // Length stats
    totalLength += quote.text.length;
  });
  
  stats.averageLength = quotes.length > 0 ? Math.round(totalLength / quotes.length) : 0;
  
  return stats;
}

/**
 * Check if quote can be edited
 */
export function canEditQuote(quote, user, currentDate) {
  if (!user) return false;
  
  // Admins can edit any quote
  if (user.isAdmin) return true;
  
  // Regular users can only edit today's quote
  return quote.date === currentDate;
}

/**
 * Check if quote is accessible
 */
export function isQuoteAccessible(date, currentDate) {
  const quoteDate = new Date(date);
  const today = new Date(currentDate);
  
  // Only allow access to quotes up to today
  return quoteDate <= today;
}
