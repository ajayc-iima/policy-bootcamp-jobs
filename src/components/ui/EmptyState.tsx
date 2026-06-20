import { type ReactNode } from "react";

export function EmptyState({
  icon, title, description, action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 animate-fade-in">
      {icon && <div className="mb-3 text-navy-300 animate-float">{icon}</div>}
      <h3 className="font-semibold text-navy-800">{title}</h3>
      {description && <p className="mt-1 text-sm text-navy-500 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
