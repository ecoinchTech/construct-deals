export interface Category {
  _id: string;
  id: string;
  name: string;
  parentId?: string;
  description: string;
  tags: string[];
  icon?: string;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  parentId?: string;
  description: string;
  tags: string[];
  icon?: string;
}

export interface UpdateCategoryRequest {
  id: string;
  name?: string;
  parentId?: string;
  description?: string;
  tags?: string[];
  icon?: string;
}
