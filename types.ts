
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  date: string;
  category: string;
  imageUrl: string;
  isDraft: boolean;
}

export type Theme = 'light' | 'dark';

export interface BlogStats {
  totalPosts: number;
  totalViews: number;
  categoriesCount: number;
  draftsCount: number;
}
