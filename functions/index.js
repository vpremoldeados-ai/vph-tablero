/**
 * Cloud Function del Tablero VPH — lee un ticket de compra escaneado (PDF o foto) subido a
 * Firebase Storage y devuelve los datos ya estructurados para precargar el formulario de Compras.
 *
 * NUNCA guarda nada en Firestore ni marca la compra como cargada: solo lee el archivo y devuelve
 * un borrador de datos. Sofía/Marcelo siempre revisan y confirman antes de guardar — el OCR puede
 * equivocarse (foto torcida, ticket manchado, letra chica).
 *
 * Requiere (ver DESPLEGAR_TICKETS_COMPRA.md):
 *  - Plan Blaze en el proyecto de Firebase (las Functions de 2ª gen lo piden, aunque el uso real sea gratis).
 *  - El secreto ANTHROPIC_API_KEY cargado (firebase functions:secrets:set ANTHROPIC_API_KEY).
 *  - Reglas de Storage publicadas (storage.rules) para que solo el rol admin pueda subir/leer tickets.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
admin.initializeApp();

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const ANTHROPIC_MODEL = "claude-sonnet-5";

// Mismas listas que usa el módulo Compras del Tablero (index.html) — si cambian ahí, actualizar acá.
const CATEGORIAS = ["MATERIAS PRIMAS", "INSUMOS", "COSTO FIJO", "Mano de Obra", "Productos Terminados", "BIENES DE USO", "gastos varios"];
const TIPOS_COMPROB = ["Compra", "Nota de Crédito", "Nota de Débito"];
const COND_IVA = ["A", "B", "C", "M", "X"];
const ALICUOTAS = ["21", "10.5", "27", "5", "2.5", "0", "exento", "nogravado"];

const ESQUEMA = {
  name: "extraer_compra",
  description: "Vuelca los datos del ticket/factura de compra en la estructura del Tablero VPH.",
  input_schema: {
    type: "object",
    properties: {
      proveedor: { type: "string", description: "Razón social o nombre del proveedor. Vacío si no se lee." },
      cuit: { type: "string", description: "CUIT del proveedor, formato 00-00000000-0. Vacío si no se lee." },
      condIva: { type: "string", enum: COND_IVA, description: "Condición de IVA del proveedor si figura (A=Resp. Inscripto). 'A' si no hay dato." },
      tipoComprobante: { type: "string", enum: TIPOS_COMPROB, description: "Tipo de comprobante. 'Compra' salvo que diga explícitamente Nota de Crédito/Débito." },
      categoria: { type: "string", enum: CATEGORIAS, description: "Mejor estimación de la categoría del gasto según lo comprado (revisar igual: es una estimación)." },
      fecha: { type: "string", description: "Fecha de emisión, formato YYYY-MM-DD. Vacío si no se lee." },
      vencimiento: { type: "string", description: "Fecha de vencimiento de pago si figura, YYYY-MM-DD. Si no figura, igual a 'fecha'." },
      puntoVenta: { type: "string", description: "Punto de venta (ej: 0001). Vacío si no se lee." },
      nroFactura: { type: "string", description: "Número de comprobante (sin el punto de venta). Vacío si no se lee." },
      items: {
        type: "array",
        description: "Renglones del comprobante. Si el ticket no discrimina ítems, un solo renglón con el total neto (antes de IVA) como precioUnit y cant=1.",
        items: {
          type: "object",
          properties: {
            desc: { type: "string" },
            cant: { type: "number" },
            precioUnit: { type: "number", description: "Precio unitario SIN IVA (neto)." },
            descPct: { type: "number", description: "Descuento del renglón en %, 0 si no hay." },
            iva: { type: "string", enum: ALICUOTAS, description: "Alícuota de IVA del renglón. '21' si no se puede determinar y el resto del comprobante es gravado." }
          },
          required: ["desc", "cant", "precioUnit", "iva"]
        }
      },
      descGeneral: { type: "number", description: "Descuento general del comprobante en %, 0 si no hay." },
      percepIva: { type: "number", description: "Percepción de IVA si figura como renglón separado, 0 si no." },
      percepIibb: { type: "number", description: "Percepción de IIBB si figura, 0 si no." },
      impInternos: { type: "number", description: "Impuestos internos si figuran, 0 si no." },
      intereses: { type: "number", description: "Intereses/recargos si figuran, 0 si no." },
      confianza: { type: "string", enum: ["alta", "media", "baja"], description: "Qué tan seguro estás de la lectura en general." },
      avisos: { type: "string", description: "Campos que no pudiste leer bien o texto ambiguo — para que la persona los revise a mano. Vacío si todo se leyó claro." }
    },
    required: ["proveedor", "cuit", "condIva", "tipoComprobante", "categoria", "fecha", "vencimiento", "items", "confianza"]
  }
};

const PROMPT = `Sos un asistente contable de una fábrica de premoldeados de hormigón en Argentina (Vassallo Premoldeados de Hormigón).
Te paso la imagen o el PDF de un ticket/factura de compra ya escaneado. Extraé los datos con la herramienta "extraer_compra".

Reglas importantes:
- Los precios de los ítems van SIN IVA (netos). Si el ticket muestra precios con IVA incluido, y podés inferir la alícuota, netealo vos (precio / (1+alicuota/100)).
- Si un dato no se puede leer con confianza, dejalo vacío o en 0 — NO inventes ni completes con un valor "típico". Es preferible un campo vacío a uno inventado, porque acá es plata real.
- Las fechas son de Argentina (día/mes/año en el ticket) — convertilas siempre a YYYY-MM-DD.
- Si el ticket es borroso, está cortado, o es ilegible en partes, decilo en "avisos" y bajá "confianza" a "media" o "baja".
- Categoría: es solo una estimación para que la persona la confirme un click — no te compliques de más (Mano de Obra = sueldos; COSTO FIJO = alquiler/servicios/seguros/sistema; MATERIAS PRIMAS = cemento/arena/hierro/etc.; INSUMOS = insumos menores; el resto según corresponda).`;

exports.procesarTicketCompra = onCall(
  { secrets: [ANTHROPIC_API_KEY], cors: true, timeoutSeconds: 60, memory: "512MiB" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Iniciá sesión para procesar un ticket.");
    }
    // Fail-closed, mismo criterio que las reglas de Firestore/Storage: solo admin.
    const rolSnap = await admin.firestore().doc(`vph_roles/${request.auth.uid}`).get();
    const rol = rolSnap.exists ? rolSnap.data().rol : null;
    if (rol !== "admin") {
      throw new HttpsError("permission-denied", "Esta función es solo para el rol admin.");
    }

    const path = (request.data && request.data.path) || "";
    if (!path.startsWith("tickets_compras/")) {
      throw new HttpsError("invalid-argument", "Ruta de archivo inválida.");
    }

    let mediaType, base64;
    try {
      const bucket = admin.storage().bucket();
      const file = bucket.file(path);
      const [meta] = await file.getMetadata();
      mediaType = meta.contentType || "";
      const [buf] = await file.download();
      if (buf.length > 15 * 1024 * 1024) {
        throw new HttpsError("invalid-argument", "El archivo pesa más de 15 MB.");
      }
      base64 = buf.toString("base64");
    } catch (e) {
      if (e instanceof HttpsError) throw e;
      console.error("descarga de storage:", e);
      throw new HttpsError("not-found", "No se pudo leer el archivo subido.");
    }

    const esPdf = mediaType === "application/pdf";
    const esImagen = ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mediaType);
    if (!esPdf && !esImagen) {
      throw new HttpsError("invalid-argument", "Formato no soportado: " + mediaType + " (solo PDF o JPG/PNG).");
    }

    const contentBlock = esPdf
      ? { type: "document", source: { type: "base64", media_type: mediaType, data: base64 } }
      : { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } };

    let resp;
    try {
      resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY.value(),
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 2048,
          temperature: 0,
          tools: [ESQUEMA],
          tool_choice: { type: "tool", name: "extraer_compra" },
          messages: [{ role: "user", content: [contentBlock, { type: "text", text: PROMPT }] }]
        })
      });
    } catch (e) {
      console.error("llamada a Anthropic:", e);
      throw new HttpsError("unavailable", "No se pudo contactar al servicio de lectura. Probá de nuevo.");
    }

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      console.error("Anthropic respondió", resp.status, txt);
      throw new HttpsError("internal", "El servicio de lectura devolvió un error (" + resp.status + ").");
    }

    const data = await resp.json();
    const toolUse = (data.content || []).find((b) => b.type === "tool_use" && b.name === "extraer_compra");
    if (!toolUse) {
      throw new HttpsError("internal", "No se pudo extraer la información del ticket.");
    }
    return toolUse.input;
  }
);
