'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const CompanyProfile = () => {
  const [info, setInfo] = useState({
    name: 'Valuable Brands Africa',
    tagline: 'Celebrating Excellence in African Business',
    description:
      'We are the premier events and awards company dedicated to recognizing and celebrating the most valuable brands across Africa. Through our flagship events, we connect industry leaders, foster innovation, and highlight the brands shaping the future of African business.',
    email: 'info@valuablebrands.co.ke',
    phone: '+254 700 123 456',
    address: 'Westlands Business Park, 5th Floor',
    city: 'Nairobi',
    country: 'Kenya',
    website: 'https://valuablebrands.co.ke',
    facebook: 'https://facebook.com/valuablebrands',
    twitter: 'https://twitter.com/valuablebrands',
    instagram: 'https://instagram.com/valuablebrands',
    linkedin: 'https://linkedin.com/company/valuablebrands',
    youtube: 'https://youtube.com/@valuablebrands',
  });

  const updateField = (field, value) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast.success('Company profile updated successfully');
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Company Information</CardTitle>
          <CardDescription>
            Basic details displayed on the public website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={info.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                value={info.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>About Description</Label>
            <Textarea
              rows={4}
              value={info.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email
              </Label>
              <Input
                type="email"
                value={info.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> Phone
              </Label>
              <Input
                value={info.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Address
              </Label>
              <Input
                value={info.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={info.city}
                onChange={(e) => updateField('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={info.country}
                onChange={(e) => updateField('country', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Globe className="h-3 w-3" /> Website
            </Label>
            <Input
              value={info.website}
              onChange={(e) => updateField('website', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Social Media Links</CardTitle>
          <CardDescription>
            Links displayed in the website footer and contact page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['facebook', 'Facebook URL'],
              ['twitter', 'Twitter / X URL'],
              ['instagram', 'Instagram URL'],
              ['linkedin', 'LinkedIn URL'],
              ['youtube', 'YouTube URL'],
            ].map(([field, label]) => (
              <div key={field} className="space-y-2">
                <Label>{label}</Label>
                <Input
                  value={info[field]}
                  onChange={(e) => updateField(field, e.target.value)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default CompanyProfile;
