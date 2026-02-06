'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Mail,
  MessageSquare,
  Send,
  User,
  Building2,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  UserCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

// Import API services

import {
  fetchbrands,
  fetchMessageTemplates,
  sendMessage,
  fetchMessageHistory,
} from '@/app/lib/action';

// Default message templates (fallback if API fails)
const defaultMessageTemplates = {
  sms: [
    {
      id: 'sms1',
      name: 'Payment Reminder',
      content:
        'Hi {name}, this is a reminder that your invoice #{invoice} is due on {date}. Please make payment to avoid late fees. - SME Awards Team',
    },
    {
      id: 'sms2',
      name: 'Event Reminder',
      content:
        'Hi {name}, reminder: SME Expo 2024 is tomorrow at KICC. Your registration is confirmed. See you there! - SME Awards Team',
    },
    {
      id: 'sms3',
      name: 'Registration Confirmation',
      content:
        'Hi {name}, your registration for {event} has been confirmed. Invoice will be sent shortly. Thank you! - SME Awards Team',
    },
  ],
  email: [
    {
      id: 'email1',
      name: 'Invoice Reminder',
      subject: 'Payment Reminder - Invoice #{invoice}',
      content:
        'Dear {name},\n\nThis is a friendly reminder that your invoice #{invoice} for {amount} is due on {date}.\n\nPlease make payment at your earliest convenience to avoid any late fees.\n\nIf you have already made the payment, please disregard this message.\n\nBest regards,\nSME Awards Team',
    },
    {
      id: 'email2',
      name: 'Event Details',
      subject: 'Your Event Details - {event}',
      content:
        'Dear {name},\n\nThank you for registering for {event}!\n\nEvent Details:\n- Date: {date}\n- Venue: KICC, Nairobi\n- Time: 8:00 AM - 6:00 PM\n\nPlease arrive 30 minutes early for check-in.\n\nWe look forward to seeing you!\n\nBest regards,\nSME Awards Team',
    },
    {
      id: 'email3',
      name: 'Thank You',
      subject: 'Thank You for Your Participation',
      content:
        'Dear {name},\n\nThank you for participating in {event}!\n\nWe hope you had a wonderful experience. Your feedback is valuable to us.\n\nStay tuned for upcoming events.\n\nBest regards,\nSME Awards Team',
    },
  ],
};

