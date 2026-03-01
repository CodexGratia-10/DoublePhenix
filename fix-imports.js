const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, searchRegex, replacement) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.match(searchRegex)) {
    console.log(`Fixing: ${filePath}`);
    fs.writeFileSync(filePath, content.replace(searchRegex, replacement), 'utf8');
  }
}

function processDirectory(directory, replacement) {
  if (!fs.existsSync(directory)) return;
  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const fullPath = path.join(directory, item);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath, replacement);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath, /from ['"]@\/lib\/utils['"]/g, `from '${replacement}'`);
    }
  }
}

const basePath = process.cwd();

console.log("Starting replacement...");

// Fix components
processDirectory(path.join(basePath, 'components', 'ui'), '../../lib/utils');
processDirectory(path.join(basePath, 'components', 'dashboard'), '../../lib/utils');

// Fix standard components
const compPath = path.join(basePath, 'components');
fs.readdirSync(compPath).forEach(item => {
  const fullPath = path.join(compPath, item);
  if (fs.statSync(fullPath).isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
    replaceInFile(fullPath, /from ['"]@\/lib\/utils['"]/g, "from '../lib/utils'");
  }
});

// Fix apps
processDirectory(path.join(basePath, 'app', '(app)'), '../../../lib/utils');
processDirectory(path.join(basePath, 'app', '(auth)'), '../../../lib/utils');

console.log('Done replacing imports.');
