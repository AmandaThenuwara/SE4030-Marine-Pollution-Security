const { z } = require("zod");

const createReportSchema = z.object({
  title: z.string().min(1, "Title is required"),
  categories: z.array(z.string().min(1)).min(1, "Select at least one category"),
  otherCategoryText: z.string().max(100).optional(),
  severity: z.enum(["low", "medium", "high"]),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  address: z.string().max(200).optional(),
});

module.exports = { createReportSchema };