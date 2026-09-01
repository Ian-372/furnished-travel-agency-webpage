# SEO Quick Start Checklist

## 🚀 Immediate Actions (Priority 1 - Week 1)

### Configuration
- [ ] Update domain in `js/seo-config.js`
  - [ ] baseUrl
  - [ ] businessEmail
  - [ ] businessPhone
  - [ ] socialLinks (Facebook, Instagram, Twitter, LinkedIn)

- [ ] Add Google Search Console account
  - [ ] Go to https://search.google.com/search-console
  - [ ] Add property with your domain
  - [ ] Verify ownership (choose DNS method)
  - [ ] Submit sitemap.xml at: https://littlemonkssafaris.com/sitemap.xml

- [ ] Add Google Analytics
  - [ ] Create GA4 property
  - [ ] Get Measurement ID
  - [ ] Add to all pages (before `</body>`):
    ```html
    <script async src=\"https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID\"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
    </script>
    ```

- [ ] Add scripts to all HTML pages (before `</body>`):
  ```html
  <script src=\"js/seo-config.js\"></script>
  <script src=\"js/image-seo.js\"></script>
  <script src=\"js/meta-pixel-config.js\"></script>
  ```

---

## 📸 Image Optimization (Priority 1 - Week 1)

### Required Open Graph Images
- [ ] Create `/images/og-image.jpg` (1200×630px)
- [ ] Create `/images/booking-og.jpg` (1200×630px)
- [ ] Create `/images/packages-og.jpg` (1200×630px)
- [ ] Create `/images/services-og.jpg` (1200×630px)
- [ ] Create `/images/about-og.jpg` (1200×630px)

### Image ALT Text
- [ ] Add alt text to all images using `js/image-seo.js`
- [ ] Compress all images (use TinyPNG.com)
- [ ] Add width/height attributes to all images
- [ ] Use descriptive filenames

---
 
## 📱 Mobile & Performance (Priority 1 - Week 1)

- [ ] Test mobile responsiveness
  - [ ] Google Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
  - [ ] Ensure all pages pass

- [ ] Check page speed
  - [ ] Google PageSpeed Insights: https://pagespeed.web.dev/
  - [ ] Target: >80 on mobile, >90 on desktop

- [ ] Core Web Vitals
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] FID (First Input Delay) < 100ms
  - [ ] CLS (Cumulative Layout Shift) < 0.1

---

## 🔗 Technical SEO (Priority 2 - Week 1-2)

- [ ] Verify sitemap.xml is accessible
  - [ ] URL: https://littlemonkssafaris.com/sitemap.xml
  - [ ] Update lastmod dates monthly

- [ ] Verify robots.txt is accessible
  - [ ] URL: https://littlemonkssafaris.com/robots.txt

- [ ] Check all canonical tags are correct
  - [ ] Run: `validateImageAltTexts()` in browser console

- [ ] SSL/HTTPS enabled
  - [ ] Ensure all pages served over HTTPS
  - [ ] Check for mixed content warnings

- [ ] Fix any crawl errors
  - [ ] Check Google Search Console → Coverage
  - [ ] Address any errors/warnings

---

## 🎯 Content SEO (Priority 2 - Week 1-2)

### Home Page (index.html)
- [ ] H1 tag: Unique, 50-60 characters
- [ ] Meta description: Compelling, 150-160 characters
- [ ] 300+ words of unique content
- [ ] Internal links to: Booking, Packages, Services, About

### Booking Page (booking.html)
- [ ] Clear value proposition
- [ ] Strong call-to-action (CTA)
- [ ] FAQ section structured with schema
- [ ] Customer reviews/testimonials

### Packages Page (packages.html)
- [ ] Clear package differentiation
- [ ] Pricing comparison table
- [ ] Feature highlights per package
- [ ] Comparison schema markup

### Services Page (services.html)
- [ ] Service descriptions (200+ words each)
- [ ] Pricing transparency
- [ ] Service area map
- [ ] Service icons with alt text

### About Page (about.html)
- [ ] Company history
- [ ] Team/staff bios
- [ ] Company values
- [ ] Awards/certifications
- [ ] Local business schema

---

## 🔍 Structured Data (Priority 2 - Week 2)

- [ ] Verify Organization schema
  - [ ] Use Schema.org validator: https://validator.schema.org/
  
- [ ] Add Product schemas for packages
  - [ ] Include pricing
  - [ ] Include ratings (if available)
  - [ ] Include reviews

- [ ] Add Event schemas for safari tours
  - [ ] Include dates
  - [ ] Include location
  - [ ] Include pricing

- [ ] Add FAQ schema (if applicable)
  - [ ] For common booking questions
  - [ ] For package details

---

## 🌐 Local SEO (Priority 2 - Week 2)

- [ ] Google My Business setup
  - [ ] Go to: https://www.google.com/business/
  - [ ] Create/claim business listing
  - [ ] Add photos (at least 10)
  - [ ] Add business hours
  - [ ] Add service areas
  - [ ] Respond to reviews

- [ ] Local directory listings
  - [ ] TripAdvisor
  - [ ] Trustpilot
  - [ ] Expedia
  - [ ] Kenya tourism directories
  - [ ] Ensure consistent NAP (Name, Address, Phone)

