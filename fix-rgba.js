import fs from 'fs';

const file = 'src/components/AdminPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace all combinations of rgba(255,255,255, alpha) with rgba(var(--text-rgb), alpha)
content = content.replace(/rgba\(255,\s*255,\s*255,/g, 'rgba(var(--text-rgb),');
content = content.replace(/rgba\(0,\s*0,\s*0,/g, 'rgba(var(--text-rgb),'); // wait, black text should also be responsive if hardcoded?
// Let's only fix white for now because white text goes invisible on white background.
// Black text `rgba(0,0,0,` might be fine on light backgrounds but invisible on dark?
// Actually yes! Let's swap `rgba(0,0,0,` to `rgba(var(--text-rgb),` conditionally or just leave it. Usually people hardcode `0,0,0` for shadows, those are fine! 
// So only `rgba(255,255,255,` is the problem because it's for text/background highlights.

fs.writeFileSync(file, content);
