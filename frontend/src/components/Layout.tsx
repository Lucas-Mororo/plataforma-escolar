import { useState } from "react";
import { useAuthStore } from "../store/auth.store";
import { useThemeStore } from "../store/theme.store";
import { useLogout } from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, LogOut, LayoutDashboard, BookOpen, PlusCircle, Users, ClipboardList, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Layout({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((state) => state.user);
    const { theme, toggleTheme } = useThemeStore();
    const logout = useLogout();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => { logout(); navigate("/login"); };

    const navItems = user?.role === "PROFESSOR"
        ? [
            { label: "Dashboard", path: "/professor", icon: LayoutDashboard },
            { label: "Minhas Atividades", path: "/professor/atividades", icon: BookOpen },
            { label: "Criar Atividade", path: "/professor/atividades/criar", icon: PlusCircle },
            { label: "Gerenciar Turmas", path: "/professor/turmas", icon: Users },
        ]
        : [
            { label: "Dashboard", path: "/aluno", icon: LayoutDashboard },
            { label: "Atividades", path: "/aluno/atividades", icon: ClipboardList },
            { label: "Minhas Respostas", path: "/aluno/respostas", icon: MessageSquare },
        ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-background text-foreground">
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
                <div className="flex items-center justify-between p-5">
                    <div>
                        <h1 className="text-lg font-bold text-primary">Plataforma Escolar</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">{user?.role === "PROFESSOR" ? "Professor" : "Aluno"}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <Separator />
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Button
                                key={item.path}
                                variant={active ? "secondary" : "ghost"}
                                className={`w-full justify-start gap-3 ${active ? "text-primary font-semibold" : "text-foreground"}`}
                                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Button>
                        );
                    })}
                </nav>
                <Separator />
                <div className="p-3 flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={toggleTheme} title={`Modo ${theme === 'light' ? 'escuro' : 'claro'}`}>
                        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-yellow-400" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" /> Sair
                    </Button>
                </div>
            </aside>

            {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            <main className="flex-1 overflow-auto">
                <div className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-5 h-5" />
                    </Button>
                    <h1 className="text-base font-semibold text-primary">Plataforma Escolar</h1>
                    <div className="w-10" />
                </div>
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
}
