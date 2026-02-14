'use client';
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trophy,
  Users,
  Vote,
  BarChart3,
  Eye,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Plus,
  Edit2,
  Trash2,
  Award,
  Crown,
  Medal,
  Globe,
  Smartphone,
  Monitor,
  FileDown,
  Share2,
  Mail,
  Copy,
  Check,
} from 'lucide-react';

import { generateAwardsPDF } from './AwardsPDFReport';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { toast } from 'react-toastify';

const mockCategories = [
  {
    id: 'c1',
    name: 'Best Emerging Brand',
    description: 'New brands making significant impact in their first 3 years',
    status: 'open',
    nominees: 8,
    totalVotes: 2450,
    startDate: '2024-01-15',
    endDate: '2024-03-15',
  },
  {
    id: 'c2',
    name: 'Excellence in Customer Service',
    description: 'Brands that go above and beyond in customer satisfaction',
    status: 'open',
    nominees: 6,
    totalVotes: 1890,
    startDate: '2024-01-15',
    endDate: '2024-03-15',
  },
  {
    id: 'c3',
    name: 'Innovation Award',
    description: 'Brands pushing boundaries with creative solutions',
    status: 'open',
    nominees: 10,
    totalVotes: 3120,
    startDate: '2024-01-15',
    endDate: '2024-03-15',
  },
  {
    id: 'c4',
    name: 'Sustainability Champion',
    description: 'Leading the way in environmental responsibility',
    status: 'closed',
    nominees: 5,
    totalVotes: 1560,
    startDate: '2023-09-01',
    endDate: '2023-12-01',
  },
  {
    id: 'c5',
    name: 'Best Digital Transformation',
    description: 'Outstanding digital innovation and adoption',
    status: 'upcoming',
    nominees: 0,
    totalVotes: 0,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
  },
  {
    id: 'c6',
    name: 'Community Impact Award',
    description: 'Brands creating meaningful social change',
    status: 'closed',
    nominees: 7,
    totalVotes: 2100,
    startDate: '2023-09-01',
    endDate: '2023-12-01',
  },
];

const mockNominees = [
  {
    id: 'n1',
    name: 'Kujali Foods',
    categoryId: 'c1',
    categoryName: 'Best Emerging Brand',
    votes: 645,
    rank: 1,
    trend: 'up',
    region: 'Nairobi',
    image: '/placeholder.svg',
  },
  {
    id: 'n2',
    name: 'Safari Tech Solutions',
    categoryId: 'c1',
    categoryName: 'Best Emerging Brand',
    votes: 523,
    rank: 2,
    trend: 'up',
    region: 'Mombasa',
    image: '/placeholder.svg',
  },
  {
    id: 'n3',
    name: 'Green Harvest Kenya',
    categoryId: 'c1',
    categoryName: 'Best Emerging Brand',
    votes: 412,
    rank: 3,
    trend: 'down',
    region: 'Kisumu',
    image: '/placeholder.svg',
  },
  {
    id: 'n4',
    name: 'MobiPay Africa',
    categoryId: 'c3',
    categoryName: 'Innovation Award',
    votes: 890,
    rank: 1,
    trend: 'up',
    region: 'Nairobi',
    image: '/placeholder.svg',
  },
  {
    id: 'n5',
    name: 'EcoPackage Ltd',
    categoryId: 'c3',
    categoryName: 'Innovation Award',
    votes: 756,
    rank: 2,
    trend: 'stable',
    region: 'Nairobi',
    image: '/placeholder.svg',
  },
  {
    id: 'n6',
    name: 'HealthTrack Kenya',
    categoryId: 'c3',
    categoryName: 'Innovation Award',
    votes: 634,
    rank: 3,
    trend: 'up',
    region: 'Eldoret',
    image: '/placeholder.svg',
  },
  {
    id: 'n7',
    name: 'Jambo Airways',
    categoryId: 'c2',
    categoryName: 'Excellence in Customer Service',
    votes: 780,
    rank: 1,
    trend: 'up',
    region: 'Nairobi',
    image: '/placeholder.svg',
  },
  {
    id: 'n8',
    name: 'Uhuru Bank',
    categoryId: 'c2',
    categoryName: 'Excellence in Customer Service',
    votes: 620,
    rank: 2,
    trend: 'down',
    region: 'Nairobi',
    image: '/placeholder.svg',
  },
  {
    id: 'n9',
    name: 'Solar Kenya',
    categoryId: 'c4',
    categoryName: 'Sustainability Champion',
    votes: 510,
    rank: 1,
    trend: 'stable',
    region: 'Nakuru',
    image: '/placeholder.svg',
  },
  {
    id: 'n10',
    name: 'ReNew Fashion',
    categoryId: 'c4',
    categoryName: 'Sustainability Champion',
    votes: 445,
    rank: 2,
    trend: 'up',
    region: 'Nairobi',
    image: '/placeholder.svg',
  },
];

