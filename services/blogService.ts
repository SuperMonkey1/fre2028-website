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
 * Clean HTML content by removing unwanted elements like image-link-expand divs
 */
function cleanHtmlContent(html: string): string {
  if (!html) return '';
  
  let cleanedHtml = html;
  
  // Remove image-link-expand divs and their content
  // Use a more reliable approach by finding the start and end positions
  while (true) {
    const startPattern = '<div class="image-link-expand"';
    const startIndex = cleanedHtml.indexOf(startPattern);
    
    if (startIndex === -1) break; // No more image-link-expand divs found
    
    // Find the end of the opening tag
    const openTagEnd = cleanedHtml.indexOf('>', startIndex);
    if (openTagEnd === -1) break;
    
    // Now count nested divs to find the matching closing div
    let divCount = 1;
    let pos = openTagEnd + 1;
    
    while (pos < cleanedHtml.length && divCount > 0) {
      const nextOpenDiv = cleanedHtml.indexOf('<div', pos);
      const nextCloseDiv = cleanedHtml.indexOf('</div>', pos);
      
      if (nextCloseDiv === -1) {
        // No more closing divs, something's wrong - just remove from start to end
        cleanedHtml = cleanedHtml.substring(0, startIndex);
        break;
      }
      
      if (nextOpenDiv !== -1 && nextOpenDiv < nextCloseDiv) {
        // Found an opening div before the closing div
        divCount++;
        pos = nextOpenDiv + 4; // Move past '<div'
      } else {
        // Found a closing div
        divCount--;
        if (divCount === 0) {
          // This is our matching closing div
          const endPos = nextCloseDiv + 6; // Include '</div>'
          cleanedHtml = cleanedHtml.substring(0, startIndex) + cleanedHtml.substring(endPos);
          break;
        } else {
          pos = nextCloseDiv + 6; // Move past '</div>'
        }
      }
    }
    
    // Safety check to prevent infinite loops
    if (pos >= cleanedHtml.length && divCount > 0) {
      // Malformed HTML, just remove from startIndex to end
      cleanedHtml = cleanedHtml.substring(0, startIndex);
      break;
    }
  }
  
  return cleanedHtml;
}

/**
 * Fetch and parse the RSS feed from Substack - Lightweight version for blog listing
 */
export async function fetchBlogPostsListing(): Promise<BlogListItem[]> {
  try {
    const feed = await parser.parseURL(RSS_FEED_URL);
    
    return feed.items.map((item: any) => {
      // Try multiple possible content fields
      const rawContent = item.contentEncoded || item['content:encoded'] || item.content || item.description || '';
      const cleanedContent = cleanHtmlContent(rawContent);
      const imageUrl = extractFirstImage(rawContent) || null;
      const slug = generateSlug(item.title || '');
      
      return {
        title: item.title || 'Untitled',
        slug,
        excerpt: stripHtml(cleanedContent, 250),
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
      const rawContent = item.contentEncoded || item['content:encoded'] || item.content || item.description || '';
      const cleanedContent = cleanHtmlContent(rawContent);
      const imageUrl = extractFirstImage(rawContent) || null;
      const slug = generateSlug(item.title || '');
      
      return {
        title: item.title || 'Untitled',
        slug,
        excerpt: stripHtml(cleanedContent, 250),
        content: cleanedContent,
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
