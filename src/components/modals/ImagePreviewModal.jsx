import React from 'react';
import { Icons } from '../../utils/Icons';

export const ImagePreviewModal = ({ context }) => {
    const {
        showImagePreviewModal, setShowImagePreviewModal,
        previewImages, setPreviewImages,
        currentPreviewIndex, setCurrentPreviewIndex
    } = context;

    if (!showImagePreviewModal || !previewImages || previewImages.length === 0) return null;

    const currentImg = previewImages[currentPreviewIndex];
    const imgSrc = typeof currentImg === 'string' ? currentImg : (currentImg?.data || currentImg?.url || '');
    const imgName = typeof currentImg === 'string' ? 'minilife-evidence.jpg' : (currentImg?.name || 'minilife-evidence.jpg');

    return (
        <div className="fixed inset-0 bg-black/95 z-[20000] flex flex-col animate-fade-in">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between p-4 text-white/50 absolute top-0 left-0 right-0 z-10">
                <div className="text-sm font-bold bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    {currentPreviewIndex + 1} / {previewImages.length}
                </div>
                <div className="flex gap-4">
                    <a href={imgSrc} download={imgName}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm cursor-pointer"
                        title="下载原始图片">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                    </a>
                    <button onClick={() => { setShowImagePreviewModal(false); setPreviewImages([]); }}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm">
                        <Icons.X size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden p-4 md:p-8 mt-16 md:mt-0">
                {previewImages.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); setCurrentPreviewIndex(prev => (prev > 0 ? prev - 1 : previewImages.length - 1)); }}
                        className="absolute left-2 md:left-8 z-20 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all shadow-xl">
                        <Icons.ChevronLeft size={28} />
                    </button>
                )}
                <img src={imgSrc} alt={imgName} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-300" />
                {previewImages.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); setCurrentPreviewIndex(prev => (prev < previewImages.length - 1 ? prev + 1 : 0)); }}
                        className="absolute right-2 md:right-8 z-20 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all shadow-xl">
                        <Icons.ChevronRight size={28} />
                    </button>
                )}
            </div>
        </div>
    );
};
