/** Clean Code Generator for ENG Language */

class CodeGenerator {
  constructor(ast) {
    this.ast = ast;
    this.html = [];
    this.indentLevel = 0;
  }

  generate() {
    this.processNode(this.ast);
    return this.html.join('\n');
  }

  processNode(node) {
    if (!node) return;

    if (node.type === 'ROOT') {
      const imports = [];
      let title = null;

      node.children.forEach(child => {
        if (child.type === 'IMPORT') imports.push(child);
        if (child.type === 'FUNCTION' && child.attributes && child.attributes.name && child.attributes.name.startsWith('setup')) {
          child.children.forEach(c => {
            if (c.type === 'TITLE') title = c.attributes.content || title;
            if (c.type === 'IMPORT') imports.push(c);
          });
        }
      });

      this.html.push('<!DOCTYPE html>');
      this.html.push('<html>');
      this.indent();
      this.html.push(this.getIndent() + '<head>');
      this.indent();
      this.html.push(this.getIndent() + '<meta charset="UTF-8">');
      this.html.push(this.getIndent() + '<meta name="viewport" content="width=device-width, initial-scale=1.0">');
      this.html.push(this.getIndent() + `<title>${this.escapeHtml(title || 'ENG Page')}</title>`);

      imports.forEach(imp => {
        const t = imp.attributes.importType;
        const p = imp.attributes.path;
        const compiled = imp.attributes && imp.attributes.compiled;
        if (compiled) {
          if (t === 'seng' || (p && p.endsWith('.seng'))) {
            this.html.push(this.getIndent() + '<script>');
            // insert compiled JS raw (do not escape)
            const lines = String(compiled).split('\n');
            lines.forEach(l => this.html.push(this.getIndent() + '  ' + l));
            this.html.push(this.getIndent() + '</script>');
            return;
          } else if (t === 'ceng' || (p && p.endsWith('.ceng'))) {
            this.html.push(this.getIndent() + '<style>');
            const lines = String(compiled).split('\n');
            lines.forEach(l => this.html.push(this.getIndent() + '  ' + l));
            this.html.push(this.getIndent() + '</style>');
            return;
          }
        }

        // fallback: reference external files
        if (t && t.includes('js')) this.html.push(this.getIndent() + `<script src="${this.escapeHtml(p)}"></script>`);
        else if (t && t.includes('ts')) this.html.push(this.getIndent() + `<script type="module" src="${this.escapeHtml(p)}"></script>`);
        else if (t && (t.includes('css') || t.includes('ceng'))) this.html.push(this.getIndent() + `<link rel="stylesheet" href="${this.escapeHtml(p)}">`);
        else {
          if (p.endsWith('.js')) this.html.push(this.getIndent() + `<script src="${this.escapeHtml(p)}"></script>`);
          else if (p.endsWith('.css') || p.endsWith('.ceng')) this.html.push(this.getIndent() + `<link rel="stylesheet" href="${this.escapeHtml(p)}">`);
          else this.html.push(this.getIndent() + `<script src="${this.escapeHtml(p)}"></script>`);
        }
      });

      this.dedent();
      this.html.push(this.getIndent() + '</head>');

      this.html.push(this.getIndent() + '<body>');
      this.indent();

      node.children.forEach(child => {
        if (child.type === 'IMPORT') return;
        if (child.type === 'FUNCTION') {
          if (child.attributes && child.attributes.name && child.attributes.name.startsWith('setup')) return;
          child.children.forEach(c => this.processNode(c));
        } else {
          this.processNode(child);
        }
      });

      this.dedent();
      this.html.push(this.getIndent() + '</body>');
      this.dedent();
      this.html.push('</html>');

    } else if (node.type === 'PAGE') {
      node.children.forEach(child => this.processNode(child));

    } else if (node.type === 'HEADING') {
      const content = node.attributes.content || 'Heading';
      const extra = this.renderAttrs(node.attributes);
      this.html.push(this.getIndent() + `<h1${extra}>${this.escapeHtml(content)}</h1>`);

    } else if (node.type === 'PARAGRAPH') {
      const content = node.attributes.content || 'Paragraph';
      const extra = this.renderAttrs(node.attributes);
      this.html.push(this.getIndent() + `<p${extra}>${this.escapeHtml(content)}</p>`);

    } else if (node.type === 'BUTTON') {
      const content = node.attributes.content || 'Button';
      const extra = this.renderAttrs(node.attributes);
      this.html.push(this.getIndent() + `<button${extra}>${this.escapeHtml(content)}</button>`);

    } else if (node.type === 'LINK') {
      const content = node.attributes.content || 'Link';
      const extra = this.renderAttrs(node.attributes);
      this.html.push(this.getIndent() + `<a href="#"${extra}>${this.escapeHtml(content)}</a>`);

    } else if (node.type === 'IMAGE') {
      const content = node.attributes.content || '';
      const extra = this.renderAttrs(node.attributes);
      this.html.push(this.getIndent() + `<img src="${this.escapeHtml(content)}" alt="Image"${extra}>`);

    } else if (node.type === 'DIV') {
      const content = node.attributes.content || '';
      const extra = this.renderAttrs(node.attributes);
      this.html.push(this.getIndent() + `<div${extra}>`);
      if (content) {
        this.indent();
        // If content appears to be raw HTML (starts with '<'), include it unescaped
        if (String(content).trim().startsWith('<')) {
          const lines = String(content).split('\n');
          lines.forEach(l => this.html.push(this.getIndent() + l));
        } else {
          this.html.push(this.getIndent() + this.escapeHtml(content));
        }
        this.dedent();
      }
      this.html.push(this.getIndent() + '</div>');

    } else if (node.type === 'INPUT') {
      const extra = this.renderAttrs(node.attributes);
      this.html.push(this.getIndent() + `<input type="text"${extra}">`);

    } else if (node.type === 'LABEL') {
      const content = node.attributes.content || 'Label';
      const extra = this.renderAttrs(node.attributes);
      this.html.push(this.getIndent() + `<label${extra}>${this.escapeHtml(content)}</label>`);

    } else if (node.type === 'TITLE') {
      const content = node.attributes.content || 'Page Title';
      this.html.push(this.getIndent() + `<title>${this.escapeHtml(content)}</title>`);

    } else if (node.type === 'IMPORT') {
      return;

    } else if (node.type === 'SCRIPT_BLOCK') {
      const kind = node.attributes.kind;
      const attrs = node.attributes.attrs || [];
      if (kind === 'cstyle') {
        this.html.push(this.getIndent() + '<style>');
        this.html.push(this.getIndent() + '  /* custom style block */');
        this.html.push(this.getIndent() + '</style>');
      } else {
        const isTs = attrs.includes('ts');
        if (isTs) {
          this.html.push(this.getIndent() + '<script type="module">');
          this.html.push(this.getIndent() + '  // TypeScript (transpile required in production)');
          this.html.push(this.getIndent() + '</script>');
        } else {
          this.html.push(this.getIndent() + '<script>');
          this.html.push(this.getIndent() + '  // Inline script');
          this.html.push(this.getIndent() + '</script>');
        }
      }
    }
  }

  indent() { this.indentLevel++; }
  dedent() { if (this.indentLevel > 0) this.indentLevel--; }
  getIndent() { return '  '.repeat(this.indentLevel); }

  escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  renderAttrs(attributes = {}) {
    const attrs = attributes.attrs || [];
    if (!attrs || attrs.length === 0) return '';
    const classes = attrs.map(a => `with-${a}`).join(' ');
    const data = attrs.join(' ');
    return ` class="${this.escapeHtml(classes)}" data-with="${this.escapeHtml(data)}"`;
  }
}

module.exports = CodeGenerator;
