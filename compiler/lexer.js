/**
 * Lexer for ENG Language
 * Tokenizes ENG source code
 */

class Token {
  constructor(type, value, line, column) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }
}

class Lexer {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
  }

  tokenize() {
    while (this.pos < this.source.length) {
      this.skipWhitespace();
      if (this.pos >= this.source.length) break;

      const char = this.source[this.pos];

      if (char === '"') {
        this.readString();
      } else if (char === '[') {
        this.readPath();
      } else if (char === '\n') {
        this.pos++;
        this.line++;
        this.column = 1;
      } else if (/[a-zA-Z]/.test(char)) {
        this.readWord();
      } else {
        this.pos++;
        this.column++;
      }
    }

    this.tokens.push(new Token('EOF', '', this.line, this.column));
    return this.tokens;
  }

  skipWhitespace() {
    while (this.pos < this.source.length && /[ \t\r]/.test(this.source[this.pos])) {
      this.pos++;
      this.column++;
    }
  }

  // Read a path enclosed in [ ... ]
  readPath() {
    const startLine = this.line;
    const startColumn = this.column;
    this.pos++; // skip '['
    this.column++;
    let value = '';

    while (this.pos < this.source.length && this.source[this.pos] !== ']') {
      value += this.source[this.pos];
      this.pos++;
      this.column++;
    }

    if (this.pos < this.source.length) {
      this.pos++; // skip ']'
      this.column++;
    }

    this.tokens.push(new Token('PATH', value.trim(), startLine, startColumn));
  }

  readString() {
    const startLine = this.line;
    const startColumn = this.column;
    this.pos++; // skip opening quote
    this.column++;
    let value = '';

    while (this.pos < this.source.length && this.source[this.pos] !== '"') {
      if (this.source[this.pos] === '\\' && this.pos + 1 < this.source.length) {
        this.pos++;
        this.column++;
        const escaped = this.source[this.pos];
        value += escaped === 'n' ? '\n' : escaped;
      } else {
        value += this.source[this.pos];
      }
      this.pos++;
      this.column++;
    }

    if (this.pos < this.source.length) {
      this.pos++; // skip closing quote
      this.column++;
    }

    this.tokens.push(new Token('STRING', value, startLine, startColumn));
  }

  readWord() {
    const startColumn = this.column;
    let word = '';

    while (this.pos < this.source.length && /[a-zA-Z0-9_-]/.test(this.source[this.pos])) {
      word += this.source[this.pos];
      this.pos++;
      this.column++;
    }

    const keywords = [
      'create', 'page', 'add', 'heading', 'paragraph', 'button', 'link',
      'image', 'div', 'span', 'style', 'script', 'form', 'input', 'label',
      'select', 'option', 'textarea', 'table', 'row', 'cell', 'list', 'item',
      'code', 'section', 'article', 'nav', 'footer', 'header', 'title', 'meta',
      'function', 'import', 'from', 'form', 'with', 'and', 'cscript', 'cstyle', 'heng_verson', 'html_verson', 'tite'
    ];

    const type = keywords.includes(word.toLowerCase()) ? 'KEYWORD' : 'IDENTIFIER';
    this.tokens.push(new Token(type, word.toLowerCase(), this.line, startColumn));
  }
}

module.exports = Lexer;
