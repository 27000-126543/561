import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  Users,
  DollarSign,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { provinces, industries } from '@/mock/data';
import type { Project } from '@/types';

const PAGE_SIZE = 6;

const statusMap: Record<string, string> = {
  active: '在建',
  completed: '已完工',
  suspended: '停工',
};

function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate();

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600 bg-green-50';
    if (score < 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPaymentRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-1">
            {project.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{project.province} {project.city}</span>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          project.status === 'active' ? 'bg-blue-50 text-blue-600' :
          project.status === 'completed' ? 'bg-green-50 text-green-600' :
          'bg-gray-100 text-gray-600'
        }`}>
          {statusMap[project.status]}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Briefcase className="w-4 h-4" />
            <span>{project.industry}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Building2 className="w-4 h-4" />
            <span className="max-w-[120px] truncate">{project.constructionUnit}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Users className="w-4 h-4" />
            <span>{project.totalWorkers} 人</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <DollarSign className="w-4 h-4" />
              <span>工资发放率</span>
            </div>
            <span className={`text-sm font-semibold ${getPaymentRateColor(project.paymentRate)}`}>
              {project.paymentRate}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                project.paymentRate >= 95 ? 'bg-green-500' :
                project.paymentRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${project.paymentRate}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <AlertTriangle className="w-4 h-4" />
            <span>风险评分</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-sm font-semibold ${getRiskColor(project.riskScore)}`}>
            {project.riskScore}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, getFilteredProjects } = useAppStore();
  const projects = useMemo(() => getFilteredProjects(), [user, getFilteredProjects]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedProvince, setSelectedProvince] = useState(searchParams.get('province') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const urlProvince = searchParams.get('province');
    const urlCity = searchParams.get('city');
    if (urlProvince) {
      setSelectedProvince(urlProvince);
    }
    if (urlCity) {
      setSelectedCity(urlCity);
    }
  }, [searchParams]);

  const cities = useMemo(() => {
    if (!selectedProvince) return [];
    const citySet = new Set(
      projects
        .filter((p) => p.province === selectedProvince)
        .map((p) => p.city)
    );
    return Array.from(citySet);
  }, [selectedProvince, projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (searchKeyword && !project.name.includes(searchKeyword)) return false;
      if (selectedProvince && project.province !== selectedProvince) return false;
      if (selectedCity && project.city !== selectedCity) return false;
      if (selectedIndustry && project.industry !== selectedIndustry) return false;
      if (selectedStatus && project.status !== selectedStatus) return false;
      return true;
    });
  }, [projects, searchKeyword, selectedProvince, selectedCity, selectedIndustry, selectedStatus]);

  const totalPages = Math.ceil(filteredProjects.length / PAGE_SIZE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedCity('');
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchKeyword('');
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedIndustry('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">项目管理</h1>
          <p className="text-sm text-gray-500 mt-1">共 {filteredProjects.length} 个项目</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-700">筛选条件</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm text-gray-600 mb-1.5">项目名称</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="请输入项目名称搜索"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">省份</label>
            <select
              value={selectedProvince}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">全部省份</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">城市</label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setCurrentPage(1);
              }}
              disabled={!selectedProvince}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">全部城市</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">行业</label>
            <select
              value={selectedIndustry}
              onChange={(e) => {
                setSelectedIndustry(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">全部行业</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">项目状态</label>
              <div className="flex gap-2">
                {[
                  { value: '', label: '全部' },
                  { value: 'active', label: '在建' },
                  { value: 'completed', label: '已完工' },
                  { value: 'suspended', label: '停工' },
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => {
                      setSelectedStatus(status.value);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      selectedStatus === status.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            重置筛选
          </button>
        </div>
      </div>

      {paginatedProjects.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16 text-center">
          <div className="text-gray-400 mb-3">
            <Search className="w-12 h-12 mx-auto opacity-50" />
          </div>
          <p className="text-gray-500">暂无匹配的项目</p>
          <button
            onClick={resetFilters}
            className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            清除筛选条件
          </button>
        </div>
      )}
    </div>
  );
}
