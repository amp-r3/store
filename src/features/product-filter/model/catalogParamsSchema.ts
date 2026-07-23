import z from "zod";

export const catalogParamsSchema = z.object({
    page: z.preprocess(
        (val) => {
            if (val === null || val === undefined || val === '') return undefined;
            const parsed = Number(val);
            return Number.isNaN(parsed) ? undefined : parsed;
        },
        z.number().int().positive()
    ).catch(1),
    sortBy: z.enum(['price', 'title', 'stock']).nullable().catch(null),
    order: z.enum(['asc', 'desc']).nullable().catch(null),
    category: z.string().catch('all'),
    deals: z.preprocess((val) => val === 'true', z.boolean()).catch(false)
});