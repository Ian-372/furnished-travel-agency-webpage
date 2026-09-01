/**
 * Meta Pixel Configuration & Event Tracking
 * Replace 'YOUR_PIXEL_ID' with your actual Meta Pixel ID throughout the project
 */

// Ensure fbq is loaded and initialized
if (typeof fbq === 'undefined') {
    console.warn('Meta Pixel not loaded. Make sure the pixel code is in your HTML head.');
}

/**
 * Track AddToCart event
 * Use when user adds a booking/package to cart
 */
function trackAddToCart(value, currency = 'USD') {
    fbq('track', 'AddToCart', {
        value: value,
        currency: currency
    });
}

/**
 * Track Initiate Checkout event
 * Use when user starts the booking process
 */
function trackInitiateCheckout(value, currency = 'USD', contentName = '') {
    fbq('track', 'InitiateCheckout', {
        value: value,
        currency: currency,
        content_name: contentName
    });
}

/**
 * Track Purchase event
 * Use when booking is confirmed/payment completed
 */
function trackPurchase(value, currency = 'USD', contentName = '') {
    fbq('track', 'Purchase', {
        value: value,
        currency: currency,
        content_name: contentName
    });
}

/**
 * Track Lead event
 * Use when user submits contact form or inquiry
 */
function trackLead(value = 0, currency = 'USD', contentName = 'Inquiry') {
    fbq('track', 'Lead', {
        value: value,
        currency: currency,
        content_name: contentName
    });
}

/**
 * Track ViewContent event
 * Use when user views a specific package/service
 */
function trackViewContent(contentName, contentId = '', value = 0) {
    fbq('track', 'ViewContent', {
        content_name: contentName,
        content_id: contentId,
        value: value,
        currency: 'USD'
    });
}

/**
 * Track Complete Registration event
 * Use when user completes signup
 */
function trackCompleteRegistration(value = 0, contentName = 'Account Registration') {
    fbq('track', 'CompleteRegistration', {
        value: value,
        currency: 'USD',
        content_name: contentName
    });
}

/**
 * Track Search event
 * Use when user searches for packages/services
 */
function trackSearch(searchString = '') {
    fbq('track', 'Search', {
        search_string: searchString
    });
}

/**
 * Track Custom event
 * Use for any custom tracking needs
 */
function trackCustomEvent(eventName, eventData = {}) {
    fbq('track', eventName, eventData);
}

// Example usage (uncomment to test):
// trackViewContent('Safari Package - 3 Days', 'safari-3day', 450);
// trackLead(0, 'USD', 'Contact Form Inquiry');
// trackPurchase(500, 'USD', 'Booking Confirmed');
