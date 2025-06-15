const fs = require('fs');
const path = require('path');

// Новая цветовая схема
const colorMap = {
  // Заменяем зеленые цвета на #8D8741
  'bg-green-600': 'bg-olive-600',
  'bg-green-700': 'bg-olive-700', 
  'bg-green-800': 'bg-olive-800',
  'text-green-600': 'text-olive-600',
  'text-green-700': 'text-olive-700',
  'hover:bg-green-700': 'hover:bg-olive-700',
  'hover:bg-green-800': 'hover:bg-olive-800',
  'border-green-600': 'border-olive-600',
  'ring-green-600': 'ring-olive-600',
  
  // Заменяем кремовые цвета на #BC986A
  'bg-warm-cream': 'bg-warm-brown',
  'bg-warm-cream-light': 'bg-warm-brown-light',
  'bg-warm-cream-dark': 'bg-warm-brown-dark',
  'bg-warm-cream/95': 'bg-warm-brown/95',
  'bg-warm-cream/90': 'bg-warm-brown/90',
  'bg-warm-cream/80': 'bg-warm-brown/80',
  'bg-warm-cream/30': 'bg-warm-brown/30',
  'bg-warm-cream/25': 'bg-warm-brown/25',
  'bg-warm-cream/20': 'bg-warm-brown/20',
  'bg-warm-cream/15': 'bg-warm-brown/15',
  'bg-warm-cream/10': 'bg-warm-brown/10',
  
  // Primary цвета
  'bg-primary': 'bg-olive-600',
  'text-primary': 'text-olive-600',
  'hover:text-primary': 'hover:text-olive-600'
};

// Функция для рекурсивного поиска файлов
function findFiles(dir, extensions = ['.tsx', '.ts', '.css']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Пропускаем node_modules и другие служебные папки
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Функция для замены цветов в файле
function replaceColorsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Применяем все замены из colorMap
    Object.entries(colorMap).forEach(([oldColor, newColor]) => {
      const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(oldColor)) {
        content = content.replace(regex, newColor);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Основная функция
function replaceColors() {
  console.log('🎨 Starting color replacement...\n');
  
  const projectRoot = process.cwd();
  const files = findFiles(projectRoot);
  
  let updatedCount = 0;
  
  files.forEach(file => {
    if (replaceColorsInFile(file)) {
      updatedCount++;
    }
  });
  
  console.log(`\n🎉 Color replacement completed!`);
  console.log(`📊 Updated ${updatedCount} files out of ${files.length} processed.`);
  
  // Показываем примененную цветовую схему
  console.log('\n🎨 Applied color scheme:');
  console.log('• Olive (primary): #8D8741');
  console.log('• Warm Brown (background): #BC986A'); 
  console.log('• Balance (accent): #DAAD86');
  console.log('• Dark (text): #5D5C61');
}

// Запускаем скрипт
if (require.main === module) {
  replaceColors();
}

module.exports = { replaceColors, colorMap }; 