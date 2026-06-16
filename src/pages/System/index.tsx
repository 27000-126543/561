import { useState, useMemo } from 'react';
import type { UserRole } from '@/types';
import {
  Users,
  Shield,
  Database,
  Settings,
  Search,
  Plus,
  Edit2,
  Ban,
  Trash2,
  ChevronRight,
  ChevronDown,
  Check,
  RefreshCw,
  Save,
  Bell,
  Mail,
  MessageSquare,
  AlertTriangle,
  PiggyBank,
  Clock,
  CheckCircle,
  XCircle,
  MinusCircle,
  Filter,
  ChevronDown as ChevronDownIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { provinces } from '@/mock/data';

type TabKey = 'users' | 'permissions' | 'data' | 'settings';

interface SystemUser {
  id: string;
  username: string;
  role: 'national' | 'provincial' | 'municipal' | 'project';
  region: string;
  permissions: string[];
  status: 'active' | 'disabled';
  createTime: string;
}

interface PermissionNode {
  id: string;
  name: string;
  children?: PermissionNode[];
}

interface DataSource {
  id: string;
  name: string;
  status: 'normal' | 'abnormal' | 'not-connected';
  lastSyncTime: string;
  description: string;
}

const tabs = [
  { key: 'users' as TabKey, label: '用户管理', icon: Users },
  { key: 'permissions' as TabKey, label: '权限配置', icon: Shield },
  { key: 'data' as TabKey, label: '数据接入', icon: Database },
  { key: 'settings' as TabKey, label: '系统设置', icon: Settings },
];

const mockUsers: SystemUser[] = [
  { id: 'u001', username: '张建国', role: 'national', region: '全国', permissions: ['全部权限'], status: 'active', createTime: '2024-01-15' },
  { id: 'u002', username: '李明华', role: 'provincial', region: '广东省', permissions: ['看板查看', '项目管理', '预警管理'], status: 'active', createTime: '2024-02-20' },
  { id: 'u003', username: '王秀英', role: 'provincial', region: '江苏省', permissions: ['看板查看', '项目管理', '预警管理', '报告查看'], status: 'active', createTime: '2024-03-10' },
  { id: 'u004', username: '刘志强', role: 'municipal', region: '深圳市', permissions: ['看板查看', '预警管理', '工资校验'], status: 'active', createTime: '2024-04-05' },
  { id: 'u005', username: '陈静', role: 'municipal', region: '南京市', permissions: ['看板查看', '项目管理', '工资校验'], status: 'active', createTime: '2024-05-12' },
  { id: 'u006', username: '赵伟', role: 'project', region: '中央商务区项目', permissions: ['看板查看', '工资校验'], status: 'active', createTime: '2024-06-18' },
  { id: 'u007', username: '孙丽', role: 'project', region: '地铁3号线项目', permissions: ['看板查看', '工资校验'], status: 'disabled', createTime: '2024-07-22' },
  { id: 'u008', username: '周杰', role: 'municipal', region: '成都市', permissions: ['看板查看', '预警管理'], status: 'active', createTime: '2024-08-30' },
];

const roleOptions = [
  { value: 'all', label: '全部角色' },
  { value: 'national', label: '国家级' },
  { value: 'provincial', label: '省级' },
  { value: 'municipal', label: '市级' },
  { value: 'project', label: '项目劳资员' },
];

const permissionTree: PermissionNode[] = [
  {
    id: 'national',
    name: '国家级',
    children: [
      {
        id: 'guangdong',
        name: '广东省',
        children: [
          { id: 'shenzhen', name: '深圳市' },
          { id: 'guangzhou', name: '广州市' },
          { id: 'dongguan', name: '东莞市' },
        ],
      },
      {
        id: 'jiangsu',
        name: '江苏省',
        children: [
          { id: 'nanjing', name: '南京市' },
          { id: 'suzhou', name: '苏州市' },
          { id: 'wuxi', name: '无锡市' },
        ],
      },
      {
        id: 'sichuan',
        name: '四川省',
        children: [
          { id: 'chengdu', name: '成都市' },
          { id: 'mianyang', name: '绵阳市' },
        ],
      },
    ],
  },
];

const permissionItems = [
  { id: 'dashboard:view', label: '看板查看', icon: '📊' },
  { id: 'projects:manage', label: '项目管理', icon: '🏗️' },
  { id: 'warnings:manage', label: '预警管理', icon: '⚠️' },
  { id: 'salary:verify', label: '工资校验', icon: '💰' },
  { id: 'reports:view', label: '报告查看', icon: '📑' },
  { id: 'system:manage', label: '系统管理', icon: '⚙️' },
];

const roleTemplates = [
  { id: 'national', name: '国家级管理员', permissions: ['dashboard:view', 'projects:manage', 'warnings:manage', 'salary:verify', 'reports:view', 'system:manage'] },
  { id: 'provincial', name: '省级管理员', permissions: ['dashboard:view', 'projects:manage', 'warnings:manage', 'reports:view'] },
  { id: 'municipal', name: '市级管理员', permissions: ['dashboard:view', 'warnings:manage', 'salary:verify'] },
  { id: 'project', name: '项目劳资员', permissions: ['dashboard:view', 'salary:verify'] },
];

const dataSources: DataSource[] = [
  { id: 'ds001', name: '实名制考勤', status: 'normal', lastSyncTime: '2026-06-16 08:30:00', description: '对接全国建筑工人管理服务信息平台' },
  { id: 'ds002', name: '工资专户', status: 'normal', lastSyncTime: '2026-06-16 09:15:00', description: '对接银行工资专用账户数据' },
  { id: 'ds003', name: '工程款拨付', status: 'abnormal', lastSyncTime: '2026-06-14 16:45:00', description: '对接住建部门工程款拨付系统' },
  { id: 'ds004', name: '劳动监察投诉', status: 'not-connected', lastSyncTime: '-', description: '对接12345政务服务热线投诉数据' },
];

export default function System() {
  const [activeTab, setActiveTab] = useState<TabKey>('users');

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)]">
      <div className="w-56 flex-shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left',
                  activeTab === tab.key
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-full overflow-y-auto">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'permissions' && <PermissionConfig />}
          {activeTab === 'data' && <DataAccess />}
          {activeTab === 'settings' && <SystemSettings />}
        </div>
      </div>
    </div>
  );
}

