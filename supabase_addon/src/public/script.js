document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fetch Supabase configuration from the backend
    const response = await fetch('http://localhost:8099/config');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const config = await response.json();
    console.log('Fetched config:', config); // Log the fetched config

    const SUPABASE_URL = config.SUPABASE_URL;
    const SUPABASE_KEY = config.SUPABASE_KEY;

    // Ensure the Supabase library is available
    if (typeof supabase === 'undefined') {
      throw new Error('Supabase library is not loaded');
    }

    // Initialize Supabase client
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Fetch states from Supabase
    const { data, error } = await supabaseClient.from('states').select('*');
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }

    console.log('Fetched data:', data); // Log the fetched data

    const tableBody = document.getElementById('data-table').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing table data

    if (!Array.isArray(data)) {
      console.error('Data is not an array:', data);
      return;
    }

    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.entity_id}</td>
        <td>${row.state}</td>
        <td>${new Date(row.last_changed).toLocaleString()}</td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error in script:', error);
  }
});
