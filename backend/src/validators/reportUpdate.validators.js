const { z } = require("zod");

const updateReportSchema = z
  .object({
    title: z.string().min(1).optional(),
    categories: z.array(z.string().min(1)).min(1).optional(),
    otherCategoryText: z.string().max(100).optional(),
    severity: z.enum(["low", "medium", "high"]).optional(),

    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    address: z.string().max(200).optional(),

    finalDescription: z.string().max(2000).optional(),
  })
  .strict();

module.exports = { updateReportSchema };