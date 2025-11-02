import Parser from 'rss-parser';
import { BlogPost, BlogListItem } from '../types/blog';

const RSS_FEED_URL = 'https://www.teamfre.be/feed';

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
});

/**
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // Normalize special characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract the first image URL from HTML content
 */
function extractFirstImage(htmlContent: string): string | undefined {
  // First try to get from src attribute
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = htmlContent.match(imgRegex);
  
  if (match && match[1]) {
    // Clean the URL - remove width descriptors like "1456w" if present
    let url = match[1].trim();
    // If URL contains a space followed by width descriptor, take only the URL part
    const spaceIndex = url.indexOf(' ');
    if (spaceIndex > 0) {
      url = url.substring(0, spaceIndex);
    }
    return url;
  }
  
  return undefined;
}

/**
 * Strip HTML tags and get plain text excerpt
 */
function stripHtml(html: string, maxLength: number = 200): string {
  const text = html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Fetch and parse the RSS feed from Substack - Lightweight version for blog listing
 */
export async function fetchBlogPostsListing(): Promise<BlogListItem[]> {
  try {
    const feed = await parser.parseURL(RSS_FEED_URL);
    
    return feed.items.map((item: any) => {
      // Try multiple possible content fields
      const content = item.contentEncoded || item['content:encoded'] || item.content || item.description || '';
      const imageUrl = extractFirstImage(content) || null;
      const slug = generateSlug(item.title || '');
      
      return {
        title: item.title || 'Untitled',
        slug,
        excerpt: stripHtml(content, 250),
        content: '', // Don't include full content for listing - saves bandwidth
        date: item.isoDate || item.pubDate || new Date().toISOString(),
        imageUrl,
        link: item.link || '',
        categories: item.categories || [],
      };
    });
  } catch (error) {
    console.error('Error fetching blog posts listing:', error);
    return [];
  }
}

/**
 * Fetch and parse the RSS feed from Substack - Full version for individual posts
 */
export async function fetchBlogPosts(): Promise<BlogListItem[]> {
  try {
    const feed = await parser.parseURL(RSS_FEED_URL);
    
    return feed.items.map((item: any) => {
      // Try multiple possible content fields
      const content = item.contentEncoded || item['content:encoded'] || item.content || item.description || '';
      const imageUrl = extractFirstImage(content) || null;
      const slug = generateSlug(item.title || '');
      
      return {
        title: item.title || 'Untitled',
        slug,
        excerpt: stripHtml(content, 250),
        content,
        date: item.isoDate || item.pubDate || new Date().toISOString(),
        imageUrl,
        link: item.link || '',
        categories: item.categories || [],
      };
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogListItem | null> {
  try {
    const posts = await fetchBlogPosts();
    return posts.find(post => post.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

/**
 * Get all blog post slugs for static path generation
 */
export async function getAllBlogSlugs(): Promise<string[]> {
  try {
    const posts = await fetchBlogPostsListing(); // Use lightweight version
    return posts.map(post => post.slug);
  } catch (error) {
    console.error('Error fetching blog slugs:', error);
    return [];
  }
}

export const blogService = {
  fetchBlogPosts,
  fetchBlogPostsListing,
  getBlogPostBySlug,
  getAllBlogSlugs,
};
