"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Code2, 
  BookOpen, 
  LineChart, 
  MessageSquare, 
  UserCircle, 
  Globe,
  MonitorPlay,
  PenTool,
  ShieldAlert,
  Rocket,
  LayoutTemplate,
  Gamepad2,
  Shield,
  GraduationCap,
  BrainCircuit,
  PanelLeftClose,
  PanelLeftOpen,
  Info
} from "lucide-react";
import Logo from "../ui/Logo";
import { useSession } from "next-auth/react";
import UserSearch from "../ui/UserSearch";

// Helper for conditional classes
function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  href: string;
  isActive?: boolean;
  color?: string; // Optional icon color override
  isCollapsed?: boolean;
}

function SidebarItem({ icon: Icon, label, href, isActive, color, isCollapsed }: SidebarItemProps) {
  const activeColor = color || "var(--primary)";
  const activeColorRGB = activeColor.includes("viz-blue") ? "var(--viz-blue-rgb)" : 
                        activeColor.includes("viz-purple") ? "var(--viz-purple-rgb)" :
                        activeColor.includes("viz-red") ? "var(--viz-red-rgb)" :
                        activeColor.includes("viz-gold") ? "var(--viz-gold-rgb)" :
                        activeColor.includes("viz-green") ? "var(--viz-green-rgb)" : "var(--viz-blue-rgb)";

  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      className={classNames(
        "group flex items-center rounded-lg transition-all duration-300 py-2.5 text-sm font-medium",
        isCollapsed ? "px-[22px]" : "px-4",
        isActive 
          ? `text-[var(--foreground)]` 
          : "text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
      )}
      style={isActive ? { 
        backgroundColor: `rgba(${activeColorRGB}, 0.1)`,
        boxShadow: `0 0 20px rgba(${activeColorRGB}, 0.05)`
      } : {}}
    >
      <Icon 
        className="w-5 h-5 transition-colors shrink-0" 
        style={{ color: isActive ? activeColor : undefined }}
      />
      <span 
        className={classNames(
          "transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-ellipsis",
          isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[150px] opacity-100 ml-3"
        )}
        style={isActive ? { color: activeColor } : {}}
      >
        {label}
      </span>
    </Link>
  );
}

interface SidebarProps {
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

export default function Sidebar({ isCollapsed = false, toggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const navItems = [
    { label: "Problems", href: "/problems", icon: Code2, color: "var(--viz-blue)" },
    { label: "Study Plans", href: "/study-plans", icon: BookOpen, color: "var(--viz-purple)" },
    { label: "CS Core", href: "/cs-core", icon: BrainCircuit, color: "var(--viz-gold)" },
    { label: "Academy", href: "/resources", icon: GraduationCap, color: "var(--viz-blue)" },
    { label: "Interview", href: "/interview", icon: MonitorPlay, color: "var(--viz-red)" },
    { label: "Arena", href: "/arena", icon: Rocket, color: "var(--viz-gold)" },
    { label: "Siege", href: "/siege", icon: Shield, color: "var(--viz-blue)" },
    { label: "Arcade", href: "/arcade", icon: Gamepad2, color: "var(--viz-blue)" },
    { label: "Visualize", href: "/dsa", icon: PenTool, color: "var(--viz-blue)" },
    { label: "Leaderboard", href: "/leaderboard", icon: LineChart, color: "var(--viz-green)" },
    { label: "Blog", href: "/blog", icon: Globe, color: "var(--viz-green)" },
    { label: "Chat", href: "/chat", icon: MessageSquare, color: "var(--viz-blue)" },
    { label: "About Build", href: "/about", icon: Info, color: "var(--viz-purple)" },
  ];

  return (
    <aside className={classNames(
      "h-screen bg-[var(--background)] flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out border-r border-[var(--border)]",
      isCollapsed ? "w-20" : "w-64"
    )}>
      
      {/* Header / Logo */}
      <div className={classNames(
        "p-4 pb-2 flex flex-col gap-6 transition-all duration-300", 
        isCollapsed ? "px-[16px] items-center" : "px-4"
      )}>
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center group" title={isCollapsed ? "LogiQuest" : undefined}>
            <Logo className="w-8 h-8 transition-transform group-hover:scale-110 shrink-0" />
            <span className={classNames(
              "transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-xl font-bold tracking-tight text-[var(--foreground)]",
              isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[150px] opacity-100 ml-2"
            )}>
              LogiQuest
            </span>
          </Link>
        </div>
        
        {/* Search Bar - hidden on collapse */}
        <div className={classNames(
          "transition-all duration-300 overflow-hidden w-full",
          isCollapsed ? "max-h-0 opacity-0 pointer-events-none" : "max-h-12 opacity-100"
        )}>
          <UserSearch className="w-full" />
        </div>
      </div>

      {/* Main Navigation */}
      <div className={classNames(
        "flex-1 overflow-y-auto space-y-1 mt-2 transition-all duration-300", 
        isCollapsed ? "px-2" : "px-4"
      )}>
        
        {/* Section: Practice */}
        <div className={classNames(
          "transition-all duration-300 overflow-hidden text-xs font-semibold text-[var(--foreground)]/40 uppercase tracking-wider mb-2 mt-2 px-2 whitespace-nowrap",
          isCollapsed ? "max-h-0 opacity-0" : "max-h-6 opacity-100"
        )}>
          Platform
        </div>
        
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            isActive={pathname.startsWith(item.href)}
            isCollapsed={isCollapsed}
          />
        ))}

