// affiliates.js - Affiliate link management for SubCheck

const affiliateLinks = {
    quicken: 'https://quicken.sjv.io/your-affiliate-id',
    trim:    'https://trim.com/?ref=your-id',
    ynab:    'https://ynab.com/referral/?ref=your-id',
};

function trackAffiliate(service) {
    // Track with Google Analytics if available
    if (typeof gtag !== 'undefined') {
        gtag('event', 'affiliate_click', {
            service: service,
            total_spending: localStorage.getItem('subcheck_yearlyTotal') || '0',
        });
    }

    // Open affiliate link in new tab
    const url = affiliateLinks[service];
    if (url) {
        window.open(url, '_blank', 'noopener');
    }
}
