import { FileCheck, Info } from 'lucide-react';
import FileUpload from '@/components/salary/FileUpload';
import VerifyResult from '@/components/salary/VerifyResult';
import AnomalyList from '@/components/salary/AnomalyList';
import { useSalaryStore } from '@/store/useSalaryStore';

export default function SalaryVerify() {
  const { uploadStatus } = useSalaryStore();

  const showResults = uploadStatus === 'success';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">工资校验</h1>
          <p className="text-gray-500 mt-1">上传工资表进行数据校验，确保工资发放准确无误</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">校验说明</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>人员校验：核对工资表人员与系统在册人员是否一致</li>
              <li>金额校验：核对工资金额与系统记录是否匹配</li>
              <li>考勤校验：核对考勤数据与工资计算是否一致</li>
            </ul>
          </div>
        </div>
      </div>

      <FileUpload />

      {showResults && (
        <>
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">校验结果</h2>
          </div>
          <VerifyResult />
          <AnomalyList />
        </>
      )}
    </div>
  );
}