const mockVoteRecords = [
  {
    id: 'v1',
    voter: 'james.m@gmail.com',
    nominee: 'Kujali Foods',
    category: 'Best Emerging Brand',
    timestamp: '2024-02-12 14:32',
    source: 'web',
    verified: true,
  },
  {
    id: 'v2',
    voter: '+254712xxx456',
    nominee: 'MobiPay Africa',
    category: 'Innovation Award',
    timestamp: '2024-02-12 14:28',
    source: 'sms',
    verified: true,
  },
  {
    id: 'v3',
    voter: 'grace.w@outlook.com',
    nominee: 'Jambo Airways',
    category: 'Excellence in Customer Service',
    timestamp: '2024-02-12 14:15',
    source: 'mobile',
    verified: true,
  },
  {
    id: 'v4',
    voter: 'peter.o@yahoo.com',
    nominee: 'Safari Tech Solutions',
    category: 'Best Emerging Brand',
    timestamp: '2024-02-12 13:50',
    source: 'web',
    verified: false,
  },
  {
    id: 'v5',
    voter: '+254722xxx789',
    nominee: 'EcoPackage Ltd',
    category: 'Innovation Award',
    timestamp: '2024-02-12 13:40',
    source: 'sms',
    verified: true,
  },
  {
    id: 'v6',
    voter: 'amina.h@gmail.com',
    nominee: 'Uhuru Bank',
    category: 'Excellence in Customer Service',
    timestamp: '2024-02-12 13:22',
    source: 'web',
    verified: true,
  },
  {
    id: 'v7',
    voter: 'faith.n@gmail.com',
    nominee: 'Green Harvest Kenya',
    category: 'Best Emerging Brand',
    timestamp: '2024-02-12 12:55',
    source: 'mobile',
    verified: true,
  },
  {
    id: 'v8',
    voter: '+254733xxx012',
    nominee: 'HealthTrack Kenya',
    category: 'Innovation Award',
    timestamp: '2024-02-12 12:30',
    source: 'sms',
    verified: false,
  },
];

const voteTrendData = [
  { day: 'Mon', web: 120, mobile: 85, sms: 45 },
  { day: 'Tue', web: 145, mobile: 92, sms: 58 },
  { day: 'Wed', web: 180, mobile: 110, sms: 62 },
  { day: 'Thu', web: 165, mobile: 125, sms: 70 },
  { day: 'Fri', web: 210, mobile: 140, sms: 78 },
  { day: 'Sat', web: 250, mobile: 180, sms: 95 },
  { day: 'Sun', web: 195, mobile: 155, sms: 82 },
];

const regionData = [
  { name: 'Nairobi', value: 4200 },
  { name: 'Mombasa', value: 1800 },
  { name: 'Kisumu', value: 1200 },
  { name: 'Nakuru', value: 950 },
  { name: 'Eldoret', value: 720 },
  { name: 'Others', value: 1150 },
];

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--muted-foreground))',
];

