import { jsPDF } from "jspdf";
import { type FontStyle, type RowInput } from "jspdf-autotable";
import { applyPlugin } from "jspdf-autotable";
import { calculateDimensions, getBase64FromUrl } from "$lib/utils";
import type {
  FacturasWithTrackings,
  Trackings,
  Companies,
  Sucursales,
  UsuariosWithSucursal,
  Reportes,
  Facturas,
} from "$lib/server/db/schema";
applyPlugin(jsPDF);

// Constants
const PDF_CONFIG = {
  orientation: "p" as const,
  unit: "pt" as const,
  format: "a4" as const,
  compress: false,
};

const STYLES = {
  header: {
    fontSize: 20,
    halign: "right" as const,
  },
  subHeader: {
    fontSize: 14,
    halign: "right" as const,
  },
  invoiceNumber: {
    fontSize: 14,
    textColor: "red",
    fontStyle: "bold",
    halign: "right" as const,
  },
  tableHeader: {
    fillColor: "#343a40",
    halign: "right" as const,
  },
  total: {
    fontSize: 16,
    halign: "right" as const,
    fontStyle: "bold" as FontStyle,
  },
};

// Helper functions
function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function createTrackingRows(trackings: Trackings[]): string[][] {
  return trackings.map(({ numeroTracking, peso, precio }) => [
    numeroTracking,
    String(peso),
    formatCurrency(precio!),
  ]) as string[][];
}

let logoCache = "";
async function getCachedLogo(logo: string) {
  if (!logoCache) logoCache = await getBase64FromUrl(logo);
  return logoCache;
}

// PDF Section Generators
async function addLogo(doc: jsPDF, logo: string): Promise<void> {
  const base64Image = await getCachedLogo(logo);
  const {
    fileType,
    height: imgHeight,
    width: imgWidth,
  } = doc.getImageProperties(base64Image);

  const { width, height } = calculateDimensions({
    imgHeight,
    imgWidth,
    maxWidth: 250,
    maxHeight: 85,
  });

  doc.addImage(base64Image, fileType, 38, 50, width, height, "", "FAST");
}

function addHeader(doc: jsPDF, title: string): void {
  // @ts-ignore
  doc.autoTable({
    body: [[{ content: title, styles: STYLES.header }]],
    theme: "plain",
  });
}

function addInvoiceInfo(
  doc: jsPDF,
  title: string,
  id: string,
  fecha: string
): void {
  // @ts-ignore
  doc.autoTable({
    body: [
      [{ content: `${title} No. ${id}`, styles: STYLES.invoiceNumber }],
      [{ content: `Fecha: ${fecha}`, styles: STYLES.subHeader }],
    ],
    styles: {
      cellPadding: { top: 0, bottom: 0, left: 5, right: 5 },
    },
    theme: "plain",
  });
}

function addClientInfo(
  doc: jsPDF,
  cliente: UsuariosWithSucursal,
  casillero: string,
  total: string
): void {
  // @ts-ignore
  doc.autoTable({
    head: [
      [
        {
          content: `${cliente.nombre} ${cliente.apellido}`,
          styles: { halign: "left", fontSize: 13 },
        },
        "",
      ],
    ],
    body: [
      [
        {
          content: `Casillero: ${casillero}`,
          styles: { halign: "left", fontSize: 13 },
        },
        { content: `Total: ${total}`, styles: STYLES.total },
      ],
    ],
    theme: "plain",
    styles: {
      cellPadding: { left: 5, right: 5, top: 0, bottom: 0 },
    },
  });
}

function addTotalHeader(doc: jsPDF, total: string): void {
  // @ts-ignore
  doc.autoTable({
    head: [
      [
        {
          content: "",
          styles: {
            halign: "left",
            fontSize: 13,
          },
        },
        "",
      ],
    ],
    body: [
      [
        {
          content: "",
          styles: {
            halign: "left",
            fontSize: 13,
          },
        },
        {
          content: `Total: ${total}`,
          styles: {
            fontSize: 16,
            halign: "right",
            fontStyle: "bold",
          },
        },
      ],
    ],
    theme: "plain",
    styles: {
      cellPadding: { left: 5, right: 5, top: 0, bottom: 0 },
    },
  });
}

function addTrackingTable(doc: jsPDF, trackings: string[][]): void {
  // @ts-ignore
  doc.autoTable({
    head: [
      [
        {
          content: "Numero de Tracking",
          styles: { halign: "left" },
        },
        "Peso (lbs)",
        "Total",
      ],
    ],
    body: trackings,
    theme: "striped",
    headStyles: STYLES.tableHeader,
    columnStyles: {
      0: { overflow: "linebreak" },
      1: { halign: "right", cellWidth: 60 },
      2: { halign: "right", cellWidth: 60 },
    },
  });
}

