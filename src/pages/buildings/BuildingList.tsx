import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetBuildingsQuery } from '@/store/api/buildingApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Search, MapPin, Square } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const BuildingList = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useGetBuildingsQuery({ page, limit: 10 });

  const filteredBuildings = data?.data.buildings.filter(building =>
    building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.address.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getBuildingTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      commercial: 'bg-primary/10 text-primary',
      residential: 'bg-secondary/10 text-secondary',
      industrial: 'bg-accent/10 text-accent',
      mixed: 'bg-muted text-muted-foreground',
    };
    return colors[type] || colors.mixed;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Buildings</h1>
            <p className="text-muted-foreground">Manage your property portfolio</p>
          </div>
          <Link to="/buildings/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Building
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search buildings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Buildings Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : filteredBuildings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No buildings found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first building'}
              </p>
              {!searchTerm && (
                <Link to="/buildings/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Building
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuildings.map((building) => (
              <Link key={building.id} to={`/buildings/${building.id}`}>
                <Card className="h-full transition-smooth hover:shadow-lg cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-12 w-12 rounded-lg gradient-secondary flex items-center justify-center">
                        <Building className="h-6 w-6 text-white" />
                      </div>
                      <Badge className={getBuildingTypeColor(building.buildingType)}>
                        {building.buildingType}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-1">{building.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="line-clamp-1">{building.address}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Square className="h-4 w-4" />
                        <span>{building.floorArea.toLocaleString()} sq ft</span>
                      </div>
                      {building.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {building.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {building.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{building.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.data.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.data.pagination.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= data.data.pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BuildingList;
