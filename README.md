# ENG / SENG / CENG Project

This workspace contains a simple toy language `heng` (ENG), plus two English-like DSLs:

- `seng` — English-like JavaScript (translates to `.js`)
- `ceng` — English-like CSS (translates to `.css`)

How to build the example bounce page:

```powershell
node seng/compiler.js examples/bounce.seng
node ceng/compiler.js examples/bounce.ceng
node compiler/compiler.js examples/bounce.heng
```

Commands are defined in `package.json`:

- `npm run build:heng` — build `examples/bounce.heng` into `examples/bounce.html`
- `npm run build:examples` — compile the demo example files and produce `examples/bounce.html`

If anything else is missing, tell me which files you expect and I will restore them next.
