'use client';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import {
  Award,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 VERCEL: Attempting login for:', email);

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('📋 VERCEL: SignIn result:', result);

      if (result?.error) {
        console.log('❌ VERCEL: Login error:', result.error);
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      console.log('✅ VERCEL: Login successful');

      // CRITICAL FIX: Use window.location.replace() instead of href
      // This preserves cookies better
      window.location.replace('/dashboard');
    } catch (err) {
      console.error('💥 VERCEL: Login crash:', err);
      setError('Server error. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 gradient-gold rounded-xl flex items-center justify-center">
              <Award className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">
                Valuable Brands
              </h1>
              <p className="text-sm text-muted-foreground">Admin Portal</p>
            </div>
          </div>

          <h2 className="font-display text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">
            Sign in to access your admin dashboard
          </p>

          {/* Error Message Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-4">
                <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-lg font-medium">Signing you in...</p>
                <p className="text-sm text-muted-foreground">
                  Please wait while we authenticate your credentials
                </p>
                <div className="flex gap-2 mt-2">
                  <div
                    className="h-2 w-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="h-2 w-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="h-2 w-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@valuablebrands.co.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-input"
                  disabled={isLoading}
                />
                <span className="text-sm">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-primary hover:underline disabled:opacity-50"
                onClick={(e) => isLoading && e.preventDefault()}
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={(e) => isLoading && e.preventDefault()}
            >
              ← Back to website
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-foreground items-center justify-center p-12">
        <div className="max-w-md text-center text-background">
          <div className="w-24 h-24 gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Award className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">
            Manage Your Platform
          </h2>
          <p className="text-background/70">
            Access your admin dashboard to manage events, awards, blog posts,
            and media content for Valuable Brands Kenya.
          </p>
        </div>
      </div>
    </div>
  );
}
