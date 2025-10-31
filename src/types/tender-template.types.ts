export interface TenderSection {
  title: string;
  content: string;
  order: number;
}

export interface TenderDocumentTemplate {
  id: string;
  name: string;
  description: string;
  sections: TenderSection[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  sections: TenderSection[];
}
