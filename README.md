Sticker E-Commerce Platform — Personal Project

Designed and built a full-stack e-commerce platform using Next.js, React, and TypeScript, supporting themed sticker collections, dynamic product pages, and a mobile-first shopping experience.

Led the end-to-end product and UI/UX design process in Figma, translating high-fidelity designs into a scalable and maintainable React component architecture.

Designed and implemented a Supabase (PostgreSQL) data model for products, collections, inventory, and orders, integrating it securely through server-side application logic.

Integrated Stripe for secure checkout and payment processing, including webhook handling for order confirmation and order state management.

Implemented server-side email workflows using Nodemailer for customer contact and transactional notifications.

Optimized performance, SEO, and user experience using server-side rendering, static generation, and image optimization in Next.js.


React Context = A way to create a globally accessible state container inside your React app.

It lets you:

Store data once

Read/update it from any component

Avoid prop-drilling

Context is not storage by itself.
It’s just a shared in-memory state.

Next Steps:

- Webhooks
    - Verify payment amount → check against server-side totals
    - Update orders → save order details to your database
    - Inventory reconciliation → decrease stock levels
    - Send confirmation emails → optional, via SMTP or email service   -> include shipping address for myself

- About Page
- Admin page
- Payment setup
- search
- Clean up tailwind and css
- Description for collections
- update sticker descriptions, prices
- upadte additional info in detail page
- add note to cart page


Ideas:
- Size options
- Sorting/filtering
- User-submitted sticker ideas
- Community stickers
- sorting all stickers