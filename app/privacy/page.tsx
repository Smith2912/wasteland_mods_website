import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-zinc-900 p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-zinc-300 mb-4">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          
          <p className="text-zinc-300 mb-6">
            This Privacy Policy describes how Wasteland Mods ("we", "us", or "our") collects, uses, and discloses your information when you use our website and services.
          </p>
          
          <h2 className="text-xl font-bold mt-6 mb-3">1. Information We Collect</h2>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">1.1 Information You Provide</h3>
          <p className="text-zinc-300 mb-4">
            We collect information you provide when you:
          </p>
          <ul className="list-disc pl-6 mb-4 text-zinc-300">
            <li>Create an account (name, email, password)</li>
            <li>Make a purchase (payment information)</li>
            <li>Contact our support team (messages, email communications)</li>
            <li>Link your Steam or Discord accounts</li>
          </ul>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">1.2 Automatically Collected Information</h3>
          <p className="text-zinc-300 mb-4">
            When you use our website, we automatically collect certain information, including:
          </p>
          <ul className="list-disc pl-6 mb-4 text-zinc-300">
            <li>Device information (browser type, operating system)</li>
            <li>Log data (IP address, pages visited, time spent)</li>
            <li>Cookies and similar technologies</li>
          </ul>
          
          <h2 className="text-xl font-bold mt-6 mb-3">2. How We Use Your Information</h2>
          <p className="text-zinc-300 mb-4">
            We use the collected information to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-zinc-300">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Respond to your comments and questions</li>
            <li>Send you technical notices and updates</li>
            <li>Protect against fraud and unauthorized access</li>
            <li>Analyze usage patterns and trends</li>
          </ul>
          
          <h2 className="text-xl font-bold mt-6 mb-3">3. Information Sharing</h2>
          <p className="text-zinc-300 mb-4">
            We may share your information with:
          </p>
          <ul className="list-disc pl-6 mb-4 text-zinc-300">
            <li>Service providers who perform services on our behalf</li>
            <li>Payment processors for transaction handling</li>
            <li>Legal authorities when required by law</li>
          </ul>
          <p className="text-zinc-300 mb-4">
            We do not sell your personal information to third parties.
          </p>
          
          <h2 className="text-xl font-bold mt-6 mb-3">4. Data Security</h2>
          <p className="text-zinc-300 mb-4">
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
          
          <h2 className="text-xl font-bold mt-6 mb-3">5. Your Choices</h2>
          <p className="text-zinc-300 mb-4">
            You can:
          </p>
          <ul className="list-disc pl-6 mb-4 text-zinc-300">
            <li>Access, update, or delete your account information</li>
            <li>Opt out of marketing communications</li>
            <li>Choose not to link third-party accounts like Steam or Discord</li>
          </ul>
          
          <h2 className="text-xl font-bold mt-6 mb-3">6. Cookies</h2>
          <p className="text-zinc-300 mb-4">
            We use cookies and similar technologies to collect information about your browsing activities. You can manage cookie preferences through your browser settings.
          </p>
          
          <h2 className="text-xl font-bold mt-6 mb-3">7. Children's Privacy</h2>
          <p className="text-zinc-300 mb-4">
            Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If we learn we have collected personal information from a child under 13, we will delete that information.
          </p>
          
          <h2 className="text-xl font-bold mt-6 mb-3">8. Changes to This Policy</h2>
          <p className="text-zinc-300 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
          
          <h2 className="text-xl font-bold mt-6 mb-3">9. Contact Us</h2>
          <p className="text-zinc-300 mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="text-zinc-300 mb-4">
            Email: privacy@wastelandmods.com
          </p>
          
          <div className="mt-8 text-center">
            <Link 
              href="/terms" 
              className="text-green-400 hover:text-green-300 underline"
            >
              View our Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 