function addFacturasTable(doc: jsPDF, facturas: Facturas[]): void {
  const listaDeFacturas = facturas.map((factura) => {
    let estado = factura.pagado ? "Pagado" : "Pendiente";
    let fechaDePago = factura.pagadoAt
      ? factura.pagadoAt.toLocaleDateString("en-GB")
      : "";

    return [
      factura.fecha!,
      `${factura.facturaId}`,
      `$${factura.total}`,
      `${factura.metodoDePago}`,
      estado,
      fechaDePago,
    ];
  });

  // @ts-ignore
  doc.autoTable({
    head: [
      [
        { content: "Fecha", styles: { halign: "left" } },
        "Factura Nº",
        "Total",
        "Metodo de Pago",
        "Estado de Pago",
        "Fecha de Pago",
      ],
    ],
    body: listaDeFacturas,
    theme: "striped",
    headStyles: {
      fillColor: "#343a40",
      halign: "right",
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
    },
  });
}

function addTotalSection(doc: jsPDF, total: string): void {
  // @ts-ignore
  doc.autoTable({
    body: [
      [
        {
          content: "Subtotal:",
          styles: { halign: "right", fontStyle: "bold" },
        },
        { content: total, styles: { halign: "right" } },
      ],
      [
        { content: "Total:", styles: { halign: "right", fontStyle: "bold" } },
        { content: total, styles: { halign: "right" } },
      ],
    ],
    columnStyles: { 1: { cellWidth: 100 } },
    styles: { fontSize: 12 },
    theme: "plain",
  });
}

function addTermsAndConditions(doc: jsPDF, company: string): void {
  const terms = [
    `${company} aplica cargos por peso o volumen para cargas extra dimensionada.`,
    `${company} no se hará responsable por daño en mercancia mal empacada por exportación.`,
    `${company} no se hace responsable por mercancia extraviada entregada por USPS.`,
    `${company} no se hace responsable por paquetes, despues de 1 mes de no ser retirado en la oficina.`,
  ];

  // @ts-ignore
  doc.autoTable({
    head: [["Terminos y Condiciones"]],
    body: terms.map((term) => [`\u2022 ${term}`]),
    headStyles: { fontSize: 13 },
    styles: { cellPadding: 4 },
    theme: "plain",
  });
}

function addFooter(doc: jsPDF, company: string, sucursal: Sucursales): void {
  const str = `${company} | Teléfono ${sucursal.telefono}\n${sucursal.direccion}`;
  doc.setFontSize(11);

  var pageSize = doc.internal.pageSize;
  var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
  doc.text(str, 40, pageHeight - 40);
}

export async function generateInvoice({
  info,
  cliente,
  company,
  logo,
  descargar = false,
}: {
  info: FacturasWithTrackings;
  cliente: UsuariosWithSucursal;
  company: Companies;
  logo: string;
  descargar?: boolean;
}): Promise<Buffer | void> {
  const doc = new jsPDF(PDF_CONFIG);
  const trackingRows = createTrackingRows(info.trackings);

  const total = formatCurrency(info.total!);
  const fecha = info.fecha!;

  await addLogo(doc, logo);
  addHeader(doc, "FACTURA");
  addInvoiceInfo(doc, "Factura", String(info.facturaId), fecha);
  addClientInfo(doc, cliente, String(info.casillero), total);
  addTrackingTable(doc, trackingRows);
  addTotalSection(doc, total);
  addTermsAndConditions(doc, company.company);
  addFooter(doc, company.company, cliente.sucursal);

  if (descargar) {
    doc.save(`Factura-${info.facturaId}.pdf`);
  } else {
    const pdfBlob = doc.output("arraybuffer");
    return Buffer.from(pdfBlob);
  }
}

export async function generateReport({
  reporte,
  facturas,
  logo,
  descargar = false,
}: {
  reporte: Reportes;
  facturas: Facturas[];
  logo: string;
  descargar?: boolean;
}) {
  const doc = new jsPDF(PDF_CONFIG);
  const total = formatCurrency(reporte.total!);

  const fechaInicial = reporte.fechaInicial!.toLocaleDateString("en-GB");
  const fechaFinal = reporte.fechaFinal!.toLocaleDateString("en-GB");

  const fechas =
    fechaInicial !== fechaFinal
      ? `${fechaInicial} - ${fechaFinal}`
      : `${fechaInicial}`;

  await addLogo(doc, logo);
  addHeader(doc, "REPORTE DE VENTAS");
  addInvoiceInfo(doc, "Reporte", String(reporte.reporteId), fechas);
  addTotalHeader(doc, total);
  addFacturasTable(doc, facturas);
  addTotalSection(doc, total);

  if (descargar) {
    doc.save(`Reporte-${reporte.reporteId}.pdf`);
  }

  return doc.output("dataurl", {
    filename: `Reporte-${reporte.reporteId}.pdf`,
  });
}
