"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useCreateIssue } from "@/hooks/use-create-issue";
import {
  createIssueSchema,
  PRIORITY_OPTIONS,
  TYPE_OPTIONS,
  type CreateIssueInput,
} from "@/lib/validations";

interface IssueFormProps {
  projectId: string;
  onCancel?: () => void;
}

/**
 * Issue Creation Form Component
 *
 * Full form for creating new Linear issues with:
 * - Title (required, min 3 chars)
 * - Description (required, min 10 chars, markdown supported)
 * - Priority (optional select)
 * - Type (optional select for predefined labels)
 * - Automatic "client-submitted" label tagging
 *
 * Features:
 * - Client-side validation with Zod
 * - Loading states during submission
 * - Error handling with inline messages
 * - Form data persistence on error
 * - Cancel navigation
 */
export function IssueForm({ projectId, onCancel }: IssueFormProps) {
  const router = useRouter();
  const createIssue = useCreateIssue();

  const form = useForm({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: null,
      type: null,
      projectId,
    } as CreateIssueInput,
  });

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const onSubmit = (data: CreateIssueInput) => {
    createIssue.mutate(data);
  };

  const isSubmitting = createIssue.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Issue</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of the issue"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A clear, concise title (minimum 3 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed information about the issue..."
                      className="min-h-[150px] resize-y"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed description with steps to reproduce, expected behavior, etc. Markdown is supported (minimum 10 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type Selection */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={(value) => {
                      field.onChange(value === "none" ? null : value);
                    }}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select issue type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TYPE_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value || "none"}
                          value={option.value || "none"}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Categorize your issue (Bug, Feature Request, or Task)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority Selection */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={(value) => {
                      field.onChange(value === "none" ? null : parseInt(value));
                    }}
                    value={field.value?.toString() || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value?.toString() || "none"}
                          value={option.value?.toString() || "none"}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How urgent is this issue?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden project ID field */}
            <input type="hidden" {...form.register("projectId")} />

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Issue"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
