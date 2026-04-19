import React from 'react';
import { Icons } from '../../utils/Icons';

// Detect if a media item is a video
const isVideoItem = (item) => {
    const src  = typeof item === 'string' ? item : (item?.url || item?.data || '');
    const name = typeof item === 'object' ? (item?.name || '') : '';
    const type = typeof item === 'object' ? (item?.type || '') : '';
    return type.startsWith('video/') || src.startsWith('data:video') || /\.(mp4|mov|webm|avi|mkv)$/i.test(name);
};

export const ImagePreviewModal = ({ context }) => {
    const {
        showImagePreviewModal, setShowImagePreviewModal,
        previewImages, setPreviewImages,
        currentPreviewIndex, setCurrentPreviewIndex
    } = context;

    if (!showImagePreviewModal || !previewImages || previewImages.length === 0) return null;

    const currentItem = previewImages[currentPreviewIndex];
    const mediaSrc  = typeof currentItem === 'string' ? currentItem : (currentItem?.url || currentItem?.data || '');
    const mediaName = typeof currentItem === 'string' ? 'minilife-media' : (currentItem?.name || 'minilife-media');
    const isVideo   = isVideoItem(currentItem);

    const goPrev = (e) => { e.stopPropagation(); setCurrentPreviewIndex(prev => prev > 0 ? prev - 1 : previewImages.length - 1); };
    const goNext = (e) => { e.stopPropagation(); setCurrentPreviewIndex(prev => prev < previewImages.length - 1 ? prev + 1 : 0); };
    const close  = () => { setShowImagePreviewModal(false); setPreviewImages([]); };

    return (
        <div className="fixed inset-0 z-[20000] flex flex-col animate-fade-in" style={{ background: '#000' }}>

            {/* ── Header toolbar ── */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)', paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
                <div className="flex items-center gap-2">
                    <div className="text-[12px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                        {currentPreviewIndex + 1} / {previewImages.length}
                    </div>
                    {isVideo && (
                        <div className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.3)', color: '#93C5FD' }}>
                            <Icons.Video size={11} /> 视频
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* Download — only for images */}
                    {!isVideo && (
                        <a href={mediaSrc} download={mediaName}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                            style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)' }}
                            title="下载">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" x2="12" y1="15" y2="3" />
                            </svg>
                        </a>
                    )}
                    <button onClick={close}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                        style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)' }}>
                        <Icons.X size={20} />
                    </button>
                </div>
            </div>

            {/* ── Main media area ── */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* Left arrow */}
                {previewImages.length > 1 && (
                    <button onClick={goPrev}
                        className="absolute left-2 md:left-6 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all"
                        style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                        <Icons.ChevronLeft size={26} />
                    </button>
                )}

                {/* Media content */}
                {isVideo ? (
                    <video
                        key={mediaSrc}
                        src={mediaSrc}
                        controls
                        playsInline
                        preload="metadata"
                        className="max-w-full max-h-full rounded-lg shadow-2xl"
                        style={{ maxHeight: 'calc(100vh - 120px)', outline: 'none', background: '#000' }}
                    />
                ) : (
                    <img
                        key={mediaSrc}
                        src={mediaSrc}
                        alt={mediaName}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        style={{ maxHeight: 'calc(100vh - 120px)' }}
                    />
                )}

                {/* Right arrow */}
                {previewImages.length > 1 && (
                    <button onClick={goNext}
                        className="absolute right-2 md:right-6 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all"
                        style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                        <Icons.ChevronRight size={26} />
                    </button>
                )}
            </div>

            {/* ── Dot indicators ── */}
            {previewImages.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1.5 pb-6"
                    style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
                    {previewImages.map((item, i) => (
                        <button key={i} onClick={() => setCurrentPreviewIndex(i)}
                            className="rounded-full transition-all"
                            style={{
                                width: i === currentPreviewIndex ? 20 : 6,
                                height: 6,
                                background: i === currentPreviewIndex ? '#fff' : 'rgba(255,255,255,0.35)'
                            }} />
                    ))}
                </div>
            )}
        </div>
    );
};