function UserManagement() {
  const [users, setUsers] = useState<SystemUser[]>(mockUsers);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch = user.username.includes(searchText) || user.region.includes(searchText);
      const matchRole = roleFilter === 'all' || user.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchText, roleFilter]);

  const getRoleText = (role: SystemUser['role']) => {
    const map: Record<SystemUser['role'], string> = {
      national: '国家级',
      provincial: '省级',
      municipal: '市级',
      project: '项目劳资员',
    };
    return map[role];
  };

  const getRoleStyle = (role: SystemUser['role']) => {
    const map: Record<SystemUser['role'], string> = {
      national: 'bg-purple-50 text-purple-600 border-purple-200',
      provincial: 'bg-blue-50 text-blue-600 border-blue-200',
      municipal: 'bg-green-50 text-green-600 border-green-200',
      project: 'bg-orange-50 text-orange-600 border-orange-200',
    };
    return map[role];
  };

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' } : u))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该用户吗？')) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">用户管理</h2>
          <p className="text-sm text-gray-500 mt-1">管理系统用户账号及权限分配</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>新增用户</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索用户名或地区..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {roleOptions.find((o) => o.value === roleFilter)?.label}
            </span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3.5 text-left text-sm font-semibold text-gray-700">用户名</th>
              <th className="px-5 py-3.5 text-left text-sm font-semibold text-gray-700">角色</th>
              <th className="px-5 py-3.5 text-left text-sm font-semibold text-gray-700">所属地区</th>
              <th className="px-5 py-3.5 text-left text-sm font-semibold text-gray-700">权限</th>
              <th className="px-5 py-3.5 text-left text-sm font-semibold text-gray-700">状态</th>
              <th className="px-5 py-3.5 text-left text-sm font-semibold text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={user.id}
                className={cn(
                  'border-b border-gray-50 hover:bg-blue-50/30 transition-colors',
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                )}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{user.username.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{user.username}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-full border font-medium',
                      getRoleStyle(user.role)
                    )}
                  >
                    {getRoleText(user.role)}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{user.region}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.slice(0, 2).map((p, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                      >
                        {p}
                      </span>
                    ))}
                    {user.permissions.length > 2 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                        +{user.permissions.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-medium',
                      user.status === 'active' ? 'text-green-600' : 'text-gray-400'
                    )}
                  >
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        user.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                      )}
                    />
                    {user.status === 'active' ? '正常' : '已禁用'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      编辑
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1.5 text-xs rounded transition-colors',
                        user.status === 'active'
                          ? 'text-orange-600 hover:bg-orange-50'
                          : 'text-green-600 hover:bg-green-50'
                      )}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      {user.status === 'active' ? '禁用' : '启用'}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>暂无用户数据</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <span>共 {filteredUsers.length} 条记录</span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            上一页
          </button>
          <span className="px-3 py-1.5 bg-blue-600 text-white rounded">1</span>
          <button className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            下一页
          </button>
        </div>
      </div>

      {(showAddModal || editingUser) && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowAddModal(false);
            setEditingUser(null);
          }}
          onSave={(user) => {
            if (editingUser) {
              setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
            } else {
              setUsers((prev) => [...prev, { ...user, id: `u${Date.now()}` }]);
            }
            setShowAddModal(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}

interface UserModalProps {
  user: SystemUser | null;
  onClose: () => void;
  onSave: (user: SystemUser) => void;
}

function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState<Partial<SystemUser>>({
    username: user?.username || '',
    role: user?.role || 'project',
    region: user?.region || '',
    status: user?.status || 'active',
    permissions: user?.permissions || ['看板查看'],
    createTime: user?.createTime || new Date().toISOString().split('T')[0],
    id: user?.id || '',
  });

  const handleSubmit = () => {
    if (!formData.username || !formData.region) {
      alert('请填写完整信息');
      return;
    }
    onSave(formData as SystemUser);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">
            {user ? '编辑用户' : '新增用户'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入用户名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">角色</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as SystemUser['role'] })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {roleOptions.filter((o) => o.value !== 'all').map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">所属地区</label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入所属地区或项目名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">状态</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={formData.status === 'active'}
                  onChange={() => setFormData({ ...formData, status: 'active' })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">正常</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={formData.status === 'disabled'}
                  onChange={() => setFormData({ ...formData, status: 'disabled' })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">禁用</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

function PermissionConfig() {
  const { user, setUserRole } = useAppStore();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['national', 'guangdong', 'jiangsu', 'sichuan']));
  const [selectedNode, setSelectedNode] = useState<string>('national');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'dashboard:view',
    'projects:manage',
    'warnings:manage',
    'reports:view',
  ]);
  const [configRole, setConfigRole] = useState<UserRole>(user.role);
  const [configProvince, setConfigProvince] = useState<string>(user.province || '');
  const [configCity, setConfigCity] = useState<string>(user.city || '');
  const [showPermissionSaved, setShowPermissionSaved] = useState(false);

  const cities = useMemo(() => {
    const { projects } = useAppStore.getState();
    if (!configProvince) return [];
    const citySet = new Set(
      projects
        .filter((p) => p.province === configProvince)
        .map((p) => p.city)
    );
    return Array.from(citySet);
  }, [configProvince]);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const applyRoleTemplate = (template: (typeof roleTemplates)[0]) => {
    setSelectedPermissions(template.permissions);
  };

  const handleSavePermission = () => {
    if (configRole === 'provincial' && !configProvince) {
      alert('请选择省份');
      return;
    }
    if (configRole === 'municipal' && (!configProvince || !configCity)) {
      alert('请选择省份和城市');
      return;
    }
    setUserRole(configRole, configProvince || undefined, configCity || undefined);
    setShowPermissionSaved(true);
    setTimeout(() => setShowPermissionSaved(false), 2000);
  };

  const renderTreeNode = (node: PermissionNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode === node.id;

    return (
      <div key={node.id}>
        <div
          className={cn(
            'flex items-center gap-2 py-2 px-3 cursor-pointer rounded-lg transition-colors mx-1',
            isSelected ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
          )}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => setSelectedNode(node.id)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}
          <span className="text-sm">{node.name}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">权限配置</h2>
        <p className="text-sm text-gray-500 mt-1">配置各级用户的数据访问权限和功能权限</p>
      </div>

      <div className="border border-gray-100 rounded-xl p-5 mb-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          当前用户角色配置
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">用户角色</label>
            <select
              value={configRole}
              onChange={(e) => {
                setConfigRole(e.target.value as UserRole);
                if (e.target.value === 'national') {
                  setConfigProvince('');
                  setConfigCity('');
                }
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="national">国家级</option>
              <option value="provincial">省级</option>
              <option value="municipal">市级</option>
              <option value="project">项目劳资员</option>
            </select>
          </div>

          {(configRole === 'provincial' || configRole === 'municipal') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">省份</label>
              <select
                value={configProvince}
                onChange={(e) => {
                  setConfigProvince(e.target.value);
                  setConfigCity('');
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">请选择省份</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
          )}

          {configRole === 'municipal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">城市</label>
              <select
                value={configCity}
                onChange={(e) => setConfigCity(e.target.value)}
                disabled={!configProvince}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">请选择城市</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <span className="font-medium">当前权限范围：</span>
            {configRole === 'national' && '全国所有数据'}
            {configRole === 'provincial' && (configProvince ? `${configProvince}范围内数据` : '请选择省份')}
            {configRole === 'municipal' && (configProvince && configCity ? `${configProvince}${configCity}范围内数据` : '请选择省份和城市')}
            {configRole === 'project' && '指定项目数据'}
          </p>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSavePermission}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors shadow-sm',
              showPermissionSaved
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {showPermissionSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {showPermissionSaved ? '权限配置已保存，刷新后生效' : '保存权限配置'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="border border-gray-100 rounded-xl p-4 h-full">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              组织架构
            </h3>
            <div className="space-y-0.5">
              {permissionTree.map((node) => renderTreeNode(node))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">功能权限</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {permissionItems.map((item) => {
                const isChecked = selectedPermissions.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                      isChecked
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                        isChecked
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      )}
                      onClick={() => togglePermission(item.id)}
                    >
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <span className="text-base mr-1">{item.icon}</span>
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">角色权限模板</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {roleTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyRoleTemplate(template)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-800 mb-1">{template.name}</div>
                  <div className="text-xs text-gray-500">
                    {template.permissions.length} 项权限
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataAccess() {
  const [sources, setSources] = useState<DataSource[]>(dataSources);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSources((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: 'normal',
                lastSyncTime: new Date().toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }).replace(/\//g, '-'),
              }
            : s
        )
      );
      setSyncingId(null);
    }, 2000);
  };

  const getStatusInfo = (status: DataSource['status']) => {
    const map = {
      normal: { text: '正常', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle, dot: 'bg-green-500' },
      abnormal: { text: '异常', color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle, dot: 'bg-red-500' },
      'not-connected': { text: '未接入', color: 'text-gray-500', bg: 'bg-gray-100', icon: MinusCircle, dot: 'bg-gray-400' },
    };
    return map[status];
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">数据接入</h2>
          <p className="text-sm text-gray-500 mt-1">管理外部数据源的接入配置与同步状态</p>
        </div>
        <button
          onClick={() => sources.forEach((s) => handleSync(s.id))}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          全部同步
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((source) => {
          const statusInfo = getStatusInfo(source.status);
          const StatusIcon = statusInfo.icon;
          const isSyncing = syncingId === source.id;

          return (
            <div
              key={source.id}
              className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', statusInfo.bg)}>
                    <Database className={cn('w-6 h-6', statusInfo.color)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{source.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={cn('w-2 h-2 rounded-full', statusInfo.dot)} />
                      <span className={cn('text-xs font-medium', statusInfo.color)}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleSync(source.id)}
                  disabled={isSyncing}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors',
                    isSyncing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  )}
                >
                  <RefreshCw className={cn('w-4 h-4', isSyncing && 'animate-spin')} />
                  {isSyncing ? '同步中...' : '同步'}
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{source.description}</p>

              <div className="flex items-center gap-2 text-xs text-gray-400 pt-3 border-t border-gray-50">
                <Clock className="w-3.5 h-3.5" />
                <span>最后同步：{source.lastSyncTime}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border border-gray-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">接入统计</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-gray-800">{sources.length}</div>
            <div className="text-sm text-gray-500 mt-1">数据源总数</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              {sources.filter((s) => s.status === 'normal').length}
            </div>
            <div className="text-sm text-gray-500 mt-1">正常接入</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <div className="text-2xl font-bold text-red-600">
              {sources.filter((s) => s.status === 'abnormal').length}
            </div>
            <div className="text-sm text-gray-500 mt-1">异常</div>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded-xl">
            <div className="text-2xl font-bold text-gray-500">
              {sources.filter((s) => s.status === 'not-connected').length}
            </div>
            <div className="text-sm text-gray-500 mt-1">未接入</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemSettings() {
  const { warningThreshold, updateSystemSettings } = useAppStore();
  const [settings, setSettings] = useState({
    paymentRateThreshold: warningThreshold.paymentRate,
    fundRatioThreshold: warningThreshold.fundRatio,
    escalationDays: warningThreshold.escalateDays,
    smsNotification: true,
    emailNotification: true,
    inAppNotification: true,
    dataRetentionPeriod: 12,
  });

  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    updateSystemSettings({
      paymentRate: settings.paymentRateThreshold,
      fundRatio: settings.fundRatioThreshold,
      escalateDays: settings.escalationDays,
    });
    setSaved(true);
    setShowToast(true);
    setTimeout(() => {
      setSaved(false);
      setShowToast(false);
    }, 2500);
  };

  return (
    <div className="p-6 relative">
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <CheckCircle className="w-5 h-5" />
          <span>设置已保存，预警计算规则已更新</span>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">系统设置</h2>
          <p className="text-sm text-gray-500 mt-1">配置系统预警阈值、通知方式及数据保留策略</p>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-lg transition-colors shadow-sm',
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? '已保存' : '保存设置'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="border border-gray-100 rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            预警阈值配置
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-blue-500" />
                  工资发放率阈值
                </label>
                <span className="text-lg font-bold text-blue-600">{settings.paymentRateThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={settings.paymentRateThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, paymentRateThreshold: Number(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-400">低于此比例将触发预警</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-green-500" />
                  专户资金比阈值
                </label>
                <span className="text-lg font-bold text-green-600">{settings.fundRatioThreshold}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={settings.fundRatioThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, fundRatioThreshold: Number(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <p className="text-xs text-gray-400">低于此比例将触发预警</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  预警升级天数
                </label>
                <span className="text-lg font-bold text-purple-600">{settings.escalationDays}天</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={settings.escalationDays}
                onChange={(e) =>
                  setSettings({ ...settings, escalationDays: Number(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <p className="text-xs text-gray-400">逾期未处理自动升级</p>
            </div>
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            通知配置
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">短信通知</div>
                  <div className="text-xs text-gray-500">重要预警短信提醒</div>
                </div>
              </div>
              <div
                className={cn(
                  'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                  settings.smsNotification ? 'bg-blue-600' : 'bg-gray-300'
                )}
                onClick={() =>
                  setSettings({ ...settings, smsNotification: !settings.smsNotification })
                }
              >
                <div
                  className={cn(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                    settings.smsNotification ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </div>
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">邮件通知</div>
                  <div className="text-xs text-gray-500">周报及汇总邮件</div>
                </div>
              </div>
              <div
                className={cn(
                  'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                  settings.emailNotification ? 'bg-blue-600' : 'bg-gray-300'
                )}
                onClick={() =>
                  setSettings({ ...settings, emailNotification: !settings.emailNotification })
                }
              >
                <div
                  className={cn(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                    settings.emailNotification ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </div>
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">站内通知</div>
                  <div className="text-xs text-gray-500">系统消息推送</div>
                </div>
              </div>
              <div
                className={cn(
                  'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                  settings.inAppNotification ? 'bg-blue-600' : 'bg-gray-300'
                )}
                onClick={() =>
                  setSettings({ ...settings, inAppNotification: !settings.inAppNotification })
                }
              >
                <div
                  className={cn(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                    settings.inAppNotification ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </div>
            </label>
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-500" />
            数据保留期限
          </h3>
          <div className="max-w-md">
            <div className="flex items-center gap-4 mb-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">历史数据保留</label>
              <select
                value={settings.dataRetentionPeriod}
                onChange={(e) =>
                  setSettings({ ...settings, dataRetentionPeriod: Number(e.target.value) })
                }
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={6}>6 个月</option>
                <option value={12}>12 个月</option>
                <option value={24}>24 个月</option>
                <option value={36}>36 个月</option>
              </select>
            </div>
            <p className="text-xs text-gray-400">
              超过保留期限的历史数据将自动归档，以释放存储空间
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Wallet(props: { className?: string }) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
