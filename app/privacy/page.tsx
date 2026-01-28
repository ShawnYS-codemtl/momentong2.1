export default function PrivacyPage(){
    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12">
            <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>

            <p className="mb-4 text-gray-700">
                Your privacy matters to me! This page explains what information I collect when you visit or interact with this site, and how I use it.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">1. Information I Collect</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li><strong>Personal info:</strong> Like your email when you contact me or sign up for updates.</li>
                <li><strong>Shipping info:</strong> Your shipping address, so I can deliver your stickers safely.</li>
                <li><strong>Site usage:</strong> Pages you visit, clicks, and interactions to help improve your experience.</li>
                <li><strong>Payments:</strong> All payment info is handled securely by Stripe/Supabase; I don’t store credit card numbers myself.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-2">2. How I Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>To process and ship your orders accurately.</li>
                <li>To provide a better experience and improve the site.</li>
                <li>To communicate about orders, updates, or news if you opt-in.</li>
                <li>To comply with legal obligations.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-2">3. Sharing & Security</h2>
            <p className="text-gray-700 mb-4">
                I do <strong>not</strong> sell your personal information. Your data, including shipping addresses, is stored securely and shared only with necessary services like payment processors or shipping providers.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">4. Your Rights</h2>
            <p className="text-gray-700 mb-4">
                You can request access, updates, or deletion of your personal information anytime by contacting me.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">5. Cookies & Analytics</h2>
            <p className="text-gray-700 mb-4">
                The site may use cookies or analytics tools to understand usage patterns and improve the experience.
            </p>

            <p className="mt-8 text-gray-600 text-center italic">
                By using this site, you agree to the practices described in this policy.
            </p>
            </main>

    )
}