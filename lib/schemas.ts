import { z } from "zod";
import { CATEGORIES, COUNTRY_CODES } from "@/lib/types";

export const CountryCodeSchema = z.enum(COUNTRY_CODES);
export const CategorySchema = z.enum(CATEGORIES);

export const ArticleSchema = z.object({
  id: z.string().min(4),
  title: z.string().min(2),
  link: z.string().url(),
  source: z.string().min(1),
  publishedAt: z.string().datetime(),
  author: z.string().optional(),
  excerpt: z.string().optional(),
  imageUrl: z.string().url().optional(),
  category: CategorySchema.optional(),
  country: CountryCodeSchema.optional(),
  readTimeMin: z.number().int().positive().optional(),
});

export const NewsResponseSchema = z.object({
  country: CountryCodeSchema,
  category: CategorySchema,
  items: z.array(ArticleSchema),
});

export const ArticleResponseSchema = z.object({
  item: ArticleSchema,
});

export const SearchResponseSchema = z.object({
  country: CountryCodeSchema,
  query: z.string(),
  items: z.array(ArticleSchema),
});
