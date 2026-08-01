# EmptyState Component

A comprehensive, reusable empty state component that handles multiple use cases with illustrations, messaging, and action buttons. Built following the LADIVA design system.

## Features

- **Multiple Types**: Predefined types for common empty states (cart, search, orders, etc.)
- **Customizable**: Support for custom titles, descriptions, and illustrations
- **Responsive Design**: Adapts to different screen sizes
- **Size Variants**: Small, medium, large, and extra-large sizes
- **Action Buttons**: Primary and secondary action buttons with customizable variants
- **Illustrations**: Built-in illustrations with decorative elements
- **Design System**: Follows LADIVA colors, typography, and spacing
- **Flexible**: Can be used with or without card wrapper

## Types

### Predefined Types
- `empty-cart`: When user's cart is empty
- `no-search-results`: When search returns no results
- `no-orders`: When user has no order history
- `no-favorites`: When user has no favorited items
- `no-products`: When category has no products
- `no-reviews`: When product has no reviews
- `error`: General error state
- `network-error`: Network connection issues
- `custom`: Custom empty state with custom content

## Props

### Required Props
- `type: EmptyStateType` - The type of empty state to display

### Optional Props
- `title?: string` - Custom title (overrides default)
- `description?: string` - Custom description (overrides default)
- `illustration?: React.ReactNode` - Custom illustration component
- `action?: ActionProps` - Primary action button configuration
- `secondaryAction?: SecondaryActionProps` - Secondary action button configuration
- `className?: string` - Additional CSS classes
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Size variant (default: 'lg')
- `showIllustration?: boolean` - Whether to show illustration (default: true)

### Action Props
```tsx
action?: {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
}
```

### Secondary Action Props
```tsx
secondaryAction?: {
  text: string;
  onClick: () => void;
}
```

## Usage Examples

### Basic Usage
```tsx
import { EmptyState } from './components/ui/EmptyState';

// Empty cart
<EmptyState 
  type="empty-cart"
  action={{
    text: 'Start Shopping',
    onClick: () => navigate('/products'),
    variant: 'primary'
  }}
/>

// No search results
<EmptyState 
  type="no-search-results"
  action={{
    text: 'Clear Filters',
    onClick: () => clearFilters(),
    variant: 'secondary'
  }}
/>
```

### Custom Content
```tsx
<EmptyState 
  type="custom"
  title="No Data Available"
  description="We couldn't load the data. Please try again later."
  action={{
    text: 'Retry',
    onClick: () => refetch(),
    variant: 'primary'
  }}
/>
```

### With Custom Illustration
```tsx
<EmptyState 
  type="custom"
  title="Custom State"
  description="This uses a custom illustration."
  illustration={
    <div className="w-24 h-24">
      <img src="/custom-illustration.svg" alt="Custom" />
    </div>
  }
  action={{
    text: 'Continue',
    onClick: () => handleContinue(),
    variant: 'primary'
  }}
/>
```

### Different Sizes
```tsx
// Small
<EmptyState type="empty-cart" size="sm" action={actionProps} />

// Medium
<EmptyState type="empty-cart" size="md" action={actionProps} />

// Large (default)
<EmptyState type="empty-cart" size="lg" action={actionProps} />

// Extra Large
<EmptyState type="empty-cart" size="xl" action={actionProps} />
```

### Without Card Wrapper
```tsx
<EmptyState 
  type="empty-cart"
  className="no-card"
  action={actionProps}
/>
```

### With Secondary Action
```tsx
<EmptyState 
  type="no-orders"
  action={{
    text: 'Browse Products',
    onClick: () => navigate('/products'),
    variant: 'primary'
  }}
  secondaryAction={{
    text: 'View Help',
    onClick: () => navigate('/help')
  }}
/>
```

## Default Content by Type

### empty-cart
- **Title**: "Your Cart is Empty"
- **Description**: "Looks like you haven't added anything to your cart yet. Start shopping to fill it up!"
- **Action**: "Start Shopping"
- **Badges**: "Free Shipping on Orders Rs.5000+", "New Arrivals Daily"

### no-search-results
- **Title**: "No Results Found"
- **Description**: "We couldn't find any products matching your search. Try adjusting your filters or search terms."
- **Action**: "Clear Filters"

### no-orders
- **Title**: "No Orders Yet"
- **Description**: "You haven't placed any orders yet. Start shopping to see your order history here."
- **Action**: "Browse Products"
- **Badges**: "Track Your Orders", "Easy Returns"

### no-favorites
- **Title**: "No Favorites Yet"
- **Description**: "Start adding products to your favorites to see them here."
- **Action**: "Explore Products"

### no-products
- **Title**: "No Products Available"
- **Description**: "There are no products in this category at the moment. Check back later!"
- **Action**: "Browse Other Categories"

### no-reviews
- **Title**: "No Reviews Yet"
- **Description**: "Be the first to share your thoughts about this product."
- **Action**: "Write a Review"

### error
- **Title**: "Something Went Wrong"
- **Description**: "An error occurred while loading this content. Please try again."
- **Action**: "Try Again"

### network-error
- **Title**: "Connection Error"
- **Description**: "Unable to connect. Please check your internet connection and try again."
- **Action**: "Retry"

## Size Specifications

| Size | Illustration | Title | Description | Spacing |
|-------|-------------|--------|-------------|----------|
| sm    | w-16 h-16   | text-lg | text-sm     | space-y-4 |
| md    | w-20 h-20   | text-xl | text-base   | space-y-6 |
| lg    | w-24 h-24   | text-2xl| text-lg     | space-y-8 |
| xl    | w-32 h-32   | text-3xl| text-xl     | space-y-10 |

## Design System Integration

- **Colors**: Uses LADIVA primary, secondary, and semantic colors
- **Typography**: Follows Inter font family with consistent scale
- **Spacing**: Uses design system spacing scale
- **Components**: Integrates with Button, Card, and Badge components
- **Shadows**: Consistent with design system shadow definitions
- **Border Radius**: Follows design system border radius scale

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Focus management for interactive elements
- Screen reader friendly content
- High contrast ratios for text
- Keyboard navigation support

## Best Practices

1. **Use Appropriate Types**: Choose the most suitable predefined type for your use case
2. **Provide Clear Actions**: Action buttons should clearly indicate next steps
3. **Keep Messages Concise**: Use clear, concise language
4. **Maintain Consistency**: Use consistent sizing and styling across your app
5. **Add Context**: Include helpful badges or additional information when relevant
6. **Test Responsiveness**: Ensure empty states work well on all screen sizes

## File Structure

```
src/components/ui/EmptyState.tsx
src/components/ui/index.ts (export added)
```

## Dependencies

- React hooks (useState)
- Lucide React icons
- LADIVA UI components (Button, Card, Badge)
- Tailwind CSS classes
