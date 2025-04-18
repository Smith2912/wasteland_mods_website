'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    try {
      // In a real application, you would authenticate with a backend service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, always "fail" login
      setError('Login functionality will be implemented in a future update.');
    } catch (error) {
      setError('An error occurred while logging in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen py-12 bg-zinc-950 flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-zinc-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Login to Your Account</h1>
        
        <form onSubmit={handleSubmit}>
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
          
          <div className="mb-6">
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
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-700/50 border border-red-600 rounded-md text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md transition-colors font-medium disabled:bg-green-800 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="text-center">
            <p className="text-zinc-300">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-green-400 hover:text-green-300">
                Register
              </Link>
            </p>
            <Link href="/" className="text-zinc-400 hover:text-zinc-300 text-sm block mt-2">
              Forgot your password?
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-zinc-700 text-center">
            <p className="text-zinc-400 text-sm mb-4">Or continue with</p>
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                className="bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                </svg>
              </button>
              <button
                type="button"
                className="bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
                </svg>
              </button>
              <button
                type="button"
                className="bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 