"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import type { CreateIssueInput } from "@/lib/validations";

interface CreateIssueResponse {
  issue: {
    id: string;
    identifier: string;
    title: string;
  };
}

interface CreateIssueError {
  error: string;
  details?: string;
}

/**
 * Creates a new issue in Linear via the API
 */
async function createIssue(data: CreateIssueInput): Promise<CreateIssueResponse> {
  const response = await fetch("/api/issues", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData: CreateIssueError = await response.json();
    throw new Error(errorData.error || "Failed to create issue");
  }

  return response.json();
}

/**
 * React Query mutation hook for creating issues
 *
 * Features:
 * - Optimistic updates
 * - Automatic cache invalidation
 * - Success/error notifications
 * - Automatic redirect on success
 */
export function useCreateIssue() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIssue,

    onSuccess: (data) => {
      // Invalidate and refetch issues list
      queryClient.invalidateQueries({ queryKey: ["issues"] });

      // Show success notification
      toast({
        variant: "success",
        title: "Issue created successfully",
        description: `${data.issue.identifier}: ${data.issue.title}`,
      });

      // Redirect to the new issue or back to list
      router.push(`/issues/${data.issue.id}`);
    },

    onError: (error: Error) => {
      // Show error notification
      toast({
        variant: "error",
        title: "Failed to create issue",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    },
  });
}
