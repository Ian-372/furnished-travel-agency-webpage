/**
 * Image SEO & Alt Text Utility
 * Ensures all images have proper alt text and are SEO optimized
 * 
 * Add this script before closing </body> tag on all pages
 */

/**
 * Images that require alt text
 * Format: {
 *   selector: CSS selector for image,
 *   altText: descriptive alt text,
 *   title: optional title attribute
 * }
 */
const ImageAltTexts = {
    homepage: [
        {
            selector: 'img.hero-image',
            altText: 'Little Monks Safaris - Premium safari experience in Kenya with wildlife and landscape views',
            title: 'Kenya Safari Adventure'
        },
        {
            selector: 'img.service-icon',
            altText: 'Safari tour service icon - professional Kenya safari experiences',
            title: 'Safari Tours'
        },
        {
            selector: 'img.transfer-icon',
            altText: 'Airport transfer service icon - reliable and professional airport transfers in Kenya',
            title: 'Airport Transfers'
        },
        {
            selector: 'img.vehicle-icon',
            altText: 'Luxury vehicle rental service icon - premium vehicle rentals across Kenya',
            title: 'Vehicle Rentals'
        }
    ],
    packages: [
        {
            selector: 'img.package-3day',
            altText: '3-day safari package - wildlife game drives and luxury accommodation in Kenya',
            title: '3-Day Safari Package'
        },
        {
            selector: 'img.package-5day',
            altText: '5-day safari package - extended safari adventure in Kenyan national parks',
            title: '5-Day Safari Package'
        },
        {
            selector: 'img.package-7day',
            altText: '7-day safari package - comprehensive luxury safari experience across Kenya',
            title: '7-Day Safari Package'
        }
    ],
    services: [
        {
            selector: 'img.service-safari',
            altText: 'Safari tour service - expert-guided game drives in Kenya national parks',
            title: 'Guided Safari Tours'
        },
        {
            selector: 'img.service-transfer',
            altText: 'Professional airport transfer service - reliable ground transportation',
            title: 'Airport Transfers'
        },
        {
            selector: 'img.service-daytrip',
            altText: 'Day trip service - guided day excursions in Kenya',
            title: 'Day Trips'
        }
    ]
};

/**
 * Apply alt text to images based on page
 * Call this function on page load
 */
function applyAltTexts(pageType = 'homepage') {
    const imageConfig = ImageAltTexts[pageType] || [];
    
    imageConfig.forEach(config => {
        const images = document.querySelectorAll(config.selector);
        images.forEach(img => {
            // Set alt text if not already present
            if (!img.alt || img.alt.trim() === '') {
                img.alt = config.altText;
                console.log(`✓ Alt text added: ${config.selector}`);
            }
            
            // Set title attribute for tooltip
            if (config.title && !img.title) {
                img.title = config.title;
            }
            
            // Ensure image has proper loading attribute
            if (!img.loading) {
                img.loading = 'lazy';
            }
        });
    });
}

/**
 * Validate all images have alt text
 * Returns array of images missing alt text
 */
function validateImageAltTexts() {
    const images = document.querySelectorAll('img');
    const missingAlt = [];
    
    images.forEach(img => {
        // Skip 1x1 tracking pixels and social media buttons
        if (img.width === 1 && img.height === 1) return;
        if (img.src.includes('facebook.com/tr') || img.src.includes('tracking')) return;
        
        if (!img.alt || img.alt.trim() === '') {
            missingAlt.push({
                src: img.src,
                class: img.className,
                parent: img.parentElement.className
            });
        }
    });
    
    if (missingAlt.length > 0) {
        console.warn('⚠️ Images missing alt text:', missingAlt);
    } else {
        console.log('✓ All images have alt text');
    }
    
    return missingAlt;
}

/**
 * Optimize images for web
 * Adds loading attribute and checks dimensions
 */
function optimizeImagesForWeb() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Add lazy loading
        if (!img.loading) {
            img.loading = 'lazy';
        }
        
        // Add decoding attribute
        if (!img.decoding) {
            img.decoding = 'async';
        }
        
        // Ensure images have dimensions to prevent CLS (Cumulative Layout Shift)
        if (!img.width || !img.height) {
            console.warn(`Image without dimensions: ${img.src}`);
        }
    });
}

/**
 * Generate image sitemap data
 * Returns JSON data for images on the page
 */
