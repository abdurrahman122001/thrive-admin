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