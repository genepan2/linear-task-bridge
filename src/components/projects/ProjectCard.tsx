'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    key: string;
    description?: string;
    icon?: string;
    color?: string;
  };
  issueCount?: number;
  onClick?: () => void;
  isSelected?: boolean;
}

/**
 * Project Card Component
 * Displays a clickable card with project information
 */
export function ProjectCard({
  project,
  issueCount,
  onClick,
  isSelected = false
}: ProjectCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {project.icon && (
              <div
                className="text-3xl flex items-center justify-center w-12 h-12 rounded-lg"
                style={{
                  backgroundColor: project.color ? `${project.color}20` : 'transparent'
                }}
              >
                {project.icon}
              </div>
            )}
            <div>
              <CardTitle className="text-xl">{project.name}</CardTitle>
              <Badge variant="outline" className="mt-1">
                {project.key}
              </Badge>
            </div>
          </div>

          {issueCount !== undefined && (
            <Badge variant="secondary">
              {issueCount} {issueCount === 1 ? 'issue' : 'issues'}
            </Badge>
          )}
        </div>

        {project.description && (
          <CardDescription className="mt-3 line-clamp-2">
            {project.description}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}
