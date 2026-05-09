import { defineCollection, z } from 'astro:content';

const serviciosCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    category: z.string(),
    badge: z.string().optional().nullable(),
    price: z.number().default(0),
    originalPrice: z.number().optional().nullable(),
    discount: z.string().optional().nullable(),
    rating: z.number().optional().nullable(),
    reviews: z.number().optional().nullable(),
    image: z.string().optional().nullable(),
    gallery: z.array(z.string()).optional().default([]),
    features: z.array(z.object({
      icon: z.string(),
      title: z.string(),
      description: z.string(),
    })).optional().default([]),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).optional().nullable(),
    order: z.number().default(99),
  }),
});

export const collections = {
  servicios: serviciosCollection,
};
