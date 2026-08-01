import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Container } from '../components/layout';
import type { RegisterFormData } from '../types';

export const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const passwordStrength = (password: string) => {
    if (password.length < 6) return { strength: 'weak', color: 'text-error-600' };
    if (password.length < 10) return { strength: 'medium', color: 'text-warning-600' };
    return { strength: 'strong', color: 'text-success-600' };
  };

  const getPasswordRequirements = (password: string) => {
    const requirements = [
      { test: password.length >= 6, text: 'At least 6 characters' },
      { test: /[A-Z]/.test(password), text: 'One uppercase letter' },
      { test: /[a-z]/.test(password), text: 'One lowercase letter' },
      { test: /\d/.test(password), text: 'One number' },
    ];
    return requirements;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp(
      formData.email,
      formData.password,
      formData.fullName
    );

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <Container className="min-h-screen flex items-center justify-center py-12">
      <Card variant="elevated" className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            LADIVA
          </h2>
          <p className="mt-2 text-gray-600 text-lg">Create your account and start shopping</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 p-4 rounded-lg text-sm animate-pulse">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                onFocus={() => setIsFocused({ ...isFocused, fullName: true })}
                onBlur={() => setIsFocused({ ...isFocused, fullName: false })}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                  isFocused.fullName 
                    ? 'border-primary-500 ring-4 ring-primary-100' 
                    : 'border-gray-200 hover:border-gray-300'
                } focus:outline-none`}
                placeholder="Enter your full name"
              />
              {isFocused.fullName && formData.fullName.length > 2 && (
                <div className="absolute right-3 top-3.5 text-success-500">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => setIsFocused({ ...isFocused, email: true })}
                onBlur={() => setIsFocused({ ...isFocused, email: false })}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                  isFocused.email 
                    ? 'border-primary-500 ring-4 ring-primary-100' 
                    : 'border-gray-200 hover:border-gray-300'
                } focus:outline-none`}
                placeholder="Enter your email"
              />
              {isFocused.email && formData.email.includes('@') && (
                <div className="absolute right-3 top-3.5 text-success-500">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onFocus={() => setIsFocused({ ...isFocused, password: true })}
                onBlur={() => setIsFocused({ ...isFocused, password: false })}
                className={`w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200 ${
                  isFocused.password 
                    ? 'border-primary-500 ring-4 ring-primary-100' 
                    : 'border-gray-200 hover:border-gray-300'
                } focus:outline-none`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-primary-500 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className={`text-xs font-medium ${passwordStrength(formData.password).color}`}>
                  Password strength: {passwordStrength(formData.password).strength}
                </div>
                <div className="space-y-1">
                  {getPasswordRequirements(formData.password).map((req, index) => (
                    <div key={index} className="flex items-center text-xs">
                      {req.test ? (
                        <Check className="w-3 h-3 text-success-500 mr-1" />
                      ) : (
                        <X className="w-3 h-3 text-gray-400 mr-1" />
                      )}
                      <span className={req.test ? 'text-success-600' : 'text-gray-400'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                onFocus={() => setIsFocused({ ...isFocused, confirmPassword: true })}
                onBlur={() => setIsFocused({ ...isFocused, confirmPassword: false })}
                className={`w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200 ${
                  isFocused.confirmPassword 
                    ? 'border-primary-500 ring-4 ring-primary-100' 
                    : 'border-gray-200 hover:border-gray-300'
                } focus:outline-none`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-primary-500 transition-colors duration-200"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {formData.confirmPassword && formData.password && (
                <div className="absolute right-3 top-3.5">
                  {formData.password === formData.confirmPassword ? (
                    <Check className="w-5 h-5 text-success-500" />
                  ) : (
                    <X className="w-5 h-5 text-error-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            size="lg"
            className="w-full py-4 text-lg font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-all duration-200"
            >
              Sign in
            </Link>
          </p>
        </form>
      </Card>
    </Container>
  );
};
