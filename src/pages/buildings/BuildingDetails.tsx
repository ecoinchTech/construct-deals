import { Link, useParams, useNavigate } from 'react-router-dom';
import { useGetBuildingQuery } from '@/store/api/buildingApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, ArrowLeft, Edit, MapPin, Square, Map } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const BuildingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetBuildingQuery(id!);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data?.data.building) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Building not found</h2>
          <Button onClick={() => navigate('/buildings')}>
            Back to Buildings
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const building = data.data.building;

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
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/buildings')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Buildings
          </Button>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl gradient-secondary flex items-center justify-center">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold">{building.name}</h1>
                  <Badge className={getBuildingTypeColor(building.buildingType)}>
                    {building.buildingType}
                  </Badge>
                </div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {building.address}
                </p>
              </div>
            </div>
            <Link to={`/buildings/${id}/edit`}>
              <Button className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Floor Area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {building.floorArea.toLocaleString()} sq ft
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Coordinates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">
                {building.geo.lat.toFixed(4)}, {building.geo.lng.toFixed(4)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Created</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {new Date(building.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tags */}
        {building.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Classification and features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {building.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Content */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Active RFQs</CardTitle>
              <CardDescription>Requests for quotation for this property</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No active RFQs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>Active and completed contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No contracts yet</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BuildingDetails;
