/**
 * IssueCard - Compact issue display for list view
 */
'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { LinearIssue } from '@/types/linear';
import { PRIORITY_LABELS } from '@/types/linear';
import { formatDistanceToNow } from 'date-fns';

interface IssueCardProps {
  issue: LinearIssue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const priorityLabel = PRIORITY_LABELS[issue.priority];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 4: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Link href={`/issues/${issue.id}`}>
      <div className="group border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Identifier and Title */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-gray-500 flex-shrink-0">
                {issue.identifier}
              </span>
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {issue.title}
              </h3>
            </div>

            {/* Description preview */}
            {issue.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {issue.description.replace(/[#*`]/g, '').substring(0, 150)}
              </p>
            )}

            {/* Metadata row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Status Badge */}
              <Badge
                variant="outline"
                style={{
                  borderColor: issue.state.color,
                  color: issue.state.color
                }}
              >
                {issue.state.name}
              </Badge>

              {/* Priority Badge */}
              {issue.priority > 0 && (
                <Badge
                  variant="outline"
                  className={getPriorityColor(issue.priority)}
                >
                  {priorityLabel}
                </Badge>
              )}

              {/* Labels */}
              {issue.labels.slice(0, 2).map(label => (
                <Badge
                  key={label.id}
                  variant="secondary"
                  style={{ backgroundColor: `${label.color}20`, color: label.color }}
                >
                  {label.name}
                </Badge>
              ))}

              {/* Timestamp */}
              <span className="text-xs text-gray-500 ml-auto">
                Updated {formatDistanceToNow(new Date(issue.updatedAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Assignee Avatar */}
          {issue.assignee && (
            <div className="flex-shrink-0">
              <Avatar className="h-8 w-8">
                {issue.assignee.avatarUrl && (
                  <AvatarImage
                    src={issue.assignee.avatarUrl}
                    alt={issue.assignee.name}
                  />
                )}
                <AvatarFallback className="text-xs">
                  {getInitials(issue.assignee.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
