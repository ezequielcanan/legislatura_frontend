import ExcelJS from 'exceljs';
import { getExportDataWithFilters } from './legislatura.service';

// ─── Color palette ───────────────────────────────
const COLOR = {
  headerBg: '4C1D95',      // deep violet for column headers
  headerFont: 'FFFFFF',    // white
  titleBg: '3B0764',       // very dark violet for title row
  titleFont: 'FFFFFF',     // white
  infoBg: 'EDE9FE',        // light lavender for info rows
  infoFont: '3B0764',      // dark violet text
  rowEven: 'F9FAFB',       // subtle gray for even data rows
  rowOdd: 'FFFFFF',        // white for odd data rows
  sanctionYes: 'D1FAE5',   // light green for sanctioned
  sanctionNo: 'FEE2E2',    // light red for not sanctioned
  border: 'D1D5DB',        // light gray border
};

interface ExportOptions {
  source: 'bae' | 'proyectos';
  /** Human-readable labels for display in the Excel info rows */
  filters: {
    busqueda?: string;
    categoria?: string;
    comision?: string;
    bloque?: string;
    autor?: string;
    coautor?: string;
    dateFrom?: string;
    dateTo?: string;
    searchMode?: string;
    baeSourceOnly?: boolean;
  };
  /** Raw IDs for the API query (bloque ID, comision URL, legislador IDs) */
  filterIds?: {
    bloqueId?: number;
    comisionUrl?: string;
    autorId?: number;
    coautorId?: number;
  };
  baeInfo?: {
    mode: 'single' | 'combine';
    nroOrden?: number;
    anoParlamentario?: number;
    selectedBaes?: Array<{ nroOrden: number; anoParlamentario: number }>;
  };
  dateInfo?: {
    mode: 'day' | 'range';
    selectedDate?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

function thin(color = COLOR.border): Partial<ExcelJS.Border> {
  return { style: 'thin', color: { argb: 'FF' + color } };
}

function applyBorder(cell: ExcelJS.Cell) {
  cell.border = { top: thin(), left: thin(), bottom: thin(), right: thin() };
}

export async function exportExpedientesToExcel(
  options: ExportOptions,
  onProgress?: (msg: string) => void,
): Promise<void> {
  const { source, filters, filterIds, baeInfo, dateInfo } = options;

  onProgress?.('Obteniendo expedientes y datos de exportación...');

  const MAX_EXPORT = 1999;

  const baseParams: Record<string, any> = { limit: MAX_EXPORT, skip: 0 };
  if (filters.busqueda) baseParams.query = filters.busqueda;
  if (filters.categoria && filters.categoria !== 'Todos') baseParams.tipo = filters.categoria;
  if (filterIds?.comisionUrl) baseParams.comisionUrl = filterIds.comisionUrl;
  if (filterIds?.bloqueId) baseParams.bloqueId = filterIds.bloqueId;
  if (filterIds?.autorId) baseParams.autorId = filterIds.autorId;
  if (filterIds?.coautorId) baseParams.coautorId = filterIds.coautorId;
  if (filters.searchMode === 'exact') baseParams.searchMode = 'exact';
  if (filters.baeSourceOnly) baseParams.baeSourceOnly = true;

  if (source === 'bae' && baeInfo) {
    if (baeInfo.mode === 'combine' && baeInfo.selectedBaes && baeInfo.selectedBaes.length > 0) {
      baseParams.baes = baeInfo.selectedBaes.map((b) => `${b.nroOrden}-${b.anoParlamentario}`).join(',');
    } else if (baeInfo.mode === 'single' && baeInfo.nroOrden && baeInfo.anoParlamentario) {
      baseParams.nroOrden = baeInfo.nroOrden;
      baseParams.anoParlamentario = baeInfo.anoParlamentario;
    }
  } else {
    if (dateInfo?.mode === 'day' && dateInfo.selectedDate) {
      baseParams.dateFrom = dateInfo.selectedDate;
      baseParams.dateTo = dateInfo.selectedDate;
    } else if (dateInfo?.mode === 'range') {
      if (dateInfo.dateFrom) baseParams.dateFrom = dateInfo.dateFrom;
      if (dateInfo.dateTo) baseParams.dateTo = dateInfo.dateTo;
    }
  }

  const { expedientes: allExpedientes, exportData } = await getExportDataWithFilters(baseParams);

  if (allExpedientes.length === 0) {
    throw new Error('No hay expedientes para exportar con los filtros actuales.');
  }

  onProgress?.('Generando Excel...');

  // ── Workbook setup ─────────────────────────────
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Legislatura CABA';
  wb.created = new Date();
  const ws = wb.addWorksheet('Expedientes', {
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
    views: [{ state: 'frozen', ySplit: 9 }], // freeze after ~9 info rows, adjust below
  });

  // ── Column widths ──────────────────────────────
  ws.columns = [
    { key: 'nro',        width: 22 },
    { key: 'titulo',     width: 75 },
    { key: 'partido',    width: 32 },
    { key: 'sancionado', width: 15 },
    { key: 'autor',      width: 32 },
  ];

  // ─── Helper: add a full-width merged info row ──
  const NUM_COLS = 5;

  function addInfoRow(text: string, opts: {
    bg: string;
    fontColor: string;
    bold?: boolean;
    size?: number;
    italic?: boolean;
    height?: number;
  }) {
    const row = ws.addRow([text]);
    ws.mergeCells(row.number, 1, row.number, NUM_COLS);
    row.height = opts.height ?? 22;
    const cell = row.getCell(1);
    cell.value = text;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + opts.bg } };
    cell.font = {
      name: 'Calibri',
      bold: opts.bold ?? false,
      italic: opts.italic ?? false,
      size: opts.size ?? 11,
      color: { argb: 'FF' + opts.fontColor },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    applyBorder(cell);
    return row;
  }

  // ─── Title row ────────────────────────────────
  addInfoRow('EXPORTACIÓN DE EXPEDIENTES — LEGISLATURA CABA', {
    bg: COLOR.titleBg, fontColor: COLOR.titleFont, bold: true, size: 14, height: 32,
  });

  // ─── Export date ──────────────────────────────
  const exportDate = new Date().toLocaleString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  addInfoRow(`Fecha de exportación: ${exportDate}`, {
    bg: COLOR.infoBg, fontColor: COLOR.infoFont, italic: true, size: 10,
  });

  // ─── Source info ──────────────────────────────
  let sourceText = '';
  if (source === 'bae' && baeInfo) {
    if (baeInfo.mode === 'single') {
      sourceText = `Origen: BAE N° ${baeInfo.nroOrden} — ${baeInfo.anoParlamentario}`;
    } else if (baeInfo.selectedBaes && baeInfo.selectedBaes.length > 0) {
      const baesStr = baeInfo.selectedBaes.map((b) => `${b.nroOrden}-${b.anoParlamentario}`).join(', ');
      sourceText = `Origen: BAEs combinados (${baesStr})`;
    }
  } else if (source === 'proyectos' && dateInfo) {
    if (dateInfo.mode === 'day' && dateInfo.selectedDate) {
      sourceText = `Origen: Proyectos — ${dateInfo.selectedDate}`;
    } else if (dateInfo.mode === 'range') {
      sourceText = `Origen: Proyectos — Rango de ${dateInfo.dateFrom || 'sin límite'} a ${dateInfo.dateTo || 'sin límite'}`;
    }
  }
  if (sourceText) {
    addInfoRow(sourceText, { bg: COLOR.infoBg, fontColor: COLOR.infoFont, bold: true, size: 11 });
  }

  // ─── Applied filters ──────────────────────────
  const appliedFilters: string[] = [];
  if (filters.busqueda) appliedFilters.push(`Búsqueda: "${filters.busqueda}"`);
  if (filters.categoria && filters.categoria !== 'Todos') appliedFilters.push(`Categoría: ${filters.categoria}`);
  if (filters.comision && filters.comision !== 'Todos') appliedFilters.push(`Comisión: ${filters.comision}`);
  if (filters.bloque && filters.bloque !== 'Todos') appliedFilters.push(`Bloque: ${filters.bloque}`);
  if (filters.autor && filters.autor !== 'Todos') appliedFilters.push(`Autor: ${filters.autor}`);
  if (filters.coautor && filters.coautor !== 'Todos') appliedFilters.push(`Coautor: ${filters.coautor}`);
  if (filters.baeSourceOnly) appliedFilters.push('Solo propios del BAE');
  if (filters.searchMode === 'exact') appliedFilters.push('Modo: búsqueda exacta');

  const filtersText = appliedFilters.length > 0
    ? `Filtros aplicados: ${appliedFilters.join('  |  ')}`
    : 'Filtros aplicados: ninguno';
  addInfoRow(filtersText, { bg: COLOR.infoBg, fontColor: COLOR.infoFont, size: 10, italic: true });

  // ─── Total count ──────────────────────────────
  addInfoRow(`Total de expedientes: ${allExpedientes.length}`, {
    bg: COLOR.infoBg, fontColor: COLOR.infoFont, bold: true, size: 11,
  });

  // empty separator
  const sepRow = ws.addRow(['']);
  ws.mergeCells(sepRow.number, 1, sepRow.number, NUM_COLS);
  sepRow.height = 6;
  sepRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLOR.infoBg } };

  // Update freeze to skip info rows
  const headerRowNum = ws.rowCount + 1;
  ws.views = [{ state: 'frozen', ySplit: headerRowNum }];

  // ─── Column header row ────────────────────────
  const headerRow = ws.addRow(['N° DE EXPTE', 'TITULO / SUMARIO', 'PARTIDO', 'SANCIONADO', 'AUTOR PRINCIPAL']);
  headerRow.height = 36;
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLOR.headerBg } };
    cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: 'FF' + COLOR.headerFont } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF' + COLOR.titleBg } },
      left: thin(COLOR.titleBg),
      bottom: { style: 'medium', color: { argb: 'FF' + COLOR.titleBg } },
      right: thin(COLOR.titleBg),
    };
  });

  // ─── Data rows ────────────────────────────────
  allExpedientes.forEach((exp, idx) => {
    const extra = exportData[exp.expedienteId];
    const autor = exp.autor
      ? `${exp.autor.apellido}, ${exp.autor.nombre}`.trim()
      : '';
    const bloque = extra?.bloque || '';
    const sancionado = extra?.sancionado ? 'SI' : 'NO';

    const dataRow = ws.addRow([exp.numero, exp.sumario, bloque, sancionado, autor]);
    dataRow.height = 40;

    const isEven = idx % 2 === 1;
    const rowBg = isEven ? COLOR.rowEven : COLOR.rowOdd;

    dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      // Background
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + rowBg } };
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
      applyBorder(cell);

      // Special styling for SANCIONADO column (col 4)
      if (colNumber === 4) {
        cell.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
        cell.font = {
          name: 'Calibri',
          size: 10,
          bold: true,
          color: { argb: extra?.sancionado ? 'FF065F46' : 'FF991B1B' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + (extra?.sancionado ? COLOR.sanctionYes : COLOR.sanctionNo) },
        };
      }

      // N° EXPTE: mono-spaced feel, center-ish
      if (colNumber === 1) {
        cell.alignment = { wrapText: false, vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Consolas', size: 10 };
      }
    });
  });

  // ─── Download ─────────────────────────────────
  const fileName = source === 'bae'
    ? `BAE_${baeInfo?.nroOrden || 'combined'}_${baeInfo?.anoParlamentario || ''}_expedientes.xlsx`
    : `Proyectos_expedientes_${new Date().toISOString().slice(0, 10)}.xlsx`;

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

