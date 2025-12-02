import * as React from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { IssueForm } from "@/components/issues/IssueForm";

// Force dynamic rendering - this page requires auth
export const dynamic = 'force-dynamic';

/**
 * Issue Creation Page
 *
 * Protected route at /issues/new for creating new Linear issues
 *
 * Features:
 * - Authentication required (redirects to sign-in if not authenticated)
 * - Project access validation
 * - Back button to issue list
 * - Full issue creation form
 *
 * Auto-tags issues with:
 * - "client-submitted" label
 * - Client-specific label (from user metadata)
 */
export default async function NewIssuePage() {
  const user = await currentUser();
  const userId = user?.id;

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  // Get user's project access from Clerk metadata
  // This would normally fetch from API, but for now we'll use a placeholder
  // TODO: Replace with actual API call to /api/projects
  const projectId = process.env.NEXT_PUBLIC_DEFAULT_PROJECT_ID || "default-project";

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/issues">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to issues</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Issue</h1>
          <p className="text-muted-foreground">
            Submit a new issue or feature request
          </p>
        </div>
      </div>

      {/* Issue creation form */}
      <IssueForm projectId={projectId} />

      {/* Help text */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Tips for creating issues:
        </h3>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>• Be specific and descriptive in your title</li>
          <li>• Include steps to reproduce for bugs</li>
          <li>• Add screenshots or examples when helpful</li>
          <li>• Use markdown formatting in the description</li>
          <li>• Set appropriate priority based on urgency</li>
        </ul>
      </div>
    </div>
  );
}