export default function Communications() {
  // State for data
  const [brands, setBrands] = useState([]);
  const [messageTemplates, setMessageTemplates] = useState(
    defaultMessageTemplates
  );
  const [messageLogs, setMessageLogs] = useState([]);

  // Loading states
  const [loading, setLoading] = useState({
    brands: false,
    templates: false,
    history: false,
  });
  const [error, setError] = useState({
    brands: null,
    templates: null,
    history: null,
  });

  // UI state
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const [sendMode, setSendMode] = useState('single');
  const [channel, setChannel] = useState('email');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load brands
      setLoading((prev) => ({ ...prev, brands: true }));
      setError((prev) => ({ ...prev, brands: null }));
      const brandsData = await fetchbrands();
      setBrands(brandsData);
    } catch (err) {
      console.error('Failed to load brands:', err);
      setError((prev) => ({ ...prev, brands: 'Failed to load brands' }));
      toast.error('Failed to load brands');
    } finally {
      setLoading((prev) => ({ ...prev, brands: false }));
    }

    try {
      // Load templates
      setLoading((prev) => ({ ...prev, templates: true }));
      setError((prev) => ({ ...prev, templates: null }));
      const templatesData = await fetchMessageTemplates();
      if (templatesData) {
        setMessageTemplates(templatesData);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError((prev) => ({ ...prev, templates: 'Failed to load templates' }));
      // Use default templates on error
    } finally {
      setLoading((prev) => ({ ...prev, templates: false }));
    }

    try {
      // Load message history
      setLoading((prev) => ({ ...prev, history: true }));
      setError((prev) => ({ ...prev, history: null }));
      const historyData = await fetchMessageHistory();
      setMessageLogs(historyData || []);
    } catch (err) {
      console.error('Failed to load message history:', err);
      setError((prev) => ({
        ...prev,
        history: 'Failed to load message history',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, history: false }));
    }
  };

  const selectedBrand = brands.find((b) => b._id === selectedBrandId);
  const selectedBrands = brands.filter((b) => selectedBrandIds.includes(b._id));

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    const templates =
      channel === 'sms' ? messageTemplates.sms : messageTemplates.email;
    const template = templates.find((t) => t._id === templateId);
    if (template) {
      setMessage(template.content);
      if ('subject' in template && typeof template.subject === 'string') {
        setSubject(template.subject);
      }
    }
  };

  const handleChannelChange = (newChannel) => {
    setChannel(newChannel);
    setSelectedTemplate('');
    setMessage('');
    setSubject('');
  };

  const handleSendModeChange = (mode) => {
    setSendMode(mode);
    setSelectedBrandId('');
    setSelectedBrandIds([]);
  };

  const handleBrandToggle = (brandId) => {
    setSelectedBrandIds((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBrandIds.length === brands.length) {
      setSelectedBrandIds([]);
    } else {
      setSelectedBrandIds(brands.map((b) => b._id));
    }
  };

  const handleSendMessage = async () => {
    const recipientBrands =
      sendMode === 'single'
        ? selectedBrand
          ? [selectedBrand]
          : []
        : selectedBrands;

    if (recipientBrands.length === 0) {
      toast.error(
        sendMode === 'single'
          ? 'Please select a brand'
          : 'Please select at least one brand'
      );
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    if (channel === 'email' && !subject.trim()) {
      toast.error('Please enter a subject for the email');
      return;
    }

    setIsSending(true);

    try {
      // Prepare message data for API
      const messageData = {
        channel,
        subject: channel === 'email' ? subject : undefined,
        content: message,
        templateId: selectedTemplate || undefined,
        recipients: recipientBrands.map((brand) => ({
          brandId: brand._id,
          email: channel === 'email' ? brand.primaryContact?.email : undefined,
          phone: channel === 'sms' ? brand.primaryContact?.phone : undefined,
          name: brand.primaryContact?.name,
        })),
      };

      // Send message via API
      const response = await sendMessage(messageData);

      // Add to message logs
      const newLogs = recipientBrands.map((brand) => ({
        id: `msg_${Date.now()}_${brand._id}`,
        brandId: brand._id,
        brandName: brand.businessName,
        channel,
        recipient:
          channel === 'sms'
            ? brand.primaryContact?.phone
            : brand.primaryContact?.email,
        subject: channel === 'email' ? subject : undefined,
        message: message.substring(0, 50) + '...',
        status: 'sent',
        sentAt: new Date().toISOString(),
      }));

      setMessageLogs((prev) => [...newLogs.reverse(), ...prev]);

      // Show success message
      const recipientCount = recipientBrands.length;
      toast.success(
        recipientCount === 1
          ? `${channel === 'sms' ? 'SMS' : 'Email'} sent successfully to ${
              recipientBrands[0].primaryContact?.name ||
              recipientBrands[0].businessName
            }`
          : `${
              channel === 'sms' ? 'SMS' : 'Email'
            } sent successfully to ${recipientCount} brands`
      );

      // Reset form
      setMessage('');
      setSubject('');
      setSelectedTemplate('');
      if (sendMode === 'bulk') {
        setSelectedBrandIds([]);
      } else {
        setSelectedBrandId('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return (
          <Badge
            variant="outline"
            className="text-green-600 border-green-600/30"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Delivered
          </Badge>
        );
      case 'sent':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600/30">
            <Clock className="h-3 w-3 mr-1" />
            Sent
          </Badge>
        );
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600/30"
          >
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge
            variant="outline"
            className="text-destructive border-destructive/30"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRetry = () => {
    loadData();
  };

  // Show loading state
  if (loading.brands && brands.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading communications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Communications</h1>
          <p className="text-muted-foreground">
            Send SMS and Email messages to your brands
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadData}
          disabled={Object.values(loading).some((l) => l)}
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${Object.values(loading).some((l) => l) ? 'animate-spin' : ''}`}
          />
          Refresh Data
        </Button>
      </div>

      {/* Error alerts */}
      {error.brands && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error.brands}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Compose Message */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Compose Message
              </CardTitle>
              <CardDescription>
                Select a brand and compose your message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Send Mode Toggle */}
              <div className="space-y-2">
                <Label>Send Mode</Label>
                <Tabs
                  value={sendMode}
                  onValueChange={(v) => handleSendModeChange(v)}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="single"
                      className="flex items-center gap-2"
                    >
                      <UserCheck className="h-4 w-4" />
                      Single Brand
                    </TabsTrigger>
                    <TabsTrigger
                      value="bulk"
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Bulk Send
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Brand Selection */}
              {sendMode === 'single' ? (
                <div className="space-y-2">
                  <Label>Select Brand</Label>
                  <Select
                    value={selectedBrandId}
                    onValueChange={setSelectedBrandId}
                    disabled={loading.brands}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loading.brands
                            ? 'Loading brands...'
                            : 'Choose a brand...'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand._id} value={brand._id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {brand.businessName}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      Select Brands ({selectedBrandIds.length} selected)
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAll}
                      className="h-auto py-1 px-2 text-xs"
                      disabled={loading.brands}
                    >
                      {selectedBrandIds.length === brands.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </Button>
                  </div>
                  <ScrollArea className="h-40 rounded-md border p-3">
                    {loading.brands ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : brands.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        No brands available
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {brands.map((brand) => (
                          <div
                            key={brand._id}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleBrandToggle(brand._id)}
                          >
                            <Checkbox
                              checked={selectedBrandIds.includes(brand._id)}
                              onCheckedChange={() =>
                                handleBrandToggle(brand._id)
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {brand.businessName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {brand.primaryContact?.name || 'No contact'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}

              {/* Channel Selection */}
              <div className="space-y-2">
                <Label>Channel</Label>
                <Tabs
                  value={channel}
                  onValueChange={(v) => handleChannelChange(v)}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="email"
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </TabsTrigger>
                    <TabsTrigger
                      value="sms"
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      SMS
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Template Selection */}
              <div className="space-y-2">
                <Label>Message Template (Optional)</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(channel === 'sms'
                      ? messageTemplates.sms
                      : messageTemplates.email
                    ).map((template) => (
                      <SelectItem key={template._id} value={template._id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject (Email only) */}
              {channel === 'email' && (
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject..."
                  />
                </div>
              )}

              {/* Message */}
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    channel === 'sms'
                      ? 'Enter your SMS message...'
                      : 'Enter your email message...'
                  }
                  rows={channel === 'sms' ? 4 : 8}
                />
                {channel === 'sms' && (
                  <p className="text-xs text-muted-foreground">
                    {message.length}/160 characters{' '}
                    {message.length > 160 &&
                      `(${Math.ceil(message.length / 160)} SMS segments)`}
                  </p>
                )}
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={
                  (sendMode === 'single'
                    ? !selectedBrand
                    : selectedBrandIds.length === 0) ||
                  !message.trim() ||
                  isSending ||
                  loading.brands
                }
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send {channel === 'sms' ? 'SMS' : 'Email'}
                    {sendMode === 'bulk' &&
                      selectedBrandIds.length > 0 &&
                      ` to ${selectedBrandIds.length} brands`}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recipient Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {sendMode === 'single' ? (
                  <User className="h-5 w-5" />
                ) : (
                  <Users className="h-5 w-5" />
                )}
                {sendMode === 'single'
                  ? 'Recipient Details'
                  : 'Selected Recipients'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sendMode === 'single' && selectedBrand ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Business</p>
                    <p className="font-medium">{selectedBrand.businessName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Primary Contact
                    </p>
                    <p className="font-medium">
                      {selectedBrand.primaryContact?.name || 'Not specified'}
                    </p>
                    {selectedBrand.primaryContact?.title && (
                      <p className="text-sm text-muted-foreground">
                        {selectedBrand.primaryContact.title}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span
                        className={
                          channel === 'email' ? 'font-medium text-primary' : ''
                        }
                      >
                        {selectedBrand.primaryContact?.email || 'No email'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span
                        className={
                          channel === 'sms' ? 'font-medium text-primary' : ''
                        }
                      >
                        {selectedBrand.primaryContact?.phone || 'No phone'}
                      </span>
                    </div>
                  </div>
                  {selectedBrand.status && (
                    <Badge variant="outline">{selectedBrand.status}</Badge>
                  )}
                </div>
              ) : sendMode === 'bulk' && selectedBrands.length > 0 ? (
                <ScrollArea className="h-50">
                  <div className="space-y-3">
                    {selectedBrands.map((brand) => (
                      <div
                        key={brand._id}
                        className="flex items-start gap-3 p-2 rounded-md bg-muted/30"
                      >
                        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {brand.businessName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {brand.primaryContact?.name || 'No contact'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {channel === 'sms'
                              ? brand.primaryContact?.phone || 'No phone'
                              : brand.primaryContact?.email || 'No email'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleBrandToggle(brand._id)}
                        >
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {sendMode === 'single'
                    ? 'Select a brand to see contact details'
                    : 'Select brands to see recipients'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Message Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {messageLogs.filter((m) => m.channel === 'email').length}
                </p>
                <p className="text-xs text-muted-foreground">Emails Sent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {messageLogs.filter((m) => m.channel === 'sms').length}
                </p>
                <p className="text-xs text-muted-foreground">SMS Sent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {messageLogs.filter((m) => m.status === 'delivered').length}
                </p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">
                  {messageLogs.filter((m) => m.status === 'failed').length}
                </p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>Recent messages sent to brands</CardDescription>
        </CardHeader>
        <CardContent>
          {loading.history ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error.history ? (
            <div className="text-center py-8 space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <p className="text-destructive">{error.history}</p>
              <Button variant="outline" onClick={handleRetry}>
                Retry
              </Button>
            </div>
          ) : messageLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No messages sent yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messageLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-medium">
                      {log.brandName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {log.channel === 'email' ? (
                          <Mail className="h-3 w-3 mr-1" />
                        ) : (
                          <MessageSquare className="h-3 w-3 mr-1" />
                        )}
                        {log.channel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.recipient}</TableCell>
                    <TableCell className="max-w-50 truncate text-sm text-muted-foreground">
                      {log.subject ? `${log.subject} - ` : ''}
                      {log.message}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.sentAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
