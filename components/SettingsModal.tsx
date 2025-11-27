import React, { useState } from 'react';
import { X, Save, Key } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSave: (key: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentKey, onSave }) => {
  const [key, setKey] = useState(currentKey);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-900">系统设置</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Key className="w-4 h-4 text-gray-400" />
              Finnhub API 密钥 (Key)
            </label>
            <input 
              type="text" 
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="请输入 Finnhub Token..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm transition-all font-mono text-gray-600"
            />
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              用于获取美股实时行情。可在 finnhub.io 免费申请。默认已内置公共Key，如遇限流请替换为您自己的Key。
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button 
            onClick={() => { onSave(key); onClose(); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;