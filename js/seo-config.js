/**
 * SEO Configuration & Utilities
 * Manages meta tags, structured data, and SEO best practices
 * 
 * UPDATE: Replace all instances of 'littlemonkssafaris.com' with your actual domain
 */

const SEOConfig = {
    baseUrl: 'https://littlemonkssafaris.com',
    businessName: 'Little Monks Safaris',
    businessEmail: 'littlemonksltd@gmail.com',
    businessPhone: '+254 708 102 302',
    businessAddress: {
        country: 'KE',
        locality: 'Kenya',
        streetAddress: 'Kenya' // Add full address when available
    },
    socialLinks: {
        facebook: 'https://www.facebook.com/profile.php?id=61590288890821',
        instagram: 'https://instagram.com/littlemonkssafaris',
        twitter: 'https://twitter.com/littlemonkssafaris',
        tiktok: 'https://www.tiktok.com/@littlemonkssafaris'
    },
    locale: 'en_US',
    defaultImage: '/images/og-image.jpg',
    siteLogo: '/images/logo.png'
};

/**
 * Update Meta Tag
 * @param {string} name - Meta tag name or property
 * @param {string} content - Content value
 * @param {boolean} isProperty - Whether to use 'property' attribute (for Open Graph)
 */
function updateMetaTag(name, content, isProperty = false) {
    let element = document.querySelector(`meta[${isProperty ? 'property' : 'name'}="${name}"]`);
    
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(isProperty ? 'property' : 'name', name);
        document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
}

/**
 * Update Page Title
 * @param {string} title - Page title
 */
function updatePageTitle(title) {
    document.title = title;
    updateMetaTag('og:title', title, true);
    updateMetaTag('twitter:title', title);
}

/**
 * Update Page Description
 * @param {string} description - Meta description
 */
function updatePageDescription(description) {
    updateMetaTag('description', description);
    updateMetaTag('og:description', description, true);
    updateMetaTag('twitter:description', description);
}

/**
 * Update Open Graph Image
 * @param {string} imageUrl - Image URL
 * @param {string} imageAlt - Image alt text
 */
function updateOGImage(imageUrl, imageAlt = '') {
    updateMetaTag('og:image', imageUrl, true);
    updateMetaTag('og:image:alt', imageAlt, true);
    updateMetaTag('twitter:image', imageUrl);
}

/**
 * Update Page URL (Canonical)
 * @param {string} url - Page URL
 */
function updateCanonicalUrl(url) {
    let canonical = document.querySelector('link[rel="canonical"]');
    
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    
    canonical.href = url;
    updateMetaTag('og:url', url, true);
}

/**
 * Add Structured Data (Schema.org JSON-LD)
 * @param {object} schemaData - Schema.org data object
 */
function addStructuredData(schemaData) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);
}

/**
 * Generate Product/Offer Schema
 * @param {object} productData - Product information
 * @returns {object} Schema.org Product schema
 */
function generateProductSchema(productData) {
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": productData.name || 'Safari Package',
        "description": productData.description || '',
        "image": productData.image || SEOConfig.defaultImage,
        "brand": {
            "@type": "Brand",
            "name": SEOConfig.businessName
        },
        "offers": {
            "@type": "Offer",
            "url": productData.url || SEOConfig.baseUrl,
            "priceCurrency": productData.currency || "USD",
            "price": productData.price || "0",
            "availability": productData.availability || "https://schema.org/InStock"
        },
        "aggregateRating": productData.rating ? {
            "@type": "AggregateRating",
            "ratingValue": productData.rating.value,
            "reviewCount": productData.rating.count
        } : undefined
    };
}

/**
 * Generate Event Schema (for safari tours/trips)
 * @param {object} eventData - Event information
 * @returns {object} Schema.org Event schema
 */
function generateEventSchema(eventData) {
    return {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": eventData.name || 'Safari Tour',
        "description": eventData.description || '',
        "image": eventData.image || SEOConfig.defaultImage,
        "startDate": eventData.startDate || new Date().toISOString(),
        "endDate": eventData.endDate || new Date().toISOString(),
        "location": {
            "@type": "Place",
            "name": eventData.location || "Kenya",
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "KE"
            }
        },
        "organizer": {
            "@type": "Organization",
            "name": SEOConfig.businessName,
            "url": SEOConfig.baseUrl,
            "email": SEOConfig.businessEmail
        },
        "offers": {
            "@type": "Offer",
            "url": eventData.url || SEOConfig.baseUrl,
            "price": eventData.price || "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
        }
    };
}

/**
 * Generate FAQSchema
 * @param {array} faqItems - Array of {question, answer} objects
 * @returns {object} Schema.org FAQPage schema
 */
function generateFAQSchema(faqItems) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };
}

/**
 * Generate Breadcrumb Schema
 * @param {array} breadcrumbs - Array of {name, url} objects
 * @returns {object} Schema.org BreadcrumbList schema
 */
function generateBreadcrumbSchema(breadcrumbs) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };
}

/**
 * Generate Organization Schema (for footer/global use)
 * @returns {object} Schema.org Organization schema
 */
function generateOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": SEOConfig.businessName,
        "url": SEOConfig.baseUrl,
        "logo": `${SEOConfig.baseUrl}${SEOConfig.siteLogo}`,
        "description": "Premium Kenyan safari experiences and travel solutions",
        "foundingDate": "2020", // Update with actual founding date
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "telephone": SEOConfig.businessPhone,
            "email": SEOConfig.businessEmail,
            "contactOption": ["TollFree", "HearingImpairedSupported"]
        },
        "sameAs": Object.values(SEOConfig.socialLinks),
        "address": {
            "@type": "PostalAddress",
            "addressCountry": SEOConfig.businessAddress.country,
            "addressLocality": SEOConfig.businessAddress.locality,
            "streetAddress": SEOConfig.businessAddress.streetAddress
        }
    };
}

/**
 * Track SEO-related events with Google Analytics
 * @param {string} eventName - Event name
 * @param {object} eventData - Event data
 */
function trackSEOEvent(eventName, eventData = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            'event_category': 'SEO',
            ...eventData
        });
    }
}

/**
 * Track page view with enhanced data
 * @param {string} pageTitle - Page title
 * @param {string} pageType - Type of page (article, product, etc.)
 */
function trackPageView(pageTitle, pageType = 'page') {
    trackSEOEvent('page_view', {
        'page_title': pageTitle,
        'page_type': pageType,
        'timestamp': new Date().toISOString()
    });
}

/**
 * Initialize SEO on page load
 * Call this on document ready
 */
function initSEO() {
    // Add organization schema to all pages
    addStructuredData(generateOrganizationSchema());
    
    // Track page view
    const pageTitle = document.title;
    trackPageView(pageTitle);
    
    console.log('SEO Configuration initialized');
}

// Auto-initialize on DOM content loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSEO);
} else {
    initSEO();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SEOConfig,
        updateMetaTag,
        updatePageTitle,
        updatePageDescription,
        updateOGImage,
        updateCanonicalUrl,
        addStructuredData,
        generateProductSchema,
        generateEventSchema,
        generateFAQSchema,
        generateBreadcrumbSchema,
        generateOrganizationSchema,
        trackSEOEvent,
        trackPageView,
        initSEO
    };
}
