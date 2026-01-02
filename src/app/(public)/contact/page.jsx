"use client";
import React from "react";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    details: ["Westlands Business Centre", "Waiyaki Way, Nairobi", "Kenya"],
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["+254 700 123 456", "+254 733 123 456"],
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["info@valuablebrands.co.ke", "events@valuablebrands.co.ke"],
  },
  {
    icon: Clock,
    title: "Office Hours",
    details: [
      "Monday - Friday: 8:00 AM - 6:00 PM",
      "Saturday: 9:00 AM - 1:00 PM",
    ],
  },
];

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success({
      title: "Message Sent!",
      description: "Thank you for reaching out. We'll get back to you soon.",
    });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 lg:py-24">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mb-4 border-accent/50 bg-accent/10 text-accent"
            >
              Contact Us
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold text-primary-foreground sm:text-5xl">
              Get in <span className="text-gradient-gold">Touch</span>
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Have questions about our events or want to partner with us? Wed
              love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <Card className="border-border/50">
              <CardContent className="p-6 lg:p-8">
                <h2 className="mb-6 font-display text-2xl font-bold text-foreground">
                  Send us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" placeholder="John" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" placeholder="Doe" required />
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+254 700 000 000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <select
                      id="subject"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    >
                      <option value="">Select a topic</option>
                      <option value="events">Event Inquiry</option>
                      <option value="partnership">
                        Partnership Opportunity
                      </option>
                      <option value="sponsorship">Sponsorship</option>
                      <option value="awards">Awards & Nominations</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-yellow-500 text-white hover:bg-yellow-600"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Contact Information
              </h2>
              <p className="text-muted-foreground">
                Reach out to us through any of the following channels. Our team
                is ready to assist you with your inquiries.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <info.icon className="h-5 w-5 text-accent" />
                      </div>
                      <h3 className="mb-2 font-display font-semibold text-foreground">
                        {info.title}
                      </h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          {detail}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Map Placeholder */}
              <Card className="overflow-hidden border-border/50">
                <div className="aspect-video bg-muted">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <MapPin className="mx-auto mb-2 h-8 w-8 text-accent" />
                      <p className="font-medium text-foreground">
                        Westlands, Nairobi
                      </p>
                      <p className="text-sm text-muted-foreground">
                        View on Google Maps
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
