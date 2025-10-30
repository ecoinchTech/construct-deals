export interface Organization {
  _id: string; // Changed from id to _id
  id?: string; // Keep optional id for compatibility
  name: string;
  gstNumber: string;
  address: string;
  defaultCurrency: string;
  ownerUserId: {
    _id: string;
    email: string;
    name: string;
  };
  preferredVendors: string[]; // Changed from preferredVendorIds
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
