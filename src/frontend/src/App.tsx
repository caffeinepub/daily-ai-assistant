import { ChatSection } from "@/components/ChatSection";
import { NotesSection } from "@/components/NotesSection";
import { TasksSection } from "@/components/TasksSection";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  ClipboardList,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Scale,
  StickyNote,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Section = "chat" | "tasks" | "notes";

const NAV_ITEMS: Array<{
  id: Section;
  label: string;
  icon: typeof MessageSquare;
}> = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "notes", label: "Notes", icon: StickyNote },
];

const SECTION_COMPONENTS: Record<Section, React.ComponentType> = {
  chat: ChatSection,
  tasks: TasksSection,
  notes: NotesSection,
};

function Sidebar({
  activeSection,
  onSectionChange,
  onClose,
}: {
  activeSection: Section;
  onSectionChange: (s: Section) => void;
  onClose?: () => void;
}) {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}…${principal.slice(-4)}`
    : "";

  return (
    <aside className="flex flex-col h-full bg-sidebar">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Scale className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-[15px] text-sidebar-foreground leading-tight">
              Daily Assistant
            </h1>
            <p className="text-[10px] text-muted-foreground">
              AI-powered workspace
            </p>
          </div>
        </div>
      </div>

      <div className="gold-line mx-4 mb-4" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                onClose?.();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth ${
                isActive
                  ? "nav-active font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-gold" : ""}`}
              />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="ml-auto w-1 h-4 rounded-full bg-gold"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Auth + Footer */}
      <div className="px-3 pb-5">
        <div className="gold-line mb-4" />

        {/* Auth button */}
        {!isInitializing && (
          <div className="mb-4">
            {isLoggedIn ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-sidebar-accent rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-gold" />
                  </div>
                  <span className="text-xs text-sidebar-foreground/70 truncate">
                    {shortPrincipal}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="w-full text-xs text-muted-foreground hover:text-foreground gap-1.5 justify-start"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                className="w-full text-xs bg-primary/15 text-gold border border-gold/30 hover:bg-primary/25 gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                {isLoggingIn ? "Signing in…" : "Sign In"}
              </Button>
            )}
          </div>
        )}

        {/* Caffeine attribution */}
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          © {new Date().getFullYear()} Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold/70 hover:text-gold transition-smooth"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </aside>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveComponent = SECTION_COMPONENTS[activeSection];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-60 flex-shrink-0 border-r border-border">
        <div className="w-full">
          <Sidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed left-0 top-0 bottom-0 w-60 z-50 md:hidden border-r border-border"
            >
              <Sidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="flex md:hidden items-center gap-3 px-4 py-3 border-b border-border bg-sidebar">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground transition-smooth"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-gold" />
            <span className="font-serif text-sm text-foreground">
              Daily Assistant
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className={`ml-auto text-muted-foreground transition-smooth ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.2 0.012 260)",
            border: "1px solid oklch(0.26 0.015 260)",
            color: "oklch(0.92 0.008 85)",
          },
        }}
      />
    </div>
  );
}
