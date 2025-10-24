# Design Guidelines: Multi-Tenant CRM & Sales Automation Platform

## Design Approach

**Selected Approach:** Reference-Based with Design System Foundation

Drawing primary inspiration from **Linear** and **Notion** for their exceptional data-dense dashboard experiences, combined with enterprise dashboard patterns from **Asana** and **Monday.com**. These references excel at presenting complex information hierarchies while maintaining visual clarity and professional polish.

**Key Design Principles:**
1. Information density without clutter - maximize data visibility while preserving breathing room
2. Consistent spatial rhythm throughout the application
3. Clear visual hierarchy through typography and spacing, not color
4. Functional minimalism - every element serves a purpose
5. Enterprise-grade professionalism with modern sensibilities

---

## Typography System

**Font Selection:**
- Primary: Inter (via Google Fonts CDN) - exceptional readability at all sizes, professional appearance
- Monospace: JetBrains Mono - for API keys, technical data, log outputs

**Hierarchy Scale:**

**Page Titles:** text-3xl font-semibold tracking-tight  
**Section Headings:** text-xl font-semibold  
**Card Titles:** text-lg font-medium  
**Subsection Headers:** text-base font-medium  
**Body Text:** text-sm font-normal  
**Secondary/Meta Text:** text-xs font-normal  
**Table Headers:** text-xs font-semibold uppercase tracking-wide  
**Buttons:** text-sm font-medium  

**Line Heights:**
- Headings: leading-tight (1.25)
- Body text: leading-normal (1.5)
- Dense tables: leading-relaxed (1.625)

---

## Layout System

**Tailwind Spacing Primitives:**

We will use a constrained set of Tailwind units for consistency: **2, 3, 4, 6, 8, 12, 16**

**Common Applications:**
- Component padding: p-4, p-6, p-8
- Card spacing: p-6 internally, gap-6 between cards
- Section margins: mb-8, mb-12
- Table cells: px-4 py-3
- Form fields: p-3
- Icon spacing: mr-2, mr-3
- Grid gaps: gap-4, gap-6

**Container System:**
- Dashboard content area: max-w-7xl mx-auto px-6 py-8
- Modal containers: max-w-2xl
- Form containers: max-w-lg
- Table containers: w-full (with horizontal scroll on mobile)

**Grid Patterns:**
- Overview cards: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- Settings sections: grid grid-cols-1 lg:grid-cols-2 gap-8
- User cards: grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4

---

## Component Library

### Navigation Architecture

**Sidebar (Fixed Left, ~240px width):**
- Logo/org name at top (h-16, px-4)
- Navigation items with icons from Heroicons (h-10, px-3, rounded-md)
- Active state: subtle background treatment
- Bottom section for user profile with avatar (40x40), name, role
- Collapsible on mobile into hamburger overlay

**Top Bar (Fixed, h-16):**
- Breadcrumb navigation on left (text-sm)
- Right section: search input (max-w-md), notification bell icon, profile dropdown
- Consistent px-6 horizontal padding
- Sits flush with sidebar

### Dashboard Components

**Overview Cards:**
- Structure: Rounded corners (rounded-lg), padding p-6
- Layout: Metric number (text-3xl font-bold), label below (text-sm), icon positioned top-right (w-10 h-10)
- Trend indicator: Small arrow icon + percentage (text-xs)
- Border treatment with subtle shadow

**Data Tables:**
- Header row: Sticky position, uppercase text-xs font-semibold, pb-3 border-b
- Data rows: py-3 px-4, border-b on each row except last
- Row hover state for interactivity
- Action buttons in last column (icon buttons, w-8 h-8)
- Pagination at bottom: Compact numbered style
- Empty state: Centered icon + message in py-16

**Task Cards:**
- Compact height (min-h-20), rounded-md border
- Left accent border (w-1) indicating status
- Layout: Title (font-medium), meta row (text-xs) with user avatar + timestamp
- Status badge in top-right (px-2 py-1 rounded text-xs)
- Checkbox for selection on left (mr-3)

**Charts Section:**
- Container: p-6 rounded-lg border
- Chart height: h-64 to h-80 depending on data density
- Use Recharts library via CDN for bar/line charts
- Legend positioned top-right, compact
- Axis labels: text-xs

### Forms & Inputs

**Input Fields:**
- Height: h-10 for text inputs, h-24 for textareas
- Padding: px-3 py-2
- Border: Rounded (rounded-md), 1px border
- Focus state: Ring treatment (focus:ring-2)
- Label above: text-sm font-medium mb-2 block
- Helper text below: text-xs mt-1
- Error state: Red ring + error message

