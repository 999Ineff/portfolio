import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    excerpt: z.string(),
    category: z.string(),
    categoryColor: z.enum(['gold', 'cyan', 'green']),
    tags: z.array(z.string()).optional(),
    linkedIn: z.boolean().optional(),
    linkedInUrl: z.string().optional(),
  }),
});

export const collections = { blog };
