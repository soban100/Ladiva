#!/bin/bash

# React Query Installation Script for LADIVA E-commerce
# This script installs React Query and updates the necessary files

echo "🚀 Installing React Query for instant UI updates..."

# Install React Query
echo "📦 Installing @tanstack/react-query..."
npm install @tanstack/react-query

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ React Query installed successfully!"
    
    echo "🔧 Updating useOrders.ts to use React Query..."
    
    # Update the hooks file to use React Query
    sed -i.bak 's|// import { useQuery, useMutation, useQueryClient } from '\''@tanstack/react-query'\'';|import { useQuery, useMutation, useQueryClient } from '\''@tanstack/react-query'\'';|' src/hooks/useOrders.ts
    
    # Remove mock implementations
    sed -i '/\/\/ Mock types for TypeScript until React Query is installed/,/const useQueryClient = () => {/c\
// React Query is now installed - using real hooks' src/hooks/useOrders.ts
    
    sed -i '/throw new Error.*React Query not installed/,/};/d' src/hooks/useOrders.ts
    
    echo "🔧 Updating AdminOrdersWithQuery.tsx to use React Query..."
    
    # Update the component file to use React Query
    sed -i 's|// import { useOrders, useOrderStats, useUpdateOrderStatus } from '\''../../hooks/useOrders'\'';|import { useOrders, useOrderStats, useUpdateOrderStatus } from '\''../../hooks/useOrders'\'';|' src/pages/admin/AdminOrdersWithQuery.tsx
    
    # Remove mock implementations
    sed -i '/\/\/ Mock hooks until React Query is installed/,/const useUpdateOrderStatus = () => {/c\
// React Query is now installed - using real hooks' src/pages/admin/AdminOrdersWithQuery.tsx
    
    sed -i '/throw new Error.*React Query not installed/,/};/d' src/pages/admin/AdminOrdersWithQuery.tsx
    
    echo "📝 Adding React Query Provider to main.tsx..."
    
    # Backup main.tsx
    cp src/main.tsx src/main.tsx.bak
    
    # Add React Query provider (this is a simplified version - you may need to adjust)
    if ! grep -q "QueryClientProvider" src/main.tsx; then
        cat > src/main-react-query.tsx << 'EOF'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)
EOF
        echo "📄 Created src/main-react-query.tsx - replace src/main.tsx with this file"
    fi
    
    echo ""
    echo "🎉 React Query installation complete!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Replace src/main.tsx with src/main-react-query.tsx (or manually add QueryClientProvider)"
    echo "2. Replace AdminOrders with AdminOrdersWithQuery in your router"
    echo "3. Start your dev server: npm run dev"
    echo "4. Test instant UI updates!"
    echo ""
    echo "📚 For detailed setup instructions, see: REACT_QUERY_SETUP.md"
    
else
    echo "❌ Failed to install React Query. Please check your npm configuration."
    exit 1
fi
