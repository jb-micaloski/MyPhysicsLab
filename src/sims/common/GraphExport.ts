// Copyright 2026.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ButtonControl } from '../../lab/controls/ButtonControl.js';
import { GraphLine, GraphPoint } from '../../lab/graph/GraphLine.js';
import { LabCanvas } from '../../lab/view/LabCanvas.js';
import { LabControl } from '../../lab/controls/LabControl.js';
import { Util } from '../../lab/util/Util.js';

type ExportFile = {
  name: string,
  data: Uint8Array
};

/** Creates controls and files for exporting the currently visible graph. */
export class GraphExport {

private constructor() {
  throw '';
};

/** Creates a download button for one graph canvas and its GraphLine data. */
static makeDownloadButton(graphCanvas: LabCanvas, graphLines: GraphLine[],
    filePrefix?: string): LabControl {
  const control = new ButtonControl(GraphExport.DOWNLOAD_GRAPH, () => {
    GraphExport.downloadGraph(graphCanvas, graphLines, filePrefix)
        .catch(err => {
          if (typeof console != 'undefined') {
            console.error(err);
          }
          alert(Util.localizeControlLabel(GraphExport.DOWNLOAD_ERROR));
        });
  });
  const element = control.getElement();
  element.classList.add('graph-download');
  element.title = Util.localizeControlLabel(GraphExport.DOWNLOAD_HINT);
  return control;
};

/** Exports a PNG snapshot and CSV data from the selected graph lines as a zip file. */
static async downloadGraph(graphCanvas: LabCanvas, graphLines: GraphLine[],
    filePrefix?: string): Promise<void> {
  graphCanvas.paint();
  const prefix = GraphExport.filePrefix(filePrefix);
  const canvas = graphCanvas.getCanvas();
  const png = await GraphExport.canvasToBytes(canvas);
  const csv = GraphExport.textToBytes(GraphExport.makeCsv(graphLines));
  const metadata = GraphExport.textToBytes(GraphExport.makeMetadata(graphLines));
  const zip = GraphExport.makeZip([
    { name: prefix+'.png', data: png },
    { name: prefix+'.csv', data: csv },
    { name: prefix+'-metadados.txt', data: metadata }
  ]);
  GraphExport.saveBlob(zip, prefix+'.zip');
};

private static canvasToBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    if (canvas.toBlob != null) {
      canvas.toBlob(blob => {
        if (blob == null) {
          reject('canvas export failed');
          return;
        }
        blob.arrayBuffer()
            .then(buffer => resolve(new Uint8Array(buffer)))
            .catch(reject);
      }, 'image/png');
    } else {
      try {
        resolve(GraphExport.dataUrlToBytes(canvas.toDataURL('image/png')));
      } catch (err) {
        reject(err);
      }
    }
  });
};

private static dataUrlToBytes(dataUrl: string): Uint8Array {
  const data = dataUrl.split(',')[1] ?? '';
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i=0; i<binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

private static makeCsv(graphLines: GraphLine[]): string {
  const rows: string[] = [
    [
      'linha',
      'eixo_x_selecionado',
      'eixo_y_selecionado',
      'indice',
      'x_plotado',
      'y_plotado',
      'sequencia_x',
      'sequencia_y'
    ].join(',')
  ];
  for (const graphLine of graphLines) {
    const points = graphLine.getGraphPoints();
    const iter = points.getIterator();
    while (iter.hasNext()) {
      const point = iter.nextValue();
      rows.push(GraphExport.csvRow(graphLine, iter.getIndex(), point));
    }
  }
  return rows.join('\n')+'\n';
};

private static csvRow(graphLine: GraphLine, index: number, point: GraphPoint): string {
  return [
    GraphExport.csvCell(GraphExport.lineName(graphLine)),
    GraphExport.csvCell(graphLine.getXVarName()),
    GraphExport.csvCell(graphLine.getYVarName()),
    String(index),
    GraphExport.numberText(point.x),
    GraphExport.numberText(point.y),
    String(point.seqX),
    String(point.seqY)
  ].join(',');
};

private static makeMetadata(graphLines: GraphLine[]): string {
  const lines = [
    'Exportacao de grafico MyPhysicsLab',
    'Pagina: '+(document.title || window.location.href),
    'URL: '+window.location.href,
    'Gerado em: '+new Date().toISOString(),
    ''
  ];
  for (const graphLine of graphLines) {
    lines.push('Linha: '+GraphExport.lineName(graphLine));
    lines.push('Eixo X selecionado: '+(graphLine.getXVarName() || '-'));
    lines.push('Eixo Y selecionado: '+(graphLine.getYVarName() || '-'));
    lines.push('Pontos exportados: '+graphLine.getGraphPoints().getSize());
    lines.push('');
  }
  return lines.join('\n');
};

private static lineName(graphLine: GraphLine): string {
  const yName = graphLine.getYVarName();
  return yName ? yName : graphLine.getName();
};

private static csvCell(value: string): string {
  return '"'+value.replace(/"/g, '""')+'"';
};

private static numberText(value: number): string {
  return Number.isFinite(value) ? value.toPrecision(15) : String(value);
};

private static textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
};

private static filePrefix(filePrefix?: string): string {
  const title = filePrefix || document.title || 'grafico';
  const clean = title.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 60);
  const suffix = new Date().toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d+Z$/, 'z');
  return (clean || 'grafico')+'-'+suffix;
};

