/**
 * Main Compiler for ENG Language
 * Orchestrates lexing, parsing, and code generation
 * Also compiles imported .seng and .ceng files
 */

const Lexer = require('./lexer');
const Parser = require('./parser');
const CodeGenerator = require('./codegen');
const fs = require('fs');
const path = require('path');

// Import seng and ceng compilers
const compileSeng = require('../seng/compiler');
const compileCeng = require('../ceng/compiler');

class EngCompiler {
  compile(sourceCode, basePath = './') {
    try {
      // Lexical analysis
      const lexer = new Lexer(sourceCode);
      const tokens = lexer.tokenize();

      // Parsing
      const parser = new Parser(tokens);
      const ast = parser.parse();

      // Pre-compile any imported .seng or .ceng files
      this.precompileImports(ast, basePath);

      // Code generation
      const codegen = new CodeGenerator(ast);
      const htmlCode = codegen.generate();

      return {
        success: true,
        html: htmlCode,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        html: null,
        error: error.message
      };
    }
  }

  precompileImports(ast, basePath) {
    if (!ast || !ast.children) return;

    const handleImportNode = (imp) => {
      if (!imp || !imp.attributes) return;
      const importPath = imp.attributes.path;
      if (!importPath) return;
      try {
        const fullPath = path.join(basePath, importPath);
        if (importPath.endsWith('.seng')) {
          // compile and attach JS output to the import node for inlining
          const js = compileSeng(fullPath);
          imp.attributes.compiled = js;
          imp.attributes.importType = 'seng';
        } else if (importPath.endsWith('.ceng')) {
          const css = compileCeng(fullPath);
          imp.attributes.compiled = css;
          imp.attributes.importType = 'ceng';
        }
      } catch (err) {
        console.warn(`Warning: Could not compile ${importPath}: ${err.message}`);
      }
    };

    ast.children.forEach(child => {
      if (child.type === 'IMPORT') handleImportNode(child);

      // Recursively check function bodies for imports
      if (child.type === 'FUNCTION' && child.children) {
        child.children.forEach(subchild => {
          if (subchild.type === 'BLOCK' && subchild.children) {
            subchild.children.forEach(stmt => {
              if (stmt.type === 'IMPORT') handleImportNode(stmt);
            });
          }
        });
      }
    });
  }

  compileFile(inputPath, outputPath) {
    try {
      if (!inputPath.endsWith('.heng')) {
        throw new Error('Input file must have .heng extension');
      }

      const sourceCode = fs.readFileSync(inputPath, 'utf-8');
      const basePath = path.dirname(inputPath);
      const result = this.compile(sourceCode, basePath);

      if (!result.success) {
        throw new Error(result.error);
      }

      const outPath = outputPath || inputPath.replace('.heng', '.html');
      fs.writeFileSync(outPath, result.html, 'utf-8');

      return {
        success: true,
        outputPath: outPath,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        outputPath: null,
        error: error.message
      };
    }
  }
}

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: compiler.js <inputFile.heng> [outputFile.html]');
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1];

  const compiler = new EngCompiler();
  const result = compiler.compileFile(inputFile, outputFile);

  if (result.success) {
    console.log(`✓ Compilation successful: ${result.outputPath}`);
  } else {
    console.error(`✗ Compilation failed: ${result.error}`);
    process.exit(1);
  }
}

module.exports = EngCompiler;
