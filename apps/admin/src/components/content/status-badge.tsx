'use client';

import { Badge } from '@/components/ui/badge';
import type { ContentStatus } from '@/lib/api';

const statusConfig: Record<ContentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' }> = {
  DRAFT: { label: 'Brouillon', variant: 'secondary' },
  SCHEDULED: { label: 'Programmé', variant: 'info' },
  PUBLISHED: { label: 'Publié', variant: 'success' },
  ARCHIVED: { label: 'Archivé', variant: 'outline' },
};

interface StatusBadgeProps {
  status: ContentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