        {session?.user?.role === "ADMIN" && (
           <>
            <div className="h-px bg-[var(--primary)]/10 my-4 mx-2" />
            <SidebarItem 
                label="Admin" 
                href="/admin" 
                icon={ShieldAlert} 
                isActive={pathname.startsWith("/admin")}
                color="text-red-500"
                isCollapsed={isCollapsed}
            />
           </>
        )}
      </div>

      {/* Footer Section: User Profile & Collapse */}
      <div className={classNames(
        "p-4 bg-[var(--background)] flex flex-col gap-2 border-t border-[var(--border)] transition-all duration-300",
        isCollapsed ? "px-2" : "px-4"
      )}>
        {toggleCollapse && (
          <button 
            onClick={toggleCollapse} 
            className={classNames(
              "flex items-center rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all duration-300 py-2.5 w-full",
              isCollapsed ? "px-[14px]" : "px-4"
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5 shrink-0 text-[var(--primary)]" /> : <PanelLeftClose className="w-5 h-5 shrink-0" />}
            <span className={classNames(
              "transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-sm font-medium",
              isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[150px] opacity-100 ml-3"
            )}>
              Collapse
            </span>
          </button>
        )}
        
        {status === "authenticated" && session.user ? (
          <div className="flex items-center justify-start rounded-xl hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer group relative p-1">
             <Link href="/profile" className="flex items-center min-w-0 w-full">
                {session.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.user.image} alt="" className="w-9 h-9 rounded-full bg-[var(--foreground)]/10 object-cover shrink-0" />
                ) : (
                    <UserCircle className="w-9 h-9 text-[var(--foreground)]/50 shrink-0" />
                )}
                <div className={classNames(
                  "transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden flex flex-col justify-center",
                  isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[150px] opacity-100 ml-3"
                )}>
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
               <Link 
                  href="/login" 
                  className={classNames(
                    "flex items-center rounded-lg bg-[var(--foreground)]/5 text-[var(--foreground)] hover:bg-[var(--foreground)]/10 transition-all duration-300 py-2 text-sm font-medium",
                    isCollapsed ? "px-[14px] justify-center" : "px-4 justify-center"
                  )} 
                  title={isCollapsed ? "Log In" : undefined}
               >
                  {isCollapsed ? <UserCircle className="w-5 h-5 shrink-0" /> : "Log In"}
               </Link>
               {!isCollapsed && (
                 <Link href="/signup" className="flex items-center justify-center w-full py-2 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-lg hover:opacity-90 transition-opacity">
                    Sign Up
                 </Link>
               )}
           </div>
        )}
      </div>
    </aside>
  );
}
