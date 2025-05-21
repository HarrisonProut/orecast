
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CostChartProps {
  data: {
    name: string;
    conservative: number;
    average: number;
    ambitious: number;
  }[];
}

const CostChart: React.FC<CostChartProps> = ({ data }) => {
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
          <YAxis />
          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
          <Legend />
          <Bar dataKey="conservative" name="Conservative Estimate" fill="#3B82F6" />
          <Bar dataKey="average" name="Average Estimate" fill="#8B5CF6" />
          <Bar dataKey="ambitious" name="Ambitious Estimate" fill="#EC4899" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostChart;
