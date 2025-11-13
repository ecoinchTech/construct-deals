// src/types/template.types.ts
export interface TemplateSection {
  title: string;
  content: string;
  order: number;
  isMandatory: boolean;
}

export interface TenderTemplate {
  _id: string;
  name: string;
  description: string;
  categoryId: {
    _id: string;
    name: string;
  };
  sections: TemplateSection[];
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  categoryId: string;
  sections: TemplateSection[];
}

export interface UpdateTemplateRequest {
  id: string;
  name?: string;
  description?: string;
  categoryId?: string;
  sections?: TemplateSection[];
  isActive?: boolean;
}

export interface TemplateFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}