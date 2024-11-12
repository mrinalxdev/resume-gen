export interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary?: string;
  };
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    highlights: string[];
  }[];
  education: string[];
  skills: string[];
  githubUsername: string;
  githubData?: {
    avatarUrl: string;
    bio: string;
    location: string;
    repos: {
      name: string;
      description: string;
      stars: number;
      url: string;
      language: string;
    }[];
  };
}