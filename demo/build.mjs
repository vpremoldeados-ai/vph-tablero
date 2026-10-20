// Arma demo.html a partir de index.html (la app real) + un Firebase simulado de SOLO LECTURA con datos INVENTADOS.
//   node demo/build.mjs        (desde la raíz del repo)
// Se vuelve a correr cada vez que cambia index.html, así la demo sigue al día.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
const seed = fs.readFileSync(path.join(raiz, 'demo', 'seed.js'), 'utf8');
const fake = fs.readFileSync(path.join(raiz, 'demo', 'fake-firebase.js'), 'utf8');

function reemplazar(desde, hasta, nuevo, etiqueta) {
  const a = html.indexOf(desde);
  if (a < 0) throw new Error('No encontré el punto de enganche: ' + etiqueta);
  const b = html.indexOf(hasta, a);
  if (b < 0) throw new Error('No encontré el cierre de: ' + etiqueta);
  html = html.slice(0, a) + nuevo + html.slice(b + hasta.length);
}

// 1) la configuración real de Firebase NO viaja en la demo
reemplazar('const firebaseConfig = {', '};', 'const firebaseConfig = { projectId: "demo" };', 'firebaseConfig');
// 2) en lugar de bajar el SDK de Firebase, se usa el simulado
reemplazar('const [appM, authM, fsM, stM] = await Promise.all([', ']);',
  'const [appM, authM, fsM, stM] = [window.__DEMO_FB.appM, window.__DEMO_FB.authM, window.__DEMO_FB.fsM, null];', 'imports de Firebase');
// 2b) la política de seguridad de la demo NO permite hablar con Firebase ni con el Worker de facturación
{
  const i0 = html.indexOf('<meta http-equiv="Content-Security-Policy"'); const i1 = html.indexOf('>', i0);
  if (i0 < 0 || i1 < 0) throw new Error('No encontré la política de seguridad (CSP)');
  const meta = html.slice(i0, i1 + 1).replace(/frame-src [^;]*;/, "frame-src 'self';").replace(/connect-src [^;]*;/, "connect-src 'self' data: blob:;");
  html = html.slice(0, i0) + meta + html.slice(i1 + 1);
}
// 3) el simulado y los datos inventados se cargan antes que cualquier módulo
const bloque = '<script>\n' + seed + '\n</script>\n<script>\n' + fake + '\n</script>\n';
if (html.indexOf('</head>') < 0) throw new Error('No encontré </head>');
html = html.replace('</head>', () => bloque + '</head>');

// 3b) nombres reales de personas que vienen escritos en listas por defecto de la app
html = html.split("Asoldi Pablo").join("Transporte Norte").split("Ignacio Mahl").join("Transporte Sur").split(", Mahl,").join(", Transporte Sur,");

// 3c) nombres reales que quedaron en comentarios del código
for (const [a, b] of [["ONIX REVESTIMIENTOS","CLIENTE EJEMPLO"],["LOPEZ GRASSO MAYCO","APELLIDO NOMBRE"],["Mayco Lopez Grasso","Nombre Apellido"],["ESCOBEDO ALEJANDRO ARIEL","APELLIDO UNO NOMBRE"],["HERZ JOSE FRANCISCO","APELLIDO DOS NOMBRE"],["Erick Rodríguez — 3571349174","Nombre Apellido — 351 0000000"],["HERTZ JOSE","APELIDO DOS"]]) html = html.split(a).join(b);

// 4) guardas: la demo no puede conservar nada que la conecte a la base real
for (const prohibido of ['firebaseapp.com', 'firebasestorage.app', 'AIzaSy', "import(base+'firebase"]) {
  if (html.indexOf(prohibido) >= 0) throw new Error('La demo todavía contiene "' + prohibido + '"');
}
fs.writeFileSync(path.join(raiz, 'demo.html'), html);
console.log('demo.html generado (' + Math.round(html.length / 1024) + ' KB)');
