import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-[#1A1C1E] border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-slate-400 text-xs font-mono mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="font-mono text-white font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// Sparkline Summary Component
interface SparklineSummaryProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const SparklineSummary: React.FC<SparklineSummaryProps> = ({ 
  title, 
  value, 
  change, 
  icon,
  color 
}) => {
  const isPositive = change >= 0;
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          {icon}
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold font-mono text-white">{value}</p>
        </div>
      </div>
      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
        isPositive ? 'bg-emerald-500/10' : 'bg-rose-500/10'
      }`}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        ) : (
          <TrendingDown className="w-4 h-4 text-rose-400" />
        )}
        <span 
          className={`text-sm font-semibold font-mono ${
            isPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isPositive ? '+' : ''}{change}%
        </span>
      </div>
    </div>
  );
};

// Main Analytics Dashboard Component
const AnalyticsDashboard: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Sample Data - Revenue & Orders
  const revenueOrdersData = useMemo(() => [
    { month: 'Jan', revenue: 45000, orders: 120 },
    { month: 'Feb', revenue: 52000, orders: 145 },
    { month: 'Mar', revenue: 48000, orders: 132 },
    { month: 'Apr', revenue: 61000, orders: 168 },
    { month: 'May', revenue: 58000, orders: 156 },
    { month: 'Jun', revenue: 72000, orders: 192 },
    { month: 'Jul', revenue: 68000, orders: 178 },
    { month: 'Aug', revenue: 79000, orders: 215 },
    { month: 'Sep', revenue: 85000, orders: 232 },
    { month: 'Oct', revenue: 82000, orders: 225 },
    { month: 'Nov', revenue: 94000, orders: 268 },
    { month: 'Dec', revenue: 102000, orders: 295 },
  ], []);

  // Sample Data - User Growth
  const userGrowthData = useMemo(() => [
    { month: 'Jan', users: 1200 },
    { month: 'Feb', users: 1450 },
    { month: 'Mar', users: 1680 },
    { month: 'Apr', users: 1920 },
    { month: 'May', users: 2150 },
    { month: 'Jun', users: 2480 },
    { month: 'Jul', users: 2750 },
    { month: 'Aug', users: 3120 },
    { month: 'Sep', users: 3480 },
    { month: 'Oct', users: 3850 },
    { month: 'Nov', users: 4280 },
    { month: 'Dec', users: 4750 },
  ], []);

  // Calculate totals and changes
  const totalRevenue = revenueOrdersData.reduce((sum, item) => sum + item.revenue, 0);
  const totalUsers = userGrowthData[userGrowthData.length - 1].users;
  
  const revenueChange = ((revenueOrdersData[revenueOrdersData.length - 1].revenue - revenueOrdersData[0].revenue) / revenueOrdersData[0].revenue * 100).toFixed(1);
  const usersChange = ((userGrowthData[userGrowthData.length - 1].users - userGrowthData[0].users) / userGrowthData[0].users * 100).toFixed(1);

  const handleMouseMove = (activeIndex: number | string | null) => {
    setActiveIndex(typeof activeIndex === 'number' ? activeIndex : null);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  return (
    <motion.div
      className="w-full p-6 bg-[#1A1C1E]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics Overview</h1>
        <p className="text-slate-400">Real-time business performance metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Orders Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#1A1C1E] border border-slate-800 rounded-2xl p-6 shadow-xl"
        >
          <SparklineSummary
            title="Total Revenue"
            value={`$${(totalRevenue / 1000).toFixed(0)}K`}
            change={parseFloat(revenueChange)}
            icon={<DollarSign className="w-5 h-5 text-blue-500" />}
            color="#3B82F6"
          />
          
          <div className="relative h-80">
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={revenueOrdersData}
                  onMouseMove={(state) => handleMouseMove(state?.activeTooltipIndex ?? null)}
                  onMouseLeave={handleMouseLeave}
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.05}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748B"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748B"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${(value / 1000)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {activeIndex !== null && (
                    <ReferenceLine x={revenueOrdersData[activeIndex]?.month} stroke="#64748B" strokeDasharray="2 2" />
                  )}
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fill="url(#revenueGradient)"
                    fillOpacity={1}
                    animationDuration={400}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#94A3B8"
                    strokeWidth={2}
                    dot={false}
                    opacity={0.6}
                    animationDuration={400}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
              <span className="text-sm text-slate-400">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#94A3B8]" />
              <span className="text-sm text-slate-400">Orders</span>
            </div>
          </div>
        </motion.div>

        {/* User Growth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1A1C1E] border border-slate-800 rounded-2xl p-6 shadow-xl"
        >
          <SparklineSummary
            title="Total Users"
            value={totalUsers.toLocaleString()}
            change={parseFloat(usersChange)}
            icon={<Users className="w-5 h-5 text-emerald-500" />}
            color="#10B981"
          />
          
          <div className="relative h-80">
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={userGrowthData}
                  onMouseMove={(state) => handleMouseMove(state?.activeTooltipIndex ?? null)}
                  onMouseLeave={handleMouseLeave}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748B"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748B"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {activeIndex !== null && (
                    <ReferenceLine x={userGrowthData[activeIndex]?.month} stroke="#64748B" strokeDasharray="2 2" />
                  )}
                  <Line
                    type="stepAfter"
                    dataKey="users"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 3 }}
                    animationDuration={400}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10B981]" />
              <span className="text-sm text-slate-400">Active Users</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
