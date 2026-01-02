"use client";
import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Events", path: "/events" },
  { name: "Awards", path: "/awards" },
  { name: "Blog", path: "/blog" },
  { name: "Gallery", path: "/gallery" },
  { name: "Contact", path: "/contact" },
];

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-jungle-green/98 backdrop-blur-lg shadow-lg border-b border-gold/20"
          : "bg-jungle-green"
      )}
      style={{ backgroundColor: "#1B4D3E" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo with text */}
          <Link href="/" className="flex items-center gap-4 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex items-center gap-4"
            >
              <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-yellow-500">
                <Image
                  src="/logo.jpeg"
                  alt="Southrift Awards Logo"
                  fill // This makes the image fill the parent container
                  className="object-cover p-1" // object-cover ensures it fills the area
                  priority
                />
              </div>
              <div className="hidden md:block">
                <div className="flex flex-col">
                  <div className="flex items-baseline">
                    <span className="font-serif text-2xl font-bold text-yellow-500 tracking-tight">
                      Valuable
                    </span>
                    <span className="font-serif text-2xl font-bold text-gold ml-1 tracking-tight">
                      Brands
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center lg:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg mx-1",
                  isActive(link.path)
                    ? "text-gold bg-jungle-green-dark shadow-gold font-bold"
                    : "text-white/90 hover:text-gold hover:bg-white/10"
                )}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gold rounded-full"
                  />
                )}
              </Link>
            ))}

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-4"
            >
              <Link href="/nominate">
                <Button className="bg-gradient-gold text-jungle-green-dark font-bold px-6 py-2 rounded-full hover:shadow-gold transition-all duration-300 border-2 border-gold hover:border-gold-light">
                  Nominate Now
                </Button>
              </Link>
            </motion.div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            {/* Mobile CTA - visible on smaller screens */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden"
            >
              <Link href="/nominate">
                <Button
                  size="sm"
                  className="bg-gradient-gold text-jungle-green-dark font-bold px-4 py-1 rounded-full border border-gold"
                >
                  Nominate
                </Button>
              </Link>
            </motion.div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-white/20"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gold/20 bg-jungle-green-dark overflow-hidden lg:hidden"
              style={{ backgroundColor: "#163E32" }}
            >
              <div className="flex flex-col gap-1 py-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "block px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg mx-2",
                        isActive(link.path)
                          ? "bg-gradient-gold text-jungle-green-dark font-bold shadow-gold"
                          : "text-white/90 hover:text-gold hover:bg-white/10"
                      )}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.05 }}
                  className="px-4 py-3 mt-2"
                >
                  <Link
                    href="/nominate"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center bg-gradient-gold text-jungle-green-dark font-bold py-3 rounded-lg shadow-gold hover:shadow-lg transition-all duration-300"
                  >
                    Nominate Now
                  </Link>
                </motion.div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};
