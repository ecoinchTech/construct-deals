export interface Organization {
  id: string;
  name: string;
  gstNumber: string;
  address: string;
  defaultCurrency: string;
  ownerId: string;
  preferredVendorIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  gstNumber: string;
  address: string;
  defaultCurrency: string;
}

export interface UpdateOrganizationRequest extends CreateOrganizationRequest {
  id: string;
}
