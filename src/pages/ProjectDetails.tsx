import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MineralTag from '@/components/ui/MineralTag';
import MineralPriceGraph from '@/components/MineralPriceGraph';
import { MineralType } from '@/pages/DrillingCostEstimator';

interface ProjectData {
  id: string;
  name: string;
  location: string;
  country: string;
  cost: string;
  costPerMeter?: string;
  npvRange: string;
  minerals: MineralType[];
  createdDate: string;
  status: string;
  fromDrillingEstimator?: boolean;
}

// Base mineral prices that always start at these amounts
const baseMineralPrices: Record<MineralType, { price: number; unit: string }> = {
  Copper: { price: 9657.50, unit: 'per tonne' },
  Gold: { price: 3430.30, unit: 'per oz' },
  Silver: { price: 36.37, unit: 'per oz' },
  Cobalt: { price: 33331.79, unit: 'per tonne' },
  Manganese: { price: 2382.48, unit: 'per tonne' },
  Iron: { price: 104.68, unit: 'per tonne' }
};

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [recoveryRange, setRecoveryRange] = useState([70, 85]);
  const [gradeRange, setGradeRange] = useState([1.2, 2.8]);
  const [tonnageRange, setTonnageRange] = useState([45, 75]);
  const [mineralPrices, setMineralPrices] = useState<Record<MineralType, number>>(
    Object.fromEntries(
      Object.entries(baseMineralPrices).map(([mineral, data]) => [mineral, data.price])
    ) as Record<MineralType, number>
  );
  const [flashingMinerals, setFlashingMinerals] = useState<Record<MineralType, boolean>>({} as Record<MineralType, boolean>);

  useEffect(() => {
    // Load project data
    const savedProjects = localStorage.getItem('explorationProjects');
    if (savedProjects && id) {
      const projects: ProjectData[] = JSON.parse(savedProjects);
      const foundProject = projects.find(p => p.id === id);
      if (foundProject) {
        setProject(foundProject);
        setEditedName(foundProject.name);
      }
    }

    // Load saved NPV calculation parameters
    const savedMetrics = localStorage.getItem(`projectMetrics_${id}`);
    if (savedMetrics) {
      const metrics = JSON.parse(savedMetrics);
      setRecoveryRange(metrics.recoveryRange);
      setGradeRange(metrics.gradeRange);
      setTonnageRange(metrics.tonnageRange);
    }
  }, [id]);

  // Simulate live mineral price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const mineralTypes = Object.keys(baseMineralPrices) as MineralType[];
      const randomMineral = mineralTypes[Math.floor(Math.random() * mineralTypes.length)];
      
      setMineralPrices(prev => {
        const currentPrice = prev[randomMineral];
        const changePercent = (Math.random() - 0.5) * 0.04; // ±2% change
        const newPrice = Math.max(currentPrice * (1 + changePercent), currentPrice * 0.9);
        
        // Trigger flash animation
        setFlashingMinerals(flashState => ({
          ...flashState,
          [randomMineral]: true
        }));
        
        // Remove flash after animation
        setTimeout(() => {
          setFlashingMinerals(flashState => ({
            ...flashState,
            [randomMineral]: false
          }));
        }, 500);
        
        return {
          ...prev,
          [randomMineral]: Math.round(newPrice * 100) / 100
        };
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handlePriceUpdate = (mineral: MineralType, newPrice: number) => {
    setMineralPrices(prev => ({
      ...prev,
      [mineral]: newPrice
    }));
  };

  const calculateNPV = () => {
    const recoveryAvg = (recoveryRange[0] + recoveryRange[1]) / 2 / 100;
    const gradeAvg = (gradeRange[0] + gradeRange[1]) / 2;
    const tonnageAvg = (tonnageRange[0] + tonnageRange[1]) / 2;
    
    if (!project) return 0;
    
    let totalValue = 0;
    project.minerals.forEach(mineral => {
      const price = mineralPrices[mineral];
      const metalContent = tonnageAvg * 1000000 * (gradeAvg / 100) * recoveryAvg;
      
      let metalValue = 0;
      if (mineral === 'Gold' || mineral === 'Silver') {
        const ounces = metalContent * 32.15; // Convert to troy ounces
        metalValue = ounces * price;
      } else {
        const tonnes = metalContent / 1000;
        metalValue = tonnes * price;
      }
      
      totalValue += metalValue;
    });
    
    const operatingCosts = tonnageAvg * 1000000 * 45;
    const capitalCosts = 150000000;
    const netValue = totalValue - operatingCosts - capitalCosts;
    
    return netValue;
  };

  const npv = calculateNPV();

  const formatCurrency = (value: number): string => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const saveMetrics = () => {
    const metrics = {
      recoveryRange,
      gradeRange,
      tonnageRange,
      npv,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`projectMetrics_${id}`, JSON.stringify(metrics));
    
    toast({
      title: "Metrics saved",
      description: "Project metrics have been updated successfully.",
    });
  };

  const handleSaveName = () => {
    if (!project || !editedName.trim()) return;
    
    const savedProjects = localStorage.getItem('explorationProjects');
    if (savedProjects) {
      const projects: ProjectData[] = JSON.parse(savedProjects);
      const updatedProjects = projects.map(p => 
        p.id === project.id ? { ...p, name: editedName.trim() } : p
      );
      
      localStorage.setItem('explorationProjects', JSON.stringify(updatedProjects));
      setProject({ ...project, name: editedName.trim() });
      setIsEditing(false);
      
      toast({
        title: "Project renamed",
        description: "Project name has been updated successfully.",
      });
    }
  };

  if (!project) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Project not found</h1>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-2xl font-bold border-0 p-0 h-auto focus:ring-0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') {
                      setIsEditing(false);
                      setEditedName(project.name);
                    }
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveName}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditedName(project.name);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Project Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Project Details */}
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Project Details</h2>
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-gray-500">Location</Label>
                <p className="font-medium">{project.location}, {project.country}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Cost</Label>
                <p className="font-medium">{project.cost}</p>
              </div>
              {project.costPerMeter && (
                <div>
                  <Label className="text-sm text-gray-500">Cost per meter</Label>
                  <p className="font-medium">{project.costPerMeter}</p>
                </div>
              )}
              <div>
                <Label className="text-sm text-gray-500">Status</Label>
                <p className="font-medium capitalize">{project.status}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Created</Label>
                <p className="font-medium">{new Date(project.createdDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Minerals */}
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Target Minerals</h2>
            <div className="flex flex-wrap gap-2">
              {project.minerals.map((mineral) => (
                <MineralTag key={mineral} type={mineral} />
              ))}
            </div>
          </div>

          {/* Live Mineral Prices */}
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Live Mineral Prices</h2>
            <div className="space-y-4">
              {project.minerals.map((mineral) => (
                <div key={mineral}>
                  <div 
                    className={`p-3 rounded-md transition-all duration-300 ${
                      flashingMinerals[mineral] 
                        ? 'bg-yellow-200 shadow-lg transform scale-105' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{mineral}</span>
                      <span className={`font-bold text-lg transition-all duration-300 ${
                        flashingMinerals[mineral] ? 'text-yellow-800' : 'text-gray-800'
                      }`}>
                        ${mineralPrices[mineral].toLocaleString()} {baseMineralPrices[mineral].unit}
                      </span>
                    </div>
                  </div>
                  
                  {/* Price history graph */}
                  <div className="mt-2">
                    <MineralPriceGraph
                      mineral={mineral}
                      currentPrice={mineralPrices[mineral]}
                      unit={baseMineralPrices[mineral].unit}
                      onPriceUpdate={(newPrice) => handlePriceUpdate(mineral, newPrice)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - NPV Calculator */}
        <div className="lg:col-span-2">
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">NPV Calculator</h2>
            
            {/* Current NPV Display */}
            <div className="text-center mb-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Current Project NPV</p>
              <p className={`text-3xl font-bold ${npv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(npv)}
              </p>
            </div>

            {/* Parameter Controls */}
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Recovery Rate: {recoveryRange[0]}% - {recoveryRange[1]}%
                </Label>
                <Slider
                  value={recoveryRange}
                  onValueChange={setRecoveryRange}
                  min={50}
                  max={95}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Grade: {gradeRange[0]}% - {gradeRange[1]}%
                </Label>
                <Slider
                  value={gradeRange}
                  onValueChange={setGradeRange}
                  min={0.1}
                  max={5.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Tonnage: {tonnageRange[0]}M - {tonnageRange[1]}M tonnes
                </Label>
                <Slider
                  value={tonnageRange}
                  onValueChange={setTonnageRange}
                  min={10}
                  max={200}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={saveMetrics}>
                Save Metrics
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
