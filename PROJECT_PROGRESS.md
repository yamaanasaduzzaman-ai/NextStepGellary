# NEXSTEP GALLERY — ADVANCED PRODUCT MANAGEMENT & WEBSITE CUSTOMIZATION ROADMAP

## Milestones & Status Tracker

### 1. Database & Schema Architecture
- [x] Create database backup (`dev.db.bak`)
- [x] Extend `prisma/schema.prisma` with `Brand`, `ProductAttribute`, `CustomPage`, `NavigationMenu`, `Popup`, `SiteCustomization`, Category self-relation (subcategories), and SEO fields
- [x] Execute `prisma db push` and `prisma generate`
- [x] Seed initial site customization, brands, attributes, and navigation records

### 2. File Upload & Asset Pipeline
- [x] Implement multi-format image upload API `/api/upload` (supporting JPG, PNG, WebP) with size checks and local `/public/uploads` storage
- [x] Support image reordering, featured selection, color association, and alt-text editing

### 3. Complete Product Management & Editing
- [x] Upgrade Product Listing (`/admin/products`):
  - Thumbnail, Name, SKU, Category, Price, Stock, Status, Created Date
  - Filters: Status, Category, Stock Level, Search by Name/SKU
  - Actions: View, Edit, Duplicate, Archive, Delete with confirmation modal (protect historical orders)
  - Bulk actions: Publish, Draft, Archive, Delete
- [x] Full Add New Product form (`/admin/products/new`):
  - Basic Info: Name, SKU, editable Slug, Descriptions, Brand, Category, Subcategory, Collection, Tags, Gender, Product Type
  - Pricing: Regular, Sale, Cost, auto-discount %, Tax, Sale Dates
  - Variations: Multi-size and multi-color matrix with individual SKUs, stock, prices, barcodes, color hex
  - Image Manager: Drag-and-drop, multi-file upload, color association, alt-text
  - Inventory: Opening stock, low-stock threshold, automatic inventory movement logs
  - Publishing: Draft, Publish, Scheduled, Featured, New Arrival, Best Seller
- [x] Complete Edit Product view (`/admin/products/[id]/edit`):
  - Full modification of all attributes, variants, images, SEO metadata, stock history
- [x] Product Duplication API `/api/products/[id]/duplicate`

### 4. Categories, Subcategories, Collections & Brands
- [x] Category Management (`/admin/categories`): CRUD, image upload, parent category hierarchy, active status
- [x] Subcategory Management (`/admin/subcategories`): Dedicated filtered view with parent selector
- [x] Collection Management (`/admin/collections`): CRUD, banner, product assignment, scheduling
- [x] Brand Management (`/admin/brands`): CRUD, logo, website, description
- [x] Product Attributes (`/admin/attributes`): Color palette, sizing charts, fabrics, fits

### 5. Bulk Product Import & Export
- [x] Import/Export Hub (`/admin/products/import-export`):
  - Download sample CSV template with exact column headers
  - Upload CSV, validate schema, duplicate SKU check, preview valid/invalid rows
  - Import execution with optional update-by-SKU toggle
  - Export all or filtered products to CSV

### 6. Full Website Customization System
- [x] Admin Sidebar Section: `WEBSITE CUSTOMIZATION` with all 13 sub-items
- [x] Theme Settings (`/admin/customization/theme`):
  - Palette (Primary, Secondary, Accent, Background, Text, Buttons)
  - Typography (Headings, Body)
  - Styling (Border radius, container width, spacing)
  - Live preview & Reset to Default
- [x] Homepage Drag-and-Drop Builder (`/admin/customization/homepage`):
  - 18 customizable section types (Hero, Slider, Category Grid, New Arrivals, Best Sellers, Brand Story, Lookbook, Reviews, etc.)
  - Section reordering, editing, visibility toggling, duplicating
  - Desktop and Mobile responsive preview mode
  - Draft vs Published version control
- [x] Header Customization (`/admin/customization/header`):
  - Logo, mobile logo, height, sticky mode, navigation menu assignment, search/wishlist/cart icon toggles
- [x] Footer Customization (`/admin/customization/footer`):
  - Logo, description, columns, social links, payment icons, copyright
- [x] Banner Management (`/admin/customization/banners`):
  - Desktop/mobile imagery, headlines, CTAs, display position, date scheduling
- [x] Navigation Menu Builder (`/admin/customization/navigation`):
  - Tree-based menu items, nested dropdowns, category/collection/custom page links
- [x] Popup Management (`/admin/customization/popups`):
  - Welcome, discount, newsletter modals with frequency/cookie rules
- [x] Page Management (`/admin/customization/pages` & `/admin/customization/pages/[slug]`):
  - Rich-content editor for About, Policies, FAQs, and custom landing pages
- [x] SEO Management (`/admin/customization/seo`):
  - Global metadata, sitemap generator, robots.txt, schema markup

### 7. Storefront Integration & Live Preview System
- [x] Dynamic Storefront Theme Provider reading published `SiteCustomization`
- [x] Dynamic Header & Footer using configured menus and customization settings
- [x] Dynamic Homepage reading published section configurations
- [x] Preview Mode (`/?preview=draft`) allowing administrators to view draft changes before publishing

### 8. Admin Permissions & Role Enforcement
- [x] Extend authorization middleware with granular permissions:
  - Product View, Create, Edit, Delete
  - Inventory, Categories, Collections, Brands
  - Website Customization, Homepage Builder, Theme, Banners, SEO, Bulk Import/Export
- [x] Backend API verification on all mutation endpoints

### 9. QA & Automated Testing
- [x] Expand `scripts/run-tests.mjs` with tests for:
  - Product CRUD, variant stock sync, product duplication, order protection on deletion
  - CSV import/export validation
  - Customization draft vs published isolation
  - Subcategory hierarchy & brand associations
- [x] Execute test suite and verify clean Next.js build (42/42 tests passing)
