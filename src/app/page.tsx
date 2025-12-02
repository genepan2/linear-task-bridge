import { redirect } from 'next/navigation';

// Force dynamic rendering - Clerk provider required
export const dynamic = 'force-dynamic';

export default function Home() {
  redirect('/issues');
}
