import { create } from 'zustand';
import type { SalaryVerifyResult, AnomalyItem, Worker } from '@/types';
import { registerWorkers } from '@/mock/data';

type UploadStatus = 'idle' | 'uploading' | 'verifying' | 'success' | 'error';

const NAME_KEYS = ['姓名', '工人姓名', '员工姓名', 'name', 'Name'];
const IDCARD_KEYS = ['身份证', '身份证号', '身份证号码', 'idCard', 'IDCard'];
const AMOUNT_KEYS = ['应发金额', '应发工资', '工资', '金额', 'salary', 'amount'];
const ATTENDANCE_KEYS = ['出勤天数', '出勤', '考勤天数', 'attendance', 'days'];

function findKey(obj: Record<string, unknown>, keys: string[]): string | undefined {
  const objKeys = Object.keys(obj);
  for (const key of keys) {
    const found = objKeys.find(k => k.trim().toLowerCase() === key.trim().toLowerCase());
    if (found) return found;
  }
  return objKeys.find(k => keys.some(key => k.trim().toLowerCase().includes(key.trim().toLowerCase())));
}

interface SalaryState {
  uploadStatus: UploadStatus;
  uploadProgress: number;
  fileName: string;
  fileSize: number;
  verifyResult: SalaryVerifyResult | null;
  selectedFilter: 'all' | 'person_mismatch' | 'amount_mismatch' | 'attendance_mismatch';
  expandedItems: string[];
  workers: Worker[];

  setUploadStatus: (status: UploadStatus) => void;
  setUploadProgress: (progress: number) => void;
  setFileInfo: (name: string, size: number) => void;
  setVerifyResult: (result: SalaryVerifyResult) => void;
  setSelectedFilter: (filter: 'all' | 'person_mismatch' | 'amount_mismatch' | 'attendance_mismatch') => void;
  toggleExpandItem: (index: number) => void;
  resetState: () => void;
  simulateUploadAndVerify: () => void;
  processAndVerifyExcel: (excelData: Record<string, unknown>[]) => boolean;
}

const initialState = {
  uploadStatus: 'idle' as UploadStatus,
  uploadProgress: 0,
  fileName: '',
  fileSize: 0,
  verifyResult: null,
  selectedFilter: 'all' as const,
  expandedItems: [] as string[],
  workers: registerWorkers,
};

