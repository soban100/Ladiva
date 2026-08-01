import { Loader2 } from 'lucide-react';
import { colors } from '../lib/design-system';

export const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-16 h-16 text-primary-600 animate-spin" />
        <p className="text-lg font-medium text-gray-600">Loading...</p>
      </div>
    </div>
  );
};
