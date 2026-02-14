'use client';
import React, { useState } from 'react';
import {
  FileText,
  BookOpen,
  BarChart3,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  User,
  ArrowUpRight,
  MoreHorizontal,
  CheckCircle2,
  Download,
  Share2,
  Tag,
  Image,
  Video,
  Link2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Code,
  X,
  Upload,
  Globe,
  Star,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'react-toastify';

// ─── Mock Data ─────────────────────────────────────────────

const initialBlogPosts = [
  {
    id: '1',
    title: "The Future of SMEs in Kenya's Digital Economy",
    excerpt:
      'Exploring how small and medium enterprises can leverage technology...',
    content:
      "Kenya's digital economy is experiencing unprecedented growth. SMEs are at the forefront of this transformation.\n\n## Key Trends\n\n1. **Mobile-First Commerce** — With over 90% internet penetration via mobile.\n2. **Digital Payments** — M-Pesa and newer fintech solutions.\n3. **Social Commerce** — Instagram and WhatsApp as primary sales channels.",
    author: 'James Mwangi',
    date: '2024-02-28',
    category: 'Business',
    status: 'Published',
    views: 1240,
    readTime: '5 min',
    featured: true,
    coverImage: '/placeholder.svg',
    images: ['/placeholder.svg'],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    tags: ['SME', 'Digital Economy', 'Kenya'],
    seoTitle: 'Future of SMEs in Kenya - Digital Economy 2024',
    seoDescription: 'How Kenyan SMEs leverage digital technology for growth.',
  },
  {
    id: '2',
    title: 'Building Valuable Brands: Lessons from Award Winners',
    excerpt: 'Key insights from past SME Excellence Award winners...',
    content:
      'What makes a brand truly valuable? We spoke with past winners to uncover the strategies behind their success.',
    author: 'Grace Wanjiku',
    date: '2024-02-15',
    category: 'Branding',
    status: 'Published',
    views: 980,
    readTime: '8 min',
    featured: false,
    coverImage: '/placeholder.svg',
    images: [],
    videoUrl: '',
    tags: ['Branding', 'Awards'],
    seoTitle: '',
    seoDescription: '',
  },
  {
    id: '3',
    title: 'Event Planning Trends for 2024',
    excerpt: 'What to expect in the corporate events landscape.',
    content:
      'Hybrid formats, immersive experiences, and sustainability are taking center stage in 2024.',
    author: 'Peter Ochieng',
    date: '2024-02-01',
    category: 'Events',
    status: 'Published',
    views: 756,
    readTime: '3 min',
    featured: false,
    coverImage: '/placeholder.svg',
    images: [],
    videoUrl: '',
    tags: ['Events', 'Trends'],
    seoTitle: '',
    seoDescription: '',
  },
  {
    id: '4',
    title: 'Women Entrepreneurs Leading Change in East Africa',
    excerpt: 'Spotlight on remarkable women reshaping industries...',
    content:
      'Women entrepreneurs are breaking barriers and building transformative businesses across East Africa.',
    author: 'Faith Njeri',
    date: '2024-01-20',
    category: 'Inspiration',
    status: 'Draft',
    views: 0,
    readTime: '6 min',
    featured: false,
    coverImage: '',
    images: [],
    videoUrl: '',
    tags: ['Women', 'Entrepreneurship'],
    seoTitle: '',
    seoDescription: '',
  },
  {
    id: '5',
    title: 'How to Build a Sustainable Brand in 2024',
    excerpt: 'Practical strategies for eco-conscious branding...',
    content:
      "Sustainability is no longer optional — it's a competitive advantage.",
    author: 'Amina Hassan',
    date: '2024-03-10',
    category: 'Branding',
    status: 'Scheduled',
    views: 0,
    readTime: '7 min',
    featured: false,
    coverImage: '/placeholder.svg',
    images: [],
    videoUrl: 'https://www.youtube.com/watch?v=example',
    tags: ['Sustainability', 'Green'],
    seoTitle: '',
    seoDescription: '',
  },
  {
    id: '6',
    title: 'The Power of Networking at Corporate Events',
    excerpt: 'Why face-to-face connections still matter...',
    content:
      'In-person networking remains irreplaceable for building genuine business relationships.',
    author: 'Michael Otieno',
    date: '2024-01-05',
    category: 'Events',
    status: 'Published',
    views: 623,
    readTime: '4 min',
    featured: false,
    coverImage: '/placeholder.svg',
    images: [],
    videoUrl: '',
    tags: ['Networking', 'Events'],
    seoTitle: '',
    seoDescription: '',
  },
];

const magazineEditions = [
  {
    id: '1',
    title: 'The Rise of Kenyan SMEs',
    issue: 'Vol. 8, Issue 1',
    date: '2024-01-15',
    status: 'Published',
    articles: 12,
    downloads: 3420,
    subscribers: 856,
  },
  {
    id: '2',
    title: 'Women Leading Change',
    issue: 'Vol. 7, Issue 4',
    date: '2023-10-20',
    status: 'Published',
    articles: 10,
    downloads: 2890,
    subscribers: 743,
  },
  {
    id: '3',
    title: 'Digital Transformation',
    issue: 'Vol. 7, Issue 3',
    date: '2023-07-15',
    status: 'Published',
    articles: 8,
    downloads: 2150,
    subscribers: 612,
  },
  {
    id: '4',
    title: 'Sustainability & Business',
    issue: 'Vol. 7, Issue 2',
    date: '2023-04-10',
    status: 'Published',
    articles: 9,
    downloads: 1870,
    subscribers: 589,
  },
  {
    id: '5',
    title: 'Innovation Frontiers',
    issue: 'Vol. 8, Issue 2',
    date: '2024-04-15',
    status: 'Upcoming',
    articles: 0,
    downloads: 0,
    subscribers: 0,
  },
];

const magazineArticles = [
  {
    id: '1',
    title: 'How Kujali Foods Built a Million-Dollar Brand',
    author: 'James Mwangi',
    edition: 'Vol. 8, Issue 1',
    category: 'Success Story',
    readTime: '8 min',
    status: 'Published',
    views: 2340,
  },
  {
    id: '2',
    title: 'The Future of Mobile Payments in Africa',
    author: 'Grace Wanjiku',
    edition: 'Vol. 8, Issue 1',
    category: 'Technology',
    readTime: '6 min',
    status: 'Published',
    views: 1890,
  },
  {
    id: '3',
    title: 'Award Winners: Where Are They Now?',
    author: 'Peter Ochieng',
    edition: 'Vol. 8, Issue 1',
    category: 'Feature',
    readTime: '10 min',
    status: 'Published',
    views: 3120,
  },
  {
    id: '4',
    title: '10 Marketing Strategies That Work for SMEs',
    author: 'Faith Njeri',
    edition: 'Vol. 7, Issue 4',
    category: 'Marketing',
    readTime: '7 min',
    status: 'Published',
    views: 1560,
  },
  {
    id: '5',
    title: 'Building a Brand That Lasts',
    author: 'Michael Otieno',
    edition: 'Vol. 7, Issue 4',
    category: 'Branding',
    readTime: '9 min',
    status: 'Published',
    views: 1230,
  },
  {
    id: '6',
    title: 'The Rise of Green Business',
    author: 'Amina Hassan',
    edition: 'Vol. 7, Issue 3',
    category: 'Sustainability',
    readTime: '5 min',
    status: 'Review',
    views: 0,
  },
  {
    id: '7',
    title: 'AI and the Future of African Business',
    author: 'James Mwangi',
    edition: 'Vol. 8, Issue 2',
    category: 'Technology',
    readTime: '8 min',
    status: 'Draft',
    views: 0,
  },
];

const viewsTrend = [
  { month: 'Sep', blog: 3200, magazine: 1800 },
  { month: 'Oct', blog: 4100, magazine: 2400 },
  { month: 'Nov', blog: 3800, magazine: 2100 },
  { month: 'Dec', blog: 4500, magazine: 2900 },
  { month: 'Jan', blog: 5200, magazine: 3400 },
  { month: 'Feb', blog: 6100, magazine: 3800 },
];

const categoryBreakdown = [
  { name: 'Business', value: 32 },
  { name: 'Branding', value: 24 },
  { name: 'Events', value: 18 },
  { name: 'Technology', value: 15 },
  { name: 'Inspiration', value: 11 },
];

const topContent = [
  {
    title: 'Award Winners: Where Are They Now?',
    views: 3120,
    type: 'Magazine',
  },
  { title: 'How Kujali Foods Built a Brand', views: 2340, type: 'Magazine' },
  { title: 'Future of Mobile Payments', views: 1890, type: 'Magazine' },
  { title: "SMEs in Kenya's Digital Economy", views: 1240, type: 'Blog' },
  { title: 'Lessons from Award Winners', views: 980, type: 'Blog' },
];

const PIE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

// ─── Component ─────────────────────────────────────────────

const BlogManagement = () => {
  const [blogPosts, setBlogPosts] = useState(initialBlogPosts);
  const [searchBlog, setSearchBlog] = useState('');
  const [searchMagArticle, setSearchMagArticle] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showEditionDialog, setShowEditionDialog] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Composer state
  const [cTitle, setCTitle] = useState('');
  const [cExcerpt, setCExcerpt] = useState('');
  const [cContent, setCContent] = useState('');
  const [cAuthor, setCAuthor] = useState('');
  const [cCategory, setCCategory] = useState('');
  const [cStatus, setCStatus] = useState('Draft');
  const [cReadTime, setCReadTime] = useState('');
  const [cCoverImage, setCCoverImage] = useState('');
  const [cImages, setCImages] = useState([]);
  const [cVideoUrl, setCVideoUrl] = useState('');
  const [cTags, setCTags] = useState([]);
  const [cTagInput, setCTagInput] = useState('');
  const [cFeatured, setCFeatured] = useState(false);
  const [cDate, setCDate] = useState('');
  const [cSeoTitle, setCSeoTitle] = useState('');
  const [cSeoDesc, setCSeoDesc] = useState('');
  const [newImgUrl, setNewImgUrl] = useState('');
  const [composerTab, setComposerTab] = useState('compose');

  // Derived stats
  const totalViews =
    blogPosts.reduce((s, p) => s + p.views, 0) +
    magazineArticles.reduce((s, a) => s + a.views, 0);
  const publishedPosts = blogPosts.filter(
    (p) => p.status === 'Published'
  ).length;
  const totalDownloads = magazineEditions.reduce((s, e) => s + e.downloads, 0);
  const totalSubscribers = magazineEditions[0]?.subscribers || 0;

  // Filters
  const filteredBlog = blogPosts.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchBlog.toLowerCase()) ||
      p.author.toLowerCase().includes(searchBlog.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const filteredMagArticles = magazineArticles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchMagArticle.toLowerCase()) ||
      a.author.toLowerCase().includes(searchMagArticle.toLowerCase())
  );

  const statusBadge = (status) => {
    const map = {
      Published:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Draft:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      Scheduled:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Review:
        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Upcoming:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return <Badge className={map[status] || ''}>{status}</Badge>;
  };

  const handleDeletePost = (id) => {
    setBlogPosts((prev) => prev.filter((p) => p.id !== id));
    toast({
      title: '🗑️ Post Deleted',
      description: 'Blog post has been removed.',
    });
  };

  const handleToggleFeatured = (id) => {
    setBlogPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p))
    );
    toast({ title: '⭐ Updated', description: 'Featured status updated.' });
  };

  const resetComposer = () => {
    setCTitle('');
    setCExcerpt('');
    setCContent('');
    setCAuthor('');
    setCCategory('');
    setCStatus('Draft');
    setCReadTime('');
    setCCoverImage('');
    setCImages([]);
    setCVideoUrl('');
    setCTags([]);
    setCTagInput('');
    setCFeatured(false);
    setCDate('');
    setCSeoTitle('');
    setCSeoDesc('');
    setNewImgUrl('');
    setComposerTab('compose');
  };

  const openComposer = (post) => {
    if (post) {
      setEditingPost(post);
      setCTitle(post.title);
      setCExcerpt(post.excerpt);
      setCContent(post.content);
      setCAuthor(post.author);
      setCCategory(post.category);
      setCStatus(post.status);
      setCReadTime(post.readTime);
      setCCoverImage(post.coverImage);
      setCImages([...post.images]);
      setCVideoUrl(post.videoUrl);
      setCTags([...post.tags]);
      setCFeatured(post.featured);
      setCDate(post.date);
      setCSeoTitle(post.seoTitle);
      setCSeoDesc(post.seoDescription);
    } else {
      setEditingPost(null);
      resetComposer();
      setCDate(new Date().toISOString().split('T')[0]);
    }
    setShowPostDialog(true);
  };

  const handleSavePost = () => {
    if (!cTitle.trim()) {
      toast({
        title: '⚠️ Required',
        description: 'Please enter a post title.',
        variant: 'destructive',
      });
      return;
    }
    const postData = {
      title: cTitle,
      excerpt: cExcerpt,
      content: cContent,
      author: cAuthor,
      category: cCategory,
      status: cStatus,
      readTime: cReadTime,
      coverImage: cCoverImage,
      images: cImages,
      videoUrl: cVideoUrl,
      tags: cTags,
      featured: cFeatured,
      date: cDate,
      seoTitle: cSeoTitle,
      seoDescription: cSeoDesc,
    };
    if (editingPost) {
      setBlogPosts((prev) =>
        prev.map((p) => (p.id === editingPost.id ? { ...p, ...postData } : p))
      );
      toast({
        title: '✏️ Post Updated',
        description: `"${cTitle}" has been updated.`,
      });
    } else {
      setBlogPosts((prev) => [
        { id: Date.now().toString(), views: 0, ...postData },
        ...prev,
      ]);
      toast({
        title: '✅ Post Created',
        description: `"${cTitle}" has been created.`,
      });
    }
    setShowPostDialog(false);
    resetComposer();
  };

  const addTag = () => {
    const tag = cTagInput.trim();
    if (tag && !cTags.includes(tag)) {
      setCTags((prev) => [...prev, tag]);
      setCTagInput('');
    }
  };

  const addImageUrl = () => {
    if (newImgUrl.trim()) {
      setCImages((prev) => [...prev, newImgUrl.trim()]);
      setNewImgUrl('');
    }
  };

  const insertFormat = (syntax) => setCContent((prev) => prev + syntax);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Content Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage blog posts, magazine editions, and content analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openComposer()}>
            <FileText className="h-4 w-4 mr-1" /> New Post
          </Button>
          <Button size="sm" onClick={() => setShowEditionDialog(true)}>
            <BookOpen className="h-4 w-4 mr-1" /> New Edition
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: 'Total Views',
            value: totalViews.toLocaleString(),
            icon: Eye,
            change: '+18%',
          },
          {
            label: 'Published Posts',
            value: publishedPosts,
            icon: CheckCircle2,
            change: `${blogPosts.length} total`,
          },
          {
            label: 'Magazine Downloads',
            value: totalDownloads.toLocaleString(),
            icon: Download,
            change: '+12%',
          },
          {
            label: 'Subscribers',
            value: totalSubscribers.toLocaleString(),
            icon: User,
            change: '+8%',
          },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" /> {kpi.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="blog" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 h-11">
          <TabsTrigger
            value="blog"
            className="flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <FileText className="h-4 w-4" /> Blog Posts
          </TabsTrigger>
          <TabsTrigger
            value="editions"
            className="flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <BookOpen className="h-4 w-4" /> Editions
          </TabsTrigger>
          <TabsTrigger
            value="articles"
            className="flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <Tag className="h-4 w-4" /> Articles
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <BarChart3 className="h-4 w-4" /> Analytics
          </TabsTrigger>
        </TabsList>

        {/* ─── Blog Posts Tab ─── */}
        <TabsContent value="blog" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchBlog}
                onChange={(e) => setSearchBlog(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Branding">Branding</SelectItem>
                <SelectItem value="Events">Events</SelectItem>
                <SelectItem value="Inspiration">Inspiration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBlog.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {post.coverImage && (
                          <img
                            src={post.coverImage}
                            alt=""
                            className="h-10 w-14 rounded object-cover hidden sm:block"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            {post.featured && (
                              <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                            )}
                            <p className="font-medium text-foreground line-clamp-1">
                              {post.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                            {post.videoUrl && (
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 px-1.5"
                              >
                                <Video className="h-2.5 w-2.5 mr-0.5" /> Video
                              </Badge>
                            )}
                            {post.images.length > 0 && (
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 px-1.5"
                              >
                                <Image className="h-2.5 w-2.5 mr-0.5" />{' '}
                                {post.images.length}
                              </Badge>
                            )}
                          </div>
                          {post.tags.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{post.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{post.author}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{post.category}</Badge>
                    </TableCell>
                    <TableCell>{statusBadge(post.status)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {post.views.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openComposer(post)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleFeatured(post.id)}
                          >
                            <Star className="h-4 w-4 mr-2" />{' '}
                            {post.featured ? 'Unfeature' : 'Feature'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toast({
                                title: '👁️ Preview',
                                description: `Previewing "${post.title}"`,
                              })
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredBlog.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No blog posts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ─── Magazine Editions Tab ─── */}
        <TabsContent value="editions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {magazineEditions.map((edition) => (
              <Card
                key={edition.id}
                className="hover:shadow-elevated transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {edition.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {edition.issue}
                      </CardDescription>
                    </div>
                    {statusBadge(edition.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(edition.date).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-lg font-bold text-foreground">
                        {edition.articles}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Articles
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-lg font-bold text-foreground">
                        {edition.downloads.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Downloads
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-lg font-bold text-foreground">
                        {edition.subscribers}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Subscribers
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" /> Preview
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Magazine Articles Tab ─── */}
        <TabsContent value="articles" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchMagArticle}
                onChange={(e) => setSearchMagArticle(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Article
            </Button>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%]">Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Edition</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMagArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <p className="font-medium text-foreground line-clamp-1">
                        {article.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {article.readTime}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">{article.author}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {article.edition}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{article.category}</Badge>
                    </TableCell>
                    <TableCell>{statusBadge(article.status)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {article.views.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ─── Analytics Tab ─── */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Content Views Trend</CardTitle>
                <CardDescription>
                  Blog vs Magazine views over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={viewsTrend}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="month"
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="blog"
                        stackId="1"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                        name="Blog"
                      />
                      <Area
                        type="monotone"
                        dataKey="magazine"
                        stackId="1"
                        stroke="hsl(var(--accent))"
                        fill="hsl(var(--accent))"
                        fillOpacity={0.3}
                        name="Magazine"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Category Breakdown</CardTitle>
                <CardDescription>Content by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        paddingAngle={4}
                      >
                        {categoryBreakdown.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {categoryBreakdown.map((c, i) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ background: PIE_COLORS[i] }}
                      />
                      <span className="text-muted-foreground">{c.name}</span>
                      <span className="font-medium text-foreground ml-auto">
                        {c.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Top Performing Content
              </CardTitle>
              <CardDescription>Most viewed posts and articles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topContent.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-6">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.title}
                        </p>
                        <Badge variant="outline" className="text-[10px] mt-1">
                          {item.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      {item.views.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Blog Post Composer Dialog ─── */}
      <Dialog
        open={showPostDialog}
        onOpenChange={(open) => {
          if (!open) resetComposer();
          setShowPostDialog(open);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {editingPost ? 'Edit Blog Post' : 'Compose New Blog Post'}
            </DialogTitle>
            <DialogDescription>
              Write your article with rich content, images, video embeds, and
              SEO metadata.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={composerTab}
            onValueChange={setComposerTab}
            className="flex-1"
          >
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-4 h-9">
                <TabsTrigger value="compose" className="text-xs">
                  <FileText className="h-3.5 w-3.5 mr-1" /> Compose
                </TabsTrigger>
                <TabsTrigger value="media" className="text-xs">
                  <Image className="h-3.5 w-3.5 mr-1" /> Media
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">
                  <Tag className="h-3.5 w-3.5 mr-1" /> Settings
                </TabsTrigger>
                <TabsTrigger value="seo" className="text-xs">
                  <Globe className="h-3.5 w-3.5 mr-1" /> SEO
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[55vh] px-6 py-4">
              {/* ── Compose Tab ── */}
              <TabsContent value="compose" className="mt-0 space-y-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Title *
                  </Label>
                  <Input
                    value={cTitle}
                    onChange={(e) => setCTitle(e.target.value)}
                    placeholder="Enter a compelling headline..."
                    className="mt-1 text-lg font-semibold"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Excerpt / Summary
                  </Label>
                  <Textarea
                    value={cExcerpt}
                    onChange={(e) => setCExcerpt(e.target.value)}
                    placeholder="A brief summary that appears in blog listings and social shares..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Content (Markdown supported)
                    </Label>
                    <div className="flex items-center gap-0.5">
                      {[
                        { icon: Bold, syntax: '**bold text**', title: 'Bold' },
                        {
                          icon: Italic,
                          syntax: '*italic text*',
                          title: 'Italic',
                        },
                        {
                          icon: Heading2,
                          syntax: '\n## Heading\n',
                          title: 'Heading',
                        },
                        {
                          icon: Quote,
                          syntax: '\n> Blockquote\n',
                          title: 'Quote',
                        },
                        {
                          icon: List,
                          syntax: '\n- List item\n',
                          title: 'Bullet List',
                        },
                        {
                          icon: ListOrdered,
                          syntax: '\n1. List item\n',
                          title: 'Numbered List',
                        },
                        { icon: Code, syntax: '`code`', title: 'Code' },
                        {
                          icon: Link2,
                          syntax: '[link text](url)',
                          title: 'Link',
                        },
                        {
                          icon: Image,
                          syntax: '![alt text](image-url)',
                          title: 'Image',
                        },
                      ].map((btn, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title={btn.title}
                          onClick={() => insertFormat(btn.syntax)}
                        >
                          <btn.icon className="h-3.5 w-3.5" />
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    value={cContent}
                    onChange={(e) => setCContent(e.target.value)}
                    placeholder="Write your blog post content here...&#10;&#10;You can use Markdown formatting:&#10;## Headings&#10;**Bold** and *italic*&#10;- Bullet points&#10;1. Numbered lists&#10;> Blockquotes&#10;![images](url)&#10;[links](url)"
                    rows={14}
                    className="mt-0 font-mono text-sm leading-relaxed"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {cContent.split(/\s+/).filter(Boolean).length} words · ~
                    {Math.max(
                      1,
                      Math.ceil(
                        cContent.split(/\s+/).filter(Boolean).length / 200
                      )
                    )}{' '}
                    min read
                  </p>
                </div>
              </TabsContent>

              {/* ── Media Tab ── */}
              <TabsContent value="media" className="mt-0 space-y-6">
                {/* Cover Image */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Cover Image
                  </Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={cCoverImage}
                        onChange={(e) => setCCoverImage(e.target.value)}
                        placeholder="Paste image URL or path..."
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast({
                            title: '📸 Upload',
                            description:
                              'In production, this opens a file picker for image upload.',
                          })
                        }
                      >
                        <Upload className="h-4 w-4 mr-1" /> Upload
                      </Button>
                    </div>
                    {cCoverImage && (
                      <div className="relative group rounded-lg overflow-hidden border border-border bg-muted h-48">
                        <img
                          src={cCoverImage}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white"
                            onClick={() => setCCoverImage('')}
                          >
                            <X className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Additional Images */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Gallery Images
                  </Label>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Add additional images that will appear in the article body.
                  </p>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newImgUrl}
                      onChange={(e) => setNewImgUrl(e.target.value)}
                      placeholder="Image URL..."
                      className="flex-1"
                      onKeyDown={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), addImageUrl())
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addImageUrl}
                      disabled={!newImgUrl.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                  {cImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {cImages.map((img, i) => (
                        <div
                          key={i}
                          className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-video"
                        >
                          <img
                            src={img}
                            alt={`Image ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() =>
                              setCImages((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              )
                            }
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <p className="absolute bottom-1 left-1 text-[9px] text-white bg-black/50 px-1 rounded">
                            #{i + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {cImages.length === 0 && (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No images added yet
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Paste URLs above to add images
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Video Embed */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Video Embed
                  </Label>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Add a YouTube, Vimeo, or other video URL to embed in your
                    post.
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={cVideoUrl}
                        onChange={(e) => setCVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="pl-9"
                      />
                    </div>
                    {cVideoUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCVideoUrl('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {cVideoUrl && (
                    <div className="mt-2 rounded-lg border border-border bg-muted/50 p-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Video className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {cVideoUrl}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Video will be embedded in the blog post
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ── Settings Tab ── */}
              <TabsContent value="settings" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Author
                    </Label>
                    <Input
                      value={cAuthor}
                      onChange={(e) => setCAuthor(e.target.value)}
                      placeholder="Author name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Category
                    </Label>
                    <Select value={cCategory} onValueChange={setCCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Branding">Branding</SelectItem>
                        <SelectItem value="Events">Events</SelectItem>
                        <SelectItem value="Inspiration">Inspiration</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Sustainability">
                          Sustainability
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Status
                    </Label>
                    <Select
                      value={cStatus}
                      onValueChange={(v) => setCStatus(v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Publish Date
                    </Label>
                    <Input
                      type="date"
                      value={cDate}
                      onChange={(e) => setCDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Read Time
                    </Label>
                    <Input
                      value={cReadTime}
                      onChange={(e) => setCReadTime(e.target.value)}
                      placeholder="e.g. 5 min"
                      className="mt-1"
                    />
                  </div>
                </div>

                <Separator />

                {/* Tags */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Tags
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={cTagInput}
                      onChange={(e) => setCTagInput(e.target.value)}
                      placeholder="Add a tag..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addTag}
                      disabled={!cTagInput.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {cTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {cTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {tag}
                          <button
                            onClick={() =>
                              setCTags((prev) => prev.filter((t) => t !== tag))
                            }
                            className="ml-0.5 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Featured toggle */}
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <Label className="text-sm font-medium">Featured Post</Label>
                    <p className="text-xs text-muted-foreground">
                      Display prominently on the blog homepage
                    </p>
                  </div>
                  <Switch checked={cFeatured} onCheckedChange={setCFeatured} />
                </div>
              </TabsContent>

              {/* ── SEO Tab ── */}
              <TabsContent value="seo" className="mt-0 space-y-4">
                <div className="rounded-lg border border-border p-4 bg-muted/30 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Search Preview
                  </p>
                  <p className="text-primary text-base font-medium truncate">
                    {cSeoTitle || cTitle || 'Post Title'}
                  </p>
                  <p className="text-xs text-emerald-600 truncate">
                    yoursite.com/blog/
                    {cTitle
                      ? cTitle.toLowerCase().replace(/\s+/g, '-').slice(0, 40)
                      : 'post-slug'}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {cSeoDesc ||
                      cExcerpt ||
                      'Post description will appear here...'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    SEO Title
                  </Label>
                  <Input
                    value={cSeoTitle}
                    onChange={(e) => setCSeoTitle(e.target.value)}
                    placeholder="Custom title for search engines (defaults to post title)"
                    className="mt-1"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {(cSeoTitle || cTitle).length}/60 characters
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Meta Description
                  </Label>
                  <Textarea
                    value={cSeoDesc}
                    onChange={(e) => setCSeoDesc(e.target.value)}
                    placeholder="Description for search results (defaults to excerpt)"
                    rows={3}
                    className="mt-1"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {(cSeoDesc || cExcerpt).length}/160 characters
                  </p>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <Separator />
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {cImages.length > 0 && (
                <span className="flex items-center gap-1">
                  <Image className="h-3 w-3" /> {cImages.length} images
                </span>
              )}
              {cVideoUrl && (
                <span className="flex items-center gap-1">
                  <Video className="h-3 w-3" /> Video
                </span>
              )}
              {cTags.length > 0 && (
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" /> {cTags.length} tags
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPostDialog(false);
                  resetComposer();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCStatus('Draft');
                  handleSavePost();
                }}
              >
                Save Draft
              </Button>
              <Button onClick={handleSavePost}>
                {editingPost ? 'Update Post' : 'Publish Post'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── New Edition Dialog ─── */}
      <Dialog open={showEditionDialog} onOpenChange={setShowEditionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Magazine Edition</DialogTitle>
            <DialogDescription>
              Set up a new magazine edition.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Edition Title</Label>
              <Input placeholder="e.g. Innovation Frontiers" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Issue Number</Label>
                <Input placeholder="e.g. Vol. 8, Issue 2" />
              </div>
              <div>
                <Label>Publication Date</Label>
                <Input type="date" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this edition..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditionDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowEditionDialog(false);
                toast({
                  title: '📖 Edition Created',
                  description: 'New magazine edition has been created.',
                });
              }}
            >
              Create Edition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManagement;
