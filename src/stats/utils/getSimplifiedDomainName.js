/**
 * A robust helper function to get the simplified, top-level domain from a hostname.
 * This is crucial for grouping activity from subdomains (e.g., 'auth.openai.com')
 * under a single entry ('openai.com').
 *
 * @param {string} domain - The full domain name (e.g., "auth.openai.com" or "courses.edx.org").
 * @returns {string} The simplified, top-level domain (e.g., "openai.com" or "edx.org").
 */
export function getSimplifiedDomainName(domain) {
    // Split the domain into its constituent parts
    const parts = domain.split('.');
    
    // A hardcoded list of common multi-part suffixes (like '.co.uk')
    const multiPartSuffixes = [
        'co.uk', 'com.au', 'co.jp', 'com.br', 'co.nz'
    ];

    // Check if the last two parts of the domain match a known multi-part suffix.
    const lastTwoParts = parts.slice(-2).join('.');
    if (multiPartSuffixes.includes(lastTwoParts)) {
        // If it's a match, we take the last three parts to get the correct domain.
        // For example, 'news.bbc.co.uk' becomes 'bbc.co.uk'.
        if (parts.length >= 3) {
            return parts.slice(-3).join('.');
        }
    }

    // Otherwise, we default to the simple two-part rule.
    // This handles most standard domains. For example, 'signin.aws.amazon.com' becomes 'amazon.com'.
    if (parts.length >= 2) {
        return parts.slice(-2).join('.');
    }
    
    // As a fallback, return the original domain if it's a single part (e.g., 'localhost').
    return domain;
}
