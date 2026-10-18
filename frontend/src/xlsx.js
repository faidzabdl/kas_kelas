// Penulis .xlsx minimal tanpa dependensi: XML sederhana dibungkus zip tanpa kompresi.
// Semua teks disimpan sebagai string (inlineStr), jadi tidak pernah dianggap rumus oleh Excel.
const enc = new TextEncoder();
export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zip(files) {
  const parts = [];
  const central = [];
  let offset = 0;
  for (const { name, data } of files) {
    const nameB = enc.encode(name);
    const crc = crc32(data);

    const l = new DataView(new ArrayBuffer(30));
    l.setUint32(0, 0x04034b50, true); l.setUint16(4, 20, true); l.setUint16(6, 0x0800, true);
    l.setUint16(12, 0x21, true); // tanggal 1980-01-01
    l.setUint32(14, crc, true); l.setUint32(18, data.length, true); l.setUint32(22, data.length, true);
    l.setUint16(26, nameB.length, true);
    parts.push(new Uint8Array(l.buffer), nameB, data);

    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
    c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
    c.setUint16(28, nameB.length, true); c.setUint32(42, offset, true);
    central.push(new Uint8Array(c.buffer), nameB);

    offset += 30 + nameB.length + data.length;
  }
  const size = central.reduce((s, p) => s + p.length, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
  e.setUint32(12, size, true); e.setUint32(16, offset, true);
  return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: XLSX_MIME });
}

// Hapus karakter kontrol yang tidak boleh ada di XML, lalu escape.
const esc = (v) =>
  String(v)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const kolom = (i) => String.fromCharCode(65 + i); // cukup untuk sampai 26 kolom

/**
 * rows  : array of array (angka atau teks)
 * opsi  : { nama: nama sheet, lebar: [lebar tiap kolom], tebal: [indeks baris yang ditebalkan] }
 */
export function buatXlsx(rows, { nama = 'Sheet1', lebar = [], tebal = [] } = {}) {
  const bold = new Set(tebal);
  const sheetRows = rows.map((row, r) => {
    const cells = row.map((v, c) => {
      const ref = `${kolom(c)}${r + 1}`;
      const s = bold.has(r) ? ' s="1"' : '';
      if (v === null || v === undefined || v === '') return '';
      if (typeof v === 'number' && Number.isFinite(v)) return `<c r="${ref}"${s}><v>${v}</v></c>`;
      return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
    }).join('');
    return `<row r="${r + 1}">${cells}</row>`;
  }).join('');

  const cols = lebar.length
    ? `<cols>${lebar.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`
    : '';
  const sheetName = esc(nama.replace(/[\[\]:*?/\\]/g, ' ').slice(0, 31) || 'Sheet1');

  const X = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const PKG = 'http://schemas.openxmlformats.org/package/2006/relationships';

  const files = {
    '[Content_Types].xml': `${X}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    '_rels/.rels': `${X}<Relationships xmlns="${PKG}"><Relationship Id="rId1" Type="${REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    'xl/workbook.xml': `${X}<workbook xmlns="${NS}" xmlns:r="${REL}"><sheets><sheet name="${sheetName}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    'xl/_rels/workbook.xml.rels': `${X}<Relationships xmlns="${PKG}"><Relationship Id="rId1" Type="${REL}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${REL}/styles" Target="styles.xml"/></Relationships>`,
    'xl/styles.xml': `${X}<styleSheet xmlns="${NS}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
    'xl/worksheets/sheet1.xml': `${X}<worksheet xmlns="${NS}">${cols}<sheetData>${sheetRows}</sheetData></worksheet>`,
  };
  return zip(Object.entries(files).map(([name, text]) => ({ name, data: enc.encode(text) })));
}
