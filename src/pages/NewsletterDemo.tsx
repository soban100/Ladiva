import { NewsletterSection } from '../components/ecommerce/NewsletterSection';
import { Section } from '../components/layout';

export const NewsletterDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Newsletter Section Demo</h1>
          <p className="text-gray-600 mt-2">Showcase of different newsletter section variants</p>
        </div>
      </div>

      {/* Default Variant */}
      <Section className="py-16 bg-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Default Variant</h2>
          <p className="text-gray-600">Full-width layout with trust indicators</p>
        </div>
        <NewsletterSection />
      </Section>

      {/* Compact Variant */}
      <Section className="py-16 bg-gray-50">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Compact Variant</h2>
          <p className="text-gray-600">Space-efficient design for footers or sidebars</p>
        </div>
        <NewsletterSection 
          variant="compact"
          heading="Get Exclusive Offers"
          description="Subscribe for 10% off your first order"
        />
      </Section>

      {/* Featured Variant */}
      <Section className="py-16 bg-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Variant</h2>
          <p className="text-gray-600">Premium design with gradient background</p>
        </div>
        <NewsletterSection 
          variant="featured"
          heading="Join LADIVA Family"
          description="Subscribe to our newsletter and get exclusive access to new collections, special offers, and 10% off your first order."
        />
      </Section>

      {/* Custom Styling Example */}
      <Section className="py-16 bg-gradient-to-br from-primary-100 to-secondary-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Custom Styling</h2>
          <p className="text-gray-600">With custom className and content</p>
        </div>
        <NewsletterSection 
          className="max-w-2xl mx-auto"
          heading="Special Offer Inside"
          description="Be the first to know about flash sales and limited edition drops."
        />
      </Section>
    </div>
  );
};
