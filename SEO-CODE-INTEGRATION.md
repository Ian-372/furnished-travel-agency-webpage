# SEO Implementation - Code Integration Guide

## Scripts to Add to All HTML Files

Add these lines **before the closing `</body>` tag** on every page:

```html
<!-- Google Analytics (Replace GA_MEASUREMENT_ID with your actual ID) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>

<!-- SEO & Meta Pixel Configuration -->
<script src="js/seo-config.js"></script>
<script src="js/image-seo.js"></script>
<script src="js/meta-pixel-config.js"></script>
```

---

## Configuration Updates Needed

### 1. Update `js/seo-config.js` (Lines 5-25)

```javascript
const SEOConfig = {
    baseUrl: 'https://your-domain.com',  // CHANGE THIS
    businessName: 'Little Monks Safaris',
    businessEmail: 'your-email@littlemonkssafaris.com',  // CHANGE THIS
    businessPhone: '+254-XXX-XXXXXX',  // CHANGE THIS
    businessAddress: {
        country: 'KE',
        locality: 'Kenya',
        streetAddress: 'Your Full Address Here'  // ADD THIS
    },
    socialLinks: {
        facebook: 'https://facebook.com/littlemonkssafaris',  // CHANGE THIS
        instagram: 'https://instagram.com/littlemonkssafaris',  // CHANGE THIS
        twitter: 'https://twitter.com/littlemonkssafaris',  // CHANGE THIS
        linkedin: 'https://linkedin.com/company/littlemonkssafaris'  // CHANGE THIS
    },
    locale: 'en_US',
    defaultImage: '/images/og-image.jpg',  // Create this image
    siteLogo: '/images/logo.png'  // Add your logo
};
```

### 2. Update `sitemap.xml` (Lines 8-57)

Replace all instances of:
- `littlemonkssafaris.com` → your actual domain
- `2024-09-01` → current date
- Update `changefreq` and `priority` as needed

### 3. Update `robots.txt` (Line 20)

Replace:
- `Sitemap: https://littlemonkssafaris.com/sitemap.xml` → your actual domain

---

## Required Images for SEO

Create and place these 1200×630px images in `/images/` folder:

| Image | Path | Usage |
|-------|------|-------|
| Homepage OG | `/images/og-image.jpg` | Facebook/Twitter sharing on homepage |
| Booking OG | `/images/booking-og.jpg` | Facebook/Twitter sharing on booking page |
| Packages OG | `/images/packages-og.jpg` | Facebook/Twitter sharing on packages page |
| Services OG | `/images/services-og.jpg` | Facebook/Twitter sharing on services page |
| About OG | `/images/about-og.jpg` | Facebook/Twitter sharing on about page |
| Logo | `/images/logo.png` | Schema logo (recommended: 250×60px) |

---

## Step-by-Step Implementation

### Step 1: Configuration (15 minutes)
```bash
1. Open js/seo-config.js in text editor
2. Replace ALL domain placeholders
3. Replace ALL email placeholders
4. Replace ALL phone placeholders
5. Replace ALL social media URLs
6. Save file
```

### Step 2: Sitemap & Robots (5 minutes)
```bash
1. Open sitemap.xml and find/replace littlemonkssafaris.com
2. Update dates to today's date
3. Open robots.txt and update sitemap URL
4. Save both files
```

### Step 3: Images (30-60 minutes)
```bash
1. Create 5 OG images (1200×630px)
   - Use Canva.com or similar
   - Include: Brand name, key message, high-quality photo
2. Create/add logo image (250×60px)
3. Place all images in /images/ folder
4. Compress images with TinyPNG.com
```

### Step 4: HTML Updates (30 minutes)
```bash
1. Open each HTML file
2. Find closing </body> tag (usually near end of file)
3. Add scripts above </body>:
   - Google Analytics script
   - seo-config.js
   - image-seo.js
   - meta-pixel-config.js
4. Replace GA_MEASUREMENT_ID with actual ID
5. Save each file
```

### Step 5: Google Search Console (15 minutes)
```bash
1. Go to https://search.google.com/search-console
2. Click "Add property"
3. Enter your domain URL
4. Verify ownership (DNS recommended)
5. Wait for verification (can take 24-48 hours)
6. Submit sitemap: https://your-domain.com/sitemap.xml
```

### Step 6: Google Analytics (10 minutes)
```bash
1. Go to https://analytics.google.com
2. Create new property/account
3. Get your Measurement ID (G-XXXXXXXXXX)
4. Update GA_MEASUREMENT_ID in script tags
```

---

## Browser Console Testing

After implementation, test in browser developer console (F12):

```javascript
// Test if SEO config loaded
console.log(SEOConfig);

// Test if Meta pixel loaded
console.log(fbq);

// Validate image alt texts
validateImageAltTexts();

// Check page title
console.log(document.title);

// Test updating meta tags
updatePageTitle("Test Title");
updatePageDescription("Test description");
```

---

## Monitoring URLs

After setup, monitor these:

| Service | URL |
|---------|-----|
| Google Search Console | https://search.google.com/search-console |
| Google Analytics | https://analytics.google.com |
| PageSpeed Insights | https://pagespeed.web.dev/ |
| Mobile Friendly Test | https://search.google.com/test/mobile-friendly |
| Rich Results Test | https://search.google.com/test/rich-results |
| Schema Validator | https://validator.schema.org/ |

---

## Troubleshooting

### Images not showing in social preview?
- Check image path is correct
- Ensure image is at least 1200×630px
- Test with: https://www.facebook.com/sharer/sharer.php?u=YOUR_URL

### Meta tags not updating?
- Clear browser cache (Ctrl+F5)
- Check js/seo-config.js is loaded (look for no errors in console)
- Verify script tag is before </body>

### Sitemap not found?
- Ensure sitemap.xml is in root directory
- Check robots.txt sitemap URL is correct
- Verify file has .xml extension, not .xml.txt

### Not indexing in Google?
- Wait 2-3 days after submission
- Check Google Search Console for errors
- Ensure no robots noindex tags on public pages
- Verify site is accessible (not behind password)

---

## SEO Quick Commands

Run these in browser console to verify implementation:

```javascript
// Check all configs loaded
[SEOConfig, fbq, initSEO, validateImageAltTexts].every(x => !!x) ? 
  console.log('✓ All SEO scripts loaded') : 
  console.log('✗ Missing SEO scripts');

// Check meta tags
Array.from(document.querySelectorAll('meta')).map(m => 
  m.getAttribute('property') || m.getAttribute('name')
);

// Check canonical tag
document.querySelector('link[rel="canonical"]')?.href;

// Test event tracking
trackSEOEvent('test_event', {test: true});
```

---

## Support & Resources

### Official Guides
- Google SEO Starter: https://developers.google.com/search
- Schema.org Docs: https://schema.org
- Open Graph Docs: https://ogp.me/
- Twitter Cards: https://developer.twitter.com/en/docs/twitter-for-websites/cards

### Free Tools
- Lighthouse: Built into Chrome DevTools
- GTmetrix: https://gtmetrix.com
- Semantic Meta Tags: https://www.seobility.net/en/seocheck/
- Keyword Planner: https://ads.google.com/home/tools/keyword-planner/

### Paid Tools (Optional)
- Ahrefs: https://ahrefs.com
- Semrush: https://www.semrush.com
- Moz: https://moz.com
- Surfer SEO: https://surferseo.com

---

**Last Updated**: September 1, 2024
**Implementation Time**: 2-3 hours
**Maintenance Time**: 1 hour/week
