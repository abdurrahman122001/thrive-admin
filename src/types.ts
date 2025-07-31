export interface About {
  id: number;
  title: string;
  description?: string;
  image?: string;
}

export interface Hero {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  features?: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  image: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
}

export interface Contact {
  phone: string;
  email: string;
  address: string;
  hours: string;
}

export interface ContactForm {
  title: string;
  subtitle: string;
  successMessage: string;
}

export interface ContentData {
  hero: Hero;
  services: Service[];
  team: TeamMember[];
  about: About;
  contact: Contact;
  contactForm: ContactForm;
}

export interface ContactSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
  updated_at: string;
}
export interface FooterData {
    id?: number;
    title: string;
    description: string;
    privacy_link: string;
    terms_link: string;
    disclaimer_link: string;
    copyright_text: string;
    designer_text: string;
    logo?: string | File;
    facebook_url: string;
    twitter_url: string;
    instagram_url: string;
    pinterest_url: string;
    linkedin_url: string;
}