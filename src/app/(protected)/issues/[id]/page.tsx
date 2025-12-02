import type { Metadata } from 'next';
import { IssueDetailClient } from '@/components/issues/IssueDetailClient';

// Force dynamic rendering - this page requires auth
export const dynamic = 'force-dynamic';

interface IssuePageProps {
  params: {
    id: string;
  };
}

/**
 * Issue Detail Page - Server Component
 *
 * Dynamic route: /issues/[id]
 * Protected route - requires authentication
 *
 * This server component:
 * 1. Receives the issueId from the URL params
 * 2. Passes it to the client component for data fetching
 * 3. Provides metadata for SEO
 */
export async function generateMetadata({
  params,
}: IssuePageProps): Promise<Metadata> {
  // In production, you might fetch the issue title here for better SEO
  // For now, we'll use a generic title
  return {
    title: `Issue ${params.id} | Task Bridge`,
    description: 'View issue details, comments, and updates',
  };
}

export default function IssuePage({ params }: IssuePageProps) {
  return <IssueDetailClient issueId={params.id} />;
}
