
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProjectData } from '@/components/ProjectCard';
import { MineralType } from '@/pages/DrillingCostEstimator';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  value: number;
  unit: string;
}

// Define mineral price data
const mineralPrices: Record<MineralType, { price: number; unit: string }> = {
  'Gold': { price: 2045.30, unit: '$/oz' },
  'Silver': { price: 24.85, unit: '$/oz' },
  'Copper': { price: 8750, unit: '$/tonne' },
  'Zinc': { price: 2580, unit: '$/tonne' },
  'Lithium': { price: 14500, unit: '$/tonne' },
  'Nickel': { price: 18200, unit: '$/tonne' },
  'Uranium': { price: 85, unit: '$/lb' }
};

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    npv: 63000000, // Default $63M
    irr: 8.3, // Default 8.3%
    paybackPeriod: 8, // Default 8 years
    npvData: [],
    paybackData: []
  });

  // Define sliders with initial values
  const [sliders, setSliders] = useState<SliderConfig[]>([
    {
      id: 'deposit-size',
      name: 'Deposit Size',
      min: 0,
      max: 1000,
      step: 10,
      value: 500,
      unit: 'tonnes'
    },
    {
      id: 'mineral-quality',
      name: 'Mineral Quality',
      min: 0,
      max: 100,
      step: 1,
      value: 70,
      unit: '%'
    },
    {
      id: 'capex-investment',
      name: 'CAPEX Investment',
      min: 0,
      max: 100,
      step: 1,
      value: 50,
      unit: 'M$'
    },
    {
      id: 'time-of-project',
      name: 'Time of Project',
      min: 1,
      max: 10,
      step: 1,
      value: 5,
      unit: 'years'
    }
  ]);

  // Load project data from localStorage
  useEffect(() => {
    const loadProject = () => {
      const savedProjects = localStorage.getItem('explorationProjects');
      if (savedProjects) {
        const projects: ProjectData[] = JSON.parse(savedProjects);
        const foundProject = projects.find(p => p.id === id);
        if (foundProject) {
          setProject(foundProject);
        }
      }
    };

    loadProject();
  }, [id]);

  // Generate NPV and payback data when metrics change
  useEffect(() => {
    // Generate NPV data over years
    const generateNpvData = () => {
      const years = sliders.find(s => s.id === 'time-of-project')?.value || 5;
      const data = [];
      
      // Initial investment (negative)
      data.push({ year: 0, value: -15000000 });
      
      // Generate cash flows with increasing values
      for (let i = 1; i <= years; i++) {
        const yearValue = (metrics.npv / years) * (1 + (i / 10)) * (i / years);
        data.push({ year: i, value: Math.round(yearValue) });
      }
      
      return data;
    };
    
    // Generate payback data
    const generatePaybackData = () => {
      const years = sliders.find(s => s.id === 'time-of-project')?.value || 5;
      const data = [];
      let cumulativeValue = -15000000; // Initial investment
      
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

  // Update financial metrics when sliders change
  useEffect(() => {
    const calculateMetrics = () => {
      const depositSize = sliders.find(s => s.id === 'deposit-size')?.value || 500;
      const mineralQuality = sliders.find(s => s.id === 'mineral-quality')?.value || 70;
      const capexInvestment = sliders.find(s => s.id === 'capex-investment')?.value || 50;
      const projectTime = sliders.find(s => s.id === 'time-of-project')?.value || 5;

      // Base NPV calculation with some randomization
      const baseNpv = 63000000;
      
      // Apply slider effects
      const depositEffect = (depositSize / 500) * 0.7; // 70% impact
      const qualityEffect = (mineralQuality / 70) * 0.3; // 30% impact
      const capexEffect = (1 - (capexInvestment / 50)) * 0.4; // 40% impact (inverse)
      const timeEffect = (1 - (projectTime / 5)) * 0.2; // 20% impact (inverse)
      
      // Combined multiplier for NPV
      const multiplier = 0.3 + (depositEffect + qualityEffect + capexEffect + timeEffect);
      const newNpv = Math.round(baseNpv * multiplier);
      
      // Calculate IRR based on NPV
      // Higher NPV generally means higher IRR
      const baseIrr = 8.3;
      const irrMultiplier = Math.sqrt(newNpv / baseNpv); // Non-linear relationship
      const newIrr = Math.round(baseIrr * irrMultiplier * 10) / 10;
      
      // Calculate payback period (inversely related to NPV)
      const basePayback = 8;
      const paybackMultiplier = baseNpv / newNpv;
      const newPayback = Math.round(basePayback * paybackMultiplier * 10) / 10;

      setMetrics(prev => ({
        ...prev,
        npv: newNpv,
        irr: newIrr,
        paybackPeriod: newPayback
      }));
    };

    calculateMetrics();
  }, [sliders]);

  // Handle slider change
  const handleSliderChange = (sliderId: string, newValue: number[]) => {
    setSliders(prev => 
      prev.map(slider => 
        slider.id === sliderId 
          ? { ...slider, value: newValue[0] } 
          : slider
      )
    );
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
      case 'Gold': return 'text-yellow-600';
      case 'Silver': return 'text-gray-600';
      case 'Copper': return 'text-orange-600';
      case 'Zinc': return 'text-blue-600';
      case 'Lithium': return 'text-purple-600';
      case 'Nickel': return 'text-green-600';
      case 'Uranium': return 'text-red-600';
      default: return 'text-gray-600';
    }
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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Projects
        </Link>
      </div>
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-gray-600">{project.location}, {project.country}</p>
        <p className="text-sm text-gray-500">Coordinates: Lat: 45.1786, Long: -123.121</p>
      </div>
      
      {/* Location Map */}
      <div className="border rounded-lg p-6 bg-white shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Location Map</h2>
        <div className="bg-[url('https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/0,0,3,0/1000x400?access_token=pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xneng1Mmp4MHRkYzNpcXl5ZDZ6Y2lyNSJ9.3jkU624v1hwRIm46HJbHMw')] rounded-md h-64 flex items-center justify-center bg-cover relative">
          <MapPin className="h-10 w-10 text-mining-primary drop-shadow-lg" />
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
            {/* Mineral Prices Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Mineral Prices (Live)</h3>
              <div className="grid grid-cols-1 gap-4">
                {project.minerals.map(mineral => (
                  <div key={mineral} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className={`font-medium ${getMineralColor(mineral)}`}>
                      {mineral}
                    </span>
                    <span className="font-semibold">
                      {mineralPrices[mineral]?.price.toLocaleString()} {mineralPrices[mineral]?.unit}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 italic">
                * These are live prices and are subject to fluctuation
              </p>
            </div>
            
            {/* Regular Sliders */}
            {sliders.map(slider => (
              <div key={slider.id} className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor={slider.id} className="text-sm font-medium">
                    {slider.name}
                  </label>
                  <span className="text-sm">
                    {slider.value} {slider.unit}
                  </span>
                </div>
                <Slider
                  id={slider.id}
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={[slider.value]}
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
          
          {/* IRR */}
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
          
          {/* Payback Period */}
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
                      {/* Add a reference line at y=0 to show payback threshold */}
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
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            {project.status || 'in progress'} drilling operations
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {project.cost ? 'Estimated drilling cost from the exploration site analysis:' : 'Drilling cost:'}
            </p>
            <p className="text-xl font-bold text-mining-primary">
              {project.cost || 'Not calculated using Drilling Cost Estimator'}
            </p>
            {project.costRange && (
              <p className="text-sm text-gray-500 mt-1">
                Cost Range: {project.costRange}
              </p>
            )}
          </div>
          
          {project.cost && (
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
  );
};

export default ProjectDetails;
