import React, { useState, useEffect } from 'react';
import ProjectCard, { ProjectData } from '@/components/ProjectCard';
import { Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MineralType } from '@/pages/DrillingCostEstimator';

const statusOptions = ['in progress', 'completed', 'planning'] as const;
type StatusType = typeof statusOptions[number];

// Random location data
const randomLocations = [
  { location: "Perth Basin", country: "Australia" },
  { location: "Pilbara Region", country: "Australia" },
  { location: "Golden Triangle", country: "Canada" },
  { location: "Atacama Desert", country: "Chile" },
  { location: "Witwatersrand Basin", country: "South Africa" },
  { location: "Nevada Mining District", country: "United States" },
  { location: "Sudbury Basin", country: "Canada" },
  { location: "Kupferberg", country: "Germany" },
  { location: "Outback Plains", country: "Australia" },
  { location: "Rocky Mountains", country: "United States" }
];

const Home: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    latitude: '',
    longitude: '',
    minerals: [] as MineralType[]
  });
  const [selectedMineral, setSelectedMineral] = useState<MineralType | ''>('');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Load projects from localStorage on initial load
  useEffect(() => {
    const savedProjects = localStorage.getItem('explorationProjects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      setProjects(parsedProjects);
    }
  }, []);

  const handleAddProject = () => {
    setIsAddDialogOpen(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const handleDeleteProject = (id: string) => {
    const updatedProjects = projects.filter(project => project.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem('explorationProjects', JSON.stringify(updatedProjects));
    
    toast({
      title: "Project deleted",
      description: "The project has been successfully removed",
    });
  };

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.latitude || !newProject.longitude || newProject.minerals.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select at least one mineral",
        variant: "destructive"
      });
      return;
    }

    // Generate random location and country
    const randomLocationData = randomLocations[Math.floor(Math.random() * randomLocations.length)];

    // Generate random NPV range based on minerals
    const minNpv = Math.floor(Math.random() * 50) + 30; // 30-80 million
    const maxNpv = minNpv + Math.floor(Math.random() * 50) + 10; // 10-60 million more than minNpv
    const npvRange = `$${minNpv}M - $${maxNpv}M`;

    const newProjectData: ProjectData = {
      id: Date.now().toString(),
      name: newProject.name,
      location: randomLocationData.location,
      country: randomLocationData.country,
      cost: 'Not calculated using Drilling Cost Estimator',
      npvRange,
      minerals: newProject.minerals,
      createdDate: new Date().toISOString(),
      status: 'N/A' as any, // Manual projects have N/A status
    };

    const updatedProjects = [...projects, newProjectData];
    setProjects(updatedProjects);
    localStorage.setItem('explorationProjects', JSON.stringify(updatedProjects));
    
    toast({
      title: "Project added",
      description: "The new exploration project has been added to your list",
    });
    
    // Reset form and close dialog
    setNewProject({
      name: '',
      latitude: '',
      longitude: '',
      minerals: []
    });
    setSelectedMineral('');
    setIsAddDialogOpen(false);
  };

  const handleAddMineral = () => {
    if (selectedMineral && !newProject.minerals.includes(selectedMineral as MineralType)) {
      setNewProject({
        ...newProject,
        minerals: [...newProject.minerals, selectedMineral as MineralType]
      });
      setSelectedMineral('');
    }
  };

  const handleRemoveMineral = (mineral: MineralType) => {
    setNewProject({
      ...newProject,
      minerals: newProject.minerals.filter(m => m !== mineral)
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Exploration Projects</h1>
        <div className="flex items-center gap-4">
          <Button 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={() => navigate('/drilling-cost-estimator')}
          >
            Drilling Cost Estimator
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
          <Button className="bg-mining-primary hover:bg-mining-secondary" onClick={handleAddProject}>
            <Plus className="mr-2 h-4 w-4" /> Add Project
          </Button>
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No projects yet. Use the Add Project button or Drilling Cost Estimator to create new projects.</p>
        </div>
      )}
      
      {/* Add Project Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Exploration Project</DialogTitle>
            <DialogDescription>
              Enter the details of your new exploration project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input 
                id="name" 
                value={newProject.name} 
                onChange={(e) => setNewProject({...newProject, name: e.target.value})} 
                placeholder="Enter project name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input 
                  id="latitude" 
                  value={newProject.latitude} 
                  onChange={(e) => setNewProject({...newProject, latitude: e.target.value})} 
                  placeholder="e.g. 45.1786"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input 
                  id="longitude" 
                  value={newProject.longitude} 
                  onChange={(e) => setNewProject({...newProject, longitude: e.target.value})} 
                  placeholder="e.g. -123.121"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Target Minerals</Label>
              <div className="flex gap-2">
                <Select value={selectedMineral} onValueChange={(value: string) => setSelectedMineral(value as MineralType | '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select mineral" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Copper">Copper</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Cobalt">Cobalt</SelectItem>
                    <SelectItem value="Manganese">Manganese</SelectItem>
                    <SelectItem value="Iron">Iron</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddMineral} type="button" disabled={!selectedMineral}>Add</Button>
              </div>
              
              {newProject.minerals.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newProject.minerals.map((mineral) => (
                    <div 
                      key={mineral} 
                      className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      <span>{mineral}</span>
                      <button 
                        onClick={() => handleRemoveMineral(mineral)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
