import { z } from 'zod';

// Existing schemas
export const issueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  priority: z.number().min(0).max(4).optional(),
  stateId: z.string().optional(),
  assigneeId: z.string().optional(),
});

export const commentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty'),
});

export type IssueInput = z.infer<typeof issueSchema>;
export type CommentInput = z.infer<typeof commentSchema>;

// Issue Creation Schema (for new issue form)
const createIssueSchemaRaw = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .trim(),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters")
    .trim(),

  priority: z
    .number()
    .int()
    .min(0)
    .max(4)
    .nullable()
    .default(null),

  type: z
    .enum(["bug", "feature", "task"])
    .nullable()
    .default(null),

  projectId: z.string().min(1, "Project ID is required"),
});

export const createIssueSchema = createIssueSchemaRaw;
export type CreateIssueInput = z.infer<typeof createIssueSchemaRaw>;

// Priority levels mapping
export const PRIORITY_OPTIONS = [
  { value: null, label: "None", description: "No priority set" },
  { value: 0, label: "No Priority", description: "Not prioritized" },
  { value: 1, label: "Urgent", description: "Critical and time-sensitive" },
  { value: 2, label: "High", description: "Important, should be addressed soon" },
  { value: 3, label: "Medium", description: "Normal priority" },
  { value: 4, label: "Low", description: "Can be addressed when time permits" },
] as const;

// Issue type labels mapping
export const TYPE_OPTIONS = [
  { value: null, label: "None", description: "No type specified" },
  { value: "bug", label: "Bug", description: "Something isn't working correctly" },
  { value: "feature", label: "Feature Request", description: "New feature or enhancement" },
  { value: "task", label: "Task", description: "General task or work item" },
] as const;

// Validation helper functions
export const validationHelpers = {
  validateIssueInput: (data: unknown) => {
    return createIssueSchema.safeParse(data);
  },

  getPriorityLabel: (priority: number | null): string => {
    const option = PRIORITY_OPTIONS.find(opt => opt.value === priority);
    return option?.label || "None";
  },

  getTypeLabel: (type: string | null): string => {
    const option = TYPE_OPTIONS.find(opt => opt.value === type);
    return option?.label || "None";
  },

  formatValidationErrors: (errors: z.ZodError): Record<string, string> => {
    const formatted: Record<string, string> = {};
    errors.errors.forEach((error) => {
      const path = error.path.join(".");
      formatted[path] = error.message;
    });
    return formatted;
  },
};
