'use strict';

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '"') {
      if (inQuotes && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((character === '\n' || character === '\r') && !inQuotes) {
      if (character === '\r' && text[index + 1] === '\n') {
        index += 1;
      }

      row.push(field);

      if (row.some((value) => value !== '')) {
        rows.push(row);
      }

      row = [];
      field = '';
      continue;
    }

    field += character;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value !== '')) {
      rows.push(row);
    }
  }

  if (!rows.length) {
    return [];
  }

  const headers = rows[0].map((header, index) => header || `column_${index}`);
  return rows.slice(1).map((values) => {
    const record = {};

    headers.forEach((header, index) => {
      record[header] = values[index] ?? '';
    });

    return record;
  });
}

module.exports = {
  parseCSV
};
