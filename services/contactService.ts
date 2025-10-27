// Contact form service that sends emails via Firebase Cloud Function

export interface ContactRequest {
  name: string;
  email: string;
  inquiryType: string;
  message: string;
}

export interface ContactResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}

class ContactService {
  private getBaseUrl(): string {
    if (process.env.NODE_ENV === 'production') {
      return '/api/contact';
    } else {
      return '/api/contact';
    }
  }

  async sendMessage(data: ContactRequest): Promise<ContactResponse> {
    const baseUrl = this.getBaseUrl();
    console.log('Sending message to:', `${baseUrl}/send`);
    
    try {
      const response = await fetch(`${baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // If API route fails and we're in production, try direct function URL
        if (process.env.NODE_ENV === 'production' && (response.status === 404 || errorText.includes('Cannot POST') || errorText.includes('<html>'))) {
          console.log('API route failed, trying direct function URL...');
          return this.sendMessageDirectly(data);
        }
        
        try {
          const errorData: ErrorResponse = JSON.parse(errorText);
          throw new Error(errorData.error || 'Failed to send message');
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error(`Server error: ${response.status}`);
          } else {
            throw parseError;
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
      if (process.env.NODE_ENV === 'production' && !error.message.includes('Server error')) {
        console.log('Fetch failed, trying direct function URL...');
        return this.sendMessageDirectly(data);
      }
      throw error;
    }
  }

  private async sendMessageDirectly(data: ContactRequest): Promise<ContactResponse> {
    // Note: The function URL from deployment is the base URL without /send
    const directUrl = 'https://us-central1-fre-2028-website.cloudfunctions.net/contact';
    console.log('Trying direct function URL:', `${directUrl}/send`);
    
    const response = await fetch(`${directUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData: ErrorResponse = JSON.parse(errorText);
        throw new Error(errorData.error || 'Failed to send message');
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

export const contactService = new ContactService();
