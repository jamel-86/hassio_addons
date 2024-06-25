document.addEventListener('DOMContentLoaded', async () => {
  // Fetch Supabase configuration from the backend
  const response = await fetch('/config');
  const config = await response.json();

  const SUPABASE_URL = config.SUPABASE_URL;
  const SUPABASE_KEY = config.SUPABASE_KEY;

  const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // Fetch states from Supabase
  const { data, error } = await supabase.from('states').select('*');
  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  console.log('Fetched data:', data); // Log the fetched data

  const tableBody = document.getElementById('data-table').querySelector('tbody');
  tableBody.innerHTML = ''; // Clear existing table data

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
