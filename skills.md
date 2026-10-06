# skills.md --- Personal Data Science Portfolio Website

## 1. Purpose

You are an expert full-stack website generation agent. Your task is to
design and build a complete, production-ready personal portfolio website
for **Emmanuel Kiriinya**, a Data Scientist with interests and
experience in data science, machine learning, artificial intelligence,
analytics, deep learning, and technical mentorship.

The website must be:

-   Professional and modern
-   Visually distinctive without sacrificing usability
-   Fully responsive
-   Accessible
-   Fast and SEO-friendly
-   Easy to maintain
-   Backed by an admin panel
-   Designed so that major content can be edited without changing source
    code
-   Suitable for showcasing professional work to recruiters, employers,
    collaborators, and technical audiences

The visual identity should combine a modern technology portfolio
aesthetic with **subtle African-inspired patterns and colors**. African
patterns are a visual accent and brand signature, not the dominant
background of every page.

------------------------------------------------------------------------

# 2. Core Product Requirements

Build two major experiences:

## Public Portfolio

The public website should include:

1.  Home
2.  About
3.  Experience
4.  Education
5.  Technical Skills
6.  Projects
7.  Project Detail Pages
8.  Blog
9.  Individual Blog Articles
10. Certifications
11. Testimonials
12. Resume Access
13. Contact
14. Footer
15. Search where appropriate

## Admin Panel

The admin panel should allow the portfolio owner to manage:

1.  Profile information
2.  Hero content
3.  About content
4.  Work experience
5.  Education
6.  Technical skills
7.  Projects
8.  Blog posts
9.  Blog categories
10. Blog tags
11. Certifications
12. Testimonials
13. Images and media
14. Resume link
15. Social links
16. Contact information
17. Featured content
18. Site settings
19. SEO settings

The admin panel should require authentication and should not be publicly
accessible.

------------------------------------------------------------------------

# 3. Design Philosophy

The design should feel like:

> Modern Data Science + Technology + Personal Professional Brand +
> Subtle African Visual Identity

Prioritize:

-   Clean layouts
-   Excellent readability
-   Strong typography
-   Generous whitespace
-   Responsive design
-   High-quality imagery
-   Minimal but meaningful animation
-   Consistent component design

Do not create a generic template-like portfolio.

Do not overload the interface with:

-   Too many colors
-   Too many animations
-   Patterns behind text
-   Excessive gradients
-   Excessive glassmorphism
-   Decorative elements that reduce readability

------------------------------------------------------------------------

# 4. African Pattern and Color Integration

The provided African-inspired artwork is a **visual reference for
patterns and colors only**.

Ignore the infinity shape or symbol in the reference image.

The website should draw inspiration from:

-   African geometric patterns
-   Repeating motifs
-   Organic decorative lines
-   Vibrant orange and gold tones
-   Green
-   Blue
-   Purple
-   Red
-   Black and dark neutral backgrounds

## Important Pattern Rule

Patterns must be used as accents rather than covering every page.

### Major Pattern Usage

Use larger pattern artwork in only a few high-impact places:

-   Hero visual area
-   Blog landing page header
-   Footer
-   Optional About page visual

### Medium Pattern Usage

Use cropped or simplified patterns for:

-   Section header accents
-   Featured project accents
-   Contact section
-   Testimonials
-   Blog category headers

### Small Pattern Usage

Use subtle pattern details for:

-   Borders
-   Decorative strips
-   Card corners
-   Dividers
-   Hover states
-   Large quotation mark decoration

## Never Use Patterns

Do not place detailed patterns:

-   Behind paragraphs
-   Behind long-form blog content
-   Behind code blocks
-   Behind forms
-   Behind important buttons
-   Across every card
-   Throughout the admin dashboard

------------------------------------------------------------------------

# 5. Color System

Create a disciplined design system inspired by the African artwork.

## Base Colors

Use neutral colors for most of the interface:

-   Dark background: near-black
-   Light background: off-white
-   Primary text: near-black or white depending on theme
-   Secondary text: neutral gray
-   Borders: subtle neutral tones

## Accent Colors

Extract a controlled palette inspired by:

-   Orange / gold
-   Green
-   Blue
-   Purple
-   Red

Do not use every accent color on every screen.

Assign clear roles. For example:

-   Primary brand accent: orange or gold
-   Secondary accent: green
-   Interactive accent: blue
-   Special AI/deep learning accent: purple
-   Red: alerts and limited visual emphasis

Use CSS variables or design tokens so the palette can be changed
globally.

------------------------------------------------------------------------

# 6. Theme Support

Support:

-   Dark mode
-   Light mode
-   System preference detection

The dark theme should be the primary visual direction if it best
complements the African pattern artwork, but both themes should be
polished.

Theme preference should persist.

------------------------------------------------------------------------

# 7. Public Website Navigation

Create a responsive navigation bar.

Suggested navigation:

-   Home
-   About
-   Experience
-   Projects
-   Blog
-   Certifications
-   Contact

Optional dropdown or condensed mobile navigation may include:

-   Skills
-   Education
-   Testimonials

Include:

-   Personal logo or initials
-   Theme toggle
-   Responsive mobile menu
-   Resume CTA

