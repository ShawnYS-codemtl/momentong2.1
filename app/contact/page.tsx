import ContactForm from "../components/ContactForm";





export default function ContactPage(){
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden m-8">
                <div className="w-1/2 px-8 pt-8 min-h-64 flex flex-col bg-[var(--primary)] text-white">
                <h1 className="text-3xl font-semibold text-shadow-md">
                Get in Touch
                </h1>

                <hr className="my-4 w-full border-white" />

                <h4 className="text-lg text-white/95">
                Have a question, idea, or just want to say hi?
                </h4>

                <p className="mt-4">
                Whether it’s feedback on a sticker, a collaboration idea, or just a quick hello,
                I personally read every message.
                </p>

                <ul className="mt-6 space-y-2">
                <li>• Questions about stickers or orders</li>
                <li>• Collaboration or custom ideas</li>
                <li>• Feedback or suggestions</li>
                </ul>

                <p className="mt-6 text-sm ">
                I usually reply within 1–2 days.
                </p>

                <p className="mt-6 text-sm">
                You can also follow along on Instagram for new stickers and updates.
                </p>

                <a
                href="https://instagram.com/momento.ng/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-white underline underline-offset-4 hover:text-white/90"
                >
                Follow along → @momento.ng
                </a>

                </div>
                <div className="w-1/2 p-8">
                    <ContactForm />
                </div>
            </div>
        </div>
    )
}