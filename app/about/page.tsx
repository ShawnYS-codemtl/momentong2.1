// app/about/page.tsx
import { getPublicStorageUrl } from "@/lib/data/images";
import Image from "next/image"

export default function AboutPage() {
    const timelineSteps = [
      {
        year: '2018',
        title: 'Discovering My Passion',
        text: 'I started making stickers to capture little moments from my daily life—foods, streets, and quirky memories that made me smile.',
        image: '/typewriter.svg',
      },
      {
        year: '2020',
        title: 'Learning & Growing',
        text: 'Designing stickers taught me patience, attention to detail, and how to create designs people truly connect with.',
        image: '/hkpost_stamp_day 1.svg',
      },
      {
        year: '2022',
        title: 'Sharing My Work',
        text: 'I began sharing my sticker collections online, connecting with people who enjoy small, personal stories through art.',
        image: '/tofu.svg',
      },
    ];
  
    return (
      <main className="w-screen relative left-1/2 right-1/2 -translate-x-1/2 bg-[var(--primary)] py-20">
  
        {/* Hero Section */}
        <section className="w-full py-24 bg-indigo-50">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-shrink-0 w-full md:w-1/2 px-4 md:pr-0 md:pl-4">
              <Image 
                src={getPublicStorageUrl("about-assets", "hero/jade.jpeg")}
                alt="About me" 
                className="w-full h-auto rounded-lg shadow-lg"
                width={600}
                height={300}
              />
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Hi, I’m Jade!</h1>
              <p className="text-xl text-gray-700">
                Creating stickers inspired by everyday life and little moments that make me smile.
              </p>
            </div>
          </div>
        </section>
  
        {/* Story / Alternating Timeline Section */}
        <section className="w-full py-24 bg-white">
          <div className="max-w-6xl mx-auto relative">
            <h2 className="text-3xl font-bold mb-12 text-center">My Sticker Journey</h2>
  
            {/* Vertical line */}
            <div className="hidden md:block absolute left-1/2 top-[48px] bottom-0 w-1 bg-gray-300 transform -translate-x-1/2"></div>
  
            <div className="flex flex-col gap-16">
              {timelineSteps.map((step, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div key={step.year} className={`flex flex-col md:flex-row items-center gap-8 relative ${!isEven ? 'md:flex-row-reverse' : ''}`}>
                    {/* Text */}
                    <div
                      className={`md:w-1/2 z-10 ${
                        isEven ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'
                      } text-center md:text-left`}
                    >
                      <span className="text-indigo-500 font-bold text-sm mb-2 block">{step.year}</span>
                      <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
                      <p className={`text-gray-700 ${isEven ? 'md:pl-8' : 'md:pr-8'}`}>{step.text}</p>
                    </div>
  
                    {/* Image */}
                    <div className={`md:w-1/2 relative z-10 flex justify-center ${isEven ? 'md:justify-start' : 'md:justify-end'} justify-center`}>
                      <div className="w-48 h-48 md:w-64 md:h-64 rounded-lg shadow-lg overflow-hidden">
                        <img
                          src={step.image}
                          alt={step.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
  
                    {/* Dot on vertical line */}
                    <div className="hidden md:block absolute left-1/2 w-4 h-4 bg-indigo-500 rounded-full top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
  
        {/* Call-to-Action Section */}
        <section className="w-full py-24 bg-indigo-50 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ready to explore my stickers?</h2>
            <p className="text-gray-700 mb-8">
              Check out my shop and follow me on social media to see all my collections.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/stickers" 
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded shadow hover:bg-indigo-700 transition"
              >
                Browse Stickers
              </a>
              <a 
                href="https://instagram.com/momento.ng/" 
                target="_blank" 
                className="px-6 py-3 bg-gray-800 text-white font-semibold rounded shadow hover:bg-gray-900 transition"
              >
                Follow on Instagram
              </a>
            </div>
          </div>
        </section>
  
      </main>
    );
  }
  
  