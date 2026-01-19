import ContactForm from "../components/ContactForm";

export default function ContactPage() {
    return (
      <div className="flex items-center justify-center bg-gray-50 px-4 py-8">
        <div className="
          flex
          w-full
          max-w-5xl
          flex-col
          md:flex-row
          bg-white
          rounded-2xl
          shadow-xl
          overflow-hidden
        ">
          {/* Left / Top Section */}
          <div className="
            w-full
            md:w-1/2
            px-6
            sm:px-8
            pt-8
            pb-10
            flex
            flex-col
            bg-[var(--primary)]
            text-white
          ">
            <h1 className="text-2xl sm:text-3xl font-semibold text-shadow-md">
              Get in Touch
            </h1>
  
            <hr className="my-4 w-full border-white/80" />
  
            <h4 className="text-base sm:text-lg text-white/95">
              Have a question, idea, or just want to say hi?
            </h4>
  
            <p className="mt-4 text-sm sm:text-base">
              Whether it’s feedback on a sticker, a collaboration idea, or just a quick hello,
              I personally read every message.
            </p>
  
            <ul className="mt-6 space-y-2 text-sm sm:text-base">
              <li>• Questions about stickers or orders</li>
              <li>• Collaboration or custom ideas</li>
              <li>• Feedback or suggestions</li>
            </ul>
  
            <p className="mt-6 text-xs sm:text-sm">
              I usually reply within 1–2 days.
            </p>
  
            <p className="mt-6 text-xs sm:text-sm">
              You can also follow along on Instagram for new stickers and updates.
            </p>
  
            <a
              href="https://instagram.com/momento.ng/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs sm:text-sm underline underline-offset-4 hover:text-white/90"
            >
              Follow along → @momento.ng
            </a>
          </div>
  
          {/* Right / Bottom Section */}
          <div className="
            w-full
            md:w-1/2
            p-6
            sm:p-8
          ">
            <ContactForm />
          </div>
        </div>
      </div>
    )
  }
  