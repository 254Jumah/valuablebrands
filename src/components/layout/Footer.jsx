import React from "react";

import {
  Award,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Award className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <span className="font-display text-xl font-bold">Valuable</span>
                <span className="font-display text-xl font-bold text-accent">
                  {" "}
                  Brands
                </span>
              </div>
            </Link>
            <p className="mb-6 text-sm text-primary-foreground/80">
              Kenyas premier event company specializing in SME recognition,
              awards ceremonies, and brand development events.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-display text-lg font-semibold">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                "About Us",
                "Events",
                "Awards",
                "Blog",
                "Gallery",
                "Contact",
                "Admin Login",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(" ", "-")}`}
                    className="text-primary-foreground/70 transition-colors hover:text-accent"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 font-display text-lg font-semibold">
              Our Services
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                "Award Ceremonies",
                "Corporate Events",
                "Brand Recognition",
                "SME Forums",
                "Workshops",
                "Gala Dinners",
              ].map((item) => (
                <li key={item}>
                  <span className="text-primary-foreground/70">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-display text-lg font-semibold">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-accent" />
                <span className="text-primary-foreground/70">
                  Westlands Business Centre,
                  <br />
                  Nairobi, Kenya
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4  text-accent" />
                <a
                  href="tel:+254700123456"
                  className="text-primary-foreground/70 hover:text-accent"
                >
                  +254 700 123 456
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4  text-accent" />
                <a
                  href="mailto:info@valuablebrands.co.ke"
                  className="text-primary-foreground/70 hover:text-accent"
                >
                  info@valuablebrands.co.ke
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <p className="text-sm text-primary-foreground/60">
            © {currentYear} Valuable Brands. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-primary-foreground/60 hover:text-accent"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-primary-foreground/60 hover:text-accent"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
