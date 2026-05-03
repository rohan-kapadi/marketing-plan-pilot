import { useEffect, useState } from "react";

export type Channel = "Ads" | "Content" | "Tools" | "Events" | "SEO";
export const CHANNELS: Channel[] = ["Ads", "Content", "Tools", "Events", "SEO"];

export type Activity = {
  id: string;
  title: string;
  channel: Channel;
  date: string; // YYYY-MM-DD
  budget: number;
  status: "Planned" | "Completed";
};

export type Allocation = Partial<Record<Channel, number>>;

export type AppState = {
  totalBudget: number;
  allocations: Allocation;
  activities: Activity[];
};

const KEY = "stratifyr-state-v1";

const DEFAULT: AppState = {
  totalBudget: 2000,
  allocations: { Ads: 800, Content: 600, Tools: 200, Events: 200, SEO: 200 },
  activities: [
    {
      id: "a1",
      title: "Google Ads campaign",
      channel: "Ads",
      date: new Date().toISOString().slice(0, 10),
      budget: 400,
      status: "Planned",
    },
    {
      id: "a2",
      title: "Blog post: Local SEO guide",
      channel: "Content",
      date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      budget: 150,
      status: "Planned",
    },
  ],
};

export function useAppState() {
  const [state, setState] = useState<AppState>(DEFAULT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  return { state, setState, ready };
}

export type Template = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  allocations: Allocation;
  activities: Omit<Activity, "id" | "date">[];
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

export const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
