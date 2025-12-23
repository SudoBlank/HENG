/**
 * Parser for ENG Language
 * Builds AST from tokens
 */

class ASTNode {
  constructor(type, attributes = {}) {
    this.type = type;
    this.attributes = attributes;
    this.children = [];
  }

  addChild(node) {
    this.children.push(node);
    return this;
  }
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
    this.ast = null;
  }

  parse() {
    const root = new ASTNode('ROOT');

    while (!this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) {
        root.addChild(stmt);
      }
    }

    return root;
  }

  parseStatement() {
    const token = this.peek();

    if (token.type === 'KEYWORD') {
      if (token.value === 'create') {
        return this.parseCreate();
      } else if (token.value === 'add') {
        return this.parseAdd();
      } else if (token.value === 'function') {
        return this.parseFunction();
      } else if (token.value === 'import') {
        return this.parseImport();
      } else if (token.value === 'script' || token.value === 'cscript' || token.value === 'cstyle') {
        return this.parseScriptOrStyle();
      } else if (token.value === 'tite' || token.value === 'title') {
        return this.parseTitle();
      }
    }

    // Unrecognized token - skip
    this.advance();
    return null;
  }

  parseFunction() {
    this.consume('KEYWORD', 'function');
    const nameToken = this.peek();
    let name = 'anonymous';
    if (nameToken.type === 'IDENTIFIER') {
      name = nameToken.value;
      this.advance();
    }

    const node = new ASTNode('FUNCTION', { name });

    // Gather statements inside function until next 'function' or EOF
    while (!this.isAtEnd() && this.peek().value !== 'function') {
      const stmt = this.parseStatement();
      if (stmt) node.addChild(stmt);
      // Prevent infinite loop if parseStatement doesn't advance
      if (this.peek().type === 'EOF') break;
    }

    return node;
  }

  parseImport() {
    this.consume('KEYWORD', 'import');
    const typeTok = this.peek();
    let importType = null;
    if (typeTok.type === 'IDENTIFIER' || typeTok.type === 'KEYWORD') {
      importType = typeTok.value;
      this.advance();
    }

    // accept 'from' or 'form'
    if (this.peek().type === 'KEYWORD' && (this.peek().value === 'from' || this.peek().value === 'form')) {
      this.advance();
    }

    let path = null;
    if (this.peek().type === 'PATH') {
      path = this.consume('PATH').value;
      // optional extension token after ] like .js parsed as IDENTIFIER 'js'
      if (this.peek().type === 'IDENTIFIER') {
        const ext = this.peek().value;
        if (['js', 'ts', 'css', 'ceng', 'seng'].includes(ext)) {
          this.advance();
          path = path + '.' + ext;
        }
      }
    }

    return new ASTNode('IMPORT', { importType, path });
  }

  parseScriptOrStyle() {
    const token = this.peek();
    const kind = token.value; // 'script', 'cscript', 'cstyle'
    this.advance();

    // optional 'with' attributes after keyword
    const attrs = [];
    if (this.peek().type === 'KEYWORD' && this.peek().value === 'with') {
      this.advance();
      while (!this.isAtEnd() && (this.peek().type === 'IDENTIFIER' || this.peek().type === 'KEYWORD')) {
        const v = this.peek().value;
        if (v === 'and') { this.advance(); continue; }
        attrs.push(v);
        this.advance();
      }
    }

    return new ASTNode('SCRIPT_BLOCK', { kind, attrs });
  }

  parseTitle() {
    // 'tite' or 'title' followed by STRING
    this.advance();
    let content = '';
    if (this.peek().type === 'STRING') {
      content = this.consume('STRING').value;
    }
    return new ASTNode('TITLE', { content });
  }

  parseCreate() {
    this.consume('KEYWORD', 'create');
    const elementToken = this.peek();

    if (elementToken.value === 'page') {
      this.advance();
      const node = new ASTNode('PAGE');
      this.parseBlock(node);
      return node;
    }

    return null;
  }

  parseAdd() {
    this.consume('KEYWORD', 'add');
    const elementToken = this.peek();
    const elementType = elementToken.value;

    this.advance();

    const attributes = {};
    let content = '';

    // Read content if string follows
    if (this.peek().type === 'STRING') {
      content = this.consume('STRING').value;
    }

    // optional attributes: 'with' attr1 and attr2
    const attrs = [];
    if (this.peek().type === 'KEYWORD' && this.peek().value === 'with') {
      this.advance();
      while (!this.isAtEnd() && (this.peek().type === 'IDENTIFIER' || this.peek().type === 'KEYWORD')) {
        const v = this.peek().value;
        if (v === 'and') { this.advance(); continue; }
        // stop if next statement starts
        if (v === 'create' || v === 'add' || v === 'function' || v === 'import') break;
        attrs.push(v);
        this.advance();
      }
    }

    const node = new ASTNode(elementType.toUpperCase(), { content, attrs });
    return node;
  }

  parseBlock(parentNode) {
    // In a real parser, indentation would be tracked
    // For now, we parse statements until we reach a non-indented keyword
    while (!this.isAtEnd() && this.peek().value !== 'EOF') {
      const token = this.peek();

      if (token.type === 'KEYWORD') {
        const stmt = this.parseStatement();
        if (stmt) parentNode.addChild(stmt);
      } else {
        // skip unrecognized
        this.advance();
      }
    }
  }

  peek() {
    return this.pos < this.tokens.length ? this.tokens[this.pos] : this.tokens[this.tokens.length - 1];
  }

  advance() {
    if (!this.isAtEnd()) {
      this.pos++;
    }
  }

  consume(expectedType, expectedValue = null) {
    const token = this.peek();

    if (token.type !== expectedType) {
      throw new Error(`Expected ${expectedType}, got ${token.type}`);
    }

    if (expectedValue && token.value !== expectedValue) {
      throw new Error(`Expected '${expectedValue}', got '${token.value}'`);
    }

    this.advance();
    return token;
  }

  isAtEnd() {
    return this.peek().type === 'EOF';
  }
}

module.exports = Parser;
