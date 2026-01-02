// Events Data
export const events = [
  {
    id: "1",
    title: "SME Excellence Summit 2024",
    description:
      "Join over 500 SME leaders for a day of networking, learning, and celebrating excellence in Kenyan business.",
    date: "2024-03-15",
    location: "Kenyatta International Convention Centre, Nairobi",
    image: "/events/sme-summit.jpg",
    category: "Summit",
    featured: true,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "2",
    title: "Kenya Brand Awards 2024",
    description:
      "The prestigious annual awards ceremony honoring outstanding brands across various categories.",
    date: "2024-04-20",
    location: "Safari Park Hotel, Nairobi",
    image: "/events/brand-awards.jpg",
    category: "Awards",
    featured: true,
  },
  {
    id: "3",
    title: "Digital Marketing Masterclass",
    description:
      "Learn cutting-edge digital marketing strategies from industry experts.",
    date: "2024-05-10",
    location: "Virtual Event",
    image: "/events/digital-marketing.jpg",
    category: "Workshop",
  },
  {
    id: "4",
    title: "Women in Business Forum",
    description:
      "Empowering women entrepreneurs with tools, connections, and inspiration.",
    date: "2024-06-08",
    location: "Radisson Blu, Upper Hill",
    image: "/events/women-business.jpg",
    category: "Forum",
  },
  {
    id: "5",
    title: "East Africa Trade Expo",
    description:
      "Connect with suppliers, buyers, and investors from across East Africa.",
    date: "2024-07-22",
    location: "KICC, Nairobi",
    image: "/events/trade-expo.jpg",
    category: "Expo",
    featured: true,
  },
  {
    id: "6",
    title: "Startup Pitch Night",
    description:
      "Watch innovative startups pitch to top investors and win funding.",
    date: "2024-08-14",
    location: "iHub, Nairobi",
    image: "/events/pitch-night.jpg",
    category: "Competition",
  },
];

// Award Categories
export const awardCategories = [
  {
    id: "1",
    name: "Best SME of the Year",
    description:
      "Recognizing outstanding SMEs that have demonstrated exceptional growth and innovation.",
    nominations: [
      {
        id: "n1",
        brandName: "TechSavvy Solutions",
        description: "Leading IT solutions provider",
        logo: "/brands/techsavvy.png",
        votes: 234,
        categoryId: "1",
      },
      {
        id: "n2",
        brandName: "GreenLeaf Organics",
        description: "Organic food producer",
        logo: "/brands/greenleaf.png",
        votes: 189,
        categoryId: "1",
      },
      {
        id: "n3",
        brandName: "SafeRide Kenya",
        description: "Transport solutions",
        logo: "/brands/saferide.png",
        votes: 156,
        categoryId: "1",
      },
    ],
  },
  {
    id: "2",
    name: "Innovation Excellence",
    description:
      "Celebrating brands that push boundaries with innovative products and services.",
    nominations: [
      {
        id: "n4",
        brandName: "FinTech Plus",
        description: "Mobile banking innovation",
        logo: "/brands/fintech.png",
        votes: 312,
        categoryId: "2",
      },
      {
        id: "n5",
        brandName: "AgriSmart",
        description: "Agricultural technology",
        logo: "/brands/agrismart.png",
        votes: 278,
        categoryId: "2",
      },
      {
        id: "n6",
        brandName: "EduConnect",
        description: "E-learning platform",
        logo: "/brands/educonnect.png",
        votes: 201,
        categoryId: "2",
      },
    ],
  },
  {
    id: "3",
    name: "Customer Service Award",
    description:
      "Honoring brands with exceptional customer experience and satisfaction.",
    nominations: [
      {
        id: "n7",
        brandName: "QuickServe Retail",
        description: "Retail chain",
        logo: "/brands/quickserve.png",
        votes: 445,
        categoryId: "3",
      },
      {
        id: "n8",
        brandName: "CareFirst Health",
        description: "Healthcare services",
        logo: "/brands/carefirst.png",
        votes: 389,
        categoryId: "3",
      },
      {
        id: "n9",
        brandName: "HomeStyle Interiors",
        description: "Interior design",
        logo: "/brands/homestyle.png",
        votes: 234,
        categoryId: "3",
      },
    ],
  },
  {
    id: "4",
    name: "Sustainability Champion",
    description:
      "Recognizing brands committed to environmental and social sustainability.",
    nominations: [
      {
        id: "n10",
        brandName: "EcoPackage Kenya",
        description: "Sustainable packaging",
        logo: "/brands/ecopackage.png",
        votes: 521,
        categoryId: "4",
      },
      {
        id: "n11",
        brandName: "SolarBright",
        description: "Solar energy solutions",
        logo: "/brands/solarbright.png",
        votes: 467,
        categoryId: "4",
      },
      {
        id: "n12",
        brandName: "RecycleHub",
        description: "Waste management",
        logo: "/brands/recyclehub.png",
        votes: 398,
        categoryId: "4",
      },
    ],
  },
];