---

## 📊 Analytics & Monitoring (Priority 3 - Week 2-3)

- [ ] Set up Google Analytics goals
  - [ ] Booking completed
  - [ ] Form submission
  - [ ] Newsletter signup
  - [ ] Account creation

- [ ] Set up conversion tracking
  - [ ] Thank you page for bookings
  - [ ] Pixel tracking for meta ads

- [ ] Create dashboard for monitoring
  - [ ] Organic traffic (week-over-week)
  - [ ] Keyword rankings (top 20)
  - [ ] Bounce rate by page
  - [ ] Conversion rate

---

## 🔗 Link Building (Priority 3 - Week 3+)

- [ ] Internal linking strategy
  - [ ] Link from home → all main pages
  - [ ] Cross-link related content
  - [ ] Use descriptive anchor text

- [ ] External links to pursue
  - [ ] Kenya tourism blogs
  - [ ] Safari review sites
  - [ ] Travel industry directories
  - [ ] Press releases for announcements

- [ ] Monitor backlinks
  - [ ] Tool: Google Search Console
  - [ ] Tool: Ahrefs (paid)
  - [ ] Tool: Moz (paid)

---

## 📝 Content Calendar (Ongoing)

- [ ] Blog strategy (if applicable)
  - [ ] Post 2-4 times per month
  - [ ] Topics: safari tips, travel guides, destination highlights
  - [ ] Optimize each post with SEO

- [ ] Page updates
  - [ ] Update pricing seasonally
  - [ ] Refresh testimonials/reviews quarterly
  - [ ] Update \"last modified\" dates
  - [ ] Add fresh content quarterly

---

## 🎯 Monthly Maintenance

Every month:
- [ ] Check Google Search Console
  - [ ] Review top performing pages
  - [ ] Check for new errors
  - [ ] Approve/reject suggested improvements

- [ ] Monitor analytics
  - [ ] Top performing pages
  - [ ] Traffic sources
  - [ ] Conversion funnel
  - [ ] Mobile vs desktop performance

- [ ] Check keyword rankings
  - [ ] Use: SE Ranking, Semrush, Ahrefs
  - [ ] Track top 20 keywords
  - [ ] Identify new opportunities

- [ ] Audit content
  - [ ] Find outdated information
  - [ ] Add fresh content
  - [ ] Fix broken links
  - [ ] Update images

---

## 📞 Useful Resources

### SEO Tools
- **Free**: Google Search Console, Google Analytics, PageSpeed Insights
- **Freemium**: Ubersuggest, Keyword Planner, Yoast SEO
- **Paid**: Ahrefs, Semrush, Moz, SE Ranking, SurferSEO

**Status:** ✅ Technical SEO 95% Complete | 🔄 Awaiting Client Setup

**Domain:** https://littlemonkssafaris.com/

---

### ✅ COMPLETED - Technical Setup
- [x] **Domain configured:** https://littlemonkssafaris.com/
- [x] **Business data integrated:**
  - Email: littlemonksltd@gmail.com
  - Phone: +254 708 102 302
  - Social links: Facebook, Instagram, Twitter, TikTok (all configured)
- [x] **Scripts deployed** to all 12 HTML pages:
  - ✅ `js/seo-config.js` (SEO & structured data)
  - ✅ `js/image-seo.js` (Image optimization)
  - ✅ `js/meta-pixel-config.js` (Meta Pixel tracking)
- [x] **Sitemap.xml** created at: https://littlemonkssafaris.com/sitemap.xml
- [x] **robots.txt** created at: https://littlemonkssafaris.com/robots.txt

### ⏳ AWAITING CLIENT ACTION

#### 1. Google Analytics Setup (Required)
- [ ] Go to https://analytics.google.com
- [ ] Create new GA4 property
- [ ] Get your **Measurement ID** (format: `G-XXXXXXXXXX`)
- [ ] Replace `GA_XXXXXXXXXX` in all HTML files with your ID
  - Files to update: index.html, booking.html, dashboard.html, packages.html, services.html, about.html, login.html, signup.html, admin.html, admin-login.html, privacy.html, terms.html

#### 2. Meta Pixel Setup (Required)
- [ ] Go to https://business.facebook.com/
- [ ] Navigate to Events Manager → Data Sources → Pixels
- [ ] Get your **Pixel ID**
- [ ] Replace `YOUR_PIXEL_ID` in all HTML files with your Pixel ID
  - Search in HTML files for `fbq('init', 'YOUR_PIXEL_ID')`

#### 3. Google Search Console (Required)
- [ ] Go to https://search.google.com/search-console
- [ ] Add property: https://littlemonkssafaris.com/
- [ ] Verify ownership (DNS method recommended)
- [ ] Submit sitemap.xml: https://littlemonkssafaris.com/sitemap.xml
- [ ] Monitor indexing in Coverage report
- ✓ 2000+ monthly organic visitors
- ✓ Strong mobile presence
- ✓ Established authority in market

---

**Start Date**: _______________
**Target Launch**: _______________
**Review Date**: _______________

**Notes**:
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
