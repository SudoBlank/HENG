/** Simple Ceng Compiler - Direct English to CSS translation */

const fs = require('fs');
const path = require('path');

function compileCeng(inputPath) {
  try {
    const source = fs.readFileSync(inputPath, 'utf-8');
    // Support raw passthrough: a .ceng file that starts with '@raw' will be returned as-is (after the marker)
    if (source.trim().startsWith('@raw')) {
      const raw = source.split('\n').slice(1).join('\n');
      const outputPath = inputPath.replace('.ceng', '.css');
      fs.writeFileSync(outputPath, raw);
      console.log(`✓ Ceng (raw) passthrough: ${outputPath}`);
      return raw;
    }
    let output = '';

    const lines = source.split('\n');
    for (let raw of lines) {
      let line = raw.trim();

      // Skip comments and empty lines
      if (!line || line.startsWith('--')) continue;

      // for body { → body {
      if (line.toLowerCase().startsWith('for ')) {
        line = line.replace(/^for\s+/i, '');
      }

      // handle 'class NAME' -> .NAME and 'id NAME' or 'ID NAME' -> #NAME
      const classMatch = line.match(/^class\s+(\w+)(\s*\{|$)/i);
      if (classMatch) {
        line = line.replace(/^class\s+(\w+)/i, `.${classMatch[1]}`);
      }
      const idMatch = line.match(/^id\s+(\w+)(\s*\{|$)/i);
      if (idMatch) {
        line = line.replace(/^id\s+(\w+)/i, `#${idMatch[1]}`);
      }

      // when hover { → :hover {
      if (/\bwhen\b/i.test(line)) {
        const match = line.match(/^(.+?)\s+when\s+(\w+)\s*{/i);
        if (match) {
          line = match[1] + ':' + match[2] + ' {';
        }
      }

      // Translate property keywords (case-insensitive)
      line = line.replace(/^background:\s*/i, 'background-color: ');
      line = line.replace(/^bg:\s*/i, 'background-color: ');
      line = line.replace(/^size:\s*/i, 'font-size: ');
      line = line.replace(/^color:\s*/i, 'color: ');
      line = line.replace(/^padding:\s*/i, 'padding: ');
      line = line.replace(/^margin:\s*/i, 'margin: ');
      line = line.replace(/^border:\s*/i, 'border: ');
      line = line.replace(/^font:\s*/i, 'font-family: ');
      line = line.replace(/^width:\s*/i, 'width: ');
      line = line.replace(/^height:\s*/i, 'height: ');
      line = line.replace(/^display:\s*/i, 'display: ');
      line = line.replace(/^flex:\s*/i, 'flex-direction: ');

      // Ensure property lines end with semicolon (skip selector/open/close lines)
      if (!line.endsWith('{') && !line.endsWith('}') && !line.endsWith(';')) {
        line = line + ';';
      }

      output += line + '\n';
    }

    const outputPath = inputPath.replace('.ceng', '.css');
    fs.writeFileSync(outputPath, output);

    console.log(`✓ Ceng compilation successful: ${outputPath}`);
    return output;
  } catch (err) {
    console.error(`✗ Ceng compilation error: ${err.message}`);
    throw err;
  }
}

module.exports = compileCeng;

if (require.main === module) {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node compiler.js <input.ceng>');
    process.exit(1);
  }
  compileCeng(path.resolve(inputPath));
}
