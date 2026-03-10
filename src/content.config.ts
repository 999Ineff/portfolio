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

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    tier: z.enum(['micro', 'growth', 'professional', 'enterprise']),
    industry: z.string(),
    serviceType: z.enum(['automation', 'website', 'platform', 'consulting']),
    challenge: z.string(),
    result: z.string(),           // One-line result for cards
    metrics: z.array(z.object({
      label: z.string(),
      value: z.string(),
      prefix: z.string().optional(),
    })),
    testimonial: z.object({
      quote: z.string(),
      author: z.string(),
      role: z.string(),
    }).optional(),
    thumbnail: z.string().optional(),
    tags: z.array(z.string()).optional(),
    date: z.string(),
    featured: z.boolean().optional(),
    placeholder: z.boolean().optional(), // marks [PLACEHOLDER] metrics
  }),
});

export const collections = { blog, projects };
