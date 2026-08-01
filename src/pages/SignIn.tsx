import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Eye, EyeOff, Loader2, Check, Mail, User, Lock, X, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface SignInFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const SignIn = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<SignInFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
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
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [step, setStep] = useState(1);

  const passwordStrength = (password: string) => {
    if (password.length < 6) return { strength: 'weak', color: 'text-red-600', bg: 'bg-red-100' };
    if (password.length < 10) return { strength: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { strength: 'strong', color: 'text-green-600', bg: 'bg-green-100' };
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

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !newErrors.fullName && !newErrors.email && !newErrors.password && !newErrors.confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.fullName);
      // Show success message and redirect
      setStep(3);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SignInFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const nextStep = () => {
    if (step === 1 && formData.fullName && formData.email) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Half - Sign-in Form */}
      <div className="w-1/2 flex items-center justify-center p-8 bg-gray-900">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-400 hover:text-primary-600 transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Home</span>
          </button>

          <div className="bg-gray-800 rounded-2xl shadow-xl p-8 text-white border border-gray-700">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                LADIVA
              </h2>
              <p className="mt-2 text-gray-300 text-lg">
                {step === 1 && 'Create your customer account'}
                {step === 2 && 'Set your password'}
                {step === 3 && 'Account created successfully!'}
              </p>
            </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm animate-pulse">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-200 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    onFocus={() => setIsFocused({ ...isFocused, fullName: true })}
                    onBlur={() => setIsFocused({ ...isFocused, fullName: false })}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-700 border-2 rounded-xl transition-all duration-200 text-black placeholder-gray-500 ${
                      errors.fullName 
                        ? 'border-red-500 ring-4 ring-red-100' 
                        : isFocused.fullName 
                          ? 'border-primary-500 ring-4 ring-primary-100' 
                          : 'border-gray-600 hover:border-gray-500'
                    } focus:outline-none`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onFocus={() => setIsFocused({ ...isFocused, email: true })}
                    onBlur={() => setIsFocused({ ...isFocused, email: false })}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-700 border-2 rounded-xl transition-all duration-200 text-black placeholder-gray-500 ${
                      errors.email 
                        ? 'border-red-500 ring-4 ring-red-100' 
                        : isFocused.email 
                          ? 'border-primary-500 ring-4 ring-primary-100' 
                          : 'border-gray-600 hover:border-gray-500'
                    } focus:outline-none`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                Continue
              </button>
            </form>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg text-sm animate-pulse">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onFocus={() => setIsFocused({ ...isFocused, password: true })}
                    onBlur={() => setIsFocused({ ...isFocused, password: false })}
                    className={`w-full pl-10 pr-12 py-3 bg-gray-700 border-2 rounded-xl transition-all duration-200 text-black placeholder-gray-500 ${
                      errors.password 
                        ? 'border-red-500 ring-4 ring-red-100' 
                        : isFocused.password 
                          ? 'border-primary-500 ring-4 ring-primary-100' 
                          : 'border-gray-600 hover:border-gray-500'
                    } focus:outline-none`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-primary-500 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Password strength:</span>
                      <span className={`text-xs font-medium ${passwordStrength(formData.password).color}`}>
                        {passwordStrength(formData.password).strength}
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          formData.password.length < 6 ? 'w-1/3 bg-red-500' :
                          formData.password.length < 10 ? 'w-2/3 bg-yellow-500' : 'w-full bg-green-500'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-3 space-y-1">
                    {getPasswordRequirements(formData.password).map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {req.test ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <X className="w-3 h-3 text-gray-500" />
                        )}
                        <span className={req.test ? 'text-green-400' : 'text-gray-500'}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-200 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onFocus={() => setIsFocused({ ...isFocused, confirmPassword: true })}
                    onBlur={() => setIsFocused({ ...isFocused, confirmPassword: false })}
                    className={`w-full pl-10 pr-12 py-3 bg-gray-700 border-2 rounded-xl transition-all duration-200 text-black placeholder-gray-500 ${
                      errors.confirmPassword 
                        ? 'border-red-500 ring-4 ring-red-100' 
                        : isFocused.confirmPassword 
                          ? 'border-primary-500 ring-4 ring-primary-100' 
                          : 'border-gray-600 hover:border-gray-500'
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
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors duration-200 font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          )}
 

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Account Created Successfully!</h3>
              <p className="text-gray-300 mb-4">You can now login with your credentials.</p>
              <div className="animate-pulse">
                <p className="text-sm text-gray-400">Redirecting to login page...</p>
              </div>
            </div>
          )}

          {/* Login Link */}
          {step < 3 && (
            <p className="text-center text-sm text-gray-300 mt-6">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-semibold text-primary-400 hover:text-primary-300 hover:underline transition-all duration-200"
              >
                Login
              </Link>
            </p>
          )}
          </div>
        </div>
      </div>

      {/* Right Half - Animation Area */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center">
          {/* Container for Phase 3: Both elements move up and scale together */}
          <motion.div
            initial={{ y: 0, scale: 1 }}
            animate={{ y: -20, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
          >
            {/* Phase 1: "Welcome to" animates from left to center (0.3s) */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <h1 className="text-5xl font-bold text-gray-200">Welcome to</h1>
            </motion.div>

            {/* Phase 2: "Ladiva" reveals underneath after Phase 1 completes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            >
              <h2 className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mt-2">
                Ladiva
              </h2>
            </motion.div>
          </motion.div>

          {/* Phase 4: "Thanks for choosing us" fades in underneath as they move up */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
            className="mt-4"
          >
            <p className="text-xl text-gray-400">Thanks for choosing us</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