**Buttons:**
- Primary: px-4 py-2, rounded-md, font-medium text-sm
- Secondary: Similar sizing, outlined style
- Icon buttons: w-8 h-8, rounded-md, centered icon (w-4 h-4)
- Loading state: Spinner icon (w-4 h-4 animate-spin) replaces text

**Dropdowns/Selects:**
- Match input height (h-10)
- Chevron icon positioned right (mr-3)
- Dropdown panel: rounded-lg shadow-lg border, max-h-60 overflow-auto

### Modal & Overlays

**Modal Structure:**
- Backdrop: fixed inset-0 with blur effect
- Panel: max-w-2xl, rounded-lg, p-6
- Header: pb-4 border-b, flex justify-between items-center
- Body: py-6
- Footer: pt-4 border-t, flex justify-end gap-3

**Toast Notifications:**
- Fixed top-right positioning
- Width: max-w-sm
- Padding: p-4, rounded-lg
- Icon on left (w-5 h-5), close button on right
- Stacked with gap-3 when multiple

### Agents Placeholder Page

**Agent Cards Grid:**
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Card structure: p-6 rounded-lg border
- Agent icon at top (w-12 h-12 rounded-full)
- Name: text-lg font-semibold mb-2
- Type badge: Inline pill shape (px-2 py-1 rounded text-xs)
- Description: text-sm, 2-line clamp
- Status indicator: Dot (w-2 h-2 rounded-full) + text
- Action row at bottom: Three compact buttons (View, Run, Settings) each w-20 h-8

**Empty State:**
- Centered container: max-w-md mx-auto text-center py-20
- Large icon (w-16 h-16)
- Heading + description
- Primary CTA button

### Settings Pages

**Settings Layout:**
- Left sidebar navigation (~200px, list of setting sections)
- Main content area with max-w-4xl
- Section structure: mb-12 spacing between sections
- Section header: text-xl font-semibold mb-6
- Subsections with cards: p-6 rounded-lg border

**API Key Management:**
- Table with columns: Name, Key (masked with show/hide toggle), Created, Actions
- Generate new key button prominent at top
- Revoke action with confirmation modal

**Integration Cards:**
- Grid of integration options: grid-cols-1 md:grid-cols-2 gap-4
- Card: p-4 rounded-lg border, flex items-center gap-4
- Service logo/icon (w-10 h-10)
- Name + status indicator
- Connect/Configure button on right

---

## Responsive Behavior

**Breakpoints:**
- Mobile: < 768px - Stack cards, single column tables, hamburger sidebar
- Tablet: 768px - 1024px - Two-column grids, visible sidebar
- Desktop: > 1024px - Full multi-column layouts, spacious padding

**Mobile Adaptations:**
- Sidebar collapses to overlay (slide from left)
- Tables horizontal scroll in container
- Overview cards stack to single column
- Reduced padding (p-4 instead of p-6)
- Top bar reduces to essential elements only

---

## Icon System

**Library:** Heroicons (outline and solid variants via CDN)

**Icon Sizing:**
- Navigation: w-5 h-5
- Buttons: w-4 h-4
- Cards/headers: w-6 h-6
- Empty states: w-16 h-16
- Table actions: w-4 h-4

**Common Icons:**
- Dashboard: ChartBarIcon
- Users: UsersIcon
- Tasks: CheckCircleIcon
- Reports: DocumentChartBarIcon
- Settings: CogIcon
- Agents: CpuChipIcon

---

## Animation & Interaction

**Minimal Animation Philosophy:**

Use animations extremely sparingly - only for functional feedback:

- Sidebar expand/collapse: 200ms ease transition
- Modal/toast entrance: 150ms fade + scale
- Dropdown opening: 150ms ease
- Loading spinners: Continuous rotation
- NO scroll animations, parallax, or decorative motion

**Hover States:**
- Subtle background shift on interactive elements
- Cursor pointer on clickable items
- No dramatic transformations

---

## Authentication Pages

**Login/Signup Layout:**
- Centered card: max-w-md, p-8 rounded-lg
- Logo at top centered (mb-8)
- Form fields with mb-4 spacing
- Primary button full width
- Links (forgot password, sign up) below: text-sm
- Minimal, focused, no distractions

**Password Reset:**
- Similar layout to login
- Success state: Green checkmark icon + message
- Link back to login

---

## Images

**No large hero images** - this is a utility dashboard application focused on data and functionality, not marketing. 

**Avatar Images:**
- User avatars throughout: 32x32 (small), 40x40 (default), 48x48 (profile page)
- Organization logo: 40x40 in sidebar, 120x120 in settings

**Empty State Illustrations:**
- Simple illustrative icons or abstract graphics for empty tables/sections
- Placeholder format: `<!-- ILLUSTRATION: [description] -->`

**No decorative imagery** - maintain focus on content and functionality