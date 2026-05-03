// ── Domain Types ──────────────────────────────────────────────
export type Channel = "Ads" | "Content" | "Tools" | "Events" | "SEO";
export const CHANNELS: Channel[] = ["Ads", "Content", "Tools", "Events", "SEO"];

export type Allocation = Partial<Record<Channel, number>>;

// ── Templates ─────────────────────────────────────────────────
export type Template = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  allocations: Allocation;
  activities: {
    title: string;
    channel: Channel;
    budget: number;
    status: "Planned" | "Completed";
  }[];
};

export const TEMPLATES: Template[] = [
  {
    id: "local",
    name: "Local Growth",
    description: "Dominate your local market with targeted ads and community presence.",
    emoji: "📍",
    allocations: { Ads: 1000, Content: 400, Events: 400, Tools: 100, SEO: 100 },
    activities: [
      { title: "Google Local Ads", channel: "Ads", budget: 500, status: "Planned" },
      { title: "Community event sponsorship", channel: "Events", budget: 400, status: "Planned" },
      { title: "Local SEO optimization", channel: "SEO", budget: 100, status: "Planned" },
    ],
  },
  {
    id: "social",
    name: "Social Media Plan",
    description: "Build an engaged audience across Instagram, TikTok, and LinkedIn.",
    emoji: "📱",
    allocations: { Ads: 600, Content: 900, Tools: 300, Events: 0, SEO: 200 },
    activities: [
      { title: "Weekly Reels production", channel: "Content", budget: 400, status: "Planned" },
      { title: "Instagram boost campaign", channel: "Ads", budget: 300, status: "Planned" },
      { title: "Scheduling tool subscription", channel: "Tools", budget: 100, status: "Planned" },
    ],
  },
  {
    id: "launch",
    name: "Product Launch",
    description: "Generate buzz and conversions for a new product release.",
    emoji: "🚀",
    allocations: { Ads: 1200, Content: 500, Tools: 200, Events: 100, SEO: 0 },
    activities: [
      { title: "Launch teaser campaign", channel: "Ads", budget: 600, status: "Planned" },
      { title: "Press kit & landing page", channel: "Content", budget: 300, status: "Planned" },
      { title: "Webinar event", channel: "Events", budget: 100, status: "Planned" },
    ],
  },
];

// ── Formatter ─────────────────────────────────────────────────
export const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
