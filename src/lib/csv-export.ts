interface EmailCapture {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  company?: string | null;
  captured_at: string;
  page_title?: string;
}

export function exportToCSV(data: EmailCapture[], filename: string = 'email-captures') {
  if (data.length === 0) {
    return;
  }

  // Define CSV headers
  const headers = [
    'Email',
    'First Name',
    'Last Name',
    'Phone',
    'Company',
    'Captured At',
    'Page'
  ];

  // Convert data to CSV rows
  const rows = data.map(capture => [
    escapeCSVField(capture.email),
    escapeCSVField(capture.first_name || ''),
    escapeCSVField(capture.last_name || ''),
    escapeCSVField(capture.phone || ''),
    escapeCSVField(capture.company || ''),
    escapeCSVField(new Date(capture.captured_at).toLocaleString()),
    escapeCSVField(capture.page_title || '')
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function escapeCSVField(field: string): string {
  // If the field contains commas, quotes, or newlines, wrap it in quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    // Escape any existing quotes by doubling them
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
