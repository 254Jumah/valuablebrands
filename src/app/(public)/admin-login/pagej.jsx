"use client";
import { useEffect, useState } from "react";

import { Award, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const handleSubmit = (e) => {
    e.preventDefault();
    // Login logic
    setIsLoggedIn(true);
    toast({
      title: "Welcome back!",
      description: "You have successfully logged in.",
    });
  };

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/admin");
    }
  }, [isLoggedIn, router]);

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
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                <input type="checkbox" className="rounded border-input" />
                <span className="text-sm">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn w-full text-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
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
