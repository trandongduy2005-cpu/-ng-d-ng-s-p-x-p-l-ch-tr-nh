import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Share2,
  Copy,
  Check,
  Eye,
  Edit3,
  Users,
  Shield,
  X,
  UserPlus,
  Lock,
  Globe,
} from 'lucide-react';

export const ShareModal: React.FC = () => {
  const {
    isShareModalOpen,
    setIsShareModalOpen,
    shareConfig,
    updateShareConfig,
    language,
  } = useApp();

  const isVi = language === 'vi';
  const [selectedPermission, setSelectedPermission] = useState<'view' | 'edit'>(
    shareConfig.permission
  );
  const [copied, setCopied] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [collaborators, setCollaborators] = useState(shareConfig.collaborators || []);

  if (!isShareModalOpen) return null;

  const currentShareUrl = updateShareConfig(selectedPermission);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setCollaborators((prev) => [
      ...prev,
      {
        name: newEmail.split('@')[0],
        email: newEmail.trim(),
        role: selectedPermission === 'edit' ? 'Editor' : 'Viewer',
      },
    ]);
    setNewEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-purple-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                {isVi ? 'Chia Sẻ & Làm Việc Nhóm' : 'Share & Team Collaboration'}
              </h3>
              <p className="text-xs text-slate-500">
                {isVi
                  ? 'Chia sẻ liên kết với 2 quyền: Chỉ xem hoặc Xem & Chỉnh sửa'
                  : 'Share plan with 2 permission options: View only or Edit'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsShareModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Roles Selector (Chỉ xem / Xem & sửa) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            {isVi ? 'Chọn quyền truy cập của liên kết:' : 'Select link permission:'}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* View Only */}
            <div
              onClick={() => setSelectedPermission('view')}
              className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2 ${
                selectedPermission === 'view'
                  ? 'border-purple-600 bg-purple-50/50'
                  : 'border-slate-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
                  <Eye className="w-4 h-4" />
                </span>
                {selectedPermission === 'view' && (
                  <Check className="w-4 h-4 text-purple-600" />
                )}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-slate-800">
                  {isVi ? '1. Chỉ xem' : '1. View Only'}
                </p>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  {isVi
                    ? 'Người nhận chỉ có thể xem lịch, không chỉnh sửa dữ liệu.'
                    : 'Recipients can view the plan, but cannot edit.'}
                </p>
              </div>
            </div>

            {/* View and Edit */}
            <div
              onClick={() => setSelectedPermission('edit')}
              className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2 ${
                selectedPermission === 'edit'
                  ? 'border-pink-500 bg-pink-50/50'
                  : 'border-slate-200 hover:border-pink-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded-xl bg-pink-100 text-pink-700">
                  <Edit3 className="w-4 h-4" />
                </span>
                {selectedPermission === 'edit' && (
                  <Check className="w-4 h-4 text-pink-600" />
                )}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-slate-800">
                  {isVi ? '2. Xem và chỉnh sửa' : '2. View & Edit'}
                </p>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  {isVi
                    ? 'Đồng đội có thể thêm, sửa, đánh dấu hoàn thành cùng bạn.'
                    : 'Teammates can add events, tasks, and edit collaboratively.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Link Field with 1-click copy */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {isVi ? 'Liên kết chia sẻ của bạn:' : 'Shareable Link:'}
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={currentShareUrl}
              className="flex-1 bg-transparent px-3 py-1 text-xs text-slate-700 outline-none font-mono select-all truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs shadow-xs hover:opacity-95 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Đã chép!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Sao chép link' : 'Copy Link'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Team Collaborators List */}
        <div className="space-y-2.5 pt-2 border-t border-purple-100 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>{isVi ? 'Thành viên đang tham gia:' : 'Active Collaborators:'}</span>
            </span>
            <span className="text-[11px] text-slate-400">
              {collaborators.length} {isVi ? 'người' : 'members'}
            </span>
          </div>

          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {collaborators.length === 0 ? (
              <div className="p-3 text-center text-slate-400 italic text-[11px] bg-purple-50/40 rounded-xl border border-dashed border-purple-200">
                {isVi
                  ? 'Chưa có thành viên nào. Bạn có thể gửi link chia sẻ phía trên hoặc nhập email bên dưới để mời đồng đội!'
                  : 'No team members yet. Share the link above or invite via email below!'}
              </div>
            ) : (
              collaborators.map((c, i) => (
                <div
                  key={i}
                  className="p-2 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between text-[11px]"
                >
                  <div>
                    <span className="font-bold text-slate-800">{c.name}</span>
                    <span className="text-slate-400 block text-[10px]">{c.email}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      c.role === 'Owner'
                        ? 'bg-purple-600 text-white'
                        : c.role === 'Editor'
                        ? 'bg-pink-100 text-pink-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {c.role}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Quick Invite input */}
          <form onSubmit={handleAddCollaborator} className="flex gap-2 pt-1">
            <input
              type="email"
              placeholder={isVi ? 'Nhập email đồng đội cần mời...' : 'Enter teammate email to invite...'}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50/30 text-xs outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-800 font-bold hover:bg-purple-200 text-xs transition cursor-pointer"
            >
              + {isVi ? 'Mời' : 'Invite'}
            </button>
          </form>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setIsShareModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
          >
            {isVi ? 'Hoàn tất' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