The navigation should remain accessible and easy to use.

------------------------------------------------------------------------

# 8. Home Page

The homepage should communicate the owner's professional identity
immediately.

## 8.1 Hero Section

Include:

-   Name
-   Professional title
-   Short professional introduction
-   Profile image or optional portrait
-   Primary CTA: View Projects
-   Secondary CTA: Download/View Resume
-   Social links
-   African-inspired visual pattern on one side

Suggested positioning:

-   Text content on the left
-   Abstract African pattern visual on the right

Do not place text directly over complex patterns.

All hero content must be editable from the admin panel.

### Editable Fields

-   Name
-   Headline
-   Short description
-   Profile image
-   Primary CTA text and link
-   Secondary CTA text and link
-   Social links
-   Hero visual

------------------------------------------------------------------------

# 9. About Section

Create a concise but engaging About section.

Include:

-   Professional introduction
-   Areas of expertise
-   Professional interests
-   Optional profile image
-   Optional key statistics

Possible statistics:

-   Years of experience
-   Number of projects
-   Number of technologies
-   Number of articles

Statistics should be editable.

Use a small African pattern accent near the section heading or image.

------------------------------------------------------------------------

# 10. Experience Section

Display professional experience in a clear timeline or modern card
format.

Each experience entry should support:

-   Job title
-   Organization
-   Organization logo
-   Employment type
-   Location, optional
-   Start date
-   End date
-   Current role toggle
-   Description
-   Key achievements
-   Technologies used
-   Display order

The public presentation should prioritize readability and quantified
achievements.

The admin panel must support:

-   Create
-   Edit
-   Delete
-   Reorder
-   Publish/hide

------------------------------------------------------------------------

# 11. Education Section

Keep education separate from certifications.

Each education entry should support:

-   Institution name
-   Institution logo
-   Degree
-   Field of study
-   Start date, optional
-   Graduation date
-   Description, optional
-   Verification or institution link, optional

Admin editable.

------------------------------------------------------------------------

# 12. Technical Skills

Create a visually engaging technical skills section.

## Display

Each skill must display:

-   Actual technology icon
-   Technology name

Icons may come from:

-   Icons8
-   Simple Icons
-   Devicon
-   Other properly licensed icon providers

Do not rely on text-only skills.

## Carousel

Create a smooth flowing carousel or marquee effect showing technology
icons and names.

Requirements:

-   Smooth animation
-   Pause on hover
-   Accessible reduced-motion behavior
-   No abrupt jumps
-   Responsive
-   Duplicate items intelligently to create continuous movement
-   Do not make the animation distracting

## Categories

Support categories such as:

-   Programming and Data
-   Machine Learning
-   Deep Learning
-   Data Visualization
-   AI and LLMs
-   Cloud and Deployment
-   Databases
-   Developer Tools

Allow either:

-   One combined flowing carousel
-   Category filtering
-   Multiple category rows

## Admin Fields

Each skill should support:

-   Name
-   Icon URL or uploaded icon
-   Category
-   Official website URL, optional
-   Display order
-   Active/hidden status

------------------------------------------------------------------------

# 13. Projects

Create a dedicated projects section and projects page.

## Project Cards

Each project card should include:

-   Project image
-   Project title
-   Short description
-   Technologies
-   Category
-   Featured status

Each project must support two action buttons:

### GitHub

Required when available.

The GitHub URL must be editable from the admin panel.

### Live Demo

Optional.

Only display the Live Demo button when a valid URL exists.

Example:

