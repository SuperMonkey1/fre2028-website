export interface Partner {
  id?: string;
  name: string;
  category: string;
  description: string;
  logoUrl: string;
  funImageUrl: string;
  // Legacy field for backwards compatibility
  imageUrl?: string;
  website?: string;
  socials?: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
