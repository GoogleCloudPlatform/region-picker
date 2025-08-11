const fs = require('fs');
const crypto = require('crypto');
const htmlFile = 'index.html';
const yamlFile = 'app.yaml';

const htmlContent = fs.readFileSync(htmlFile, 'utf-8');

// Extract inline scripts
const inlineScripts = [...htmlContent.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)]
  .map(match => match[1])
  .filter(script => script.length > 0);

// Generate SHA-256 hashes
const shaHashes = inlineScripts.map(script => {
  const hash = crypto.createHash('sha256').update(script).digest('base64');
  return `'sha256-${hash}'`;

});

// Construct CSP value
const cspValue = `base-uri 'none'; object-src 'none'; script-src 'unsafe-inline' 'strict-dynamic' ${shaHashes.join(' ')} http: https:; connect-src 'self';`;

let yamlContent = fs.readFileSync(yamlFile, 'utf-8');

// Regex to match each http_headers block
const httpHeadersRegex = /(http_headers:\s*\n((?:\s{6,}[^\n]*\n)*))/g;

// Replace or insert CSP in each block
yamlContent = yamlContent.replace(httpHeadersRegex, (match, headerBlock, innerHeaders) => {
  let lines = innerHeaders.trimEnd().split('\n');

  const cspLine = `      Content-Security-Policy: "${cspValue}"`;
  const hasCSP = lines.some(line => line.trim().startsWith('Content-Security-Policy:'));

  if (hasCSP) {
    lines = lines.map(line => {
      if (line.trim().startsWith('Content-Security-Policy:')) {
        return cspLine;
      }
      return line;
    });
  } else {
    lines.push(cspLine);
  }

  return `http_headers:\n${lines.join('\n')}\n`;
});

fs.writeFileSync(yamlFile, yamlContent, 'utf-8');