private static saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    link.remove();
  }, 0);
};

private static makeZip(files: ExportFile[]): Blob {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const fileName = GraphExport.textToBytes(file.name);
    const crc = GraphExport.crc32(file.data);
    const mod = GraphExport.dosDateTime(new Date());
    const localHeader = GraphExport.localHeader(fileName, file.data.length, crc, mod);
    localParts.push(localHeader, file.data);
    centralParts.push(GraphExport.centralHeader(fileName, file.data.length, crc, mod,
        offset));
    offset += localHeader.length + file.data.length;
  }
  const centralOffset = offset;
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = GraphExport.endOfCentralDirectory(files.length, centralSize,
      centralOffset);
  const zipBytes = GraphExport.concat([...localParts, ...centralParts, end]);
  const zipBuffer = zipBytes.buffer.slice(zipBytes.byteOffset,
      zipBytes.byteOffset + zipBytes.byteLength) as ArrayBuffer;
  return new Blob([zipBuffer], { type: 'application/zip' });
};

private static localHeader(fileName: Uint8Array, size: number, crc: number,
    mod: {date: number, time: number}): Uint8Array {
  const header = new Uint8Array(30 + fileName.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, mod.time, true);
  view.setUint16(12, mod.date, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, size, true);
  view.setUint32(22, size, true);
  view.setUint16(26, fileName.length, true);
  view.setUint16(28, 0, true);
  header.set(fileName, 30);
  return header;
};

private static centralHeader(fileName: Uint8Array, size: number, crc: number,
    mod: {date: number, time: number}, offset: number): Uint8Array {
  const header = new Uint8Array(46 + fileName.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, mod.time, true);
  view.setUint16(14, mod.date, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, size, true);
  view.setUint32(24, size, true);
  view.setUint16(28, fileName.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, offset, true);
  header.set(fileName, 46);
  return header;
};

private static endOfCentralDirectory(fileCount: number, centralSize: number,
    centralOffset: number): Uint8Array {
  const header = new Uint8Array(22);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, fileCount, true);
  view.setUint16(10, fileCount, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  view.setUint16(20, 0, true);
  return header;
};

private static dosDateTime(date: Date): {date: number, time: number} {
  const year = Math.max(date.getFullYear(), 1980);
  return {
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    time: (date.getHours() << 11) | (date.getMinutes() << 5) |
        Math.floor(date.getSeconds() / 2)
  };
};

private static concat(parts: Uint8Array[]): Uint8Array {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
};

private static crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i=0; i<data.length; i++) {
    crc = (crc >>> 8) ^ GraphExport.CRC_TABLE[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
};

private static readonly CRC_TABLE: number[] = (() => {
  const table: number[] = [];
  for (let i=0; i<256; i++) {
    let c = i;
    for (let j=0; j<8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

static readonly DOWNLOAD_GRAPH = 'download graph';
static readonly DOWNLOAD_HINT = 'download current graph data';
static readonly DOWNLOAD_ERROR = 'could not download graph';

} // end GraphExport class

Util.defineGlobal('sims$common$GraphExport', GraphExport);
