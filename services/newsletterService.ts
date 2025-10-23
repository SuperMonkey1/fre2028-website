// This file is a copy of the service from your other project.
// It handles calling the Firebase Cloud Function.

export interface SubscribeRequest {
  email: string;
}

export interface SubscribeResponse {
  message: string;
  email: string;
}

export interface ErrorResponse {
  error: string;
}

class NewsletterService {
  private getBaseUrl(): string {
    if (process.env.NODE_ENV === 'production') {
      // Try API route first, fallback to direct function URL
      return '/api/newsletter';
    } else {
      // For local development (if you run the function locally)
      // You might need to adjust this URL if your local setup differs
      return '/api/newsletter';
    }
  }

  async subscribe(email: string): Promise<SubscribeResponse> {
    const baseUrl = this.getBaseUrl();
    console.log('Subscribing to:', `${baseUrl}/subscribe`);
    
    try {
      const response = await fetch(`${baseUrl}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // If API route fails and we're in production, try direct function URL
        if (process.env.NODE_ENV === 'production' && (response.status === 404 || errorText.includes('Cannot POST') || errorText.includes('<html>'))) {
          console.log('API route failed, trying direct function URL...');
          return this.subscribeDirectly(email);
        }
        
        try {
          const errorData: ErrorResponse = JSON.parse(errorText);
          throw new Error(errorData.error || 'Failed to subscribe');
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error(`Server error: ${response.status}`);
          } else {
            throw parseError; // Re-throw the error from parsed JSON
          }
        }
      }

      const responseText = await response.text();
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      // If fetch fails entirely and we're in production, try direct function URL
      if (process.env.NODE_ENV === 'production' && !error.message.includes('Server error')) {
        console.log('Fetch failed, trying direct function URL...');
        return this.subscribeDirectly(email);
      }
      throw error;
    }
  }

  private async subscribeDirectly(email: string): Promise<SubscribeResponse> {
    // This is the public URL of your deployed Firebase Function
    const directUrl = 'https://us-central1-fre-2028-website.cloudfunctions.net/newsletter';
    console.log('Trying direct function URL:', `${directUrl}/subscribe`);
    
    const response = await fetch(`${directUrl}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData: ErrorResponse = JSON.parse(errorText);
        throw new Error(errorData.error || 'Failed to subscribe');
      } catch (parseError) {
        if (parseError instanceof SyntaxError) {
          throw new Error(`Server error: ${response.status}`);
        } else {
          throw parseError;
        }
      }
    }

    const responseText = await response.text();
    return JSON.parse(responseText);
  }
}

export const newsletterService = new NewsletterService();
