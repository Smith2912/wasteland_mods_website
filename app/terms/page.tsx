import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-zinc-900 p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-zinc-300 mb-4">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          
          <h2 className="text-xl font-bold mt-6 mb-3">1. Acceptance of Terms</h2>
          <p className="text-zinc-300 mb-4">
            By accessing or using the Wasteland Mods website and services, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access or use our services.
          </p>
          
          <h2 className="text-xl font-bold mt-6 mb-3">2. Description of Service</h2>
          <p className="text-zinc-300 mb-4">
            Wasteland Mods provides digital modifications ("mods") for DayZ and related services. Our services may include premium mods, documentation, support, and updates.
          </p>
          
          <h2 className="text-xl font-bold mt-6 mb-3">3. User Accounts</h2>
          <p className="text-zinc-300 mb-4">
            To access certain features of our services, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
          
          <h2 className="text-xl font-bold mt-6 mb-3">4. Purchases and Payments</h2>
          <p className="text-zinc-300 mb-4">
            By purchasing a mod, you acquire a license to use the mod according to the licensing terms specified for that mod. All purchases are final unless otherwise stated. Prices are subject to change without notice.
          </p>
          
          <h2 className="text-xl font-bold mt-6 mb-3">5. Intellectual Property</h2>
          <p className="text-zinc-300 mb-4">
            All mods, content, and materials available through our services are protected by intellectual property laws. The purchase of a mod grants you a license to use it according to the specified terms, but ownership remains with Wasteland Mods or its licensors.
          </p>
          
          <h2 className="text-xl font-bold mt-6 mb-3">6. User Conduct</h2>
          <p className="text-zinc-300 mb-4">
            You agree not to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-zinc-300">
            <li>Redistribute, resell, or share purchased mods</li>
            <li>Decompile, reverse engineer, or attempt to extract the source code of mods</li>
            <li>Use our services for any illegal purpose</li>
            <li>Interfere with or disrupt our services or servers</li>
            <li>Impersonate any person or entity</li>
          </ul>
          
          <h2 className="text-xl font-bold mt-6 mb-3">7. Limitation of Liability</h2>
          <p className="text-zinc-300 mb-4">
            Wasteland Mods shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services.
          </p>
          
          <h2 className="text-xl font-bold mt-6 mb-3">8. Changes to Terms</h2>
          <p className="text-zinc-300 mb-4">
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on the website. Your continued use of our services after any changes constitutes acceptance of the new terms.
          </p>
          
          <h2 className="text-xl font-bold mt-6 mb-3">9. Contact Information</h2>
          <p className="text-zinc-300 mb-4">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="text-zinc-300 mb-4">
            Email: legal@wastelandmods.com
          </p>
          
          <div className="mt-8 text-center">
            <Link 
              href="/privacy" 
              className="text-green-400 hover:text-green-300 underline"
            >
              View our Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 