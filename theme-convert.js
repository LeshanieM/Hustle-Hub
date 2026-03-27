const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client/src');

function convertFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Colors & Opacities
    content = content.replace(/bg-white\/\[0\.01\]/g, 'bg-slate-50/50');
    content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-white');
    content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-white');
    content = content.replace(/bg-white\/\[0\.04\]/g, 'bg-slate-50');
    content = content.replace(/bg-white\/\[0\.05\]/g, 'bg-slate-50');
    content = content.replace(/bg-white\/10/g, 'bg-slate-100');
    
    content = content.replace(/border-white\/\[0\.02\]/g, 'border-slate-100');
    content = content.replace(/border-white\/\[0\.05\]/g, 'border-slate-200');
    content = content.replace(/border-white\/\[0\.1\]/g, 'border-slate-200');
    content = content.replace(/border-white\/10/g, 'border-slate-200');
    
    // Text colors
    content = content.replace(/text-white/g, 'text-slate-900');
    content = content.replace(/text-slate-400/g, 'text-slate-500');
    content = content.replace(/text-slate-300/g, 'text-slate-600');
    content = content.replace(/text-slate-500\/70/g, 'text-slate-400');
    // For EmptyState icon, to not be invisible
    content = content.replace(/text-slate-500/g, 'text-slate-400'); // wait, if text-slate-400 became 500 above... let's do this carefully.
    
    // Gradient text
    content = content.replace(/from-white via-slate-200 to-slate-500/g, 'from-slate-900 via-slate-700 to-slate-500');

    // Chart styles
    content = content.replace(/stroke="#334155"/g, 'stroke="#e2e8f0"');
    content = content.replace(/backgroundColor: '#0f172a'/g, "backgroundColor: '#ffffff'");
    content = content.replace(/border: '1px solid #334155'/g, "border: '1px solid #e2e8f0'");
    content = content.replace(/color: '#f8fafc'/g, "color: '#334155'");
    
    // Specific elements bg
    content = content.replace(/bg-slate-800/g, 'bg-white');
    content = content.replace(/bg-slate-900/g, 'bg-slate-50');
    content = content.replace(/border-slate-700/g, 'border-slate-200');

    // Inputs
    content = content.replace(/placeholder-slate-700/g, 'placeholder-slate-400');
    
    // Avoid double conversions on text-slate
    // Revert some text changes if needed, but simple string replacements is good enough for now.

    fs.writeFileSync(filePath, content, 'utf8');
}

// Convert component files
const files = [
    path.join(srcDir, 'pages/admin/Analytics.jsx'),
    path.join(srcDir, 'components/dashboard/TopProductsTable.jsx'),
    path.join(srcDir, 'components/dashboard/AlertPanel.jsx')
];

files.forEach(f => {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        
        // Custom text replacements to avoid cascading changes
        content = content.replace(/text-slate-500/g, 'TEXT_SLATE_500_TMP');
        content = content.replace(/text-slate-400/g, 'TEXT_SLATE_400_TMP');
        content = content.replace(/text-slate-300/g, 'TEXT_SLATE_300_TMP');
        
        content = content.replace(/TEXT_SLATE_500_TMP/g, 'text-slate-500'); 
        content = content.replace(/TEXT_SLATE_400_TMP/g, 'text-slate-500'); 
        content = content.replace(/TEXT_SLATE_300_TMP/g, 'text-slate-600'); 

        content = content.replace(/text-white/g, 'text-slate-900');
        
        content = content.replace(/bg-white\/\[0\.01\]/g, 'bg-slate-50/50');
        content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-white');
        content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-white');
        content = content.replace(/bg-white\/\[0\.04\]/g, 'bg-slate-50');
        content = content.replace(/bg-white\/\[0\.05\]/g, 'bg-slate-50');
        content = content.replace(/bg-white\/10/g, 'bg-slate-100');
        
        content = content.replace(/border-white\/\[0\.02\]/g, 'border-slate-100');
        content = content.replace(/border-white\/\[0\.05\]/g, 'border-slate-200');
        content = content.replace(/border-white\/\[0\.1\]/g, 'border-slate-200');
        content = content.replace(/border-white\/10/g, 'border-slate-200');
        
        content = content.replace(/from-white via-slate-200 to-slate-500/g, 'from-slate-900 via-slate-700 to-slate-500');
        
        // Chart styles
        content = content.replace(/stroke="#334155"/g, 'stroke="#e2e8f0"');
        content = content.replace(/backgroundColor: '#0f172a'/g, "backgroundColor: '#ffffff'");
        content = content.replace(/border: '1px solid #334155'/g, "border: '1px solid #e2e8f0'");
        content = content.replace(/color: '#f8fafc'/g, "color: '#334155'");
        
        // Specific elements bg
        content = content.replace(/bg-slate-800/g, 'bg-white');
        content = content.replace(/bg-slate-900/g, 'bg-slate-50');
        content = content.replace(/border-slate-700/g, 'border-slate-200');
    
        // Inputs
        content = content.replace(/placeholder-slate-700/g, 'placeholder-slate-400');

        content = content.replace(/theme="dark"/g, 'theme="white"');

        fs.writeFileSync(f, content, 'utf8');
        console.log('Converted', f);
    }
});

// Update OwnerLayout
const layoutFile = path.join(srcDir, 'components/dashboard/OwnerLayout.jsx');
if (fs.existsSync(layoutFile)) {
    let layoutContent = fs.readFileSync(layoutFile, 'utf8');
    layoutContent = layoutContent.replace(
        "theme === 'dark' ? 'bg-[#030712] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#030712] to-black text-slate-100' : 'bg-[#f6f6f8]'",
        "theme === 'dark' ? 'bg-[#030712] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#030712] to-black text-slate-100' : theme === 'white' ? 'bg-white text-slate-900' : 'bg-[#f6f6f8]'"
    );
    fs.writeFileSync(layoutFile, layoutContent, 'utf8');
    console.log('Updated OwnerLayout.jsx');
}
