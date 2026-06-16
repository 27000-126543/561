import React, { useState } from 'react';
import { Bell, Search, User, ChevronDown, MapPin } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, selectedProvince, setSelectedProvince, sidebarCollapsed } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const roleMap = {
    national: '国家级',
    provincial: '省级',
    municipal: '市级',
    project: '项目劳资员',
  };

  const getRegionText = () => {
    switch (user.role) {
      case 'national':
        return '全国';
      case 'provincial':
        return user.province || '';
      case 'municipal':
        return `${user.province || ''}${user.city || ''}`;
      case 'project':
        return '指定项目';
      default:
        return '';
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-30 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-60'
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索项目、预警..."
              className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <select
              value={selectedProvince || 'national'}
              onChange={(e) => setSelectedProvince(e.target.value === 'national' ? null : e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="national">全国</option>
              <option value="广东省">广东省</option>
              <option value="江苏省">江苏省</option>
              <option value="浙江省">浙江省</option>
              <option value="四川省">四川省</option>
              <option value="湖北省">湖北省</option>
              <option value="河南省">河南省</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">
                  {roleMap[user.role]}
                  {getRegionText() && `/${getRegionText()}`}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
                  个人中心
                </button>
                <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left">
                  修改密码
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
