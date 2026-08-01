# NewsletterSection Component

A conversion-focused newsletter subscription component with multiple variants, validation, and toast notifications.

## Features

- **Multiple Variants**: Default, compact, and featured layouts for different use cases
- **Email Validation**: Real-time email format validation with error messages
- **Toast Notifications**: Success and error notifications using the existing notification system
- **Loading States**: Proper loading indicators during form submission
- **Conversion Focused**: Designed to maximize newsletter sign-ups with compelling copy and design
- **Responsive Design**: Works perfectly on all screen sizes
- **Accessibility**: Proper form semantics and ARIA support

## Variants

### Default Variant
- Full-width layout with large email input and prominent subscribe button
- Trust indicators (no spam, unsubscribe anytime, exclusive offers)
- Best for homepage main sections

### Compact Variant
- Smaller, space-efficient design
- Horizontal layout on larger screens
- Ideal for footers or sidebars

### Featured Variant
- Premium design with gradient background and decorative elements
- Gift icon and limited-time offer messaging
- Perfect for special placement sections

## Usage

```tsx
import { NewsletterSection } from './components/ecommerce/NewsletterSection';

// Default variant
<NewsletterSection />

// Custom content
<NewsletterSection 
  heading="Get Exclusive Offers"
  description="Subscribe for 10% off your first order and special promotions."
/>

// Compact variant for footer
<NewsletterSection 
  variant="compact"
  heading="Stay Updated"
  description="Get the latest news and offers."
/>

// Featured variant
<NewsletterSection 
  variant="featured"
  heading="Join LADIVA Family"
  description="Subscribe to our newsletter and get exclusive access to new collections."
/>
```

## Props

- `className?: string` - Additional CSS classes
- `variant?: 'default' | 'compact' | 'featured'` - Layout variant (default: 'default')
- `heading?: string` - Section heading (default: 'Stay in the Loop')
- `description?: string` - Section description (default: 'Get exclusive offers, new product alerts, and 10% off your first order.')

## Validation

- **Required Field**: Email is required
- **Format Validation**: Validates email format using regex pattern
- **Real-time Feedback**: Errors clear when user starts typing
- **Error Messages**: Clear, user-friendly error messages

## Integration

- **Notification System**: Integrates with existing `useNotifications` hook
- **Design System**: Uses LADIVA design system colors, buttons, and styling
- **Form Handling**: Simulated API call with 1.5 second delay
- **Success Message**: Shows welcome message with discount code information
- **Error Handling**: Graceful error handling with user feedback

## Styling Features

- **Gradient Backgrounds**: Beautiful gradient backgrounds for featured variant
- **Hover Effects**: Smooth hover animations on buttons and inputs
- **Loading States**: Spinning loader during form submission
- **Micro-interactions**: Scale and shadow effects on interactive elements
- **Trust Indicators**: Visual cues for trust (no spam, secure, etc.)

## Best Practices

1. **Placement**: Place in high-visibility areas like homepage or before checkout
2. **Copy**: Use compelling, benefit-oriented copy
3. **Incentives**: Offer clear value proposition (discount, exclusive content)
4. **Trust**: Include privacy and unsubscribe information
5. **Testing**: A/B test different variants and copy for optimal conversion

## Technical Details

- **TypeScript**: Fully typed with proper interfaces
- **React Hooks**: Uses useState for form state management
- **Form Handling**: Proper form submission with preventDefault
- **Async Operations**: Simulated async API call with try/catch
- **Cleanup**: Proper timeout cleanup in notification system
