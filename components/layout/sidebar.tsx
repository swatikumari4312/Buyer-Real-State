"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  Home,
  Users,
  Plus,
  FileText,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "All Leads", href: "/buyers", icon: Users },
  { name: "Add Lead", href: "/buyers/new", icon: Plus },
  { name: "Import/Export", href: "/buyers/import-export", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-gradient-to-b from-indigo-50 to-white">
      {/* Brand / Logo */}
      <div className="flex h-16 items-center px-6 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          {/* Custom logo (you can replace Building2 with an image/logo) */}
          <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-wide">
            LeadCRM
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-indigo-100 text-indigo-700 shadow-sm"
                  : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-400 group-hover:text-indigo-600"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
