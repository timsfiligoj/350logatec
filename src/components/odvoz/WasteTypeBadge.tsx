import { Recycle, Trash2, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type WasteType = "E" | "M" | "B";

interface WasteTypeBadgeProps {
  type: WasteType;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const wasteTypeConfig = {
  E: {
    label: "Embalaža",
    shortLabel: "E",
    icon: Recycle,
    bgColor: "bg-blue-100",
    textColor: "text-blue-900",
    borderColor: "border-blue-200",
    dotColor: "bg-blue-500",
  },
  M: {
    label: "Mešani",
    shortLabel: "M",
    icon: Trash2,
    bgColor: "bg-gray-100",
    textColor: "text-gray-900",
    borderColor: "border-gray-300",
    dotColor: "bg-gray-700",
  },
  B: {
    label: "Bio",
    shortLabel: "B",
    icon: Leaf,
    bgColor: "bg-green-100",
    textColor: "text-green-900",
    borderColor: "border-green-200",
    dotColor: "bg-green-500",
  },
};

export function WasteTypeBadge({
  type,
  showLabel = true,
  size = "md",
}: WasteTypeBadgeProps) {
  const config = wasteTypeConfig[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border",
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel ? config.label : config.shortLabel}
    </Badge>
  );
}

export function WasteTypeDot({ type }: { type: WasteType }) {
  const config = wasteTypeConfig[type];
  return (
    <span
      className={cn("inline-block h-2.5 w-2.5 rounded-full", config.dotColor)}
      title={config.label}
    />
  );
}

export { wasteTypeConfig };
export type { WasteType };
