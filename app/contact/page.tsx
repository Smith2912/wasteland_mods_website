'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    // Simulate API call
    try {
      // In a real application, you would send this data to your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFormStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setFormStatus('error');
    }
  };
  
  return (
    <div className="min-h-screen py-12 bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">Get In Touch</h2>
              <p className="text-zinc-300 mb-6">
                Have questions about our mods or need support with your purchase? 
                We're here to help! Fill out the form and we'll get back to you as soon as possible.
              </p>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-600 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold">Email</h3>
                  <p className="text-zinc-300">support@wastelandmods.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-green-600 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold">Discord</h3>
                  <p className="text-zinc-300">Join our Discord community for quick support</p>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-800 p-6 rounded-lg">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-4 py-2 focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-4 py-2 focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="subject" className="block text-sm font-medium mb-1">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-4 py-2 focus:outline-none focus:border-green-500"
                    required
                  >
                    <option value="">Select a topic</option>
                    <option value="Pre-purchase Question">Pre-purchase Question</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Custom Development">Custom Development</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-4 py-2 focus:outline-none focus:border-green-500"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition-colors font-medium disabled:bg-green-800 disabled:cursor-not-allowed"
                >
                  {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                </button>
                
                {formStatus === 'success' && (
                  <div className="mt-4 p-3 bg-green-700/50 border border-green-600 rounded-md text-center">
                    Your message has been sent successfully. We'll get back to you soon!
                  </div>
                )}
                
                {formStatus === 'error' && (
                  <div className="mt-4 p-3 bg-red-700/50 border border-red-600 rounded-md text-center">
                    There was an error sending your message. Please try again later.
                  </div>
                )}
              </form>
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
            <p className="text-zinc-300 mb-6 max-w-md mx-auto">
              Join our Discord community to get help from our team and other mod users,
              stay updated on new releases, and share your feedback.
            </p>
            <a 
              href="https://discord.gg/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"/>
              </svg>
              Join Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 