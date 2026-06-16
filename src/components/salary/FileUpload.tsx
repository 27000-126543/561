import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSalaryStore } from '@/store/useSalaryStore';
import * as XLSX from 'xlsx';

export default function FileUpload() {
  const {
    uploadStatus,
    uploadProgress,
    fileName,
    fileSize,
    setFileInfo,
    setUploadStatus,
    setUploadProgress,
    resetState,
    processAndVerifyExcel,
  } = useSalaryStore();

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        alert('请上传Excel文件（.xlsx, .xls, .csv格式）');
        return;
      }

      setFileInfo(file.name, file.size);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

          setUploadStatus('uploading');
          setUploadProgress(0);

          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
              setUploadProgress(100);
              setUploadStatus('verifying');

              setTimeout(() => {
                const success = processAndVerifyExcel(jsonData);
                if (success) {
                  setUploadStatus('success');
                } else {
                  alert('Excel格式不正确，请使用模板');
                  setUploadStatus('error');
                }
              }, 800);
            } else {
              setUploadProgress(progress);
            }
          }, 200);
        } catch (error) {
          console.error('Excel解析失败:', error);
          setUploadStatus('error');
        }
      };
      reader.readAsBinaryString(file);
    },
    [setFileInfo, setUploadStatus, setUploadProgress, processAndVerifyExcel]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    if (uploadStatus === 'idle' || uploadStatus === 'success' || uploadStatus === 'error') {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetState();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isProcessing = uploadStatus === 'uploading' || uploadStatus === 'verifying';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileSpreadsheet className="w-5 h-5 text-blue-600" />
        工资表上传
      </h2>

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300',
          isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50',
          isProcessing && 'cursor-default'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {uploadStatus === 'idle' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-base font-medium text-gray-900">拖拽文件到此处上传</p>
              <p className="text-sm text-gray-500 mt-1">
                或 <span className="text-blue-600 font-medium">点击选择文件</span>
              </p>
            </div>
            <p className="text-xs text-gray-400">支持 .xlsx, .xls, .csv 格式，文件大小不超过 10MB</p>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <div>
              <p className="text-base font-medium text-gray-900">{fileName}</p>
              <p className="text-sm text-gray-500 mt-1">
                {uploadStatus === 'uploading' ? '正在上传...' : '正在校验数据...'}
              </p>
            </div>
            <div className="max-w-md mx-auto">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{Math.round(uploadProgress)}%</p>
            </div>
          </div>
        )}

        {(uploadStatus === 'success' || uploadStatus === 'error') && (
          <div className="space-y-4">
            <div
              className={cn(
                'w-16 h-16 mx-auto rounded-full flex items-center justify-center',
                uploadStatus === 'success' ? 'bg-green-50' : 'bg-red-50'
              )}
            >
              {uploadStatus === 'success' ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <X className="w-8 h-8 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-base font-medium text-gray-900">{fileName}</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatFileSize(fileSize)}
              </p>
              <p
                className={cn(
                  'text-sm mt-2 font-medium',
                  uploadStatus === 'success' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {uploadStatus === 'success' ? '上传成功，校验完成' : '上传失败'}
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
              重新上传
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Excel模板：</span>
        </div>
        <button className="text-blue-600 hover:text-blue-700 font-medium">
          下载工资表模板
        </button>
      </div>
    </div>
  );
}
