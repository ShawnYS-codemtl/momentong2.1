# Momento.ng - Sticker E-Commerce Platform

https://momentong.vercel.app/ 

## Project Overview
A friend of mine runs a small sticker business that she currently promotes through Instagram. Orders are collected via a Google Form, and fulfillment requires coordinating in-person meetups with customers. This limits sales primarily to local markets or nearby buyers and makes scaling difficult.

I built this website to give her a proper ecommerce platform where she can showcase her stickers, process orders, collect payments and customer information, and ship products across Canada. The goal was to remove the logistical friction of manual ordering and local-only delivery, while giving her a foundation that could grow with the business.

By moving off Instagram DMs and Google Forms, this project enables broader reach beyond word-of-mouth, streamlines order fulfillment through shipping, and provides a more professional and scalable way to run the business.

This project was also an opportunity to design and deploy a production-ready ecommerce system using modern web technologies and real payment and fulfillment flows.

## Tech Stack & Tooling
| Tool / Technology | Purpose |
|------------------|---------|
| Figma | Designed and iterated on UI/UX before development to validate layout, spacing, and user flow early. |
| Tailwind CSS | Enabled rapid, consistent styling directly in components without maintaining separate CSS files. |
| TypeScript | Provided type safety across the codebase, reducing runtime errors and improving scalability and refactorability. |
| Next.js (App Router) | Delivered a production-ready full-stack setup with server components and API routes for efficient data fetching and separation of concerns. |
| Supabase (PostgreSQL, Storage, Auth) | Served as the backend database, image storage, and authentication system for securely managing products, orders, and admin access. |
| Stripe | Handled secure payment processing via embedded checkout, simplifying PCI compliance and user payments. |
| Vercel | Provided deployment and hosting with seamless CI/CD, serverless functions, and tight Next.js integration. |
| Nodemailer / SMTP / Resend | Implemented transactional emails for order confirmations and post-checkout notifications. |

## Architecture Overview
This project is built with Next.js App Router to structure pages, API routes, and components in a full-stack, production-ready setup. The architecture balances server-side rendering, client-side interactivity, and dynamic routing to create a seamless ecommerce experience.

### Pages and Components
Server and client components are explicitly separated using the App Router, with "use client" marking interactive components and all data-fetching defaults safely executed on the server.

| Component Type | When It’s Used | Responsibilities |
|---------------|---------------|------------------|
| Server Components | Default for pages and layouts that fetch or render sensitive data | Fetch data directly from Supabase or Stripe, enforce authorization, render content securely and efficiently, and improve performance and SEO. |
| Client Components | Used only when browser-side interactivity is required | Handle user interactions, forms, query parameters, Stripe embedded checkout, and dynamic UI state using React hooks and browser APIs. |


### API Routes

All backend logic is handled in app/api server routes, including:
	
	/api/admin/orders/[id]/update-status – Updates order status for admin management.

	/api/admin/stickers – Handles creating new stickers and fetching sticker data.

	/api/admin/stickers/[sid] – Handles editing or deleting a specific sticker.

	/api/checkout – Computes subtotal server-side, creates Stripe session, and returns the client secret for the embedded checkout.

	/api/contact – Processes customer messages from the contact form.

	/api/webhooks/stripe – Processes Stripe webhooks, updating order status, stock, and sending confirmation emails.

These routes handle sensitive operations securely and interact directly with Supabase and Stripe.

### Dynamic Routes

Pages like /stickers/[slug] and /collections/[slug] are dynamic. The route parameter (slug or id) is used to fetch the correct resource from Supabase, allowing content-driven pages to scale without duplicating code.

### Stripe Integration

Stripe embedded checkout is client-only. The client secret is generated server-side and passed to the embedded checkout component. On payment success or cancellation, users are redirected to the appropriate dynamic page, and server-side webhooks ensure backend operations are triggered reliably.

### Supabase Integration

- Database: Stores orders, customers, collections, and sticker information.

- Storage: Manages public images for stickers and collections.

- Authentication: Admin access is secured with Supabase Auth, restricting product, order, and collection management to authorized users only.

### Webhooks and Post-Payment Flow

Stripe webhooks trigger server-side actions after a successful payment:

1. The corresponding order status is updated in Supabase

2. Sticker stock is decremented automatically

3. A confirmation email is sent to the customer

This ensures orders, inventory, and communications are fully automated without manual intervention.

### Static vs Dynamic Pages

