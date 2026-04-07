const fs = require('fs');
const file = fs.readFileSync('/Users/dulaidila/.gemini/antigravity/scratch/minilife/src/components/VirtualPet/VirtualPetDashboard.jsx', 'utf8');

let newFile = file.replace(
  /<div className="w-full h-full flex flex-col md:flex-row overflow-hidden relative" style={{ background: '#F4F4F0' }}>[\s\S]*?(?=<\!-- Game Canvas -->)/,
  `<div className="w-full h-full flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative" style={{ background: '#F4F4F0' }}>
                {/* ── MAIN CONTENT: full-bleed canvas ── */}
                <div className="w-full aspect-square md:w-auto md:aspect-auto md:flex-1 md:h-full relative overflow-hidden bg-[#e0dbd3] flex-shrink-0 flex items-center justify-center">
                    `
);

newFile = newFile.replace(
  /<\!-- Game Canvas -->[\s\S]*?<div className="flex-1 flex flex-col min-h-0">[\s\S]*?{/\* Canvas fills remaining space \*/}[\s\S]*?<div className="flex-1 relative overflow-hidden">[\s\S]*?<div className="w-full h-full relative overflow-hidden"[\s\S]*?ref={containerRef}[\s\S]*?>/,
  `{/* Game Canvas */}
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center relative overflow-hidden"
                        ref={containerRef}
                    >`
);

newFile = newFile.replace(
  /<\/div>{\/\* \/canvas inner \*\/}[\s\S]*?<\/div>{\/\* \/canvas flex-1 \*\/}[\s\S]*?<\/div>{\/\* \/LEFT column \(flex-col\) \*\/}[\s\S]*?{/\* RIGHT: Controls panel \(Stacked on Mobile, Right side on PC\) \*/}[\s\S]*?<div className="flex flex-col w-full md:w-\[320px\] flex-1 md:flex-shrink-0 overflow-y-auto"[\s\S]*?style={{ background: '#F4F4F0', borderLeft: '4px solid #111827', zIndex: 20 }}>/,
  `</div>{/* /container bounds */}
                </div>{/* /MAIN CONTENT */}

                {/* RIGHT: Controls panel */}
                <div className="flex flex-col w-full md:w-[360px] flex-shrink-0 md:h-full overflow-visible md:overflow-y-auto relative z-20 border-t-4 md:border-t-0 md:border-l-4 border-gray-900 bg-[#F4F4F0] min-h-max">`
);


fs.writeFileSync('/Users/dulaidila/.gemini/antigravity/scratch/minilife/src/components/VirtualPet/VirtualPetDashboard.jsx', newFile);
console.log("Replaced");
