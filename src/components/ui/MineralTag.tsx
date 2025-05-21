
import React from 'react';
import { cn } from '@/lib/utils';

type MineralType = 'Copper' | 'Gold' | 'Silver' | 'Cobalt' | 'Manganese';

interface MineralTagProps {
  type: MineralType;
}

const MineralTag: React.FC<MineralTagProps> = ({ type }) => {
  const getColorClass = () => {
    switch (type) {
      case 'Copper':
        return 'bg-mining-copper text-white';
      case 'Gold':
        return 'bg-mining-gold text-white';
      case 'Silver':
        return 'bg-mining-silver text-white';
      case 'Cobalt':
        return 'bg-mining-cobalt text-white';
      case 'Manganese':
        return 'bg-mining-manganese text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <span className={cn('px-3 py-1 rounded-full text-xs font-medium', getColorClass())}>
      {type}
    </span>
  );
};

export default MineralTag;
