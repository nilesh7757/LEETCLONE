"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Code2, 
  Trophy, 
  BookOpen, 
  LineChart, 
  MessageSquare, 
  UserCircle, 
  Globe,
  MonitorPlay,
  PenTool,
  ShieldAlert
} from "lucide-react";
import Logo from "../ui/Logo";
import { useSession } from "next-auth/react";
import UserSearch from "../ui/UserSearch";

// Helper for conditional classes
function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
  color?: string; // Optional icon color override
}

function SidebarItem({ icon: Icon, label, href, isActive, color }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={classNames(
        "group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
        isActive 
          ? "bg-[var(--foreground)]/10 text-[var(--foreground)]" 
          : "text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
      )}
    >
      <Icon className={classNames("w-5 h-5 transition-colors", isActive ? (color || "text-[var(--foreground)]") : "text-[var(--foreground)]/50 group-hover:text-[var(--foreground)]")} />
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const navItems = [
    { label: "Problems", href: "/problems", icon: Code2 },
    { label: "Study Plans", href: "/study-plans", icon: BookOpen },
    { label: "Interview", href: "/interview", icon: MonitorPlay },
    { label: "Contest", href: "/contest", icon: Trophy },
    { label: "Visualize", href: "/dsa", icon: PenTool },
    { label: "Leaderboard", href: "/leaderboard", icon: LineChart },
    { label: "Blog", href: "/blog", icon: Globe },
    { label: "Chat", href: "/chat", icon: MessageSquare },
  ];

  return (
    <aside className="w-64 h-screen border-r border-[var(--card-border)] bg-[var(--background)] flex flex-col fixed left-0 top-0 z-50">
      
      {/* Header / Logo */}
      <div className="p-6 pb-2">
        <Link href="/" className="flex items-center gap-2 mb-8 group">
          <Logo className="w-8 h-8 transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">LeetClone</span>
        </Link>
        
        {/* Search Bar */}
        <UserSearch className="w-full" />
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1 mt-4">
        
        {/* Section: Practice */}
        <div className="text-xs font-semibold text-[var(--foreground)]/40 uppercase tracking-wider mb-2 mt-2 px-2">
          Platform
        </div>
        
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            isActive={pathname.startsWith(item.href)}
          />
        ))}

        {session?.user?.role === "ADMIN" && (
           <>
            <div className="h-px bg-[var(--card-border)] my-4 mx-2" />
            <SidebarItem 
                label="Admin" 
                href="/admin" 
                icon={ShieldAlert} 
                isActive={pathname.startsWith("/admin")}
                color="text-red-500"
            />
           </>
        )}
      </div>

      {/* Footer Section: User Profile */}
      <div className="p-4 border-t border-[var(--card-border)] bg-[var(--background)]">
        {status === "authenticated" && session.user ? (
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer group relative">
             <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0">
                {session.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.user.image} alt="" className="w-9 h-9 rounded-full bg-[var(--foreground)]/10 object-cover" />
                ) : (
                    <UserCircle className="w-9 h-9 text-[var(--foreground)]/50" />
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {session.user.name || "User"}
                    </p>
                    <p className="text-xs text-[var(--foreground)]/50 truncate">
                        View Profile
                    </p>
                </div>
             </Link>
          </div>
        ) : (
           <div className="space-y-2">
               <Link href="/login" className="flex items-center justify-center w-full py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--foreground)]/5 rounded-lg hover:bg-[var(--foreground)]/10 transition-colors">
                  Log In
               </Link>
               <Link href="/signup" className="flex items-center justify-center w-full py-2 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-lg hover:opacity-90 transition-opacity">
                  Sign Up
               </Link>
           </div>
        )}
      </div>
    </aside>
  );
}