function generateImageSitemapData() {
    const images = document.querySelectorAll('img:not([src*="facebook"]):not([src*="tracking"])');
    const imageData = [];
    
    images.forEach(img => {
        if (img.src && img.src.startsWith('http')) {
            imageData.push({
                url: img.src,
                title: img.alt || img.title || 'Image'
            });
        }
    });
    
    return imageData;
}

/**
 * Add structured data for images
 * Supports both ImageObject schema
 */
function addImageStructuredData() {
    const images = document.querySelectorAll('img[alt]:not([src*="facebook"]):not([src*="tracking"])');
    
    images.forEach((img, index) => {
        if (img.src.startsWith('http')) {
            const imageSchema = {
                "@context": "https://schema.org",
                "@type": "ImageObject",
                "url": img.src,
                "name": img.alt || "Image",
                "description": img.title || img.alt || "Safari and travel related image"
            };
            
            // Only add structured data for hero and featured images
            if (img.classList.contains('hero') || img.classList.contains('featured')) {
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.textContent = JSON.stringify(imageSchema);
                document.head.appendChild(script);
            }
        }
    });
}

/**
 * Initialize image SEO
 * Call on document ready
 */
function initImageSEO(pageType = 'homepage') {
    // Detect page type if not provided
    if (pageType === 'homepage') {
        if (document.body.classList.contains('packages-page')) pageType = 'packages';
        if (document.body.classList.contains('services-page')) pageType = 'services';
    }
    
    // Apply alt texts
    applyAltTexts(pageType);
    
    // Optimize images
    optimizeImagesForWeb();
    
    // Validate
    validateImageAltTexts();
    
    // Add structured data
    addImageStructuredData();
    
    console.log('✓ Image SEO initialization complete');
}

/**
 * Manual Image Alt Text Updates
 * Use these functions to update specific images
 */
const ManualImageUpdates = {
    /**
     * Update a specific image's alt text
     * @param {string} selector - CSS selector
     * @param {string} altText - New alt text
     */
    updateImageAlt: function(selector, altText) {
        const img = document.querySelector(selector);
        if (img) {
            img.alt = altText;
            img.title = altText.substring(0, 60);
            console.log(`✓ Updated: ${selector}`);
        }
    },
    
    /**
     * Update multiple images
     * @param {array} updates - Array of {selector, altText} objects
     */
    updateMultipleImages: function(updates) {
        updates.forEach(update => {
            this.updateImageAlt(update.selector, update.altText);
        });
    },
    
    /**
     * Update image title/tooltip
     * @param {string} selector - CSS selector
     * @param {string} title - New title
     */
    updateImageTitle: function(selector, title) {
        const img = document.querySelector(selector);
        if (img) {
            img.title = title;
        }
    }
};

/**
 * Image SEO Best Practices
 * 
 * 1. ALT TEXT GUIDELINES
 *    - Describe the image content
 *    - Include relevant keywords (naturally)
 *    - Keep under 125 characters
 *    - Don't start with "image of" or "picture of"
 *    - Use proper punctuation
 * 
 * 2. FILE NAMING
 *    - Use descriptive names: safari-game-drive.jpg
 *    - Not: img123.jpg or untitled.jpg
 *    - Use hyphens, not underscores
 * 
 * 3. FILE SIZE & FORMAT
 *    - Compress images for web (tools: TinyPNG, ImageOptim)
 *    - Use WebP format for better compression
 *    - Provide fallback to JPEG/PNG
 *    - Hero images: 1-2MB max
 *    - Thumbnail images: 50-200KB
 * 
 * 4. DIMENSIONS
 *    - Always specify width and height
 *    - Prevents layout shift (CLS)
 *    - Helps browsers allocate space
 * 
 * 5. RESPONSIVE IMAGES
 *    - Use srcset for different screen sizes
 *    - Use picture element for art direction
 *    - Example:
 *      <img srcset="image-sm.jpg 480w,
 *                   image-md.jpg 768w,
 *                   image-lg.jpg 1200w"
 *           src="image-md.jpg"
 *           alt="descriptive text">
 *
 * 6. CAPTIONS & CONTEXT
 *    - Use figure and figcaption for semantic HTML
 *    - Example:
 *      <figure>
 *        <img src="safari.jpg" alt="Lion on safari">
 *        <figcaption>A majestic lion in the Serengeti</figcaption>
 *      </figure>
 */

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageSEO);
} else {
    initImageSEO();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        applyAltTexts,
        validateImageAltTexts,
        optimizeImagesForWeb,
        generateImageSitemapData,
        addImageStructuredData,
        initImageSEO,
        ManualImageUpdates
    };
}
