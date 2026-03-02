export const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      gold: 'bg-yellow-500',
      orange: 'bg-orange-700',
      purple: 'bg-purple-700',
      pink: 'bg-pink-700',
      teal: 'bg-teal-700',
      indigo: 'bg-indigo-700',
      silver: 'bg-gray-500',
      black: 'bg-black',
      white: 'bg-white'
    };
  
    return colorMap[color.toLowerCase()] || 'bg-gray-400';
  };