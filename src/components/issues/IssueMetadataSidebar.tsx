'use client';

import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Calendar,
  Clock
} from 'lucide-react';
import type { LinearIssue } from '@/types';

interface IssueMetadataSidebarProps {
  issue: LinearIssue;
}

/**
 * Priority icon mapping based on Linear's priority levels (0-4)
 */
const PriorityIcon = ({ priority }: { priority: number }) => {
  const icons = {
    0: <SignalLow className="h-4 w-4 text-muted-foreground" />,
    1: <SignalLow className="h-4 w-4 text-blue-500" />,
    2: <SignalMedium className="h-4 w-4 text-yellow-500" />,
    3: <SignalHigh className="h-4 w-4 text-orange-500" />,
    4: <AlertCircle className="h-4 w-4 text-red-500" />,
  };

  return icons[priority as keyof typeof icons] || icons[0];
};

const priorityLabels = {
  0: 'No priority',
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Urgent',
};

/**
 * Get status badge color based on workflow state type
 */
function getStatusColor(stateType: string): string {
  switch (stateType) {
    case 'backlog':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'unstarted':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'started':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'canceled':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * IssueMetadataSidebar displays issue metadata in a sidebar format
 * Shows status, priority, labels, assignee, and dates
 */
export function IssueMetadataSidebar({ issue }: IssueMetadataSidebarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase">
            Status
          </div>
          <Badge
            variant="outline"
            className={getStatusColor(issue.state.type)}
          >
            {issue.state.name}
          </Badge>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase">
            Priority
          </div>
          <div className="flex items-center gap-2">
            <PriorityIcon priority={issue.priority} />
            <span className="text-sm">
              {priorityLabels[issue.priority as keyof typeof priorityLabels]}
            </span>
          </div>
        </div>

        {/* Labels */}
        {issue.labels && issue.labels.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase">
              Labels
            </div>
            <div className="flex flex-wrap gap-2">
              {issue.labels.map((label: { id: string; name: string; color: string }) => (
                <Badge
                  key={label.id}
                  variant="outline"
                  style={{
                    borderColor: label.color,
                    color: label.color,
                  }}
                  className="text-xs"
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Assignee */}
        {issue.assignee && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase">
              Assignee
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={issue.assignee.avatarUrl}
                  alt={issue.assignee.name}
                />
                <AvatarFallback>
                  {issue.assignee.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{issue.assignee.name}</span>
            </div>
          </div>
        )}

        {/* Created Date */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase">
            Created
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatDistanceToNow(new Date(issue.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        {/* Updated Date */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase">
            Updated
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatDistanceToNow(new Date(issue.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
