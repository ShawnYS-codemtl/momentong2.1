export default function TermsPage(){
    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12">
            <h1 className="text-3xl font-bold mb-6 text-center">Terms of Service</h1>

            <p className="mb-4 text-gray-700">
                Welcome! By using this website, you agree to the following terms. Please read them carefully.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">1. Using the Site</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>You may browse, explore, and purchase products responsibly.</li>
                <li>Do not use the site for illegal or harmful activities.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-2">2. Orders, Payments & Shipping</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>All payments are processed securely via Stripe/Supabase.</li>
                <li>Prices and product availability may change without notice.</li>
                <li>Orders are subject to confirmation and availability.</li>
                <li>
                <strong>Shipping:</strong> I collect your shipping address to send your stickers. I take care to ship orders promptly, but delivery times may vary depending on location and shipping providers.
                </li>
                <li>You are responsible for providing accurate shipping information to ensure delivery.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-2">3. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
                All content, stickers, images, and text on this site belong to me. You may not copy, redistribute, or sell any content without permission.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">4. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
                I strive to ensure the site is accurate and functional, but I’m not liable for errors, interruptions, or damages arising from using the site. While I do my best to ensure safe delivery, I am not responsible for delays or issues caused by third-party shipping providers.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">5. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
                I may update these terms at any time. Continuing to use the site means you accept the updated terms.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">6. Contact</h2>
            <p className="text-gray-700 mb-4">
                If you have questions about these terms, your orders, or anything on the site, you can reach me via the contact page.
            </p>
        </main>

    )
}