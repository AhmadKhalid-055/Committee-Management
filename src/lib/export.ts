/**
 * Utility to export an array of JSON objects into an Excel-friendly CSV format
 */
export function exportToCSV(data: any[], headers: { key: string; label: string }[], filename = "export") {
  if (!data || !data.length) return;

  const csvRows = [];
  
  // 1. Header row
  csvRows.push(headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(","));

  // 2. Data rows
  for (const row of data) {
    const values = headers.map(h => {
      // Handle nested properties (e.g., 'committee.name' or 'uploadedBy.name')
      const keys = h.key.split(".");
      let val: any = row;
      for (const k of keys) {
        val = val?.[k];
      }

      // Format arrays, dates, or nested items
      if (val === undefined || val === null) {
        val = "";
      } else if (val instanceof Date) {
        val = val.toLocaleDateString();
      } else if (Array.isArray(val)) {
        val = val.length; // export array length (e.g. member count, participant count)
      } else if (typeof val === "object") {
        val = JSON.stringify(val);
      }

      // Clean and escape quotes
      const cleanVal = String(val).replace(/"/g, '""');
      return `"${cleanVal}"`;
    });
    csvRows.push(values.join(","));
  }

  // 3. Create blob and download
  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
