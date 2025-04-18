import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">About Wasteland Mods</h1>
          
          <div className="relative w-full h-64 md:h-80 mb-8 rounded-lg overflow-hidden">
            <Image
              src="/images/about-banner.jpg"
              alt="DayZ Wasteland Team"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          
          <div className="prose prose-lg prose-invert max-w-none">
            <p>
              Welcome to Wasteland Mods, a dedicated team of DayZ enthusiasts and experienced
              developers focused on creating high-quality mods for server owners.
            </p>
            
            <h2>Our Story</h2>
            <p>
              Wasteland Mods began in 2020 when our team of server administrators faced challenges
              finding reliable, well-optimized mods for our own DayZ servers. We decided to start
              developing our own solutions, focusing on performance, stability, and customization.
            </p>
            <p>
              What started as personal projects quickly gained attention from other server owners
              who were impressed with our work. Today, we're proud to offer our growing collection
              of premium mods to the DayZ community.
            </p>
            
            <h2>Our Approach</h2>
            <p>
              Every mod we create follows these core principles:
            </p>
            <ul>
              <li>
                <strong>Performance-Focused:</strong> We rigorously optimize our code to ensure minimal
                impact on server performance.
              </li>
              <li>
                <strong>Extensively Tested:</strong> All mods undergo weeks of testing on live servers
                before release.
              </li>
              <li>
                <strong>Highly Configurable:</strong> We provide extensive configuration options to
                allow server owners to tailor the experience to their specific needs.
              </li>
              <li>
                <strong>Well Documented:</strong> Clear, comprehensive documentation ensures smooth
                installation and configuration.
              </li>
              <li>
                <strong>Regular Updates:</strong> We continuously improve our mods based on feedback
                and game updates.
              </li>
            </ul>
            
            <h2>Our Team</h2>
            <p>
              Wasteland Mods consists of experienced developers with backgrounds in game modding,
              server administration, and software development. Our combined experience ensures that
              each mod we create meets the highest standards of quality and performance.
            </p>
            
            <h2>Get in Touch</h2>
            <p>
              We're always happy to hear from fellow DayZ enthusiasts and server owners. Whether
              you have questions about our mods, need technical support, or want to discuss custom
              development work, we're here to help.
            </p>
            
            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md text-center font-medium transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/mods"
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-md text-center font-medium transition-colors"
              >
                Browse Our Mods
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 