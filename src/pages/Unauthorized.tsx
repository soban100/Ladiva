import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Container } from '../components/layout';

export const Unauthorized = () => {
  return (
    <Container className="min-h-screen flex items-center justify-center py-12">
      <Card variant="elevated" className="max-w-md w-full p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 bg-error-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-error-600" />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You don't have permission to access this page. This area is restricted to administrators only.
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
            
            <Link to="/" className="flex-1">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact the system administrator.
          </p>
        </div>
      </Card>
    </Container>
  );
};

export default Unauthorized;
