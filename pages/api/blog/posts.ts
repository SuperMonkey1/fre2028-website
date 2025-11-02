import { NextApiRequest, NextApiResponse } from 'next';
import { blogService } from '../../../services/blogService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const posts = await blogService.fetchBlogPostsListing();
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
}