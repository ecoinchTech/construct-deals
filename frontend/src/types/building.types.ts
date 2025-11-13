export interface Building {
  _id: string;
  id: string;
  organizationId: string;
  name: string;
  address: string;
  geo: {
    lat: number;
    lng: number;
  };
  floorArea: number;
  buildingType: 'commercial' | 'residential' | 'industrial' | 'mixed';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBuildingRequest {
  organizationId: string;
  name: string;
  address: string;
  geo: {
    lat: number;
    lng: number;
  };
  floorArea: number;
  buildingType: 'commercial' | 'residential' | 'industrial' | 'mixed';
  tags: string[];
}

export interface UpdateBuildingRequest extends CreateBuildingRequest {
  id: string;
}