const hourlyVoteData = [
  { hour: '6am', votes: 45 },
  { hour: '8am', votes: 120 },
  { hour: '10am', votes: 280 },
  { hour: '12pm', votes: 350 },
  { hour: '2pm', votes: 410 },
  { hour: '4pm', votes: 380 },
  { hour: '6pm', votes: 520 },
  { hour: '8pm', votes: 680 },
  { hour: '10pm', votes: 420 },
];

// ── Component ─────────────────────────────────────────────────────

const AdminAwards = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copied, setCopied] = useState(false);

  const handleDownloadPDF = (reportType) => {
    const fileName = generateAwardsPDF({
      categories: mockCategories,
      nominees: mockNominees,
      voteTrends: voteTrendData,
      regionData,
      hourlyData: hourlyVoteData,
      totalVotes,
      totalNominees,
      openCategories: openCategories,
      verifiedPct,
      reportType,
    });
    toast.success('📄 PDF Downloaded!', {
      title: '📄 PDF Downloaded!',
      description: `${fileName} has been saved.`,
    });
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(
      'Valuable Brands Africa — Awards Analytics Report'
    );
    const body = encodeURIComponent(
      `Hi,\n\nPlease find the latest Awards Analytics report from Valuable Brands Africa.\n\nKey Highlights:\n• Total Votes: ${totalVotes.toLocaleString()}\n• Active Categories: ${openCategories}\n• Total Nominees: ${totalNominees}\n• Verified Votes: ${verifiedPct}%\n\nPlease download the attached PDF for the full report.\n\nBest regards,\nVBA Awards Team`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    toast({
      title: '📧 Email Draft Opened',
      description: 'Compose your email and attach the downloaded PDF.',
    });
  };

  const handleCopyLink = () => {
    const reportSummary = `VBA Awards Report — ${new Date().toLocaleDateString()}\n\nTotal Votes: ${totalVotes.toLocaleString()}\nActive Categories: ${openCategories}\nNominees: ${totalNominees}\nVerified: ${verifiedPct}%\n\nTop Nominees:\n${mockNominees
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5)
      .map(
        (n, i) => `${i + 1}. ${n.name} (${n.categoryName}) — ${n.votes} votes`
      )
      .join('\n')}`;
    navigator.clipboard.writeText(reportSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: '📋 Copied!',
      description:
        'Report summary copied to clipboard. Paste it anywhere to share.',
    });
  };

  const totalVotes = mockCategories.reduce((a, c) => a + c.totalVotes, 0);
  const totalNominees = mockNominees.length;
  const openCategories = mockCategories.filter(
    (c) => c.status === 'open'
  ).length;
  const verifiedPct = Math.round(
    (mockVoteRecords.filter((v) => v.verified).length /
      mockVoteRecords.length) *
      100
  );

  const filteredNominees = mockNominees.filter((n) => {
    const matchSearch = n.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchCategory =
      categoryFilter === 'all' || n.categoryId === categoryFilter;
    return matchSearch && matchCategory;
  });

  const filteredCategories = mockCategories.filter((c) => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
            Open
          </Badge>
        );
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      case 'upcoming':
        return (
          <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30">
            Upcoming
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up')
      return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (trend === 'down')
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <span className="h-4 w-4 text-muted-foreground">—</span>;
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'web':
        return <Monitor className="h-4 w-4" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'sms':
        return <Globe className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-amber-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Awards Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage categories, track votes, view results & analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Download PDF */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileDown className="h-4 w-4" /> Download PDF
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDownloadPDF('full')}>
                <Download className="h-4 w-4 mr-2" /> Full Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownloadPDF('results')}>
                <Trophy className="h-4 w-4 mr-2" /> Results Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownloadPDF('analytics')}>
                <BarChart3 className="h-4 w-4 mr-2" /> Analytics Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Share */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShareEmail}>
                <Mail className="h-4 w-4 mr-2" /> Share via Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink}>
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy Summary'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Category
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Vote className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Votes</p>
              <p className="text-2xl font-bold text-foreground">
                {totalVotes.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nominees</p>
              <p className="text-2xl font-bold text-foreground">
                {totalNominees}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <Trophy className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Categories</p>
              <p className="text-2xl font-bold text-foreground">
                {openCategories}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
              <CheckCircle2 className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Verified Votes</p>
              <p className="text-2xl font-bold text-foreground">
                {verifiedPct}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories" className="gap-1.5">
            <Trophy className="h-4 w-4 hidden sm:inline" /> Categories
          </TabsTrigger>
          <TabsTrigger value="votes" className="gap-1.5">
            <Vote className="h-4 w-4 hidden sm:inline" /> Votes
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-1.5">
            <Award className="h-4 w-4 hidden sm:inline" /> Results
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <BarChart3 className="h-4 w-4 hidden sm:inline" /> Analytics
          </TabsTrigger>
        </TabsList>

        {/* ─── Categories Tab ─────────────────────────────────────── */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCategories.map((cat) => (
              <Card key={cat.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{cat.name}</CardTitle>
                    {getStatusBadge(cat.status)}
                  </div>
                  <CardDescription className="text-xs">
                    {cat.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Nominees</p>
                      <p className="font-semibold text-foreground">
                        {cat.nominees}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Total Votes
                      </p>
                      <p className="font-semibold text-foreground">
                        {cat.totalVotes.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {cat.startDate} → {cat.endDate}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                    >
                      <Eye className="h-3 w-3" /> View
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Votes Tab ──────────────────────────────────────────── */}
        <TabsContent value="votes" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search votes..." className="pl-9" />
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Votes</CardTitle>
              <CardDescription>
                Live feed of incoming votes across all categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voter</TableHead>
                    <TableHead>Nominee</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Category
                    </TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockVoteRecords.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium text-sm">
                        {v.voter}
                      </TableCell>
                      <TableCell className="text-sm">{v.nominee}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {v.category}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm capitalize">
                          {getSourceIcon(v.source)} {v.source}
                        </div>
                      </TableCell>
                      <TableCell>
                        {v.verified ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {v.timestamp}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Results Tab ────────────────────────────────────────── */}
        <TabsContent value="results" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search nominees..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {mockCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredNominees.map((nom) => {
              const categoryNominees = mockNominees.filter(
                (n) => n.categoryId === nom.categoryId
              );
              const maxVotes = Math.max(
                ...categoryNominees.map((n) => n.votes)
              );
              const pct = Math.round((nom.votes / maxVotes) * 100);
              return (
                <Card
                  key={nom.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getRankIcon(nom.rank)}
                        <div>
                          <p className="font-semibold text-foreground">
                            {nom.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {nom.categoryName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(nom.trend)}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Votes</span>
                        <span className="font-semibold text-foreground">
                          {nom.votes.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Region: {nom.region}</span>
                      <span>{pct}% of leader</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── Analytics Tab ──────────────────────────────────────── */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Vote Trend by Channel */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Votes by Channel (This Week)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={voteTrendData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 8,
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="web"
                        stackId="1"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="mobile"
                        stackId="1"
                        stroke="hsl(var(--accent))"
                        fill="hsl(var(--accent))"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="sms"
                        stackId="1"
                        stroke="hsl(var(--chart-3))"
                        fill="hsl(var(--chart-3))"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Regional Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Votes by Region</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={regionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {regionData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 8,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Peak Voting Hours */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Peak Voting Hours (Today)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyVoteData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 8,
                        }}
                      />
                      <Bar
                        dataKey="votes"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Leaderboard */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Category Leaderboard
                </CardTitle>
                <CardDescription>
                  Top nominee per active category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockCategories
                  .filter((c) => c.status === 'open')
                  .map((cat) => {
                    const leader = mockNominees
                      .filter((n) => n.categoryId === cat.id)
                      .sort((a, b) => b.votes - a.votes)[0];
                    if (!leader) return null;
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {cat.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Crown className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-xs text-muted-foreground">
                              {leader.name} — {leader.votes.toLocaleString()}{' '}
                              votes
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">
                            {cat.totalVotes.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            total votes
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAwards;