export const useSalaryStore = create<SalaryState>((set, get) => ({
  ...initialState,

  setUploadStatus: (status) => set({ uploadStatus: status }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setFileInfo: (name, size) => set({ fileName: name, fileSize: size }),
  setVerifyResult: (result) => set({ verifyResult: result }),
  setSelectedFilter: (filter) => set({ selectedFilter: filter }),
  toggleExpandItem: (index) =>
    set((state) => {
      const key = String(index);
      const expanded = state.expandedItems.includes(key)
        ? state.expandedItems.filter((k) => k !== key)
        : [...state.expandedItems, key];
      return { expandedItems: expanded };
    }),
  resetState: () => set(initialState),

  simulateUploadAndVerify: async () => {
    set({ uploadStatus: 'uploading', uploadProgress: 0 });

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        set({ uploadProgress: 100, uploadStatus: 'verifying' });

        setTimeout(() => {
          const { workers } = get();
          const anomalies: AnomalyItem[] = [];
          
          const sampleWorkers = workers.slice(0, 10);
          let matchedCount = workers.length - 3;
          let totalAmount = 0;
          let matchedAmount = 0;

          workers.forEach(w => {
            totalAmount += w.monthlySalary;
            if (w.status === 'active') {
              matchedAmount += w.monthlySalary;
            }
          });

          sampleWorkers.forEach((w, i) => {
            if (i === 0) {
              anomalies.push({
                type: 'person_mismatch',
                name: w.name,
                idCard: w.idCard,
                expected: '在职',
                actual: '未找到',
                description: '系统中未找到该人员信息，可能为新入职人员或身份证号有误',
              });
            } else if (i === 1) {
              anomalies.push({
                type: 'person_mismatch',
                name: w.name,
                idCard: w.idCard,
                expected: '在职',
                actual: '已离职',
                description: '该人员已离职，但工资表中仍有记录',
              });
            } else if (i === 2) {
              anomalies.push({
                type: 'amount_mismatch',
                name: w.name,
                idCard: w.idCard,
                expected: w.monthlySalary,
                actual: w.monthlySalary - 500,
                description: `工资金额差异：应发工资与系统记录相差500元`,
              });
            } else if (i === 3) {
              anomalies.push({
                type: 'attendance_mismatch',
                name: w.name,
                idCard: w.idCard,
                expected: 22,
                actual: 20,
                description: '考勤天数差异：系统记录出勤22天，工资表按20天计算',
              });
            }
          });

          const result: SalaryVerifyResult = {
            totalWorkers: workers.length,
            matchedWorkers: matchedCount,
            unmatchedWorkers: workers.length - matchedCount,
            totalAmount,
            matchedAmount,
            unmatchedAmount: totalAmount - matchedAmount,
            status: anomalies.length === 0 ? 'passed' : anomalies.length > 5 ? 'error' : 'warning',
            anomalies,
          };

          set({ verifyResult: result, uploadStatus: 'success' });
        }, 1500);
      } else {
        set({ uploadProgress: progress });
      }
    }, 200);
  },

  processAndVerifyExcel: (excelData: Record<string, unknown>[]) => {
    const { workers } = get();
    const anomalies: AnomalyItem[] = [];

    if (!excelData || excelData.length === 0) {
      return false;
    }

    const firstRow = excelData[0];
    const nameKey = findKey(firstRow, NAME_KEYS);
    const idCardKey = findKey(firstRow, IDCARD_KEYS);
    const amountKey = findKey(firstRow, AMOUNT_KEYS);
    const attendanceKey = findKey(firstRow, ATTENDANCE_KEYS);

    if (!nameKey || !idCardKey || !amountKey) {
      return false;
    }

    const activeWorkers = workers.filter(w => w.status === 'active');
    const excelIdCards = new Set<string>();

    let totalExcelWorkers = 0;
    let matchedWorkers = 0;
    let nameMismatchCount = 0;
    let extraPersonCount = 0;
    let missingPersonCount = 0;
    let totalAmount = 0;
    let matchedAmount = 0;

    excelData.forEach((row) => {
      const name = String(row[nameKey] ?? '').trim();
      const idCard = String(row[idCardKey] ?? '').trim();
      const amountRaw = row[amountKey];
      const attendanceRaw = attendanceKey ? row[attendanceKey] : undefined;

      if (!name || !idCard) return;

      totalExcelWorkers++;
      excelIdCards.add(idCard);
      const amount = typeof amountRaw === 'number' ? amountRaw : parseFloat(String(amountRaw)) || 0;
      totalAmount += amount;

      const systemWorker = workers.find(w => w.idCard === idCard);

      if (!systemWorker) {
        extraPersonCount++;
        anomalies.push({
          type: 'person_mismatch',
          name,
          idCard,
          expected: '系统无记录',
          actual: '工资表有记录',
          description: `【多出人员】系统实名制数据库中无此人员（身份证：${idCard}），请核实是否为新入职未登记人员`,
        });
        return;
      }

      if (systemWorker.name !== name) {
        nameMismatchCount++;
        anomalies.push({
          type: 'person_mismatch',
          name,
          idCard,
          expected: systemWorker.name,
          actual: name,
          description: `【姓名不一致】身份证号${idCard}在系统中登记姓名为「${systemWorker.name}」，但工资表中为「${name}」`,
        });
        return;
      }

      if (systemWorker.status !== 'active') {
        anomalies.push({
          type: 'person_mismatch',
          name,
          idCard,
          expected: '已离职',
          actual: '工资表有记录',
          description: `【已离职人员】该人员已于${systemWorker.status === 'left' ? '上月' : '近期'}离职，但工资表中仍有发放记录`,
        });
        return;
      }

      let rowMatched = true;

      if (Math.abs(amount - systemWorker.monthlySalary) > 100) {
        rowMatched = false;
        anomalies.push({
          type: 'amount_mismatch',
          name,
          idCard,
          expected: systemWorker.monthlySalary,
          actual: amount,
          description: `【金额差异】系统标准工资${systemWorker.monthlySalary}元，工资表实发${amount}元，相差${Math.abs(amount - systemWorker.monthlySalary)}元`,
        });
      }

      if (attendanceRaw !== undefined && attendanceRaw !== null && attendanceRaw !== '') {
        const attendance = typeof attendanceRaw === 'number' ? attendanceRaw : parseFloat(String(attendanceRaw)) || 0;
        if (Math.abs(attendance - systemWorker.expectedAttendance) > 2) {
          rowMatched = false;
          anomalies.push({
            type: 'attendance_mismatch',
            name,
            idCard,
            expected: systemWorker.expectedAttendance,
            actual: attendance,
            description: `【考勤差异】系统标准出勤${systemWorker.expectedAttendance}天，工资表按${attendance}天计算`,
          });
        }
      }

      if (rowMatched) {
        matchedWorkers++;
        matchedAmount += amount;
      }
    });

    activeWorkers.forEach(worker => {
      if (!excelIdCards.has(worker.idCard)) {
        missingPersonCount++;
        anomalies.push({
          type: 'person_mismatch',
          name: worker.name,
          idCard: worker.idCard,
          expected: '应发薪',
          actual: '未在工资表中',
          description: `【漏发人员】该在职人员（${worker.name}，身份证：${worker.idCard}）本月应发薪但工资表中无记录`,
        });
      }
    });

    const totalPersonCount = activeWorkers.length;
    const anomalyCount = anomalies.length;
    let status: SalaryVerifyResult['status'] = 'passed';
    if (anomalyCount > 0) {
      const personErrors = nameMismatchCount + extraPersonCount + missingPersonCount;
      status = personErrors >= 3 || anomalyCount >= 8 ? 'error' : 'warning';
    }

    const result: SalaryVerifyResult = {
      totalWorkers: totalExcelWorkers,
      systemActiveWorkers: totalPersonCount,
      matchedWorkers,
      nameMismatchCount,
      extraPersonCount,
      missingPersonCount,
      unmatchedWorkers: totalExcelWorkers - matchedWorkers + missingPersonCount,
      totalAmount,
      matchedAmount,
      unmatchedAmount: totalAmount - matchedAmount,
      status,
      anomalies,
    };

    set({ verifyResult: result });
    return true;
  },
}));
