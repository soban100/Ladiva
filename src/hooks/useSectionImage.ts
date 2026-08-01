import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface UseSectionImageOptions {
  type: 'category' | 'product';
  id?: string;
  slug?: string;
}

export const useSectionImage = ({ type, id, slug }: UseSectionImageOptions) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (!id && !slug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let url = '';

        if (type === 'category') {
          // Fetch category image
          const { data, error } = await supabase
            .from('categories')
            .select('image_url')
            .eq(id ? 'id' : 'slug', id || slug)
            .single();

          if (error) throw error;
          url = data?.image_url || '';
        } else if (type === 'product') {
          // Fetch product image
          const { data, error } = await supabase
            .from('products')
            .select('images')
            .eq(id ? 'id' : 'slug', id || slug)
            .single();

          if (error) throw error;
          url = data?.images?.[0] || '';
        }

        setImageUrl(url);
      } catch (err: any) {
        console.error('❌ [SECTION_IMAGE] Error fetching image:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [type, id, slug]);

  return { imageUrl, loading, error };
};
