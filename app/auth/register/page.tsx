'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    try {
      // In a real application, you would register with a backend service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, always "fail" registration
      setError('Registration functionality will be implemented in a future update.');
    } catch (error) {
      setError('An error occurred while registering. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen py-12 bg-zinc-950 flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-zinc-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Create an Account</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name
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
              Email Address
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
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-4 py-2 focus:outline-none focus:border-green-500"
              required
              minLength={8}
            />
            <p className="text-zinc-400 text-xs mt-1">
              Password must be at least 8 characters long
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-4 py-2 focus:outline-none focus:border-green-500"
              required
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-700/50 border border-red-600 rounded-md text-center">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 mr-2 accent-green-500"
                required
              />
              <span className="text-sm text-zinc-300">
                I agree to the{' '}
                <Link href="/terms" className="text-green-400 hover:text-green-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-green-400 hover:text-green-300">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md transition-colors font-medium disabled:bg-green-800 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
          
          <div className="text-center">
            <p className="text-zinc-300">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-green-400 hover:text-green-300">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 