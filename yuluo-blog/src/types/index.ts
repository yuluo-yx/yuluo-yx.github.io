// Type definitions for the blog

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  category: string;
  coverImage?: string;
  content: string;
  readingTime?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  image?: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  posts: BlogPost[];
  totalPosts: number;
  completedPosts: number;
  lastUpdated: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  thumbnail?: string;
  title?: string;
  category?: string;
  metadata?: {
    date?: string;
    location?: string;
    camera?: string;
    aperture?: string;
    shutter?: string;
    iso?: string;
  };
}

export type Theme = 'light' | 'dark';
