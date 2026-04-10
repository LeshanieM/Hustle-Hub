const fs = require('fs');
const path = require('path');
const adminDir = path.join(__dirname, 'client', 'src', 'pages', 'admin');
const filesToUpdate = ['AdminDashboard.jsx', 'UserDirectory.jsx', 'BusinessDirectory.jsx', 'AdminAIInsights.jsx', 'AuditLogs.jsx'];
filesToUpdate.forEach(file => {
  const filePath = path.join(adminDir, file);
  if(fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/<DashboardLayout\s*([\s\S]*?)>/, (match, inner) => {
      if(!inner.includes('showSearch={false}')) {
        return `<DashboardLayout ${inner}\n      showSearch={false}>`;
      }
      return match;
    });
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
