
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MineralType } from '@/pages/DrillingCostEstimator';

type TimePeriod = '1D' | '5D' | '1M' | '1Y' | '5Y';

interface MineralPriceGraphProps {
  mineral: MineralType;
  currentPrice: number;
  unit: string;
  onPriceUpdate?: (newPrice: number) => void;
}

const MineralPriceGraph: React.FC<MineralPriceGraphProps> = ({ 
  mineral, 
  currentPrice, 
  unit,
  onPriceUpdate 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1Y');
  const [graphData, setGraphData] = useState<{ date: string; price: number; timestamp: number }[]>([]);

  // Generate historical data based on selected period
  const generateHistoricalData = (period: TimePeriod) => {
    const now = Date.now();
    let dataPoints: { date: string; price: number; timestamp: number }[] = [];
    let intervals: number;
    let timeStep: number;

    switch (period) {
      case '1D':
        intervals = 24; // 24 hours
        timeStep = 60 * 60 * 1000; // 1 hour
        break;
      case '5D':
        intervals = 120; // 5 days * 24 hours
        timeStep = 60 * 60 * 1000; // 1 hour
        break;
      case '1M':
        intervals = 30; // 30 days
        timeStep = 24 * 60 * 60 * 1000; // 1 day
        break;
      case '1Y':
        intervals = 52; // 52 weeks
        timeStep = 7 * 24 * 60 * 60 * 1000; // 1 week
        break;
      case '5Y':
        intervals = 60; // 60 months
        timeStep = 30 * 24 * 60 * 60 * 1000; // 1 month
        break;
      default:
        intervals = 52;
        timeStep = 7 * 24 * 60 * 60 * 1000;
    }

    // Generate realistic price fluctuations
    const basePrice = currentPrice;
    const volatility = period === '1D' ? 0.02 : period === '5D' ? 0.05 : period === '1M' ? 0.1 : period === '1Y' ? 0.3 : 0.8;
    
    for (let i = intervals; i >= 0; i--) {
      const timestamp = now - (i * timeStep);
      const date = new Date(timestamp);
      
      // Generate realistic price movement
      const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
      const trend = (intervals - i) / intervals; // Slight upward trend over time
      const priceVariation = basePrice * (volatility * randomFactor * 0.5 + trend * 0.1);
      const price = Math.max(basePrice + priceVariation, basePrice * 0.5); // Don't go below 50% of base price
      
      let dateString: string;
      if (period === '1D') {
        dateString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (period === '5D') {
        dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (period === '1M') {
        dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (period === '1Y') {
        dateString = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      } else {
        dateString = date.toLocaleDateString('en-US', { year: 'numeric' });
      }

      dataPoints.push({
        date: dateString,
        price: Math.round(price * 100) / 100,
        timestamp
      });
    }

    // Ensure the last data point is the current price
    if (dataPoints.length > 0) {
      dataPoints[dataPoints.length - 1].price = currentPrice;
    }

    return dataPoints;
  };

  // Update graph data when period changes or when price updates
  useEffect(() => {
    const newData = generateHistoricalData(selectedPeriod);
    setGraphData(newData);
  }, [selectedPeriod, currentPrice]);

  // Simulate live price updates
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const randomChange = (Math.random() - 0.5) * 0.02; // ±1% change
      const newPrice = Math.max(currentPrice * (1 + randomChange), currentPrice * 0.9);
      
      if (onPriceUpdate) {
        onPriceUpdate(Math.round(newPrice * 100) / 100);
      }

      // Update the last data point with new price
      setGraphData(prevData => {
        if (prevData.length === 0) return prevData;
        
        const updatedData = [...prevData];
        const lastPoint = updatedData[updatedData.length - 1];
        updatedData[updatedData.length - 1] = {
          ...lastPoint,
          price: Math.round(newPrice * 100) / 100
        };
        return updatedData;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isOpen, currentPrice, onPriceUpdate]);

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  const periods: { value: TimePeriod; label: string }[] = [
    { value: '1D', label: '1D' },
    { value: '5D', label: '5D' },
    { value: '1M', label: '1M' },
    { value: '1Y', label: '1Y' },
    { value: '5Y', label: '5Y' }
  ];

  return (
    <div className="border border-gray-200 rounded-md">
      <Button
        variant="ghost"
        className="w-full justify-between p-3 h-auto"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-medium">View Price History</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      
      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {/* Time period selector */}
          <div className="flex gap-2 mb-4">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
                className="text-xs"
              >
                {period.label}
              </Button>
            ))}
          </div>
          
          {/* Price chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 10 }}
                  domain={['dataMin * 0.95', 'dataMax * 1.05']}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)} ${unit}`, mineral]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8b4513" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#8b4513" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-3 text-xs text-gray-500 text-center">
            Live updates every 5 seconds • Historical data is simulated
          </div>
        </div>
      )}
    </div>
  );
};

export default MineralPriceGraph;
