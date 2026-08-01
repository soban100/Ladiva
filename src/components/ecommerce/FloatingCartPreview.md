# FloatingCartPreview Component

A floating cart preview component that displays cart contents on hover over the cart icon.

## Features

- **Hover Activation**: Shows cart preview when hovering over the cart icon
- **Cart Items Display**: Shows product image, name, size, color, quantity, and price
- **Quantity Controls**: Increment/decrement item quantities directly in the preview
- **Remove Items**: Quick removal of items from cart
- **Subtotal Calculation**: Real-time subtotal calculation
- **Empty State**: Friendly message when cart is empty
- **Smooth Animations**: Slide-up animation with proper timing
- **Responsive Design**: Works on all screen sizes
- **Design System Integration**: Uses LADIVA design system colors and styles

## Usage

```tsx
import { FloatingCartPreview } from './components/ecommerce/FloatingCartPreview';

// Wrap your cart icon with the FloatingCartPreview component
<FloatingCartPreview>
  <YourCartIconComponent />
</FloatingCartPreview>
```

## Props

- `children: React.ReactNode` - The cart icon or trigger element

## Integration Notes

- Automatically connects to the Redux cart store
- Filters cart items based on user authentication status
- Uses the same guest ID logic as other cart components
- Follows the existing cart state management patterns

## Dependencies

- React hooks (useState, useRef, useEffect)
- Redux store for cart state
- LADIVA design system
- Lucide React icons

## Styling

- Uses Tailwind CSS classes
- Integrates with the LADIVA design system
- Smooth transitions and micro-interactions
- Responsive and accessible design
