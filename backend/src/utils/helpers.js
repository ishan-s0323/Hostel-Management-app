// Convert Oracle UPPER_CASE column names to camelCase
function rowToCamel(row) {
  if (!row) return null;
  const obj = {};
  for (const key in row) {
    const camel = key.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    obj[camel] = row[key];
  }
  return obj;
}

function rowsToCamel(rows) {
  return rows.map(rowToCamel);
}

module.exports = { rowToCamel, rowsToCamel };
