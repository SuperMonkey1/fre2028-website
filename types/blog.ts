export interface BlogPost {
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  content: string;
  contentSnippet: string;
  guid: string;
  isoDate: string;
  categories?: string[];
  enclosure?: {
    url: string;
    type: string;
  };
}

export interface BlogListItem {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  imageUrl?: string | null;
  link: string;
  categories?: string[];
}