[GitHub](#github) [Live Demo](#live-demo)

Do not display an empty or disabled live demo button.

## Project Admin Fields

Support:

-   Title
-   Slug
-   Short description
-   Full description
-   Cover image
-   Gallery images
-   Technologies
-   Category
-   GitHub URL
-   Live demo URL
-   Featured toggle
-   Publish status
-   Display order
-   Completion date

------------------------------------------------------------------------

# 14. Project Detail Pages

Each project should have a dedicated detail page.

Suggested structure:

1.  Project title
2.  Hero image
3.  Overview
4.  Problem
5.  Solution
6.  Dataset, when applicable
7.  Methodology
8.  Technologies
9.  Models or approaches used
10. Evaluation and results
11. Screenshots or gallery
12. GitHub button
13. Optional live demo button
14. Related projects

For Data Science and Machine Learning projects, support rich technical
storytelling.

The project content should be editable through the admin panel.

------------------------------------------------------------------------

# 15. Blog

Create a full technical blog.

The blog should be a major feature of the portfolio.

## Blog Listing Page

Include:

-   Blog title and description
-   African-inspired pattern accent in the header
-   Featured article
-   Article cards
-   Search
-   Category filtering
-   Tag filtering
-   Pagination or load more
-   Reading time
-   Publication date

## Article Card

Display:

-   Cover image
-   Category
-   Title
-   Excerpt
-   Date
-   Reading time
-   Tags, optional
-   Read more link

------------------------------------------------------------------------

# 16. Blog Editor

The admin panel must include a rich text editor.

The editor should feel intuitive and provide formatting similar to
modern collaboration and messaging tools.

## Required Formatting

Support:

-   Paragraphs
-   Headings
-   Bold
-   Italic
-   Underline
-   Strikethrough, optional
-   Ordered lists
-   Bullet lists
-   Task lists, optional
-   Blockquotes
-   Horizontal dividers
-   Links
-   Images
-   Image captions
-   Tables
-   Code blocks

## Technical Writing Support

Support:

-   Python code blocks
-   SQL code blocks
-   JavaScript code blocks
-   Bash code blocks
-   JSON code blocks
-   Syntax highlighting
-   Copy code button

Optional advanced support:

-   Mathematical equations
-   Mermaid diagrams
-   Embedded charts
-   Jupyter Notebook links
-   GitHub repository embeds or links

## Image Support

Inside the editor, allow:

-   Upload image
-   Select existing image from media library
-   Insert image into article
-   Add alt text
-   Add caption
-   Resize or choose display size where supported

------------------------------------------------------------------------

# 17. Blog Post Management

Each post should support:

-   Title
-   Slug
-   Excerpt
-   Rich content
-   Cover image
-   Category
-   Tags
-   Status
-   Featured toggle
-   Author
-   Created date
-   Updated date
-   Published date

## Statuses

Support:

-   Draft
-   Published

Optional:

-   Scheduled

## Admin Actions

Support:

-   Create
-   Edit
-   Preview
-   Save draft
-   Publish
-   Unpublish
-   Delete

Avoid permanently deleting content accidentally. Prefer confirmation
dialogs and soft delete where appropriate.

------------------------------------------------------------------------

# 18. Blog Article Page

Individual articles should prioritize readability.

Include:

-   Cover image
-   Title
-   Author
-   Date
-   Updated date when relevant
-   Reading time
-   Category
-   Tags
-   Share controls
-   Table of contents for longer articles
-   Rich content
-   Syntax-highlighted code
-   Images
-   Related articles

Use African patterns only as:

-   Header accent
-   Section decoration
-   Divider

Keep the article body clean and distraction-free.

------------------------------------------------------------------------

# 19. Certifications

Create a dedicated certification section and optional full page.

Each certification card should support:

-   Certification name
-   Issuing institution
-   Institution logo or profile image
-   Certificate image, optional
-   Issue date
-   Expiry date, optional
-   Credential ID, optional
-   Verification URL
-   Description, optional
-   Display order
-   Featured toggle

## Actions

Provide:

-   Verify Credential
-   View Certificate, when available

Verification links must be editable from the admin panel.

------------------------------------------------------------------------

# 20. Resume

The website must support a downloadable or viewable resume.

Primary requirement:

-   Resume URL may be a Google Drive link

The Google Drive URL must be editable from the admin panel.

Also support:

-   Direct PDF URL
-   Optional uploaded PDF in storage

Public actions:

-   Download Resume
-   View Resume

Use the most appropriate behavior depending on the link type.

Do not hardcode the resume URL.

------------------------------------------------------------------------

# 21. Testimonials

Create a testimonial carousel.

Each testimonial should support:

-   Person's name
-   Profile image
-   Professional title
-   Organization, optional
-   Testimonial text
-   LinkedIn profile URL
-   Display order
-   Published/hidden status

## Public Display

Use a responsive carousel with:

-   Profile image
-   Name
-   Title
-   Testimonial
-   LinkedIn action

Use a subtle African-inspired decorative quotation mark or pattern
accent.

Do not overload testimonial cards with decoration.

## Carousel Requirements

-   Mobile responsive
-   Keyboard accessible
-   Swipe support on touch devices
-   Previous/next controls
-   Pagination indicators if useful
-   Pause auto-play on interaction
-   Respect reduced motion preferences

------------------------------------------------------------------------

# 22. Contact

Create a dedicated contact section or page.

Include:

-   Contact introduction
-   Email
-   LinkedIn
-   GitHub
-   Contact form

## Contact Form

Fields:

-   Name
-   Email
-   Subject
-   Message

Requirements:

-   Validation
-   Spam protection
-   Success feedback
-   Error feedback
-   Accessible labels

The contact method should be configurable.

Possible implementations:

-   Database storage
-   Email service
-   Server-side email provider

Do not expose secrets in the frontend.

------------------------------------------------------------------------

# 23. Social Links

Create centralized social profile management.

Support:

-   LinkedIn
-   GitHub
-   Email
-   Other platforms as needed

These links should be reusable across:

-   Hero
-   Contact
-   Footer
-   Other relevant sections

Update once in admin settings and reflect changes everywhere.

------------------------------------------------------------------------

# 24. Featured Content

Allow the administrator to mark content as featured.

Support:

-   Featured projects
-   Featured blog posts
-   Featured certifications

The homepage should automatically display selected featured content.

Do not require duplicate data entry.

------------------------------------------------------------------------

# 25. Search

Implement search where useful.

## Searchable Content

Search:

-   Blog posts
-   Projects

Support searching by:

-   Title
-   Excerpt
-   Tags
-   Categories
-   Relevant content fields where practical

Provide clear empty states.

Example:

"No results found. Try a different search term."

------------------------------------------------------------------------

# 26. Media Library and Image Storage

The admin panel must include a media library.

This is a major requirement.

## Media Library Features

Support:

-   Upload image
-   Drag and drop upload
-   Browse existing images
-   Search media
-   Copy image URL
-   Delete media
-   View image preview
-   Edit alt text
-   View upload date
-   View file name

Optional:

-   Folders
-   Tags
-   Usage tracking

Suggested organization:

-   Profile
-   Blog
-   Projects
-   Certifications
-   Testimonials
-   General

## Image Requirements

Support:

-   JPEG
-   PNG
-   WebP

Optimize images where possible.

Use responsive image delivery.

Store image metadata separately when useful.

Do not store large image binaries directly in the relational database
unless there is a compelling architectural reason.

------------------------------------------------------------------------

# 27. Admin Panel

The admin panel should be clean, functional, and intentionally less
decorative than the public portfolio.

Do not use African patterns throughout the dashboard.

## Admin Navigation

Suggested navigation:

Dashboard

Content - Blog Posts - Projects - Certifications - Testimonials

Profile - About - Experience - Education - Skills

Media - Media Library

Settings - Resume - Social Links - Contact - Homepage - SEO

Logout

------------------------------------------------------------------------

# 28. Admin Dashboard

Display useful summary information:

-   Total blog posts
-   Published posts
-   Draft posts
-   Total projects
-   Total certifications
-   Total testimonials

Optional:

-   Recent activity
-   Recently edited content
-   Quick create buttons

Include quick actions:

-   New Blog Post
-   New Project
-   Upload Media

------------------------------------------------------------------------

# 29. Admin Authentication and Security

The admin panel must be protected.

Requirements:

-   Secure login
-   Secure password handling
-   Protected admin routes
-   Session management
-   Logout
-   Authentication state persistence
-   Server-side authorization checks

Initially support a single administrator if appropriate, but structure
the system so roles can be added later.

Never expose:

-   Database credentials
-   API secrets
-   Storage secrets
-   Private authentication keys

Use environment variables for secrets.

------------------------------------------------------------------------

# 30. Settings

Create a centralized settings area.

## Profile Settings

-   Name
-   Headline
-   Bio
-   Profile image

## Resume Settings

-   Google Drive URL
-   Direct PDF URL
-   Resume label

## Social Settings

-   LinkedIn
-   GitHub
-   Email

## Contact Settings

-   Public email
-   Contact form destination

## Homepage Settings

Allow:

-   Show/hide sections
-   Section order where practical
-   Featured content configuration

## SEO Settings

Support:

-   Site title
-   Site description
-   Default keywords
-   Default social image
-   Site URL

------------------------------------------------------------------------

# 31. SEO

Implement strong SEO.

Requirements:

-   Semantic HTML
-   Unique page titles
-   Meta descriptions
-   Canonical URLs
-   Open Graph metadata
-   Twitter/social metadata where appropriate
-   Sitemap
-   Robots configuration
-   Structured data where useful

## Blog SEO

Each article should support:

-   SEO title
-   Meta description
-   Social share image

If these are not manually provided, generate sensible fallbacks from
article data.

Do not require the admin to configure every SEO field for a post to
publish it.

------------------------------------------------------------------------

# 32. Accessibility

Meet modern accessibility expectations.

Requirements:

-   Keyboard navigation
-   Visible focus states
-   Proper semantic HTML
-   Accessible form labels
-   Sufficient color contrast
-   Alt text support
-   ARIA only where necessary
-   Accessible carousel controls
-   Reduced motion support

Do not rely only on color to communicate meaning.

------------------------------------------------------------------------

# 33. Responsive Design

The website must work on:

-   Mobile
-   Tablet
-   Laptop
-   Large desktop

Mobile should not be an afterthought.

Requirements:

-   Responsive navigation
-   Responsive project cards
-   Responsive blog layout
-   Responsive image galleries
-   Responsive admin panel
-   Touch-friendly controls
-   Readable typography

------------------------------------------------------------------------

# 34. Animations

Use subtle animations.

Good uses:

-   Fade-in on scroll
-   Small card hover effects
-   Smooth carousel movement
-   Button transitions
-   Page transitions if lightweight
-   Pattern reveal in hero

Avoid:

-   Excessive bouncing
-   Constant moving backgrounds
-   Long entrance animations
-   Animation that delays access to content

Respect:

prefers-reduced-motion

------------------------------------------------------------------------

# 35. Recommended Data Model

Design the database around reusable entities.

Suggested entities:

## User

-   id
-   name
-   email
-   password/auth provider
-   role
-   created_at
-   updated_at

## Profile

-   id
-   name
-   headline
-   bio
-   profile_image_id
-   hero_description
-   created_at
-   updated_at

## Experience

-   id
-   title
-   organization
-   organization_logo_id
-   employment_type
-   location
-   start_date
-   end_date
-   current
-   description
-   display_order
-   published

## ExperienceAchievement

-   id
-   experience_id
-   content
-   display_order

## Education

-   id
-   institution
-   institution_logo_id
-   degree
-   field_of_study
-   start_date
-   graduation_date
-   description
-   verification_url
-   display_order

## SkillCategory

-   id
-   name
-   slug
-   display_order

## Skill

-   id
-   name
-   icon_url
-   icon_media_id
-   category_id
-   official_url
-   display_order
-   active

## Project

-   id
-   title
-   slug
-   excerpt
-   content
-   cover_image_id
-   github_url
-   live_url
-   category
-   featured
-   status
-   completion_date
-   display_order
-   created_at
-   updated_at

## ProjectMedia

-   id
-   project_id
-   media_id
-   display_order

## BlogPost

-   id
-   title
-   slug
-   excerpt
-   content
-   cover_image_id
-   author_id
-   category_id
-   status
-   featured
-   seo_title
-   seo_description
-   social_image_id
-   published_at
-   created_at
-   updated_at

## BlogCategory

-   id
-   name
-   slug
-   description

## BlogTag

-   id
-   name
-   slug

## BlogPostTag

-   post_id
-   tag_id

## Certification

-   id
-   name
-   issuer
-   issuer_logo_id
-   certificate_image_id
-   issue_date
-   expiry_date
-   credential_id
-   verification_url
-   description
-   featured
-   display_order
-   published

## Testimonial

-   id
-   name
-   title
-   organization
-   profile_image_id
-   content
-   linkedin_url
-   display_order
-   published

## Media

-   id
-   file_name
-   storage_path
-   public_url
-   mime_type
-   alt_text
-   caption
-   category
-   created_at

## SiteSettings

-   id
-   site_title
-   site_description
-   default_social_image_id
-   resume_url
-   resume_type
-   public_email
-   linkedin_url
-   github_url
-   theme_defaults

------------------------------------------------------------------------

# 36. Storage Architecture

Use object storage for media files.

Suggested buckets:

-   profile
-   blog
-   projects
-   certifications
-   testimonials
-   general
-   resumes

Use database records to reference media metadata and URLs.

The implementation should make it easy to switch storage providers if
needed.

------------------------------------------------------------------------

# 37. Recommended Technology Direction

Choose a modern stack appropriate for:

-   SEO
-   Admin functionality
-   Authentication
-   Database
-   Image storage
-   Rich content
-   Responsive UI

A suitable direction is:

## Frontend and Full Stack

Next.js with TypeScript

## Styling

Tailwind CSS or an equally maintainable component styling system.

## Database

PostgreSQL

## Backend Services

A managed backend platform may provide:

-   PostgreSQL
-   Authentication
-   Object storage

## Rich Text

Use a modern editor suitable for:

-   Rich text
-   Images
-   Tables
-   Code blocks

Examples of appropriate editor categories include:

-   Block editor
-   Rich text editor
-   Extensible editor with syntax highlighting support

Choose an implementation that stores portable structured content or
well-defined HTML/JSON safely.

## Deployment

Use a production-ready hosting platform with:

-   Environment variable support
-   HTTPS
-   Build automation
-   Preview deployments

The architecture should avoid unnecessary microservices.

------------------------------------------------------------------------

# 38. Performance

Optimize for fast loading.

Requirements:

-   Responsive images
-   Image compression
-   Lazy loading where appropriate
-   Code splitting
-   Minimal unnecessary JavaScript
-   Cached static content
-   Efficient database queries
-   Pagination for large collections

Do not sacrifice content quality for artificial performance scores.

------------------------------------------------------------------------

# 39. Error States and Empty States

Design all major states.

Examples:

## No Projects

"No projects are available yet."

## No Blog Results

"No articles matched your search."

## No Testimonials

Hide the section or show a clean empty state.

## Image Upload Error

Explain what failed and how to fix it.

## Missing Live Demo

Show GitHub only.

Do not leave broken buttons or empty containers.

------------------------------------------------------------------------

# 40. Content Editing Principle

The owner should not need to edit code for normal content updates.

The following must be editable from the admin panel:

-   Hero content
-   About content
-   Profile image
-   Skills
-   Projects
-   Project links
-   Blog posts
-   Blog images
-   Certifications
-   Institution images
-   Resume link
-   Testimonials
-   Testimonial LinkedIn URLs
-   Experience
-   Education
-   Social links
-   Contact information
-   Featured content
-   SEO settings

------------------------------------------------------------------------

# 41. Suggested Public Routes

Use a clean route structure.

/

Home

/about

/projects

/projects/\[slug\]

/blog

/blog/\[slug\]

/certifications

/contact

Optional:

/experience

/resume

------------------------------------------------------------------------

# 42. Suggested Admin Routes

/admin

/admin/login

/admin/dashboard

/admin/posts

/admin/posts/new

/admin/posts/\[id\]/edit

/admin/projects

/admin/projects/new

/admin/projects/\[id\]/edit

/admin/skills

/admin/certifications

/admin/testimonials

/admin/experience

/admin/education

/admin/media

/admin/settings

------------------------------------------------------------------------

# 43. Quality Requirements

Before considering the website complete, verify:

## Functionality

-   Admin login works
-   Protected routes work
-   Blog creation works
-   Blog editing works
-   Draft and publish work
-   Image upload works
-   Media library works
-   Projects can be created and edited
-   GitHub URLs work
-   Optional live demo button hides correctly
-   Skills carousel works
-   Certifications are editable
-   Verification links work
-   Resume link is editable
-   Testimonials work
-   LinkedIn testimonial links work
-   Contact form works

## UI

-   No broken layouts
-   No horizontal scrolling on mobile
-   Patterns do not obscure text
-   Colors have sufficient contrast
-   Carousels are usable
-   Buttons are clear
-   Forms are usable

## Content

-   No placeholder lorem ipsum in production
-   No broken images
-   No broken links
-   No hardcoded content that should be admin editable

------------------------------------------------------------------------

# 44. Implementation Strategy

Build incrementally.

## Phase 1: Foundation

Implement:

-   Project setup
-   Database
-   Authentication
-   Storage
-   Design system
-   Public layout
-   Admin layout

## Phase 2: Core Portfolio

Implement:

-   Hero
-   About
-   Experience
-   Education
-   Skills
-   Projects
-   Certifications
-   Testimonials
-   Contact

## Phase 3: Admin CMS

Implement:

-   Profile management
-   Skills management
-   Projects management
-   Certifications management
-   Testimonials management
-   Experience management
-   Education management
-   Settings

## Phase 4: Blog

Implement:

-   Blog listing
-   Categories
-   Tags
-   Rich text editor
-   Image embedding
-   Draft/publish
-   Article pages
-   Search

## Phase 5: Polish

Implement:

-   SEO
-   Accessibility
-   Animation
-   Performance optimization
-   Empty states
-   Error handling
-   Mobile testing

------------------------------------------------------------------------

# 45. Final Visual Direction

The final website should feel:

-   Intelligent
-   Personal
-   Modern
-   Technical
-   Professional
-   Culturally distinctive
-   Easy to navigate

The African-inspired patterns should act as a recognizable visual
signature.

The final balance should be approximately:

-   80 to 90 percent clean modern interface
-   10 to 20 percent African-inspired visual accents

Do not turn the entire interface into a patterned artwork.

The user experience, portfolio content, projects, technical writing, and
professional credibility must remain the primary focus.

------------------------------------------------------------------------

# 46. Final Acceptance Criteria

The website is complete when:

1.  The public portfolio is responsive and professional.
2.  All core portfolio content can be managed through the admin panel.
3.  Blog posts support rich formatting and images.
4.  Images can be uploaded and managed through a media library.
5.  Projects support editable GitHub links and optional live demo links.
6.  Technical skills display real icons and names in a smooth carousel.
7.  Certifications support institution images and verification links.
8.  The resume can be accessed through an editable Google Drive or PDF
    link.
9.  Testimonials display in an accessible carousel with names, titles,
    images, and LinkedIn links.
10. Experience and education are manageable from the admin panel.
11. Social links and contact details are centrally managed.
12. African-inspired patterns and colors are used tastefully and
    consistently.
13. The admin panel is secure and functional.
14. The website is SEO-friendly, accessible, and performant.
15. No normal content update requires editing application source code.

---

# 47. Frontend Design

## Design Lead Mindset

Approach the frontend as the design lead at a design studio responsible for giving every client a distinct visual identity that cannot be mistaken for a generic template.

This portfolio must not feel cliché or templated. Make deliberate, opinionated choices about palette, typography, layout, visual hierarchy, pattern usage, motion, and component design.

The design is specifically for:

> A professional Data Scientist, Machine Learning, and AI portfolio with a subtle African-inspired visual identity.

### Audience

- Recruiters and employers
- Technical collaborators
- Potential clients
- Data Science and AI professionals
- Students and readers of technical articles

### Primary Job

Make Emmanuel's work, technical depth, experience, and professional identity memorable while keeping the website clear and easy to use.

---

# 48. Ground the Design in the Subject Matter

Do not design this as a generic:

- SaaS dashboard
- Startup landing page
- Agency website
- Generic developer portfolio
- Template-based blog

Use the real subject matter throughout the design:

- Data and analytics
- Machine learning
- Artificial intelligence
- Technical writing
- Professional portfolio presentation
- African-inspired geometric patterns and color

The result should communicate:

> Technical depth with a distinctive personal and cultural visual identity.

The African-inspired visual language should draw from the provided reference image, especially its:

- Geometric motifs
- Pattern fragments
- Decorative line work
- Orange and gold
- Green
- Blue
- Purple
- Red
- Black

Ignore the infinity symbol from the original reference image. It was provided only to communicate the desired pattern style and color inspiration.

---

# 49. Mandatory Design Process: Plan, Review, Build, Critique

Before generating or substantially reshaping the frontend, work in two passes.

## Pass 1: Create a Compact Design Plan

### Color

Define a core palette using 4 to 6 named hex values.

Give each color a clear role, such as:

- Base background
- Surface
- Primary text
- Secondary text
- Primary accent
- Supporting accent

Do not give every color from the African pattern equal visual weight.

### Type

Choose typefaces deliberately.

Define:

- Display/headline typeface
- Body typeface
- Optional utility typeface only when justified

One family is acceptable if it has sufficient range. If using two families, their roles must be clearly distinct.

Typography should reflect technical credibility, editorial readability, and the portfolio's identity rather than defaulting to the same families used for unrelated projects.

### Layout

Describe the layout concept in one sentence and create simple ASCII wireframes when useful.

Example:

```text
┌─────────────────────────────────────────────────────────┐
│ Navigation                                              │
├───────────────────────────────┬─────────────────────────┤
│ Name and professional story   │ African pattern visual  │
│ Primary actions               │ or profile visual       │
├───────────────────────────────┴─────────────────────────┤
│ Selected projects and technical work                    │
└─────────────────────────────────────────────────────────┘
```

Specify alignment intentionally. Decide whether each area should be:

- Left aligned
- Center aligned
- Mixed
- Grid aligned

Do not center all content by default.

### Principles

Define the high-level rules that make this portfolio unique. Prioritize:

- Clean technical presentation
- Strong editorial readability
- Intentional African-inspired accents
- Distinctive but restrained visual identity
- Clear hierarchy
- Content-first design

---

# 50. Review the Plan Before Building

After creating the design plan, review it against the brief.

Ask:

1. Does this design look specific to Emmanuel's portfolio?
2. Could the same design be used unchanged for a random SaaS company?
3. Are the African patterns being used intentionally rather than decoratively?
4. Does the visual system support Data Science and AI content?
5. Does the blog prioritize readability?
6. Is there one memorable visual idea rather than many competing ones?
7. Does the design avoid obvious generated-template patterns?

If the design feels generic, revise it before implementation.

When the workflow supports it, briefly document:

- What was generic
- What was changed
- Why the revised choice better fits this portfolio

Only then proceed with implementation.

---

# 51. Distinctive Hero Design

The hero is the first thing visitors see and must introduce the most characteristic aspect of this portfolio.

Prioritize:

- Professional identity
- Data Science and AI expertise
- A concise personal statement
- Clear actions
- A memorable African-inspired visual treatment

Do not automatically use:

- A giant number
- Supporting statistics
- A generic gradient blob
- Floating SaaS cards
- Random decorative charts

Use those only when they genuinely serve the content.

A strong direction for this portfolio is:

```text
┌──────────────────────────────────────────────────────────────┐
│ Logo / Navigation                                            │
├───────────────────────────────────┬──────────────────────────┤
│ Emmanuel Kiriinya                 │                          │
│                                   │ African-inspired         │
│ Data Scientist                    │ pattern composition      │
│ Machine Learning / AI             │ with modern geometric    │
│                                   │ framing                  │
│ Short professional statement      │                          │
│                                   │                          │
│ [ View projects ] [ View resume ] │                          │
└───────────────────────────────────┴──────────────────────────┘
```

Do not place important text directly over complex patterns.

The hero should contain the strongest visual expression. Surrounding sections should remain more disciplined.

---

# 52. Typography Requirements

Typography carries much of the personality of the page.

Choose type deliberately based on:

- Technical credibility
- Editorial readability
- Personal character
- Modernity
- Compatibility with African-inspired visual accents

## Type Scale

Create a clear type scale with intentional:

- Font sizes
- Weights
- Line heights
- Letter spacing
- Paragraph spacing

Do not use arbitrary font sizes throughout the application.

## Line Length

Default to readable line lengths of fewer than approximately 80 characters.

Long-form blog content should use narrower content columns.

Serif body typography may use slightly longer lines and additional line height if a serif is selected intentionally.

## Avoid Generic Typographic Treatments

Do not automatically:

- Accent one random word in every headline
- Use a differently colored word simply for decoration
- Put every section title in all caps
- Add unnecessary labels above headings
- Use excessive letter spacing for labels
- Use monospace text for arbitrary metadata

Typography itself can be a visual element, but it must serve content and hierarchy.

---

# 53. Layout and Visual Structure

Visual structure is information.

Use:

- Grids
- Alignment
- Spacing
- Borders
- Dividers
- Grouping
- Scale

only where they help users understand relationships between content.

Do not add numbering, borders, labels, outlines, or dividers merely as decoration.

For example, numbered markers are appropriate for a process or timeline, but not for unrelated sections simply to make them look designed.

Avoid chopping every piece of content into identical rounded cards.

Cards should improve:

- Grouping
- Scanning
- Comparison
- Interaction

A project card, certification item, testimonial, and blog preview do not need identical border radii, shadows, padding, or layouts.

---

# 54. Avoid Generic Template Aesthetics

Avoid automatically falling into these patterns unless they are explicitly justified by the brief.

## Warm Generic Editorial Theme

Do not default to:

- Warm cream backgrounds
- High-contrast serif display text
- Terracotta accents

unless intentionally chosen for this portfolio.

## Single Neon Accent on Black

Do not default to a generic near-black background with acid green or vermilion accents. The African-inspired palette provides a more specific visual direction.

## Broadsheet Layout

Do not automatically use:

- Dense newspaper columns
- Hairline rules everywhere
- Zero border radius everywhere

unless a specific content area benefits from an editorial treatment.

## SaaS Card Kit

Avoid:

- Identical rounded cards everywhere
- One border radius for every component
- The same soft shadow under every object
- Decorative gradient washes
- Repetitive dashboard-style blocks

## Template Chrome

Avoid automatically adding:

- All-caps eyebrow labels above every heading
- Metadata strings joined with decorative middle dots
- Repeated "WORD — fragment" labels
- Arrows appended to every link
- Monospace labels for arbitrary UI metadata

These choices are acceptable when justified, but must not become automatic habits.

---

# 55. African Pattern Restraint

Spend visual boldness primarily on one memorable area.

For this portfolio, the strongest candidate is:

> The hero's African-inspired pattern composition.

Secondary uses may include:

- Blog landing page header
- Footer pattern band
- Section heading accents
- Testimonial quotation mark
- Featured project decoration

Keep the rest of the interface calm.

Before considering a page complete, review every decorative element and remove anything that:

- Does not clarify information
- Does not reinforce visual identity
- Competes with content
- Makes the page feel busy

The pattern is a signature, not wallpaper.

---

# 56. Motion Principles

Use non-user-triggered motion sparingly and deliberately.

Prefer one intentional orchestrated moment over scattered animation throughout the website.

Appropriate motion includes:

- Hero visual reveal
- Subtle skill carousel movement
- User-triggered accordion expansion
- Menu transitions
- Modal opening
- Form confirmation
- Image gallery interaction

Avoid automatically adding:

- Fade-and-slide-up animation to every section
- Hover animations to every card
- Floating elements everywhere
- Constant moving backgrounds
- Delayed animations that block content

Motion should either:

1. Direct attention, or
2. Explain what changed after a user's action.

Respect `prefers-reduced-motion`.

---

# 57. Interaction Design

Interaction should be clear and predictable.

Use direct labels such as:

- Publish
- Save changes
- Upload image
- Delete post
- View project
- Verify credential
- Download resume

Avoid vague actions when a specific action is possible.

For example, do not use "Submit" when the actual action is publishing.

An action should use consistent vocabulary throughout the flow.

Example:

Button: `Publish`

Success message: `Published`

Do not change terminology unnecessarily.

---

# 58. Writing and Interface Copy

Words are part of the design.

Every written element should help users:

- Understand
- Navigate
- Decide
- Act

Write from the user's perspective.

Use:

- Plain language
- Active voice
- Sentence case
- Short, direct instructions
- Specific actions

Avoid:

- Filler
- Generic marketing language
- Buzzwords
- Excessive cleverness
- Unnecessary technical implementation language

Describe what something does rather than how the underlying system is built.

Good:

`Manage blog posts`

Less useful:

`Configure content publishing infrastructure`

---

# 59. Empty States and Error States

Treat empty and failure states as moments for direction.

## Empty State

Instead of:

`No data`

Use:

`No blog posts yet. Create your first article to publish it here.`

## Search Empty State

`No articles matched your search. Try a different term.`

## Error State

Errors should:

- State what happened
- Explain how to fix it when possible
- Avoid vague apologies
- Avoid blaming the user

Example:

`Image upload failed. Upload a PNG, JPG, or WebP file smaller than the allowed size.`

Avoid vague messages such as:

`Something went wrong.`

unless no additional information is safely available.

---

# 60. Design Review and Self-Critique

Before completing major pages, critique the design.

## Visual Identity

- Does the page look specific to this portfolio?
- Is the African-inspired visual language recognizable but restrained?
- Is the design memorable?

## Hierarchy

- Is the most important information obvious?
- Can users scan the page quickly?
- Are headings meaningful?

## Readability

- Is text easy to read?
- Are line lengths appropriate?
- Are code blocks readable?
- Do patterns stay away from long-form content?

## Components

- Are all cards unnecessarily identical?
- Are borders and shadows doing useful work?
- Are there too many decorative elements?

## Motion

- Does motion communicate something?
- Can unnecessary animation be removed?

## Mobile

- Does the design remain intentional on smaller screens?
- Does the hero still work?
- Are carousels usable?
- Is navigation accessible?

When screenshot review is available, inspect rendered pages visually rather than relying only on code.

Remove unnecessary decoration before finalizing.

---

# 61. CSS and Component Implementation Discipline

When implementing the frontend:

- Keep component responsibilities clear.
- Use reusable design tokens.
- Avoid conflicting CSS selector specificity.
- Avoid component styles that accidentally override one another.
- Avoid broad element selectors that create unexpected side effects.
- Keep spacing responsibilities clear between parent layouts and child components.
- Do not let generic utility classes create inconsistent hierarchy.

Pay particular attention to:

- Section margins and padding
- CTA styling
- Card variants
- Heading styles
- Theme overrides
- Mobile overrides

Use a coherent token system for:

- Colors
- Typography
- Spacing
- Border radii
- Shadows
- Motion

Do not apply one border radius or shadow value mechanically to every component.

---

# 62. Final Frontend Design Acceptance Criteria

The frontend design is complete only when:

1. It does not look like a generic generated portfolio template.
2. Its visual choices can be explained using the actual subject matter and audience.
3. The African-inspired patterns and colors are recognizable but restrained.
4. The hero provides the strongest memorable visual moment.
5. Typography has been selected intentionally.
6. Blog content is highly readable.
7. Projects feel distinct from generic SaaS cards.
8. The design works in dark and light themes.
9. Mobile layouts are intentionally designed rather than simply compressed.
10. Motion is purposeful and respects reduced-motion preferences.
11. Interface copy is clear, active, and consistent.
12. Error and empty states provide useful direction.
13. Accessibility and keyboard interaction are maintained.
14. Decorative elements have been reviewed and unnecessary ones removed.
15. The finished website feels personal, professional, technical, and culturally distinctive.
