// ═══════════════════════════════════════════════
// PixelIcon — 通用像素图标渲染组件
// 从 VirtualPetDashboard 提取
// ═══════════════════════════════════════════════
import React from 'react';

const PixelIcon = ({ grid, palette, size = 3, className = "" }) => {
    const boxSize = grid[0].length * size;
    let shadows = [];
    grid.forEach((row, y) => {
        for(let x = 0; x < row.length; x++) {
            const char = row[x];
            if (char !== ' ' && palette[char]) {
                shadows.push(`${x * size}px ${y * size}px 0 ${palette[char]}`);
            }
        }
    });
    return (
        <div className={`relative flex-shrink-0 origin-center ${className}`} style={{ width: boxSize, height: boxSize }}>
            <div className="absolute top-0 left-0 transition-transform group-hover:scale-[1.05]" style={{
                width: size, height: size,
                boxShadow: shadows.join(','),
                backgroundColor: 'transparent'
            }} />
        </div>
    );
};

export default PixelIcon;
