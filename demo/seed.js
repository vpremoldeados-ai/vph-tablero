/* DEMO del Tablero VPH — datos 100% INVENTADOS.
 * Nada de acá sale de la base real: nombres, importes, teléfonos y CUIT son ficticios.
 * Las fechas son relativas a "hoy", así la demo siempre se ve viva.
 * (Los códigos y nombres de producto son los del catálogo público; los precios y costos son inventados.)
 */
window.__demoSeed = function () {
  'use strict';
  var HOY = new Date(); HOY.setHours(12, 0, 0, 0);
  var seedN = 20261020;
  function rnd() { seedN |= 0; seedN = seedN + 0x6D2B79F5 | 0; var t = Math.imul(seedN ^ seedN >>> 15, 1 | seedN); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoD(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function ago(n) { var d = new Date(HOY); d.setDate(d.getDate() - n); return isoD(d); }
  function ahead(n) { return ago(-n); }
  function habilAgo(n) { var d = new Date(HOY); d.setDate(d.getDate() - n); while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1); return isoD(d); }
  function habilAhead(n) { var d = new Date(HOY); d.setDate(d.getDate() + n); while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1); return isoD(d); }
  function ddmmyy(iso) { return iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(2, 4); }
  function r2(n) { return Math.round(n * 100) / 100; }
  var uidN = 0;
  function uid(p) { uidN++; return (p || 'd') + (1000 + uidN).toString(36) + ri(10, 99); }
  function tsISO(iso, h, m) { return iso + 'T' + pad(h) + ':' + pad(m || 0) + ':00'; }
  function cuitValido(pref, cuerpo8) {
    var s = String(pref) + cuerpo8, mult = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2], suma = 0;
    for (var i = 0; i < 10; i++) suma += (+s[i]) * mult[i];
    var dv = 11 - (suma % 11); if (dv === 11) dv = 0; if (dv === 10) dv = 9;
    return pref + '-' + cuerpo8 + '-' + dv;
  }

  var C = {};   // colección -> [docs]
  function add(col, doc) { (C[col] = C[col] || []).push(doc); return doc; }

  // ---------------------------------------------------------------- INSUMOS (materias primas + reposición)
  var MP = {
    cemento: { _uid: 'ins_mp_cemento', nombre: 'Cemento portland 50 kg', precio: 6200, unidad: 'bolsa', unidadUso: 'bolsa', contenido: 1, proveedor: 'Cementera Regional SRL' },
    arena: { _uid: 'ins_mp_arena', nombre: 'Arena fina (m³)', precio: 22000, unidad: 'm³', unidadUso: 'm³', contenido: 1, proveedor: 'Áridos San Pedro' },
    piedra: { _uid: 'ins_mp_piedra', nombre: 'Piedra 6-12 (m³)', precio: 28000, unidad: 'm³', unidadUso: 'm³', contenido: 1, proveedor: 'Áridos San Pedro' },
    hierro: { _uid: 'ins_mp_hierro', nombre: 'Hierro Ø4,2 mm barra 12 m', precio: 1950, unidad: 'barra', unidadUso: 'barra', contenido: 1, proveedor: 'Aceros del Plata SA' }
  };
  Object.keys(MP).forEach(function (k, i) {
    var m = MP[k];
    add('vph_insumos', { _uid: m._uid, nombre: m.nombre, categoria: 'Materia prima', precio: m.precio, unidad: m.unidad, unidadUso: m.unidadUso, contenido: m.contenido, iva: '21', stock: 0, stockMinimo: 0, proveedor: '', nota: '', orden: (i + 1) * 10, fechaConteo: ago(3), usuario: 'demo@vph-demo.com' });
  });
  var INS = [
    ['Pallet de madera', 'Pallets y Embalajes Norte', 'u', 4800, 120, 80, 14, 3],
    ['Fleje plástico (rollo)', 'Pallets y Embalajes Norte', 'rollo', 38000, 6, 4, 0.4, 4],
    ['Hebillas para fleje (caja)', 'Pallets y Embalajes Norte', 'caja', 9500, 3, 2, 0.1, 4],
    ['Desmoldante / gasoil (litro)', 'Estación de Servicio El Cruce', 'litro', 1350, 60, 120, 25, 1],
    ['Disco de corte 7"', 'Ferretería Industrial Norte', 'u', 3900, 9, 6, 0.3, 2],
    ['Guantes de trabajo (par)', 'Ferretería Industrial Norte', 'par', 2800, 14, 10, 1, 2],
    ['Anteojos de seguridad', 'Ferretería Industrial Norte', 'u', 2400, 5, 6, 0.1, 2],
    ['Grasa multipropósito (kg)', 'Ferretería Industrial Norte', 'kg', 7200, 4, 3, 0.2, 2],
    ['Aceite hidráulico (litro)', 'Ferretería Industrial Norte', 'litro', 5600, 8, 6, 0.3, 2],
    ['Lavandina (bidón 5 L)', 'Almacén Doña Rosa', 'u', 3100, 3, 4, 0.2, 1],
    ['Bolsas de residuos (paquete)', 'Almacén Doña Rosa', 'u', 2600, 6, 5, 0.2, 1],
    ['Moldes losetas 60x40', 'Metalúrgica Vega', 'molde', 185000, 8, 6, 0, 20],
    ['Tarimas para curado', 'Pallets y Embalajes Norte', 'u', 6200, 30, 20, 0.5, 3],
    ['Cinta de embalar', 'Ferretería Industrial Norte', 'rollo', 1700, 2, 6, 0.4, 2],
    ['Lubricante para vibradoras', 'Ferretería Industrial Norte', 'litro', 4300, 0, 2, 0.1, 2]
  ];
  INS.forEach(function (x, i) {
    add('vph_insumos', { _uid: 'ins_rep_' + (i + 1), nombre: x[0], categoria: 'Insumo', proveedor: x[1], unidad: x[2], unidadUso: x[2], contenido: 1, precio: x[3], iva: '21', stock: x[4], stockMinimo: x[5], consumoDiario: x[6], demoraDias: x[7], orden: (i + 1) * 10, fechaConteo: ago(3 + (i % 5)), usuario: 'produccion@vph-demo.com', nota: '' });
  });

  // ---------------------------------------------------------------- PRODUCTOS
  // [codigo, nombre, peso, udPorPallet, uPorM2, minorista, mayorista, mayoristaSF, costoObjetivo, stockMinimo, tipo]
  var PROD = [
    ['ULC60', 'Loseta Cribada 60x40', 18, 75, 4.3, 6200, 4450, 3990, 1790, 1800],
    ['ULC40', 'Loseta Cribada 40x40', 12, 99, 7, 4750, 3200, 2870, 1020, 600],
    ['UGB35', 'Green Block 35x35', 10, 126, 8, 3500, 2500, 2230, 880, 300],
    ['UGR35', 'Green Rombo 35x35', 12, 126, 8, 4500, 3000, 2680, 1010, 900],
    ['UGC35', 'Green Círculo 35x35', 12, 126, 8, 4300, 3000, 2680, 1010, 80],
    ['TET50', 'Tope Estacionamiento Trapecio 50', 15, 98, 0, 9000, 5450, 4900, 1260, 130],
    ['TEC50', 'Tope Estacionamiento Circular', 20, 70, 0, 12000, 7300, 6500, 1580, 60],
    ['TET100', 'Tope Estacionamiento Trapecio 100', 30, 48, 0, 23000, 14000, 12500, 3200, 25],
    ['TEC100', 'Tope Estacionamiento Cuadrado 15x15 x 100cm', 50, 30, 0, 27800, 16800, 15000, 4400, 30],
    ['UL60', 'Listón', 8, 170, 0, 1650, 1200, 1070, 530, 85],
    ['UCC10', 'Cordón Confinamiento', 8, 189, 0, 1730, 1220, 1090, 510, 90],
    ['BNV40', 'Base de hormigón BNV-40', 50, 24, 0, 31000, 18700, 16700, 9800, 30]
  ];
  var P = {};
  PROD.forEach(function (x, i) {
    var peso = x[2], costoObj = x[8];
    var costoMaq = 2 * MP.cemento.precio + 0.1 * MP.arena.precio + 0.07 * MP.piedra.precio;   // 16.560 por maquinada
    var rinde = r2(costoMaq / (peso * 61.24));
    var hierroQ = Math.max(0, r2((costoObj - peso * 61.24) / MP.hierro.precio));
    var costo = r2(costoMaq / rinde + hierroQ * MP.hierro.precio);
    var p = {
      _uid: 'prod_' + x[0].toLowerCase(), codigo: x[0], nombre: x[1], tipo: 'Producto terminado', unidad: 'u', activo: true, seFabrica: true, seVende: true,
      pesoUnit: peso, udPorPallet: x[3], unidadesPorM2: x[4], precioMinorista: x[5], precioMayorista: x[6], precioMayoristaSF: x[7], ivaVenta: '21',
      costo: costo, diasCurado: 10, stockMinimo: x[9], stock: 0, nota: '',
      costeo: { fecha: ago(8), rinde: rinde, flete: 0, ing: [
        { insumoUid: MP.cemento._uid, cantidad: 2, porUnidad: false },
        { insumoUid: MP.arena._uid, cantidad: 0.1, porUnidad: false },
        { insumoUid: MP.piedra._uid, cantidad: 0.07, porUnidad: false },
        { insumoUid: MP.hierro._uid, cantidad: hierroQ, porUnidad: true }
      ] }
    };
    P[x[0]] = p; add('vph_productos', p);
  });
  var ACTIVOS = PROD.map(function (x) { return x[0]; });

  // ---------------------------------------------------------------- CLIENTES / PROVEEDORES
  var CLI = [
    ['Corralón Los Tilos', 'M', 'A', 'Río Segundo'], ['Materiales Río Seco', 'M', 'A', 'Córdoba'], ['Pisos y Revestimientos Andina SRL', 'M', 'A', 'Córdoba'],
    ['Corralón La Esquina', 'M', 'X', 'Villa Allende'], ['Cerámicos Valle Chico SRL', 'M', 'A', 'Alta Gracia'], ['Ladrillera El Nogal', 'M', 'X', 'Córdoba'],
    ['Barraca Santa Rita', 'M', 'A', 'Jesús María'], ['Distribuidora Cuatro Vientos', 'M', 'X', 'Córdoba'],
    ['Constructora Horizonte SA', 'm', 'A', 'Córdoba'], ['Estudio Arq. Beltrán & Asoc.', 'm', 'A', 'Córdoba'], ['Inmobiliaria Rumbo SRL', 'm', 'A', 'Córdoba'],
    ['Familia Quiroga', 'm', 'X', 'Mendiolaza'], ['Consorcio Torres del Sur', 'm', 'A', 'Córdoba'], ['Playa Estacionamiento Centro SRL', 'm', 'A', 'Córdoba'],
    ['Club Atlético Unión Norte', 'm', 'B', 'Córdoba'], ['Hotel Altos del Lago SA', 'm', 'A', 'Villa Carlos Paz'], ['Sanatorio Santa Inés SA', 'm', 'A', 'Córdoba'],
    ['Municipalidad de Villa Rosales', 'm', 'B', 'Villa Rosales'], ['Logística Cordillera SRL', 'm', 'A', 'Malagueño'], ['Vial Norte Servicios SA', 'm', 'A', 'Córdoba'],
    ['Parque Industrial Los Aromos', 'm', 'A', 'Malvinas Argentinas'], ['Rodrigo Salinas', 'm', 'B', 'Córdoba'], ['Marisa Aguirre', 'm', 'B', 'Unquillo'],
    ['Ing. Facundo Paredes', 'm', 'X', 'Córdoba'], ['Obras Civiles del Centro SA', 'm', 'A', 'Córdoba'], ['Gimnasio Fuerza Viva', 'm', 'X', 'Córdoba']
  ];
  var CLIS = CLI.map(function (x, i) {
    var cuit = (x[2] === 'A') ? cuitValido(x[1] === 'M' ? 30 : 33, '99' + pad(10 + i) + pad(40 + i) + '') : '';
    cuit = (x[2] === 'A') ? cuitValido(30, '99' + String(100000 + i * 137).slice(0, 6)) : '';
    var cat = x[1] === 'M' ? (x[2] === 'X' ? 'MAYORISTA Desc 10.5%' : 'MAYORISTA') : (x[2] === 'X' ? 'Minorista Descuento 10.5%' : 'MINORISTA');
    var d = { _uid: 'cli_' + (i + 1), nombre: x[0], cuit: cuit, condIva: x[2], categoria: cat, localidad: x[3], direccion: 'Calle Ficticia ' + (100 + i * 7) + ', ' + x[3], telefono: '351 555-' + pad(10 + i) + pad(20 + i), email: '', nota: '' };
    d._m = x[1]; return d;
  });
  CLIS.forEach(function (c) { var o = {}; Object.keys(c).forEach(function (k) { if (k !== '_m') o[k] = c[k]; }); add('vph_clientes', o); });
  var PROV = [
    ['Cementera Regional SRL', 'Cemento', 30, 45], ['Áridos San Pedro', 'Áridos', 15, 30], ['Aceros del Plata SA', 'Hierro', 30, 45], ['Pallets y Embalajes Norte', 'Embalajes', 15, 0],
    ['Fletes Rojas', 'Transporte', 0, 0], ['Estación de Servicio El Cruce', 'Combustible', 0, 0], ['Inmobiliaria Alquileres Sur', 'Alquiler', 0, 0],
    ['EPEC', 'Energía', 0, 0], ['Seguros del Litoral', 'Seguros', 0, 0], ['Estudio Contable Ferrari', 'Contador', 0, 0], ['Ferretería Industrial Norte', 'Ferretería', 0, 0],
    ['Publicidad Digital SRL', 'Marketing', 0, 0], ['Metalúrgica Vega', 'Moldes', 0, 0], ['Almacén Doña Rosa', 'Varios', 0, 0]
  ];
  PROV.forEach(function (x, i) { add('vph_proveedores', { _uid: 'prv_' + (i + 1), nombre: x[0], rubro: x[1], cuit: cuitValido(30, '98' + String(100000 + i * 211).slice(0, 6)), condIva: 'A', plazoPagoDias: x[2], plazoEcheqDias: x[3], telefono: '351 555-' + pad(60 + i) + '00', email: '', direccion: '', nota: '' }); });

  // ---------------------------------------------------------------- VENTAS
  var nFacA = 1840, nFacB = 612, nInt = 2400;
  var VENTAS = [];
  function medioCobro(v, sal) {
    var r = rnd();
    if (v.condIva === 'X') return r < .55 ? 'Efectivo' : 'Transferencia';
    return r < .5 ? 'Transferencia' : (r < .8 ? 'Cheque / E-Cheq' : (r < .93 ? 'Efectivo' : 'Retención'));
  }
  for (var k = 0; k < 92; k++) {
    var dias = Math.floor(80 - k * (79 / 91) + rnd() * 1.5); if (dias < 0) dias = 0;
    var cli = (rnd() < .55) ? pick(CLIS.filter(function (c) { return c._m === 'M'; })) : pick(CLIS.filter(function (c) { return c._m === 'm'; }));
    var fecha = habilAgo(dias);
    var mayor = cli._m === 'M';
    var lista = mayor ? (cli.condIva === 'X' ? '6 Mayorista Sin Facturar' : '5 Mayorista Facturado') : (cli.condIva === 'A' ? '3 Minorista Responsable Inscripto' : (cli.condIva === 'B' ? '1 Minorista Consumidor Final' : '2 Minorista Sin Facturar'));
    var fact = cli.condIva !== 'X';
    var tipoComp = !fact ? 'Sin factura' : (cli.condIva === 'A' ? 'Factura A' : 'Factura B');
    var nItems = mayor ? ri(1, 2) : ri(1, 3), items = [], usados = {};
    for (var q = 0; q < nItems; q++) {
      var cod = mayor ? pick(['ULC60', 'ULC60', 'ULC40', 'UGR35', 'UGB35', 'UCC10']) : pick(['ULC60', 'ULC40', 'UGR35', 'UGB35', 'UGC35', 'TET50', 'TEC50', 'TET100', 'TEC100', 'UCC10', 'UL60', 'BNV40']);
      if (usados[cod]) continue; usados[cod] = 1;
      var pr = P[cod];
      var cant = mayor ? pr.udPorPallet * ri(2, 8) : (/^T|BNV/.test(cod) ? ri(10, 140) : ri(60, 520));
      var lp = mayor ? (fact ? pr.precioMayorista : pr.precioMayoristaSF) : (fact ? pr.precioMinorista : r2(pr.precioMinorista * .895));
      items.push({ codigo: cod, desc: pr.nombre, cant: cant, descPct: 0, iva: fact ? '21' : 'nogravado', precioUnit: fact ? r2(lp / 1.21) : r2(lp), precioContado: fact ? r2(lp / 1.21) : r2(lp) });
    }
    var v = {
      _uid: 'ven_' + (k + 1), fecha: fecha, periodo: fecha.slice(0, 7), cliente: cli.nombre, cuit: cli.cuit, condIva: cli.condIva, categoria: cli.categoria,
      listaPrecios: lista, tipoComprobante: tipoComp, puntoVenta: fact ? '0010' : '0010', items: items, descGeneral: 0, impInternos: 0, percepIva: 0, percepIibb: 0, intereses: 0,
      vencimiento: fecha, cobros: [], vendedor: '', nota: '', notaCliente: '', compAsoc: '', arca: '', origen: pick(['Manual', 'WhatsApp', 'Web cotizador', 'Teléfono', 'Referido', 'Google Ads']),
      domicilioEntrega: cli.direccion, finPerfil: '', finCuotas: 0
    };
    if (fact) {
      var nro = (cli.condIva === 'A') ? ++nFacA : ++nFacB;
      v.nroFactura = String(nro).padStart(8, '0'); v.arca = 'Aprobado'; v.arcaAmbiente = 'produccion';
      v.cae = '7' + String(ri(10000000000, 99999999999)) + '00'.slice(0, 2); v.caeVto = ahead(7).replace(/-/g, '');
      var tot = 0; items.forEach(function (it) { tot += it.cant * it.precioUnit * 1.21; });
      var payload = { ver: 1, fecha: fecha, cuit: 30717840042, ptoVta: 10, tipoCmp: cli.condIva === 'A' ? 1 : 6, nroCmp: nro, importe: r2(tot), moneda: 'PES', ctz: 1, tipoDocRec: cli.cuit ? 80 : 99, nroDocRec: cli.cuit ? +cli.cuit.replace(/-/g, '') : 0, tipoCodAut: 'E', codAut: +v.cae };
      v.qr = 'https://www.afip.gob.ar/fe/qr/?p=' + btoa(JSON.stringify(payload));
    } else {
      v.nroInterno = String(++nInt); v.nroFactura = '';
    }
    // total con IVA para repartir cobros
    var total = 0; items.forEach(function (it) { total += it.cant * it.precioUnit * (it.iva === '21' ? 1.21 : 1); });
    total = r2(total); v._total = total;
    var edad = dias, pagado;
    if (edad > 40) pagado = rnd() < .9 ? 1 : .5; else if (edad > 15) pagado = rnd() < .65 ? 1 : (rnd() < .5 ? .5 : 0); else pagado = rnd() < .35 ? 1 : (rnd() < .4 ? .5 : 0);
    if (pagado > 0) {
      var monto = r2(total * pagado), medio = medioCobro(v), cid = 'cob_' + v._uid;
      var cob = { id: cid, monto: monto, medio: medio, fecha: ago(Math.max(0, dias - ri(0, 12))) };
      if (/Cheque/.test(medio)) { cob.chNumero = String(ri(10000000, 99999999)); cob.chVenc = ahead(ri(-20, 60)); cob.chBanco = pick(['MACRO', 'GALICIA', 'SANTANDER', 'NACION']); cob.chequeRechazado = false; }
      if (medio === 'Retención') { cob.monto = r2(monto * .02); }
      if (medio === 'Transferencia') cob.cuenta = 'Banco Macro VPH';
      v.cobros.push(cob);
      if (medio === 'Retención') v.cobros.push({ id: 'cob2_' + v._uid, monto: r2(monto - cob.monto), medio: 'Transferencia', fecha: cob.fecha, cuenta: 'Banco Macro VPH' });
    }
    VENTAS.push(v);
  }
  VENTAS.forEach(function (v) { delete v._total; add('vph_ventas', v); });
  // Nota de crédito de ejemplo
  (function () {
    var base = VENTAS.filter(function (v) { return v.tipoComprobante === 'Factura A'; })[3];
    add('vph_ventas', { _uid: 'ven_nc1', fecha: ago(9), periodo: ago(9).slice(0, 7), cliente: base.cliente, cuit: base.cuit, condIva: 'A', categoria: base.categoria, listaPrecios: base.listaPrecios, tipoComprobante: 'Nota de Crédito', puntoVenta: '0010', nroFactura: String(++nFacA).padStart(8, '0'), arca: 'Aprobado', arcaAmbiente: 'produccion', cae: '70' + ri(100000000000, 999999999999), caeVto: ahead(7).replace(/-/g, ''), items: [{ codigo: 'ULC60', desc: 'Loseta Cribada 60x40', cant: 40, descPct: 0, iva: '21', precioUnit: r2(4450 / 1.21) }], compAsoc: base.nroFactura, ncMotivo: 'bonificacion', cobros: [], descGeneral: 0, impInternos: 0, percepIva: 0, percepIibb: 0, intereses: 0, vencimiento: ago(9), nota: 'Bonificación por piezas defectuosas (ejemplo)' });
  })();

  // ---------------------------------------------------------------- CHEQUES (recibidos de clientes)
  VENTAS.forEach(function (v) {
    v.cobros.forEach(function (c) {
      if (!/Cheque/.test(c.medio)) return;
      var vencido = c.chVenc < ago(0);
      var estado = vencido ? (rnd() < .5 ? 'endosado' : 'cobrado') : (rnd() < .5 ? 'cartera' : 'endosado');
      var ch = { _uid: 'chqcob_' + c.id, tipo: 'recibido', origen: 'cobro', refId: c.id, refUid: v._uid, entidad: v.cliente, numero: c.chNumero, banco: c.chBanco, monto: c.monto, fechaEmision: c.fecha, fechaVencimiento: c.chVenc, estado: estado, echeq: true, nota: 'Cobro de la venta ' + (v.nroFactura || v.nroInterno) };
      if (estado === 'endosado') { ch.endosadoA = pick(['Cementera Regional SRL', 'Aceros del Plata SA', 'Áridos San Pedro']); ch.fechaEndoso = ago(ri(1, 20)); }
      if (estado === 'cobrado') { ch.fechaMov = c.chVenc; ch.cuenta = 'Banco Macro VPH'; }
      add('vph_cheques', ch);
    });
  });

  // ---------------------------------------------------------------- COMPRAS
  var COMPRAS = [], nCmp = 5000;
  function compra(o) {
    var c = { _uid: o.uid || uid('cmp'), fecha: o.fecha, periodo: o.fecha.slice(0, 7), proveedor: o.prov, cuit: o.cuit || '', condIva: o.iva || 'A', categoria: o.cat, tipoComprobante: 'Compra', puntoVenta: '0001',
      nroFactura: String(++nCmp).padStart(8, '0'), items: [{ desc: o.desc, cant: o.cant || 1, precioUnit: o.pu, descPct: 0, iva: o.ivaItem || '21', codigo: '' }], descGeneral: 0, percepIva: 0, percepIibb: 0, impInternos: 0, intereses: 0,
      vencimiento: o.venc || o.fecha, pagos: [], nota: '', etiquetas: [] };
    var total = (o.cant || 1) * o.pu * ((o.ivaItem || '21') === '21' ? 1.21 : 1);
    if (o.pagado) {
      var medio = o.medio || 'Transferencia';
      var pg = { id: 'pag_' + c._uid, monto: r2(total * (o.pagado === true ? 1 : o.pagado)), medio: medio, fecha: o.fechaPago || o.fecha };
      if (/Cheque|E-Cheq/.test(medio)) { pg.chVenc = o.chVenc || ahead(ri(5, 40)); pg.chNumero = String(ri(10000000, 99999999)); pg.chBanco = 'MACRO'; }
      if (/Transferencia/.test(medio)) pg.cuenta = 'Banco Macro VPH';
      c.pagos.push(pg);
    }
    COMPRAS.push(c); return c;
  }
  // 3 meses completos hacia atrás (mes actual parcial)
  var meses = [];
  for (var mm = 3; mm >= 0; mm--) { var dm = new Date(HOY.getFullYear(), HOY.getMonth() - mm, 1); meses.push({ y: dm.getFullYear(), m: dm.getMonth() + 1, parcial: mm === 0 }); }
  function diaMes(mes, dia) { var d = new Date(mes.y, mes.m - 1, Math.min(dia, 28)); if (d > HOY) return null; return isoD(d); }
  meses.forEach(function (ms) {
    var f;
    if ((f = diaMes(ms, 5))) compra({ fecha: f, prov: 'Inmobiliaria Alquileres Sur', cat: 'ESTRUCTURA', desc: 'Alquiler galpón y oficina ' + pad(ms.m) + '/' + ms.y, pu: 1450000, pagado: true, medio: 'Transferencia' });
    if ((f = diaMes(ms, 8))) compra({ fecha: f, prov: 'EPEC', cat: 'ESTRUCTURA', desc: 'Energía eléctrica', pu: ri(780000, 960000) / 1.21, pagado: true, medio: 'Transferencia', iva: 'A' });
    if ((f = diaMes(ms, 10))) compra({ fecha: f, prov: 'Estudio Contable Ferrari', cat: 'ESTRUCTURA', desc: 'Honorarios mensuales', pu: 310000, pagado: true });
    if ((f = diaMes(ms, 12))) compra({ fecha: f, prov: 'Seguros del Litoral', cat: 'ESTRUCTURA', desc: 'Seguro de planta y vehículos', pu: 142000, pagado: true });
    if ((f = diaMes(ms, 14))) compra({ fecha: f, prov: 'Publicidad Digital SRL', cat: 'ESTRUCTURA', desc: 'Campaña de publicidad online', pu: 245000, pagado: true, medio: 'VISA / Tarjeta' });
    [3, 11, 19, 26].forEach(function (d) {
      if ((f = diaMes(ms, d))) compra({ fecha: f, prov: 'Cementera Regional SRL', cat: 'MATERIAS PRIMAS', desc: 'Cemento portland 50 kg', cant: ri(450, 700), pu: 5100, pagado: rnd() < .8 ? true : .5, medio: pick(['Transferencia', 'Cheque de terceros (endoso)']), venc: ago(0) });
    });
    [4, 12, 20, 27].forEach(function (d) {
      if ((f = diaMes(ms, d))) { compra({ fecha: f, prov: 'Áridos San Pedro', cat: 'MATERIAS PRIMAS', desc: 'Arena fina y piedra 6-12 (viajes)', cant: ri(5, 9), pu: ri(120000, 160000), pagado: true, medio: 'Transferencia' }); }
    });
    if ((f = diaMes(ms, 6))) compra({ fecha: f, prov: 'Aceros del Plata SA', cat: 'MATERIAS PRIMAS', desc: 'Hierro Ø4,2 mm barras 12 m', cant: ri(1800, 2600), pu: 1620, pagado: true, medio: 'Cheque / E-Cheq', chVenc: ahead(ri(-5, 35)) });
    if ((f = diaMes(ms, 18))) compra({ fecha: f, prov: 'Aceros del Plata SA', cat: 'MATERIAS PRIMAS', desc: 'Hierro Ø4,2 mm barras 12 m', cant: ri(1500, 2200), pu: 1620, pagado: rnd() < .5 ? true : false });
    [7, 21].forEach(function (d) { if ((f = diaMes(ms, d))) compra({ fecha: f, prov: 'Fletes Rojas', cat: 'COSTOS VARIABLES', desc: 'Fletes de entrega a clientes', pu: ri(900000, 1250000), pagado: true, medio: 'Transferencia' }); });
    if ((f = diaMes(ms, 9))) compra({ fecha: f, prov: 'Pallets y Embalajes Norte', cat: 'COSTOS VARIABLES', desc: 'Pallets de madera', cant: 100, pu: 4600, pagado: true });
    if ((f = diaMes(ms, 15))) compra({ fecha: f, prov: 'Estación de Servicio El Cruce', cat: 'COSTOS VARIABLES', desc: 'Gasoil', cant: ri(300, 420), pu: 1380, pagado: true, medio: 'VISA / Tarjeta' });
    if ((f = diaMes(ms, 16))) compra({ fecha: f, prov: 'Ferretería Industrial Norte', cat: 'MANTENIMIENTO Y CONSUMIBLES', desc: 'Repuestos y consumibles de planta', pu: ri(380000, 620000) / 1.21, pagado: true, medio: pick(['Efectivo', 'Transferencia']) });
    if ((f = diaMes(ms, 24))) compra({ fecha: f, prov: 'Metalúrgica Vega', cat: 'NO OPERATIVAS', desc: 'Moldes nuevos (inversión)', cant: 2, pu: 160000, pagado: true });
  });
  // sueldos (compras por persona y quincena, ids determinísticos como en el módulo Sueldos)
  var EMP = [
    ['Carlos Medina', 'Encargado de planta', 'quincenal', 1300000], ['Ramón Acuña', 'Operario', 'quincenal', 980000], ['Diego Soria', 'Operario', 'quincenal', 960000],
    ['Lucas Ferrer', 'Operario', 'quincenal', 940000], ['Marta Olivera', 'Administración', 'mensual', 1200000], ['Gonzalo Benítez', 'Producción y logística', 'mensual', 1250000]
  ];
  EMP.forEach(function (x, i) {
    add('vph_empleados', { _uid: 'emp_' + pad(i + 1) + '_' + x[0].split(' ')[1].toLowerCase().replace(/[^a-z]/g, ''), legajo: String(i + 1), nombre: x[0], dni: '30.000.' + pad(100 + i), puesto: x[1], area: '', formaPago: x[2], basicoMes: x[3], activo: true, fechaIngreso: '202' + (i % 3 + 2) + '-0' + (i % 8 + 1) + '-15', cobraPresentismo: false, presentismo: '', comisionPct: 0, cuil: '', cbu: '', banco: '', telefono: '351 555-0' + pad(30 + i), talleZapato: String(40 + i % 4), tallePantalon: String(42 + (i % 3) * 2), talleRemera: pick(['M', 'L', 'XL']), nota: '', sac: {}, vac: {} });
  });
  meses.forEach(function (ms) {
    [1, 2].forEach(function (q) {
      var fq = diaMes(ms, q === 1 ? 14 : 28); if (!fq) return;
      EMP.forEach(function (x, i) {
        if (x[2] === 'mensual' && q === 1) return;
        var monto = x[2] === 'mensual' ? x[3] : r2(x[3] / 2);
        var eid = 'emp_' + pad(i + 1) + '_' + x[0].split(' ')[1].toLowerCase().replace(/[^a-z]/g, '');
        var c = compra({ uid: 'sue_' + ms.y + '-' + pad(ms.m) + '_Q' + q + '_' + eid, fecha: fq, prov: x[0], cat: 'SUELDOS', desc: 'Sueldo ' + (x[2] === 'mensual' ? 'mensual' : q + 'ª quincena') + ' ' + pad(ms.m) + '/' + ms.y, pu: monto, ivaItem: 'nogravado', iva: 'X', pagado: true, medio: pick(['Efectivo', 'Transferencia']) });
        c.nroFactura = ''; c.tipoComprobante = 'Compra';
      });
    });
  });
  // algunas compras recientes impagas con vencimiento próximo / vencido
  compra({ fecha: ago(12), prov: 'Cementera Regional SRL', cat: 'MATERIAS PRIMAS', desc: 'Cemento portland 50 kg', cant: 620, pu: 5100, pagado: false, venc: ago(-6) });
  compra({ fecha: ago(25), prov: 'Aceros del Plata SA', cat: 'MATERIAS PRIMAS', desc: 'Hierro Ø4,2 mm barras 12 m', cant: 2100, pu: 1620, pagado: .4, venc: ago(2) });
  compra({ fecha: ago(4), prov: 'Fletes Rojas', cat: 'COSTOS VARIABLES', desc: 'Fletes de entrega', pu: 640000, pagado: false, venc: ago(-10) });
  COMPRAS.forEach(function (c) { add('vph_compras', c); });
  // e-cheqs propios emitidos por compras
  COMPRAS.forEach(function (c) {
    (c.pagos || []).forEach(function (p) {
      if (!/^(Cheque \/ E-Cheq|E-Cheq)/.test(p.medio)) return;
      var vencido = p.chVenc <= ago(0);
      add('vph_cheques', { _uid: 'chqpag_' + p.id, tipo: 'emitido', origen: 'pago', refId: p.id, refUid: c._uid, entidad: c.proveedor, numero: p.chNumero, banco: 'Macro', monto: p.monto, fechaEmision: p.fecha, fechaVencimiento: p.chVenc, estado: (vencido && rnd() < .7) ? 'cobrado' : 'cartera', echeq: true, cuenta: 'Banco Macro VPH', fechaMov: vencido ? p.chVenc : undefined, nota: 'Pago de factura ' + c.nroFactura });
    });
  });
  // un e-cheq propio que vence hoy (para mostrar el indicador "a cubrir hoy")
  add('vph_cheques', { _uid: 'chqpag_demo_hoy', tipo: 'emitido', origen: 'pago', entidad: 'Cementera Regional SRL', numero: '45110233', banco: 'Macro', monto: 1385000, fechaEmision: ago(30), fechaVencimiento: ago(0), estado: 'cartera', echeq: true, cuenta: 'Banco Macro VPH', nota: 'Pago de factura (ejemplo)' });

  // ---------------------------------------------------------------- CAJA
  add('vph_caja', { _uid: 'caj_demo1', tipo: 'saldo', fecha: ago(6), ts: tsISO(ago(6), 9, 30), nota: 'Saldo declarado (demo)', cuentas: [{ nombre: 'Efectivo', monto: 380000 }, { nombre: 'Banco Macro MAV', monto: 1900000 }, { nombre: 'Banco Macro VPH', monto: 3400000 }] });

  // ---------------------------------------------------------------- PRODUCCIÓN / PEDIDOS / ENTREGAS
  var ventasConEntrega = VENTAS.filter(function (v) { return v.items.some(function (it) { return !!P[it.codigo]; }); });
  var entregadoPorProd = {}, producidoPorProd = {};
  ventasConEntrega.forEach(function (v, i) {
    var edad = Math.round((HOY - new Date(v.fecha + 'T12:00:00')) / 86400000);
    var estado = edad > 8 ? 'entregado' : (edad > 3 ? (rnd() < .5 ? 'programado' : 'pendiente') : 'pendiente');
    if (edad > 8 && rnd() < .06) estado = 'pendiente';
    var diaEnt = estado === 'entregado' ? habilAgo(Math.max(0, edad - ri(2, 6))) : habilAhead(ri(1, 9));
    var transporte = estado === 'pendiente' && rnd() < .4 ? 'Sin asignar' : pick(['Sánchez', 'Sánchez', 'Retira cliente', 'Marcelo Vassallo']);
    var items = v.items.filter(function (it) { return !!P[it.codigo]; }).map(function (it) { return { codigo: it.codigo, cantidad: it.cant, producto: P[it.codigo].nombre }; });
    var ped = { _uid: 'ped_' + v._uid, ventaUid: v._uid, cliente: v.cliente, fecha: v.fecha, diaEntrega: ddmmyy(diaEnt), direccion: v.domicilioEntrega, ciudad: '', transporte: transporte, estado: estado, items: items, plan: {}, mixtos: [], numeroViaje: 1, fechaRequerida: '', puedeEsperar: false, nota: '', clienteCuit: v.cuit, clienteCondIva: v.condIva, clienteTel: '' };
    if (estado === 'entregado') { ped.fechaEntregado = diaEnt; ped.transporteEntrega = transporte === 'Sin asignar' ? '' : transporte; ped.viajeEntrega = diaEnt + '||' + ped.transporteEntrega; }
    add('vph_pedidos', ped);
    if (estado === 'entregado') items.forEach(function (it, j) {
      entregadoPorProd[it.codigo] = (entregadoPorProd[it.codigo] || 0) + it.cantidad;
      add('vph_entregas', { _uid: 'ent_' + ped._uid + '-' + j, pedidoUid: ped._uid, cliente: v.cliente, codigo: it.codigo, producto: it.producto, cantidad: it.cantidad, fecha: diaEnt, ts: tsISO(diaEnt, 15, 10), usuario: 'produccion@vph-demo.com', transporte: ped.transporteEntrega, viaje: ped.viajeEntrega });
    });
  });
  // producción diaria de los últimos 34 días hábiles
  for (var d = 34; d >= 0; d--) {
    var fd = habilAgo(d); if (new Date(fd + 'T12:00:00').getDay() === 0) continue;
    var hechos = {};
    for (var z = 0; z < 4; z++) {
      var cod = pick(['ULC60', 'ULC60', 'ULC60', 'ULC40', 'UGR35', 'UGB35', 'UGC35', 'TET50', 'TEC50', 'TET100', 'TEC100', 'UCC10', 'UL60']);
      if (hechos[cod] || (d < 4 && cod === 'UGC35')) continue; hechos[cod] = 1;
      var pr2 = P[cod], cantP = Math.round(ri(1100, 1700) / pr2.pesoUnit / 5) * 5;
      if (cantP < 5) cantP = 5;
      producidoPorProd[cod] = (producidoPorProd[cod] || 0) + cantP;
      add('vph_produccion', { _uid: 'prd_' + fd + '_' + cod, fecha: fd, ts: tsISO(fd, 17, 5), codigo: cod, producto: pr2.nombre, cantidad: cantP, usuario: 'produccion@vph-demo.com' });
    }
  }
  // stock inicial: se calcula para que el físico quede en un valor creíble (algunos productos bajo el mínimo)
  var objetivo = { ULC60: 1.15, ULC40: 0.7, UGB35: 2.0, UGR35: 0.55, UGC35: 1.6, TET50: 1.3, TEC50: 0.9, TET100: 1.4, TEC100: 0.6, UL60: 1.5, UCC10: 1.2, BNV40: 1.8 };
  ACTIVOS.forEach(function (cod) {
    var fis = Math.round(P[cod].stockMinimo * (objetivo[cod] || 1.2));
    P[cod].stock = Math.max(0, fis - ((producidoPorProd[cod] || 0) - (entregadoPorProd[cod] || 0)));
  });
  // ajustes por conteo
  [['ULC40', -12], ['UGB35', 20], ['TET50', -3]].forEach(function (x, i) {
    add('vph_ajustes', { _uid: 'aju_' + i, codigo: x[0], producto: P[x[0]].nombre, cantidad: x[1], teorico: 0, real: 0, motivo: 'Conteo semanal', fecha: ago(6 + i), ts: tsISO(ago(6 + i), 8, 0), usuario: 'produccion@vph-demo.com' });
  });
  add('vph_ajustes', { _uid: 'aju_rot1', codigo: 'ULC60', producto: P.ULC60.nombre, cantidad: -24, motivo: 'Rotura', etapa: 'Desmolde', nota: 'Piezas rotas al desmoldar (ejemplo)', fecha: ago(2), ts: tsISO(ago(2), 10, 30), usuario: 'produccion@vph-demo.com' });
  add('vph_ajustes', { _uid: 'aju_rot2', codigo: 'UGR35', producto: P.UGR35.nombre, cantidad: -15, motivo: 'Rotura', etapa: 'Movimiento en planta', nota: '', fecha: ago(5), ts: tsISO(ago(5), 11, 0), usuario: 'produccion@vph-demo.com' });

  // ---------------------------------------------------------------- PRESUPUESTOS / LEADS
  var NOM_LEAD = ['Familia Ibáñez', 'Arq. Mariana Lozano', 'Constructora Sol Naciente', 'Estacionamiento Plaza Mayor', 'Colegio San Gabriel', 'Fernando Giménez', 'Loteo Las Acacias', 'Veterinaria Mi Mascota', 'Panadería La Espiga', 'Concesionaria Sierras Motors', 'Gabriela Torres', 'Edificio Mirador', 'Café del Parque', 'Taller Mecánico Norte', 'Luciano Barrionuevo', 'Camping Los Aromos', 'Estudio Jurídico Pereyra', 'Club de Pádel Smash', 'Natalia Cabrera', 'Hostería El Mirlo'];
  var ESTADOS_LEAD = ['nuevo', 'cotizado', 'cotizado', 'reconsulta1', 'reconsulta2', 'reconsulta3', 'confirmado', 'perdido', 'cotizado', 'nuevo'];
  NOM_LEAD.forEach(function (n, i) {
    var cod = pick(['ULC60', 'ULC40', 'UGR35', 'TET50', 'TEC50', 'UGB35']);
    var cant = /^T/.test(cod) ? ri(20, 120) : ri(80, 480);
    var est = ESTADOS_LEAD[i % ESTADOS_LEAD.length];
    var f = ago(ri(1, 40));
    var precio = r2(P[cod].precioMinorista / 1.21);
    var lead = { _uid: 'lead_' + (i + 1), cliente: n, fecha: f, estado: est, origen: pick(['WhatsApp', 'Web cotizador', 'Google Ads', 'Manual', 'Referido', 'Teléfono']), telefono: '351 555-' + pad(70 + i) + pad(11 + i), email: '', cuit: '', condIva: 'B', categoria: 'MINORISTA', listaPrecios: '1 Minorista Consumidor Final', zona: pick(['capital', 'capital', 'cercanas', 'retiro', 'brio']), lugar: '', pago: 'A confirmar', m2: /^T/.test(cod) ? 0 : r2(cant / 4.3), monto: Math.round(cant * precio * 1.21), contactado: est !== 'nuevo', nota: '', items: [{ codigo: cod, producto: P[cod].nombre, cantidad: cant, precioUnit: precio, iva: '21', descPct: 0 }], seguimiento: [], palletsFlete: 0 };
    if (est !== 'confirmado' && est !== 'perdido') lead.proximoSeguimiento = pick([ago(2), ago(0), ahead(2), ahead(5)]);
    if (est === 'confirmado') lead.fechaConfirmado = ago(ri(1, 10));
    if (est === 'perdido') { lead.fechaPerdido = ago(ri(5, 30)); lead.motivoPerdida = pick(['Precio', 'Sin obra / postergó', 'No respondió', 'Compró en otro lado']); }
    add('vph_leads', lead);
    if (est !== 'nuevo') {
      add('vph_presupuestos', { _uid: 'pre_' + (i + 1), numero: 'P-' + String(300 + i).padStart(4, '0'), fecha: f, cliente: n, cuit: '', condIva: 'B', categoria: 'MINORISTA', listaPrecios: '1 Minorista Consumidor Final', vendedor: '', validezDias: 15, descGeneral: 0, estado: est === 'confirmado' ? 'convertido' : (rnd() < .5 ? 'enviado' : 'borrador'), zona: lead.zona, palletsFlete: 0, leadUid: lead._uid, notaCliente: '', nota: '', domicilioEntrega: '', finPerfil: '', items: [{ codigo: cod, desc: P[cod].nombre, cant: cant, precioUnit: precio, descPct: 0, iva: '21' }] });
    }
  });
  // contadores
  add('vph_config', { _uid: 'contadores', presupuestos: 320, ventasInternas: nInt });

  // ---------------------------------------------------------------- REMITOS (de entregas recientes)
  var rn = 2800;
  C.vph_pedidos.filter(function (p) { return p.estado === 'entregado'; }).slice(-14).forEach(function (p) {
    add('vph_remitos', { _uid: 'rem_' + p._uid, numero: '0002-' + String(++rn).padStart(8, '0'), numeroInt: rn, fecha: p.fechaEntregado, cliente: p.cliente, clienteCuit: p.clienteCuit, clienteCondIva: p.clienteCondIva, clienteTel: '', domicilioEntrega: p.direccion, transportista: p.transporteEntrega || 'Sánchez', ventaUid: p.ventaUid, pedidoUid: p._uid, comprobante: 'Detalle de Vta N° ' + (p.ventaUid || ''), usuario: 'produccion@vph-demo.com', ts: tsISO(p.fechaEntregado, 8, 0), items: p.items.map(function (it) { var u = P[it.codigo].udPorPallet, pal = [], r = it.cantidad; while (r > 0) { pal.push(Math.min(u, r)); r -= u; } return { codigo: it.codigo, cant: it.cantidad, desc: it.producto, pallets: pal }; }) });
  });
  add('vph_remitos', { _uid: '_contador', ultimo: rn });

  // ---------------------------------------------------------------- CRM Mayoristas / Topes / Bandeja
  var MAYS = CLIS.filter(function (c) { return c._m === 'M'; });
  add('vph_config', { _uid: 'crm_mayoristas', filas: MAYS.map(function (c, i) { return { nombre: c.nombre, contacto: pick(['Fran', 'Daniela', 'Marcos', 'Lucía', 'Pablo']), tipo: c.condIva === 'X' ? 'cbaSF' : 'cbaFact', telefono: c.telefono, notas: '', listaPeriodo: i < 3 ? ago(0).slice(0, 7) : '', listaFecha: i < 3 ? ago(3) : '', stockFecha: '', accionPor: i < 3 ? 'Sofía' : '' }; }) });
  var RUBROS = [['Playa de estacionamiento', 'Playa'], ['Hotel', 'Hotel'], ['Colegio privado', 'Colegio'], ['Clínica', 'Clínica'], ['Constructora-desarrolladora', 'Constructora'], ['Corralón', 'Corralón'], ['Concesionaria', 'Automotores'], ['Supermercado', 'Súper']];
  var ESTT = ['pendiente', 'pendiente', 'pendiente', 'contactado', 'falta-dato', 'interesado'];
  for (var t = 0; t < 48; t++) {
    var rb = RUBROS[t % RUBROS.length];
    add('vph_topes_prospectos', { _uid: 'tp_' + (t + 1), orden: t + 1, nombre: rb[1] + ' ' + pick(['Central', 'del Sol', 'Los Aromos', 'San Martín', 'Norte', 'Sierras', 'Alto Verde', 'Santa Rosa']) + ' ' + (t + 1), rubro: rb[0], telefono: '351 555-' + pad(10 + (t % 80)) + pad(t), email: '', estado: ESTT[t % ESTT.length], zona: 'Córdoba', nota: '', lat: -31.42 + (rnd() - .5) * .16, lon: -64.18 + (rnd() - .5) * .18, geoNivel: 'casa', grande: t % 7 === 0, ultimaAccion: t % 6 === 3 ? ago(ri(1, 12)) : '' });
  }
  var WA = [
    ['Rodrigo', 'Hola, buenas! Quería saber el precio de las losetas cribadas para unos 45 m2 en barrio Jardín.', 'lead_nuevo'],
    ['Corralón Los Tilos', 'Hola, ¿tienen stock de green rombo para esta semana? Necesito 3 pallets.', 'cliente'],
    ['Mariana L.', 'Buen día, necesito presupuesto de topes de estacionamiento para una playa de 20 cocheras.', 'lead_nuevo'],
    ['Constructora Horizonte', 'Por favor confirmen el horario de entrega del pedido del jueves.', 'cliente'],
    ['Fabián', 'Hola, ¿hacen envíos a Villa General Belgrano? ¿Cuánto sale el flete?', 'lead_nuevo'],
    ['Playa Estacionamiento Centro', 'Quiero sumar 40 topes más al pedido anterior, ¿se puede?', 'lead_existente']
  ];
  WA.forEach(function (w, i) {
    add('vph_wa_pendientes', { _uid: 'wa_' + (i + 1), waId: '549351555' + pad(10 + i) + '@c.us', nombre: w[0], telefono: '54935155' + pad(510 + i), mensaje: w[1], tipo: w[2], estado: 'pendiente', fueraDeHorario: false, recuperado: false, creadoEn: { seconds: Math.floor(Date.now() / 1000) - (i * 5400 + 1800), nanoseconds: 0 }, sugerencias: [] });
  });
  add('vph_config', { _uid: 'wa_estado', estado: 'conectado', maquina: 'DEMO', detalle: '', ultimoConectado: { seconds: Math.floor(Date.now() / 1000) - 60, nanoseconds: 0 }, cuando: { seconds: Math.floor(Date.now() / 1000) - 60, nanoseconds: 0 } });
  [['2026-10-12', 'Día del Respeto a la Diversidad Cultural'], ['2026-11-23', 'Día de la Soberanía Nacional (trasladado)'], ['2026-12-07', 'Puente turístico'], ['2026-12-08', 'Inmaculada Concepción'], ['2026-12-25', 'Navidad']].forEach(function (f, i) {
    add('vph_feriados', { _uid: 'fer_' + f[0], fecha: f[0], motivo: f[1], usuario: 'demo@vph-demo.com', ts: tsISO(ago(60), 9, 0) });
  });
  add('vph_roles', { _uid: 'demo-admin', rol: 'admin', nombre: 'Demostración', email: 'demo@vph-demo.com', creado: ago(90) });
  add('vph_config', { _uid: 'parametros', objKgMinMes: 60000, objKgDia: 6000 });

  // ---------------------------------------------------------------- REPORTES (snapshot histórico del dashboard)
  var mesesTxt = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
  function mtxt(offs) { var d = new Date(HOY.getFullYear(), HOY.getMonth() + offs, 1); return mesesTxt[d.getMonth()] + '-' + d.getFullYear(); }
  var dash = {
    _uid: 'dashboard',
    ivaDiario: [], margenCanal: [], rentabilidad: { costosFijos: 13200000, margen: 0, costoMP: 0, aguinaldoProvision: 0, capacidadPct: 78, productos: [], margenSeguridad: 9, margenPct: 36, puntoEquilibrio: 36400000, utilidadProyectada: 2100000, clientes: [], mes: mtxt(-1), utilidadPorKg: 140, fijosRecurrentes: 13200000, facturacion: 38600000, kgVendidos: 112000 },
    stockSnapshot: { items: [], kgEnStock: 61000, kgVendidosNoEntregados: 18500, fecha: ddmmyy(ago(1)).replace(/\/(\d\d)$/, '/20$1') },
    notasLogistica: [{ titulo: 'Camión de tercero', detalle: 'Se usa para entregas de más de 8 pallets (ejemplo).', tipo: 'info', ico: '🚚' }],
    comprasMensuales: [{ mes: mtxt(-2), sueldosFijos: 9300000, otros: 4100000, variables: 5200000, total: 18600000, otrosFijos: 3800000, aguinaldo: 0 }, { mes: mtxt(-1), sueldosFijos: 9500000, otros: 4300000, variables: 5600000, total: 19400000, otrosFijos: 4000000, aguinaldo: 0 }],
    META: { ultimaActualizacion: ddmmyy(ago(1)).replace(/\/(\d\d)$/, '/20$1'), mesCerrado: mtxt(-1), mesEnCurso: mtxt(0), objetivoKgDia: 6000 },
    METAS: [], produccionMensual: [{ mes: mtxt(-2), objetivoDia: 6000, producidoKg: 118000, vendidoKg: 109000, diasConDato: 21, objetivoCumplimiento: 94 }, { mes: mtxt(-1), objetivoDia: 6000, producidoKg: 121000, vendidoKg: 112000, diasConDato: 22, objetivoCumplimiento: 92 }],
    productosPorMes: {}, costosFijosPagos: [], finanzas: { fecha: ddmmyy(ago(1)).replace(/\/(\d\d)$/, '/20$1'), aCobrar: 0, cobrar: [], cajas: 380000, bancos: 5300000, disponible: 5680000, aCobrarVencido: 0, pagar: [], aPagarVencido: 0, aPagar: 0, visa: { cierre: '', estimado: 0, ultimoDebito: 0, debito: '' } },
    ventasMensuales: [{ mes: mtxt(-2), ventas: 36400000 }, { mes: mtxt(-1), ventas: 38600000 }],
    mesEnCurso: { clienteTop: 'Corralón Los Tilos', ventas: 19800000, resultado: 1200000, compras: 14100000, diasHabilesTranscurridos: 12, etiqueta: mtxt(0) + ' (al ' + ddmmyy(ago(0)) + ')', ventaPromedio: 830000, cantVentas: 24, diasHabilesTotales: 22, clienteTopPct: 14 },
    prodDiaria: []
  };
  for (var di = 7; di >= 1; di--) { dash.prodDiaria.push({ dia: ddmmyy(habilAgo(di)).slice(0, 5), kg: ri(4600, 6200) }); dash.ivaDiario.push({ fecha: ddmmyy(habilAgo(di)).slice(0, 5), credito: ri(120000, 480000), debito: ri(300000, 900000) }); }
  PROD.slice(0, 9).forEach(function (x) { dash.margenCanal.push({ nombre: x[1], costoMP: P[x[0]].costo, minCF: x[5], mayCF: x[6], maySF: x[7] }); dash.stockSnapshot.items.push({ producto: x[0], stockMinimo: x[9], disponible: ri(0, x[9] * 2), stock: ri(0, x[9] * 2), necesario: ri(0, x[9]) }); });
  dash.rentabilidad.productos = PROD.slice(0, 8).map(function (x) { return { nombre: x[1], margen: ri(800000, 4500000) }; });
  dash.rentabilidad.clientes = CLIS.slice(0, 12).map(function (c, i) { return { cliente: c.nombre.toUpperCase(), venta: 5200000 - i * 380000, margen: 2100000 - i * 150000, pct: 40 - i }; });
  dash.METAS = [
    { area: 'Comercial', nombre: 'Facturación del mes', unidad: '$', objetivo: 38000000, actual: 19800000, proRata: true, sentido: '>=' },
    { area: 'Comercial', nombre: 'Kilos vendidos', unidad: 'kg', objetivo: 112000, actual: 61000, proRata: true, sentido: '>=' },
    { area: 'Producción', nombre: 'Kilos producidos', unidad: 'kg', objetivo: 126000, actual: 70500, proRata: true, sentido: '>=' },
    { area: 'Finanzas', nombre: 'Gastos del mes', unidad: '$', objetivo: 34000000, actual: 14100000, proRata: true, sentido: '<=' }
  ];
  dash.productosPorMes[mtxt(-1)] = PROD.slice(0, 8).map(function (x) { return { producto: x[0] + ' (' + x[1] + ')', unidades: ri(500, 6000) }; });
  add('vph_reportes', dash);

  // limpieza: ningún doc puede quedar sin _uid
  Object.keys(C).forEach(function (k) { C[k].forEach(function (d) { if (!d._uid) throw new Error('doc sin _uid en ' + k); Object.keys(d).forEach(function (x) { if (d[x] === undefined) delete d[x]; }); }); });
  return C;
};
