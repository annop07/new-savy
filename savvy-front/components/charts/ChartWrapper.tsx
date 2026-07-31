"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { cn } from '@/lib/utils';

interface ChartWrapperProps {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export const ChartWrapper = ({ title, description, className, children }: ChartWrapperProps) => (
  <Card className={cn("h-full overflow-hidden", className)}>
    <CardHeader className="space-y-0.5 py-2">
      <CardTitle className="text-md font-semibold">{title}</CardTitle>
      {description && <CardDescription className="text-xs">{description}</CardDescription>}
    </CardHeader>
    <CardContent className="p-2 flex-1">
      <div className="h-full w-full">{children}</div>
    </CardContent>
  </Card>
);