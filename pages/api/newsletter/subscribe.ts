import type { NextApiRequest, NextApiResponse } from 'next';

type SubscribeResponse = {
  message: string;
  email: string;
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubscribeResponse | ErrorResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is verplicht' });
    }

    // For local development, use the deployed function URL
    // For production, also use the deployed function URL
    const functionUrl = 'https://us-central1-fre-2028-website.cloudfunctions.net/newsletter/subscribe';

    console.log(`Forwarding subscription request to: ${functionUrl}`);
    console.log(`Email: ${email}`);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorData;
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        const errorText = await response.text();
        console.error('Non-JSON error response:', errorText);
        errorData = { error: 'De newsletter functie is nog niet gedeployed. Gelieve eerst te deployen naar Firebase.' };
      }
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error in newsletter API route:', error);
    
    // Check if it's a network error (function not deployed)
    if (error.message?.includes('fetch') || error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'De newsletter functie is nog niet beschikbaar. Gelieve eerst te deployen naar Firebase met: firebase deploy --only functions' 
      });
    }
    
    return res.status(500).json({ error: 'Interne server fout: ' + error.message });
  }
}
