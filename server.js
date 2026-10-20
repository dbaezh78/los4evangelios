const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const PROJECT_FILE = path.join(ROOT_DIR, 'los_cuatro_evangelios_proyecto.json');
const BACKUP_FILE = path.join(ROOT_DIR, 'los_cuatro_evangelios_proyecto.bak.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 50 * 1024 * 1024) { // 50MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // API Endpoints
  if (pathname === '/api/status') {
    sendJSON(res, 200, { status: 'ok', serverTime: new Date().toISOString() });
    return;
  }

  // Load project state from disk
  if (pathname === '/api/load' && req.method === 'GET') {
    if (fs.existsSync(PROJECT_FILE)) {
      try {
        const raw = fs.readFileSync(PROJECT_FILE, 'utf8');
        const data = JSON.parse(raw);
        sendJSON(res, 200, { success: true, project: data });
      } catch (err) {
        sendJSON(res, 500, { success: false, error: 'Error al leer el archivo de proyecto: ' + err.message });
      }
    } else {
      sendJSON(res, 200, { success: true, project: null, message: 'No hay proyecto guardado previamente.' });
    }
    return;
  }

  // Save project state to disk
  if (pathname === '/api/save' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.project) {
        sendJSON(res, 400, { success: false, error: 'Datos de proyecto no proporcionados' });
        return;
      }

      // Create backup if previous file exists
      if (fs.existsSync(PROJECT_FILE)) {
        try {
          fs.copyFileSync(PROJECT_FILE, BACKUP_FILE);
        } catch (copyErr) {
          console.warn('No se pudo crear backup:', copyErr.message);
        }
      }

      fs.writeFileSync(PROJECT_FILE, JSON.stringify(body.project, null, 2), 'utf8');

      sendJSON(res, 200, {
        success: true,
        message: 'Proyecto guardado exitosamente en disco',
        savedAt: new Date().toISOString()
      });
    } catch (err) {
      sendJSON(res, 500, { success: false, error: 'Error al guardar el proyecto: ' + err.message });
    }
    return;
  }

  // Export to disk files (TXT and MD)
  if (pathname === '/api/export-files' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const project = body.project;
      if (!project || !project.capitulos) {
        sendJSON(res, 400, { success: false, error: 'Datos incompletos para exportar' });
        return;
      }

      const bookTitle = project.titulo || 'Los Cuatro Evangelios';

      // Markdown export
      let mdContent = `# ${bookTitle}\n\n`;
      mdContent += `*Compilado y armonizado el ${new Date().toLocaleDateString('es-ES')}*\n\n---\n\n`;

      // Plain text export
      let txtContent = `${bookTitle.toUpperCase()}\n${'='.repeat(bookTitle.length)}\n\n`;

      project.capitulos.forEach((cap, idx) => {
        const capNum = idx + 1;
        const capTitle = cap.titulo ? `Capítulo ${capNum}: ${cap.titulo}` : `Capítulo ${capNum}`;

        mdContent += `## ${capTitle}\n\n`;
        txtContent += `\n--- ${capTitle} ---\n\n`;

        if (cap.versiculos && cap.versiculos.length > 0) {
          cap.versiculos.forEach((v, vIdx) => {
            const vNum = vIdx + 1;
            const ref = v.origen ? `[${v.origen}]` : '';
            mdContent += `**${vNum}** ${v.texto} *${ref}*\n\n`;
            txtContent += `${vNum}. ${v.texto} ${ref}\n`;
          });
        } else {
          mdContent += `*(Capítulo vacío)*\n\n`;
          txtContent += `(Capítulo vacío)\n`;
        }
        mdContent += `\n`;
        txtContent += `\n`;
      });

      fs.writeFileSync(path.join(ROOT_DIR, 'los_cuatro_evangelios.md'), mdContent, 'utf8');
      fs.writeFileSync(path.join(ROOT_DIR, 'los_cuatro_evangelios.txt'), txtContent, 'utf8');

      sendJSON(res, 200, {
        success: true,
        message: 'Archivos los_cuatro_evangelios.md y los_cuatro_evangelios.txt creados exitosamente'
      });
    } catch (err) {
      sendJSON(res, 500, { success: false, error: 'Error al exportar archivos: ' + err.message });
    }
    return;
  }

  // Serve Static Files
  let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end('Acceso denegado');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Archivo no encontrado: ' + pathname);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  📖 Los Cuatro Evangelios - Servidor Iniciado`);
  console.log(`  Dirección: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
