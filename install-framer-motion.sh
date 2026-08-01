#!/bin/bash

# Framer Motion Installation Script for Animated Orders Dashboard
# This script installs framer-motion and sets up the animated orders component

echo "🎬 Installing Framer Motion for animated orders dashboard..."

# Install framer-motion
echo "📦 Installing framer-motion..."
npm install framer-motion

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Framer Motion installed successfully!"
    
    echo ""
    echo "🎯 Next steps:"
    echo "1. Replace your AdminOrders component with AdminOrdersAnimated"
    echo "2. Start your dev server: npm run dev"
    echo "3. Test the animated order status updates!"
    echo ""
    echo "📚 For detailed setup instructions, see: ANIMATED_ORDERS_SETUP.md"
    echo ""
    echo "🎉 Features you now have:"
    echo "  • Smooth card slide animations between sections"
    echo "  • Loading spinners on buttons during requests"
    echo "  • Error handling with automatic rollback"
    echo "  • Optimistic updates for instant feedback"
    echo "  • Professional spring animations"
    
else
    echo "❌ Failed to install framer-motion. Please check your npm configuration."
    echo "💡 Try installing manually: npm install framer-motion"
    exit 1
fi
