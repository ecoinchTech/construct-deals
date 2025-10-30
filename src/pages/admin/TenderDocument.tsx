import { useState } from 'react';
import { useGetTemplatesQuery, useCreateTemplateMutation, useUpdateTemplateMutation, useDeleteTemplateMutation } from '@/store/api/tenderDocumentTemplateApi';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, FileText, Copy, Search } from 'lucide-react';
import { TemplateSection } from '@/types/template.types';

const TenderDocumentTemplates = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    sections: [
      { title: 'Introduction', content: '', order: 0, isMandatory: true },
      { title: 'Scope of Work', content: '', order: 1, isMandatory: true },
      { title: 'Technical Requirements', content: '', order: 2, isMandatory: true },
      { title: 'Commercial Terms', content: '', order: 3, isMandatory: true }
    ]
  });

  const { data, isLoading, refetch } = useGetTemplatesQuery({ 
    page, 
    limit: 10, 
    search: searchTerm, 
    categoryId: categoryFilter 
  });
  const { data: categoriesData } = useGetCategoriesQuery({});
  
  const [createTemplate] = useCreateTemplateMutation();
  const [updateTemplate] = useUpdateTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();

  const templates = data?.data?.templates || [];
  const pagination = data?.data?.pagination;
  const categories = categoriesData?.data?.categories || [];

  const handleCreateTemplate = async () => {
    if (!formData.name || !formData.categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createTemplate(formData).unwrap();
      toast.success('Template created successfully');
      refetch();
      setCreateDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create template');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate || !formData.name || !formData.categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateTemplate({ id: selectedTemplate._id, ...formData }).unwrap();
      toast.success('Template updated successfully');
      refetch();
      setEditDialogOpen(false);
      resetForm();
      setSelectedTemplate(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate(templateId).unwrap();
      toast.success('Template deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete template');
    }
  };

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      categoryId: template.categoryId._id,
      sections: template.sections
    });
    setEditDialogOpen(true);
  };

  const handleViewTemplate = (template: any) => {
    setSelectedTemplate(template);
    setViewDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      sections: [
        { title: 'Introduction', content: '', order: 0, isMandatory: true },
        { title: 'Scope of Work', content: '', order: 1, isMandatory: true },
        { title: 'Technical Requirements', content: '', order: 2, isMandatory: true },
        { title: 'Commercial Terms', content: '', order: 3, isMandatory: true }
      ]
    });
  };

  const addSection = () => {
    const newSection: TemplateSection = {
      title: '',
      content: '',
      order: formData.sections.length,
      isMandatory: false
    };
    setFormData({
      ...formData,
      sections: [...formData.sections, newSection]
    });
  };

  const updateSection = (index: number, field: keyof TemplateSection, value: any) => {
    const updatedSections = [...formData.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setFormData({ ...formData, sections: updatedSections });
  };

  const removeSection = (index: number) => {
    const updatedSections = formData.sections.filter((_, i) => i !== index);
    // Reorder the remaining sections
    const reorderedSections = updatedSections.map((section, i) => ({
      ...section,
      order: i
    }));
    setFormData({ ...formData, sections: reorderedSections });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tender Document Templates</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage templates for tender documents
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
           <Select value={categoryFilter} onValueChange={setCategoryFilter}>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="All Categories" />
  </SelectTrigger>
  <SelectContent>
    {categories.map((category: any) => (
      <SelectItem key={category._id} value={category._id}>
        {category.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No templates found</p>
            <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
              Create your first template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {templates.map((template: any) => (
              <Card key={template._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {template.name}
                      </CardTitle>
                      <CardDescription>
  Created on {new Date(template.createdAt).toLocaleDateString()} by{" "}
  {template.createdBy?.name || "Unknown"}
</CardDescription>

                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
  {template.categoryId?.name || "Uncategorized"}
</Badge>

                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-sm line-clamp-2">{template.description || "No description provided"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Sections ({template.sections.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {template.sections.slice(0, 3).map((section: any, index: number) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {section.isMandatory && <span className="text-red-500">*</span>}
                          {section.title}
                        </Badge>
                      ))}
                      {template.sections.length > 3 && (
                        <Badge variant="outline">+{template.sections.length - 3}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTemplate(template)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this template?')) {
                          handleDeleteTemplate(template._id);
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                disabled={page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Template Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a new tender document template with custom sections
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                   <SelectContent>
      {categories.map((category: any) => (
        <SelectItem key={category._id} value={category._id}>
          {category.name}
        </SelectItem>
      ))}
    </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter template description"
                rows={3}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Template Sections</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSection}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </div>
              <Tabs defaultValue="0" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {formData.sections.map((section, index) => (
                    <TabsTrigger key={index} value={index.toString()}>
                      {section.title || `Section ${index + 1}`}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {formData.sections.map((section, index) => (
                  <TabsContent key={index} value={index.toString()} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`section-title-${index}`}>Section Title</Label>
                        <Input
                          id={`section-title-${index}`}
                          value={section.title}
                          onChange={(e) => updateSection(index, 'title', e.target.value)}
                          placeholder="Enter section title"
                        />
                      </div>
                      <div className="flex items-center space-x-2 mt-6">
                        <input
                          type="checkbox"
                          id={`section-mandatory-${index}`}
                          checked={section.isMandatory}
                          onChange={(e) => updateSection(index, 'isMandatory', e.target.checked)}
                        />
                        <Label htmlFor={`section-mandatory-${index}`}>Mandatory Section</Label>
                        {formData.sections.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSection(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`section-content-${index}`}>Section Content</Label>
                      <Textarea
                        id={`section-content-${index}`}
                        value={section.content}
                        onChange={(e) => updateSection(index, 'content', e.target.value)}
                        placeholder="Enter section content"
                        rows={6}
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update the tender document template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Template Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: any) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter template description"
                rows={3}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Template Sections</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSection}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </div>
              <Tabs defaultValue="0" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {formData.sections.map((section, index) => (
                    <TabsTrigger key={index} value={index.toString()}>
                      {section.title || `Section ${index + 1}`}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {formData.sections.map((section, index) => (
                  <TabsContent key={index} value={index.toString()} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`edit-section-title-${index}`}>Section Title</Label>
                        <Input
                          id={`edit-section-title-${index}`}
                          value={section.title}
                          onChange={(e) => updateSection(index, 'title', e.target.value)}
                          placeholder="Enter section title"
                        />
                      </div>
                      <div className="flex items-center space-x-2 mt-6">
                        <input
                          type="checkbox"
                          id={`edit-section-mandatory-${index}`}
                          checked={section.isMandatory}
                          onChange={(e) => updateSection(index, 'isMandatory', e.target.checked)}
                        />
                        <Label htmlFor={`edit-section-mandatory-${index}`}>Mandatory Section</Label>
                        {formData.sections.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSection(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`edit-section-content-${index}`}>Section Content</Label>
                      <Textarea
                        id={`edit-section-content-${index}`}
                        value={section.content}
                        onChange={(e) => updateSection(index, 'content', e.target.value)}
                        placeholder="Enter section content"
                        rows={6}
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTemplate}>
              Update Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Template Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Created on {new Date(selectedTemplate?.createdAt).toLocaleDateString()} by {selectedTemplate?.createdBy.name}
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.description || "No description provided"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Category</h3>
                <Badge variant="outline">{selectedTemplate.categoryId.name}</Badge>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Template Sections</h3>
                <div className="space-y-4">
                  {selectedTemplate.sections.map((section: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          {section.isMandatory && <span className="text-red-500">*</span>}
                          {section.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{section.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(selectedTemplate, null, 2));
                toast.success('Template copied to clipboard');
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenderDocumentTemplates;