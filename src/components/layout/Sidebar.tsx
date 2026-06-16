import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  FileSpreadsheet,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const menuItems = [
  { id: 'dashboard', label: '核心看板', icon: LayoutDashboard, path: '/' },
  { id: 'projects', label: '项目管理', icon: Building2, path: '/projects' },
  { id: 'warnings', label: '预警中心', icon: AlertTriangle, path: '/warnings' },
  { id: 'salary-verify', label: '工资校验', icon: FileSpreadsheet, path: '/salary-verify' },
  { id: 'reports', label: '周报中心', icon: FileBarChart, path: '/reports' },
  { id: 'system', label: '系统管理', icon: Settings, path: '/system' },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, sidebarCollapsed, toggleSidebar } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const item = menuItems.find((m) => m.path === path);
    if (item) {
      setCurrentPage(item.id);
    }
  }, [location.pathname, setCurrentPage]);

  const handleMenuClick = (itemId: string, path: string) => {
    setCurrentPage(itemId);
    navigate(path);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-gradient-to-b from-[#0f2744] to-[#1e3a5f] text-white transition-all duration-300 z-40',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-white/10">
        <Shield className="w-8 h-8 text-amber-400 flex-shrink-0" />
        {!sidebarCollapsed && (
          <div className="ml-3 overflow-hidden">
            <h1 className="text-lg font-bold tracking-wide truncate">欠薪预警平台</h1>
            <p className="text-xs text-gray-400 truncate">工资支付保障智能分析</p>
          </div>
        )}
      </div>

      <nav className="mt-4 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id, item.path)}
              className={cn(
                'w-full flex items-center px-3 py-2.5 mb-1 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-amber-500/20 text-amber-400 border-l-2 border-amber-400'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-amber-400' : '')} />
              {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
              {!sidebarCollapsed && item.id === 'warnings' && (
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  156
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <button
        onClick={toggleSidebar}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