Public-facing pages such as /about, /cart, /checkout, /terms, and /privacy are mostly statically generated for fast loading. Admin pages and dynamic resource pages rely on server rendering or client-side fetching to provide up-to-date data.

### Overall Data Flow

1. User interacts with the client (browsing, adding to cart, checkout)

2. Client requests data from API routes or server components

3. Stripe processes the payment and triggers webhooks

4. Webhooks update Supabase order status, inventory, and send confirmation emails

5. Admin panel fetches fresh data from Supabase for management of stickers, collections, and orders

This architecture ensures a secure, automated, and scalable ecommerce system, combining the benefits of server-side rendering, client interactivity, and fully managed backend services.

## Environment Variables
This project relies on a mix of public and server-only environment variables to manage configuration, secrets, and integrations.

| Scope | Environment Variable | Purpose |
|------|----------------------|---------|
| Public | NEXT_PUBLIC_SITE_URL | Absolute site URL used for redirects and links in transactional emails. |
| Public | NEXT_PUBLIC_SUPABASE_URL | Supabase project URL for client-side database and auth requests. |
| Public | NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Stripe publishable key used for client-side embedded checkout. |
| Server-only | SUPABASE_SERVICE_ROLE_KEY | Grants full access to the Supabase database for privileged server-side operations. |
| Server-only | STRIPE_SECRET_KEY | Stripe secret key for creating payments, sessions, and managing secure Stripe operations. |
| Server-only | STRIPE_WEBHOOK_SECRET | Verifies the authenticity of incoming Stripe webhook events. |
| Server-only | SMTP_HOST | SMTP server address used for sending transactional emails. |
| Server-only | SMTP_USER | Email account username for SMTP authentication. |
| Server-only | SMTP_PASS | Password or app-specific token for SMTP email sending (e.g., Gmail App Password). |
| Server-only | SMTP_PORT | Port used to connect to the SMTP server (commonly 587 for TLS). |
| Server-only | RESEND_API_KEY | API key for sending transactional emails via Resend. |
| Server-only | RESEND_FROM_EMAIL | Sender email address used for emails sent through Resend. |

## Lessons Learned

1. Next.js App Router & Server vs Client Components

Hooks like useSearchParams() cannot run in server components. I had to wrap client-only logic in <Suspense> to satisfy Next.js CSR rules, ensuring proper hydration without breaking server rendering.

Understanding when to use server components vs client components was critical, especially for pages handling sensitive data like orders, or interactive components like Stripe checkout.

2. Dynamic Route Parameters

Dynamic routes (/stickers/[slug], /collections/[slug], /api/admin/orders/[id]/update-status) require careful handling of params.

Next.js now expects route parameters to sometimes be Promises, which required updating function signatures and properly unwrapping parameters to avoid type errors during build.

3. Stripe Integration

Stripe embedded checkout is client-only; the client secret must be generated server-side and passed down to the component.

Webhooks are essential to automate order updates, inventory management, and confirmation emails, ensuring backend operations happen even if users close the page.

4. Supabase Backend & Authentication

Supabase provides database, storage, and authentication, but handling admin authentication securely required server-side verification and protecting API routes.

Designed and enforced Supabase Row Level Security (RLS) for both database tables and storage to safely separate public, user, and admin access in a production e-commerce app.

5. Email Infrastructure

Sending transactional emails via SMTP (Gmail) or Resend required careful configuration of host, port, and credentials.

Learning to properly secure credentials using server-only environment variables and fallback logic was critical to avoid exposing sensitive information.

6. Build & Deployment Gotchas

The app sometimes worked locally but failed during Vercel deployment due to uncommitted changes, environment variables, or lockfile conflicts.

npm run dev and npm run build behave differently; testing the production build locally (npm run build && npm run start) was essential before deployment.

Vercel builds only reflect committed changes, which required disciplined workflow: save → commit → push → redeploy.

## Hardest parts to implement

The most challenging part was implementing payments end-to-end: syncing sticker stock with Stripe checkout, disabling UI actions across pages when inventory was low, handling cart state via React context, and correctly updating inventory and bundles through Stripe webhooks.

## Future Improvememts

- update all descriptions
- add optional note by customer before checkout
- Convert css files to tailwind styling
- Size options?
- Sorting/filtering
- User-submitted sticker ideas / community stickers
- archive orders
- sorting discount by cheapest stickers
- increase shipping costs for US (international)
