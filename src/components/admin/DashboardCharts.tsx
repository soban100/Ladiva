import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

interface UserGrowthChartProps {
  data: Array<{
    date: string;
    users: number;
    newUsers: number;
  }>;
}

interface OrderStatusChartProps {
  data: {
    pending: number;
    confirmed: number;
    delivered: number;
    cancelled: number;
  };
}

const COLORS = {
  primary: '#F8C8DC',
  secondary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  purple: '#8B5CF6'
};

const STATUS_COLORS = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  delivered: '#10B981',
  cancelled: '#EF4444'
};

// Custom tooltip for revenue chart
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-green-600">
          Revenue: Rs.{payload[0].value?.toLocaleString('ur-PK') || '0'}
        </p>
        <p className="text-sm text-blue-600">
          Orders: {payload[1].value || 0}
        </p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for user growth chart
const UserGrowthTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-purple-600">
          Total Users: {payload[0].value || 0}
        </p>
        <p className="text-sm text-pink-600">
          New Users: {payload[1].value || 0}
        </p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for order status chart
const OrderStatusTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900 mb-2">Order Status</p>
        <p className="text-sm" style={{ color: STATUS_COLORS.pending }}>
          Pending: {data.pending}
        </p>
        <p className="text-sm" style={{ color: STATUS_COLORS.confirmed }}>
          Confirmed: {data.confirmed}
        </p>
        <p className="text-sm" style={{ color: STATUS_COLORS.delivered }}>
          Delivered: {data.delivered}
        </p>
        <p className="text-sm" style={{ color: STATUS_COLORS.cancelled }}>
          Cancelled: {data.cancelled}
        </p>
      </div>
    );
  }
  return null;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  // Format date for display
  const formattedData = data.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis 
            yAxisId="revenue"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="orders"
            orientation="right"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: 'Orders', angle: 90, position: 'insideRight' }}
          />
          <Tooltip content={<RevenueTooltip />} />
          <Line
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke={COLORS.success}
            strokeWidth={2}
            dot={{ fill: COLORS.success, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="orders"
            type="monotone"
            dataKey="orders"
            stroke={COLORS.secondary}
            strokeWidth={2}
            dot={{ fill: COLORS.secondary, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data }) => {
  // Format date for display
  const formattedData = data.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis 
            yAxisId="total"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: 'Total Users', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="new"
            orientation="right"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: 'New Users', angle: 90, position: 'insideRight' }}
          />
          <Tooltip content={<UserGrowthTooltip />} />
          <Line
            yAxisId="total"
            type="monotone"
            dataKey="users"
            stroke={COLORS.purple}
            strokeWidth={2}
            dot={{ fill: COLORS.purple, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="new"
            type="monotone"
            dataKey="newUsers"
            stroke={COLORS.primary}
            strokeWidth={2}
            dot={{ fill: COLORS.primary, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Pending', value: data.pending, color: STATUS_COLORS.pending },
    { name: 'Confirmed', value: data.confirmed, color: STATUS_COLORS.confirmed },
    { name: 'Delivered', value: data.delivered, color: STATUS_COLORS.delivered },
    { name: 'Cancelled', value: data.cancelled, color: STATUS_COLORS.cancelled }
  ].filter(item => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    if (percent < 0.05) return null; // Don't show label for very small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<OrderStatusTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600">
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple bar chart for top products
interface TopProductsChartProps {
  data: Array<{
    name: string;
    revenue: number;
    sales: number;
  }>;
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({ data }) => {
  // Limit to top 5 products and format names
  const chartData = data.slice(0, 5).map(item => ({
    ...item,
    displayName: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: 'Revenue (Rs.)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            type="category"
            dataKey="displayName"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            width={80}
          />
          <Tooltip 
            formatter={(value: number) => [`Rs.${value.toLocaleString('ur-PK')}`, 'Revenue']}
            labelFormatter={(label) => `Product: ${label}`}
          />
          <Bar 
            dataKey="revenue" 
            fill={COLORS.primary}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
