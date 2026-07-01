export interface ProjectSection {
  id?: number;
  title: string;
  body: string;
  image_path: string | null;
  sort_order: number;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  usage_guide: string;
  app_url: string | null;
  cover_image_path: string | null;
  author_name: string;
  author_school: string;
  author_email: string;
  created_at: string;
  updated_at: string;
  sections: ProjectSection[];
}

export interface ProjectListItem {
  id: number;
  title: string;
  description: string;
  cover_image_path: string | null;
  author_name: string;
  author_school: string;
  created_at: string;
}

export interface Comment {
  id: number;
  project_id: number;
  author_name: string;
  author_school: string;
  author_email: string;
  body: string;
  created_at: string;
}

export interface ContributorProfile {
  id: string;
  name: string;
  school: string;
  email: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  usage_guide: string;
  app_url: string | null;
  cover_image_path: string | null;
  author_name: string;
  author_school: string;
  author_email: string;
  sections: ProjectSection[];
}
