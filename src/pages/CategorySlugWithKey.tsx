import { useParams } from 'react-router-dom';
import CategoryPage from './CategorySlug';

const CategorySlugWithKey = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Use the slug as a key to ensure React re-renders when navigating between categories
  return <CategoryPage key={slug} />;
};

export default CategorySlugWithKey;
