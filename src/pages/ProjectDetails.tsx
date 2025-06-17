import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Edit2, Check, X, Download } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProjectData } from '@/components/ProjectCard';
import { MineralType } from '@/pages/DrillingCostEstimator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';

// Define financial metrics interface
interface FinancialMetrics {
  npv: number;
  irr: number;
  paybackPeriod: number;
  npvData: Array<{year: number, value: number}>;
  paybackData: Array<{year: number, value: number}>;
}

// Define slider configuration
interface SliderConfig {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  value: number | [number, number];
  unit: string;
  isRange: boolean;
}

// Updated mineral price data with new base figures
const baseMineralPrices: Record<MineralType, { price: number; unit: string }> = {
  'Copper': { price: 9657.50, unit: '$/tonne' },
  'Gold': { price: 3430.30, unit: '$/oz' },
  'Silver': { price: 36.37, unit: '$/oz' },
  'Cobalt': { price: 33331.79, unit: '$/tonne' },
  'Manganese': { price: 2382.48, unit: '$/tonne' },
  'Iron': { price: 104.68, unit: '$/tonne' }
};

// Landscape images for different locations
const landscapeImages = [
  'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1000&h=400&fit=crop',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1000&h=400&fit=crop',
  'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=1000&h=400&fit=crop',
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1000&h=400&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1000&h=400&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&h=400&fit=crop',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1000&h=400&fit=crop',
  'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=1000&h=400&fit=crop'
];

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [liveMineralPrices, setLiveMineralPrices] = useState(baseMineralPrices);
  const [flashingMinerals, setFlashingMinerals] = useState<Record<MineralType, boolean>>({} as Record<MineralType, boolean>);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    npv: 63000000, // Default $63M
    irr: 8.3, // Default 8.3%
    paybackPeriod: 8, // Default 8 years
    npvData: [],
    paybackData: []
  });

  // Define sliders with initial values and updated ranges
  const [sliders, setSliders] = useState<SliderConfig[]>([
    {
      id: 'deposit-size',
      name: 'Deposit Size',
      min: 0,
      max: 1000,
      step: 10,
      value: 500,
      unit: 'tonnes',
      isRange: false
    },
    {
      id: 'mineral-quality',
      name: 'Mineral Quality',
      min: 0,
      max: 20,
      step: 0.1,
      value: 7,
      unit: '%',
      isRange: false
    },
    {
      id: 'capex-investment',
      name: 'CAPEX Investment',
      min: 0,
      max: 1000,
      step: 10,
      value: 500,
      unit: 'M$',
      isRange: false
    },
    {
      id: 'time-of-project',
      name: 'Time of Project',
      min: 1,
      max: 20,
      step: 1,
      value: 5,
      unit: 'years',
      isRange: false
    }
  ]);

  // Live pricing update effect with flash animation
  useEffect(() => {
    const updatePrices = () => {
      setLiveMineralPrices(prevPrices => {
        const updatedPrices = { ...prevPrices };
        const flashUpdates: Record<MineralType, boolean> = {} as Record<MineralType, boolean>;
        
        Object.keys(updatedPrices).forEach(mineral => {
          const mineralKey = mineral as MineralType;
          const basePrice = baseMineralPrices[mineralKey].price;
          
          // Generate small random change (±0.1% to ±0.5%)
          const changePercent = (Math.random() - 0.5) * 1; // -0.5% to +0.5%
          const changeAmount = basePrice * (changePercent / 100);
          
          // Apply change to current price, but keep it within reasonable bounds
          const currentPrice = updatedPrices[mineralKey].price;
          const newPrice = Math.max(basePrice * 0.95, Math.min(basePrice * 1.05, currentPrice + changeAmount));
          
          // Check if price actually changed
          if (Math.abs(newPrice - currentPrice) > 0.01) {
            flashUpdates[mineralKey] = true;
          }
          
          updatedPrices[mineralKey] = {
            ...updatedPrices[mineralKey],
            price: Math.round(newPrice * 100) / 100 // Round to 2 decimal places
          };
        });
        
        // Trigger flash animation for changed prices
        setFlashingMinerals(flashUpdates);
        setTimeout(() => setFlashingMinerals({} as Record<MineralType, boolean>), 500);
        
        return updatedPrices;
      });
    };

    // Update prices every 5 seconds
    const priceInterval = setInterval(updatePrices, 5000);
    
    return () => clearInterval(priceInterval);
  }, []);

  // Load project data from localStorage
  useEffect(() => {
    const loadProject = () => {
      const savedProjects = localStorage.getItem('explorationProjects');
      if (savedProjects) {
        const projects: ProjectData[] = JSON.parse(savedProjects);
        const foundProject = projects.find(p => p.id === id);
        if (foundProject) {
          setProject(foundProject);
          setEditedName(foundProject.name);
          
          // Load saved metrics if they exist
          const savedMetrics = localStorage.getItem(`projectMetrics_${id}`);
          if (savedMetrics) {
            const parsedMetrics = JSON.parse(savedMetrics);
            setMetrics(prev => ({
              ...prev,
              ...parsedMetrics
            }));
          }
        }
      }
    };

    loadProject();
  }, [id]);

  // Generate NPV and payback data when metrics change
  useEffect(() => {
    // Generate NPV data over years
    const generateNpvData = () => {
      const years = typeof sliders.find(s => s.id === 'time-of-project')?.value === 'number'
        ? sliders.find(s => s.id === 'time-of-project')?.value as number || 5
        : (sliders.find(s => s.id === 'time-of-project')?.value as [number, number])?.[0] || 5;
      const data = [];
      
      data.push({ year: 0, value: -15000000 });
      
      for (let i = 1; i <= years; i++) {
        const yearValue = (metrics.npv / years) * (1 + (i / 10)) * (i / years);
        data.push({ year: i, value: Math.round(yearValue) });
      }
      
      return data;
    };
    
    const generatePaybackData = () => {
      const years = typeof sliders.find(s => s.id === 'time-of-project')?.value === 'number'
        ? sliders.find(s => s.id === 'time-of-project')?.value as number || 5
        : (sliders.find(s => s.id === 'time-of-project')?.value as [number, number])?.[0] || 5;
      const data = [];
      let cumulativeValue = -15000000;
      
      data.push({ year: 0, value: cumulativeValue });
      
      for (let i = 1; i <= years; i++) {
        const yearValue = (metrics.npv / years) * (1 + (i / 10)) * (i / years);
        cumulativeValue += yearValue;
        data.push({ year: i, value: Math.round(cumulativeValue) });
      }
      
      return data;
    };
    
    const npvData = generateNpvData();
    const paybackData = generatePaybackData();
    
    setMetrics(prev => ({
      ...prev,
      npvData,
      paybackData
    }));
  }, [metrics.npv, sliders]);

  // Update financial metrics when sliders change AND save to localStorage - FIXED to use range values
  useEffect(() => {
    const calculateMetrics = () => {
      // Get slider values, using average for ranges or single value
      const getSliderValue = (sliderId: string) => {
        const slider = sliders.find(s => s.id === sliderId);
        if (!slider) return 500; // default
        
        if (Array.isArray(slider.value)) {
          // For ranges, use average of min and max
          return (slider.value[0] + slider.value[1]) / 2;
        }
        return slider.value as number;
      };
      
      const depositSize = getSliderValue('deposit-size');
      const mineralQuality = getSliderValue('mineral-quality');
      const capexInvestment = getSliderValue('capex-investment');
      const projectTime = getSliderValue('time-of-project');

      // Base NPV calculation
      const baseNpv = 63000000;
      
      // Apply slider effects (using average values for ranges)
      const depositEffect = (depositSize / 500) * 0.7;
      const qualityEffect = (mineralQuality / 7) * 0.3;
      const capexEffect = (1 - (capexInvestment / 500)) * 0.4;
      const timeEffect = (1 - (projectTime / 5)) * 0.2;
      
      const multiplier = 0.3 + (depositEffect + qualityEffect + capexEffect + timeEffect);
      const newNpv = Math.round(baseNpv * multiplier);
      
      const baseIrr = 8.3;
      const irrMultiplier = Math.sqrt(newNpv / baseNpv);
      const newIrr = Math.round(baseIrr * irrMultiplier * 10) / 10;
      
      const basePayback = 8;
      const paybackMultiplier = baseNpv / newNpv;
      const newPayback = Math.round(basePayback * paybackMultiplier * 10) / 10;

      const newMetrics = {
        npv: newNpv,
        irr: newIrr,
        paybackPeriod: newPayback
      };

      setMetrics(prev => ({
        ...prev,
        ...newMetrics
      }));

      if (id) {
        localStorage.setItem(`projectMetrics_${id}`, JSON.stringify(newMetrics));
      }
    };

    calculateMetrics();
  }, [sliders, id]);

  // Handle slider change
  const handleSliderChange = (sliderId: string, newValue: number[]) => {
    setSliders(prev => 
      prev.map(slider => 
        slider.id === sliderId 
          ? { 
              ...slider, 
              value: slider.isRange ? [newValue[0], newValue[1]] : newValue[0] 
            } 
          : slider
      )
    );
  };

  // Toggle slider range mode
  const toggleSliderRange = (sliderId: string) => {
    setSliders(prev => 
      prev.map(slider => 
        slider.id === sliderId 
          ? { 
              ...slider, 
              isRange: !slider.isRange,
              value: !slider.isRange 
                ? [typeof slider.value === 'number' ? slider.value : slider.value[0], typeof slider.value === 'number' ? slider.value : slider.value[1]]
                : typeof slider.value === 'number' ? slider.value : slider.value[0]
            } 
          : slider
      )
    );
  };

  // Handle project name editing
  const handleSaveName = () => {
    if (project && editedName.trim()) {
      const savedProjects = localStorage.getItem('explorationProjects');
      if (savedProjects) {
        const projects: ProjectData[] = JSON.parse(savedProjects);
        const updatedProjects = projects.map(p => 
          p.id === project.id ? { ...p, name: editedName.trim() } : p
        );
        localStorage.setItem('explorationProjects', JSON.stringify(updatedProjects));
        setProject({ ...project, name: editedName.trim() });
      }
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditedName(project?.name || '');
    setIsEditingName(false);
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  // Get mineral icon and color
  const getMineralColor = (mineral: MineralType): string => {
    switch (mineral) {
      case 'Gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Silver': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'Copper': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Cobalt': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Manganese': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Iron': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Function to get project image - UPDATED to properly use drilling estimator images
  const getProjectImage = () => {
    if (project?.fromDrillingEstimator) {
      // Check if there's a saved image from drilling estimator using the project ID
      const savedImage = localStorage.getItem(`drillingImage_${project.id}`);
      if (savedImage) {
        return savedImage;
      }
      
      // Also check if there's a drilling search history entry that matches this project
      const savedProjects = localStorage.getItem('drillingSearchHistory');
      if (savedProjects) {
        const drillingProjects = JSON.parse(savedProjects);
        const matchingProject = drillingProjects.find((p: any) => 
          p.locationDetails.name === project.location && 
          p.locationDetails.country === project.country
        );
        if (matchingProject && matchingProject.landscapeImage) {
          return matchingProject.landscapeImage;
        }
      }
    }
    
    // Use a consistent random image based on project ID for non-drilling projects
    const imageIndex = project ? Math.abs(project.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % landscapeImages.length : 0;
    return landscapeImages[imageIndex];
  };

  if (!project) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <p>Project not found.</p>
        <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Return to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-6">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Projects
            </Link>
          </div>
          
          {/* Header with editable name and download button */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-2xl font-bold border-none p-0 h-auto"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                    <Button size="sm" onClick={handleSaveName} className="h-8 w-8 p-0">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold">{project.name}</h1>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setIsEditingName(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Download Report Button */}
              <Button 
                onClick={() => {
                  // Download PDF report function
                  const downloadPDFReport = async () => {
                    if (!project) return;
                    const pdf = new jsPDF();
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();
                    let yPos = 20;

                    // Header
                    pdf.setFontSize(24);
                    pdf.setTextColor(31, 41, 55); // Gray-800
                    pdf.text(project.name || 'Project Report', 20, yPos);
                    yPos += 15;

                    pdf.setFontSize(12);
                    pdf.setTextColor(107, 114, 128); // Gray-500
                    pdf.text(`Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString()}`, 20, yPos);
                    yPos += 10;
                    pdf.text(`Location: ${project.location}, ${project.country}`, 20, yPos);
                    yPos += 20;

                    // Executive Summary
                    pdf.setFontSize(18);
                    pdf.setTextColor(31, 41, 55);
                    pdf.text('Executive Summary', 20, yPos);
                    yPos += 15;

                    pdf.setFontSize(12);
                    pdf.setTextColor(55, 65, 81);
                    
                    // Key Financial Metrics
                    pdf.text(`Net Present Value: ${formatCurrency(metrics.npv)}`, 20, yPos);
                    yPos += 8;
                    pdf.text(`Internal Rate of Return: ${metrics.irr}%`, 20, yPos);
                    yPos += 8;
                    pdf.text(`Payback Period: ${metrics.paybackPeriod} years`, 20, yPos);
                    yPos += 15;

                    // Current Mineral Prices
                    pdf.setFontSize(16);
                    pdf.setTextColor(31, 41, 55);
                    pdf.text('Current Mineral Prices', 20, yPos);
                    yPos += 10;

                    pdf.setFontSize(10);
                    project.minerals.forEach(mineral => {
                      pdf.text(`${mineral}: ${liveMineralPrices[mineral]?.price.toLocaleString()} ${liveMineralPrices[mineral]?.unit}`, 20, yPos);
                      yPos += 6;
                    });
                    yPos += 10;

                    // Project Inputs
                    pdf.setFontSize(16);
                    pdf.setTextColor(31, 41, 55);
                    pdf.text('Project Inputs', 20, yPos);
                    yPos += 10;

                    pdf.setFontSize(10);
                    sliders.forEach(slider => {
                      const value = Array.isArray(slider.value) 
                        ? `${slider.value[0]} - ${slider.value[1]} ${slider.unit}`
                        : `${slider.value} ${slider.unit}`;
                      pdf.text(`${slider.name}: ${value}`, 20, yPos);
                      yPos += 6;
                    });
                    yPos += 10;

                    // Drilling Cost Information
                    if (project.cost && project.cost !== 'Not calculated using Drilling Cost Estimator') {
                      pdf.setFontSize(16);
                      pdf.setTextColor(31, 41, 55);
                      pdf.text('Exploration Drilling Cost', 20, yPos);
                      yPos += 10;

                      pdf.setFontSize(10);
                      pdf.text(`Estimated Cost: ${project.cost}`, 20, yPos);
                      yPos += 6;
                      if (project.costRange) {
                        pdf.text(`Cost Range: ${project.costRange}`, 20, yPos);
                        yPos += 6;
                      }
                      pdf.text('Drilling Method: Reverse Circulation', 20, yPos);
                      yPos += 6;
                      pdf.text('Estimated Duration: 3-4 weeks', 20, yPos);
                      yPos += 6;
                      pdf.text('Depth: 350m', 20, yPos);
                      yPos += 6;
                      pdf.text('Core Samples: Required', 20, yPos);
                      yPos += 10;
                    }

                    // Financial Analysis
                    if (yPos > pageHeight - 50) {
                      pdf.addPage();
                      yPos = 20;
                    }

                    pdf.setFontSize(16);
                    pdf.setTextColor(31, 41, 55);
                    pdf.text('Financial Analysis', 20, yPos);
                    yPos += 15;

                    pdf.setFontSize(12);
                    pdf.text('NPV Analysis:', 20, yPos);
                    yPos += 8;
                    pdf.setFontSize(10);
                    pdf.text(`The Net Present Value of ${formatCurrency(metrics.npv)} suggests a strong potential`, 20, yPos);
                    yPos += 6;
                    pdf.text('for profit generation with this project.', 20, yPos);
                    yPos += 10;

                    pdf.setFontSize(12);
                    pdf.text('Key Influencing Factors:', 20, yPos);
                    yPos += 8;
                    pdf.setFontSize(10);
                    pdf.text('• Metal price projection', 25, yPos);
                    yPos += 6;
                    pdf.text('• Deposit grade and tonnage', 25, yPos);
                    yPos += 6;
                    pdf.text('• Capital investment required', 25, yPos);
                    yPos += 6;
                    pdf.text('• Timing of cash flows', 25, yPos);
                    yPos += 15;

                    // Footer
                    pdf.setFontSize(8);
                    pdf.setTextColor(107, 114, 128);
                    pdf.text('This report is generated automatically and should be reviewed by qualified professionals.', 20, pageHeight - 20);
                    pdf.text(`Page 1 of 1 - Generated by Mining Exploration Platform`, 20, pageHeight - 10);

                    // Save the PDF
                    pdf.save(`${project.name || 'project'}-report-${new Date().toISOString().split('T')[0]}.pdf`);
                  };
                  downloadPDFReport();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            </div>
            <p className="text-gray-600">{project.location}, {project.country}</p>
            <p className="text-sm text-gray-500">Coordinates: Lat: 45.1786, Long: -123.121</p>
          </div>
          
          {/* Location Map */}
          <div className="border rounded-lg p-6 bg-white shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4">Location Map</h2>
            <div className="relative rounded-md h-64 overflow-hidden">
              <img 
                src={getProjectImage()} 
                alt={`${project.location} landscape`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <MapPin className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="mt-4 bg-gray-50 border rounded-md p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Location Information</h4>
                  <p className="font-medium">{project.location}, {project.country}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    This exploration site is located in {project.location}, {project.country}. This area may have geological 
                    characteristics that impact drilling costs and resource potential.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content - split into two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column - Sliders */}
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Project Inputs</h2>
              <p className="text-gray-500 mb-4">Adjust parameters to see impact on project metrics</p>
              
              <div className="space-y-8">
                {/* Mineral Prices Section with flash animation */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Mineral Prices (Live)</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {project.minerals.map(mineral => (
                      <div key={mineral} className={`flex justify-between items-center p-3 rounded-md border ${getMineralColor(mineral)}`}>
                        <span className={`font-medium ${getMineralColor(mineral).split(' ')[0]}`}>
                          {mineral}
                        </span>
                        <span className={`font-semibold transition-all duration-300 ${
                          flashingMinerals[mineral] ? 'bg-yellow-200 scale-110' : ''
                        }`}>
                          {liveMineralPrices[mineral]?.price.toLocaleString()} {liveMineralPrices[mineral]?.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    * These are live prices and update every 5 seconds
                  </p>
                </div>
                
                {/* Regular Sliders */}
                {sliders.map(slider => (
                  <div key={slider.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor={slider.id} className="text-sm font-medium">
                        {slider.name}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {slider.isRange 
                            ? `${Array.isArray(slider.value) ? slider.value[0] : slider.value} - ${Array.isArray(slider.value) ? slider.value[1] : slider.value} ${slider.unit}`
                            : `${Array.isArray(slider.value) ? slider.value[0] : slider.value} ${slider.unit}`
                          }
                        </span>
                        <button
                          onClick={() => toggleSliderRange(slider.id)}
                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                        >
                          {slider.isRange ? 'Single' : 'Range'}
                        </button>
                      </div>
                    </div>
                    <Slider
                      id={slider.id}
                      min={slider.min}
                      max={slider.max}
                      step={slider.step}
                      value={Array.isArray(slider.value) ? slider.value : [slider.value]}
                      onValueChange={(value) => handleSliderChange(slider.id, value)}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{slider.min} {slider.unit}</span>
                      <span>{slider.max} {slider.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right column - Financial Metrics */}
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Project Outputs</h2>
              <p className="text-gray-500 mb-4">Financial metrics based on your inputs</p>
              
              {/* NPV */}
              <Accordion type="single" collapsible className="mb-4">
                <AccordionItem value="npv">
                  <AccordionTrigger className="py-2">
                    <div className="flex justify-between w-full">
                      <span>Net Present Value</span>
                      <span className="font-bold text-mining-primary">
                        {formatCurrency(metrics.npv)}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-2 pb-4 h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={metrics.npvData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                          <YAxis 
                            tickFormatter={(value) => `$${(value/1000000).toFixed(0)}M`}
                            label={{ value: 'Cash Flow ($)', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip 
                            formatter={(value: any) => [`${formatCurrency(value)}`, 'Cash Flow']} 
                            labelFormatter={(label) => `Year ${label}`}
                          />
                          <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-8 p-4 bg-gray-50 rounded-md border">
                      <h3 className="font-medium mb-2">NPV Analysis</h3>
                      <p className="text-sm text-gray-600">
                        The Net Present Value of {formatCurrency(metrics.npv)} suggests a strong potential for profit generation with this project.
                      </p>
                      <h4 className="font-medium mt-4 mb-2 text-sm">Key influencing factors:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                        <li>Metal price projection</li>
                        <li>Deposit grade and tonnage</li>
                        <li>Capital investment required</li>
                        <li>Timing of cash flows</li>
                      </ul>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      This chart shows the projected cash flows over the lifetime of the project. The NPV is the sum of these cash flows discounted to present value.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Accordion type="single" collapsible className="mb-4">
                <AccordionItem value="irr">
                  <AccordionTrigger className="py-2">
                    <div className="flex justify-between w-full">
                      <span>Internal Rate of Return</span>
                      <span className="font-bold text-mining-primary">{metrics.irr}%</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-2 pb-4">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(metrics.irr / 15) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>0%</span>
                        <span>15%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      This project's IRR indicates the profitability of the investment. The higher the IRR, the more attractive the project.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Accordion type="single" collapsible className="mb-4">
                <AccordionItem value="payback">
                  <AccordionTrigger className="py-2">
                    <div className="flex justify-between w-full">
                      <span>Payback Period</span>
                      <span className="font-bold text-mining-primary">{metrics.paybackPeriod} years</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-2 pb-4 h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics.paybackData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                          <YAxis 
                            tickFormatter={(value) => `$${(value/1000000).toFixed(0)}M`} 
                            label={{ value: 'Cumulative Cash Flow ($)', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip 
                            formatter={(value: any) => [`${formatCurrency(value)}`, 'Cumulative Cash Flow']} 
                            labelFormatter={(label) => `Year ${label}`}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3b82f6" 
                            strokeWidth={2} 
                            dot={{ fill: '#3b82f6', r: 4 }}
                          />
                          <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" strokeOpacity={0.5} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      The payback period represents the time needed to recover the initial investment. The chart shows when the cumulative cash flow crosses above zero.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          
          {/* Exploration Drilling Cost Section */}
          <div className="mt-8 border rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Exploration Drilling Cost</h2>
              {project.status && project.status !== 'N/A' && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  {project.status} drilling operations
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {project.cost && project.cost !== 'Not calculated using Drilling Cost Estimator' 
                    ? 'Estimated drilling cost from the exploration site analysis:' 
                    : 'Drilling cost:'}
                </p>
                <p className="text-xl font-bold text-mining-primary">
                  {project.cost}
                </p>
                {project.costRange && (
                  <p className="text-sm text-gray-500 mt-1">
                    Cost Range: {project.costRange}
                  </p>
                )}
              </div>
              
              {project.cost && project.cost !== 'Not calculated using Drilling Cost Estimator' && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2 text-sm">Drilling Details</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex justify-between">
                      <span>Drilling Type:</span>
                      <span className="font-medium">Reverse Circulation</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Estimated Duration:</span>
                      <span className="font-medium">3-4 weeks</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Depth:</span>
                      <span className="font-medium">350m</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Core Samples:</span>
                      <span className="font-medium">Required</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-4 bg-white border-t border-gray-200">
        <div className="container mx-auto flex justify-center">
          <img 
            src="/lovable-uploads/6f649b14-e4cc-4507-8e7c-f01855797ce5.png" 
            alt="Footer Logo" 
            className="h-10"
          />
        </div>
      </footer>
    </div>
  );
};

export default ProjectDetails;
