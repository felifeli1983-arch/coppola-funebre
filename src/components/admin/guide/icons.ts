import {
  BarChart3,
  BellRing,
  BookOpen,
  Cookie,
  FileText,
  FolderTree,
  HelpCircle,
  KanbanSquare,
  LayoutDashboard,
  MousePointerClick,
  Package,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Store,
  Table2,
  Truck,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';

export const GUIDE_ICONS: Record<string, LucideIcon> = {
  BarChart3,
  BellRing,
  BookOpen,
  Cookie,
  FileText,
  FolderTree,
  HelpCircle,
  KanbanSquare,
  LayoutDashboard,
  MousePointerClick,
  Package,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Store,
  Table2,
  Truck,
  UserCog,
  Users,
};

export function guideIcon(name: string): LucideIcon {
  return GUIDE_ICONS[name] ?? BookOpen;
}
