document.addEventListener('DOMContentLoaded', async () => {
  const SUPABASE_URL = 'your-supabase-url';
  const SUPABASE_KEY = 'your-supabase-key';
  const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data, error } = await supabase.from('states').select('*');
  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  const tableBody = document.getElementById('data-table').querySelector('tbody');
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.entity_id}</td>
      <td>${row.state}</td>
      <td>${new Date(row.last_changed).toLocaleString()}</td>
    `;
    tableBody.appendChild(tr);
  });
});
