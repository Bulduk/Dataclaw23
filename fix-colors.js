import fs from 'fs';
import path from 'path';

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.match(/#fff|#ffffff|text-white|bg-\[#0B0D11\]|bg-\[#050505\]|bg-\[#1A1E29\]|bg-\[#1A1A24\]|bg-\[#12151C\]/i)) {
    content = content.replace(/color:\s*['"]#fff['"]/g, 'color:"var(--nexus-text)"');
    content = content.replace(/color:\s*['"]#ffffff['"]/g, 'color:"var(--nexus-text)"');
    content = content.replace(/\btext-white\b/g, 'text-gray-900 dark:text-white');
    content = content.replace(/\bbg-\[#0B0D11\]\b/g, 'bg-white dark:bg-slate-900');
    content = content.replace(/\bbg-\[#050505\]\b/g, 'bg-gray-50 dark:bg-slate-950');
    content = content.replace(/\bbg-\[#12151C\]\b/g, 'bg-gray-100 dark:bg-slate-800');
    content = content.replace(/\bbg-\[#1A1A24\]\b/g, 'bg-gray-200 dark:bg-slate-800');
    content = content.replace(/\bbg-\[#1A1E29\]\b/g, 'bg-gray-200 dark:bg-slate-800');
    changed = true;
  }
  
  if (file.includes('BottomNav.tsx')) {
     if (content.includes('bg-[#0a0a0a]')) {
         content = content.replace(/\bbg-\[#0a0a0a\]\b/g, 'bg-white dark:bg-[#0f172a]');
         changed = true;
     }
  }

  if (file.includes('AdminPanel.tsx')) {
    content = content.replace(/className="flex flex-wrap border-b border-white\/5 bg-black\/30 shrink-0 gap-1 p-2"/g, 'className="grid grid-cols-5 md:flex md:flex-wrap border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/30 shrink-0 gap-2 p-4"');
    content = content.replace(/'text-\[\#FF4D6D\]'/g, "'text-blue-500'");
    content = content.replace(/'bg-white\/10 border-white\/20'/g, "'bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 shadow-sm'");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
  }
});
