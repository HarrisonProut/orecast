
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CostChartProps {
  data: {
    name: string;
    cost: number;
  }[];
}

const CostChart: React.FC<CostChartProps> = ({ data }) => {
  // Format the tooltip value
  const formatTooltip = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `$${value/1000}k`} />
          <Tooltip formatter={formatTooltip} />
          <Bar dataKey="cost" name="Drilling Cost Estimate" fill="#9b87f5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostChart;
