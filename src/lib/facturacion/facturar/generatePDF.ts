import { jsPDF } from "jspdf";
import Logo from "$lib/assets/logocompleto.png";
import { type FontStyle, type RowInput } from "jspdf-autotable";
import { applyPlugin } from "jspdf-autotable";
import {
  getToday,
  dateToLocaleString,
  generateBase64,
  calculateDimensions,
} from "$lib/utils";
import type {
  FacturasWithTrackings,
  Usuarios,
  Facturas,
  Trackings,
} from "$lib/server/db/schema";

applyPlugin(jsPDF);

// Constants
const PDF_CONFIG = {
  orientation: "p" as const,
  unit: "pt" as const,
  format: "a4" as const,
  compress: true,
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

// PDF Section Generators
async function addLogo(doc: jsPDF): Promise<void> {
  const {
    fileType,
    height: imgHeight,
    width: imgWidth,
  } = doc.getImageProperties(Logo);

  const { width, height } = calculateDimensions({
    imgHeight,
    imgWidth,
    maxWidth: 250,
    maxHeight: 85,
  });

  doc.addImage(Logo, fileType, 38, 50, width, height, "", "FAST");
}

function addHeader(doc: jsPDF): void {
  doc.autoTable({
    body: [[{ content: "FACTURA", styles: STYLES.header }]],
    theme: "plain",
  });
}

function addInvoiceInfo(doc: jsPDF, facturaId: string, fecha: string): void {
  doc.autoTable({
    body: [
      [{ content: `Factura No. ${facturaId}`, styles: STYLES.invoiceNumber }],
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
  cliente: Usuarios,
  casillero: string,
  total: string
): void {
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

function addTrackingTable(doc: jsPDF, trackings: string[][]): void {
  doc.autoTable({
    head: [["Numero de Tracking", "Peso (lbs)", "Total"]],
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

function addTotalSection(doc: jsPDF, total: string): void {
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

function addTermsAndConditions(doc: jsPDF): void {
  const terms = [
    "Panabox Logistics aplica cargos por peso o volumen para cargas extra dimensionada.",
    "Panabox Logistics no se hará responsable por daño en mercancia mal empacada por exportación.",
    "Panabox Logistics no se hace responsable por mercancia extraviada entregada por USPS.",
    "Panabox Logistics no se hace responsable por paquetes, despues de 1 mes de no ser retirado en la oficina.",
  ];

  doc.autoTable({
    head: [["Terminos y Condiciones"]],
    body: terms.map((term) => [`\u2022 ${term}`]),
    headStyles: { fontSize: 13 },
    styles: { cellPadding: 4 },
    theme: "plain",
  });
}

function addFooter(doc: jsPDF): void {
  const str =
    "Panabox Logistics | Teléfono +507 6858-1291\nRicardo J. Alfaro, Plaza Dorado City Center, Piso 1, Local 113A";
  doc.setFontSize(11);

  var pageSize = doc.internal.pageSize;
  var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
  doc.text(str, 40, pageHeight - 40);
}

export async function generateInvoice(
  info: FacturasWithTrackings,
  cliente: Usuarios,
  descargar = false,
  reenviar = false
): Promise<string> {
  const doc = new jsPDF(PDF_CONFIG);
  const trackingRows = createTrackingRows(info.trackings);

  const total = formatCurrency(info.total!);
  const fecha =
    descargar || reenviar ? info.fecha! : dateToLocaleString(getToday());

  await addLogo(doc);
  addHeader(doc);
  addInvoiceInfo(doc, String(info.facturaId), fecha);
  addClientInfo(doc, cliente, String(info.casillero), total);
  addTrackingTable(doc, trackingRows);
  addTotalSection(doc, total);
  addTermsAndConditions(doc);
  addFooter(doc);

  let base = "";
  if (descargar) {
    doc.save(`Factura-${info.facturaId}.pdf`);
  } else {
    base = (await generateBase64(doc.output("blob"))) as string;
  }

  return base;
}

// export async function createReport(
//   reporte: any,
//   facturas: Facturas[],
//   descargar = false
// ): Promise<string> {
//   const doc = new jsPDF(PDF_CONFIG);

//   // Report generation logic...
//   // TODO: Refactor this function similarly to generateInvoice

//   return doc.output("dataurlstring");
// }
