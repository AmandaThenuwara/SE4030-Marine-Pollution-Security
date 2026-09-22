const { z } = require("zod");

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(6).optional(),
  role: z.enum(["general", "volunteer"]).optional(),
  bio: z.string().max(500).optional(),
});

module.exports = { updateProfileSchema };