// Blog Posts
export const blogPosts = [
  {
    id: "1",
    title: "The Rise of SMEs in Kenya's Digital Economy",
    excerpt:
      "How small and medium enterprises are leveraging technology to drive growth in the Kenyan market.",
    content: "Full article content here...",
    author: "Sarah Wanjiku",
    date: "2024-02-28",
    image: "/blog/sme-digital.jpg",
    category: "Business Insights",
  },
  {
    id: "2",
    title: "10 Branding Strategies for East African Markets",
    excerpt:
      "Essential branding tips for businesses looking to expand across the East African region.",
    content: "Full article content here...",
    author: "James Ochieng",
    date: "2024-02-20",
    image: "/blog/branding-strategies.jpg",
    category: "Marketing",
  },
  {
    id: "3",
    title: "Highlights from SME Excellence Summit 2023",
    excerpt:
      "A recap of the key moments, speakers, and insights from last year's summit.",
    content: "Full article content here...",
    author: "Grace Muthoni",
    date: "2024-02-15",
    image: "/blog/summit-highlights.jpg",
    category: "Events",
  },
  {
    id: "4",
    title: "Building Customer Loyalty in Competitive Markets",
    excerpt:
      "Strategies for retaining customers and building lasting brand loyalty.",
    content: "Full article content here...",
    author: "Peter Kamau",
    date: "2024-02-10",
    image: "/blog/customer-loyalty.jpg",
    category: "Business Insights",
  },
  {
    id: "5",
    title: "Sustainable Business Practices: A Competitive Advantage",
    excerpt:
      "Why going green is not just good for the planet but great for business.",
    content: "Full article content here...",
    author: "Amina Hassan",
    date: "2024-02-05",
    image: "/blog/sustainability.jpg",
    category: "Sustainability",
  },
  {
    id: "6",
    title: "Nominations Now Open for Kenya Brand Awards 2024",
    excerpt:
      "Submit your nominations for this year's most prestigious business awards.",
    content: "Full article content here...",
    author: "Valuable Brands Team",
    date: "2024-01-30",
    image: "/blog/nominations-open.jpg",
    category: "Awards",
  },
];

// Gallery Items
export const galleryItems = [
  {
    id: "g1",
    type: "image",
    url: "/gallery/event1.jpg",
    title: "SME Summit 2023 - Main Stage",
  },
  {
    id: "g2",
    type: "image",
    url: "/gallery/event2.jpg",
    title: "Brand Awards Ceremony",
  },
  {
    id: "g3",
    type: "video",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Event Highlights 2023",
  },
  {
    id: "g4",
    type: "image",
    url: "/gallery/event3.jpg",
    title: "Networking Session",
  },
  {
    id: "g5",
    type: "image",
    url: "/gallery/event4.jpg",
    title: "Panel Discussion",
  },
  {
    id: "g6",
    type: "video",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "CEO Interview",
  },
  {
    id: "g7",
    type: "image",
    url: "/gallery/event5.jpg",
    title: "Award Winners",
  },
  {
    id: "g8",
    type: "image",
    url: "/gallery/event6.jpg",
    title: "Workshop Session",
  },
  {
    id: "g9",
    type: "image",
    url: "/gallery/event7.jpg",
    title: "Exhibition Hall",
  },
];

// Team Members
export const teamMembers = [
  {
    id: "t1",
    name: "Michael Otieno",
    role: "Founder & CEO",
    image: "/team/ceo.jpg",
    bio: "With over 15 years in brand management and event planning, Michael founded Valuable Brands to elevate Kenyan SMEs on the global stage.",
  },
  {
    id: "t2",
    name: "Jane Njeri",
    role: "Director of Operations",
    image: "/team/operations.jpg",
    bio: "Jane ensures every event runs flawlessly, bringing her expertise in logistics and client relations.",
  },
  {
    id: "t3",
    name: "David Mwangi",
    role: "Creative Director",
    image: "/team/creative.jpg",
    bio: "David leads our creative team, crafting memorable brand experiences and visual identities.",
  },
  {
    id: "t4",
    name: "Faith Akinyi",
    role: "Marketing Manager",
    image: "/team/marketing.jpg",
    bio: "Faith drives our digital presence and marketing campaigns, connecting brands with their audiences.",
  },
];

// Dashboard Stats (for Admin)
export const dashboardStats = {
  totalEvents: 24,
  upcomingEvents: 6,
  totalNominations: 156,
  totalVotes: 4892,
  totalBlogs: 32,
  activeCategories: 8,
  registeredUsers: 1247,
  monthlyVisitors: 15600,
};
