let ncrData = []; // Define a variable to hold the data

// DOMContentLoaded ensures that first all of the HTML is loaded in the web page before adding anything to the HTML structure.
document.addEventListener('DOMContentLoaded', () => {
    // 1. Loading the data
    fetch('Data/ncr_reports.json')
        .then(response => response.json()) // Convert the response to JSON format
        .then(data => {
            ncrData = data; // Assign fetched data to ncrData
            populateTable(ncrData); // Populate table initially
        })
        .catch(error => console.error("An error occurred while retrieving data: ", error));
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      const activeElement = document.activeElement;
      if (activeElement.type === 'radio') {
        activeElement.click(); // Programmatically click the radio button
      }
    }
  });
  
// 2. Function to populate the table
function populateTable(data) {
    const tBody = document.getElementById('ncr-tbody'); // Get the table body
    tBody.innerHTML = ''; // Resetting the table to empty

    // Populate the table with data
    data.forEach(ncr => {
        // Create a new row
        const row = document.createElement('tr');

        // Add table cells (td) for each piece of data
        row.innerHTML = `
            <td>${ncr.qa.supplier_name || 'N/A'}</td>
            <td>${ncr.ncr_no || 'N/A'}</td>
            <td>${ncr.qa.item_description || 'N/A'}</td>
            <td>${ncr.qa.date || 'N/A'}</td>
            <td>${ncr.qa.ncr_closed ? 'Yes' : 'No'}</td>
            <td>${ncr.status}</td>
        `;

        row.addEventListener('click', () => {
            const queryString = new URLSearchParams({
                supplier_name: ncr.qa.supplier_name,
                product_no: ncr.qa.po_no,
                sales_order_no: ncr.qa.sales_order_no,
                item_description: ncr.qa.item_description,
                quantity_received: ncr.qa.quantity_received,
                quantity_defective: ncr.qa.quantity_defective,
                description_of_defect: ncr.qa.description_of_defect,
                item_marked_nonconforming: ncr.qa.item_marked_nonconforming,
                quality_representative_name: ncr.qa.quality_representative_name,
                date: ncr.qa.date,
                resolved: ncr.qa.resolved,
                ncr_no: ncr.ncr_no,
                supplier_or_rec_insp: ncr.qa.process.supplier_or_rec_insp,  
                wip_production_order: ncr.qa.process.wip_production_order 
            }).toString();
            window.location.href = `/ncReport.html?${queryString}`; // Adjust the URL to your routing
        });

        // Append the row to the table body
        tBody.appendChild(row);
    });
}
// 3. Filtering the NCR reports logic
function filterNcr(ncrData) {
    // Getting the data from the filtering options
    const search = document.getElementById('search').value.toLowerCase(); // Convert to lower case
    const date = document.getElementById('date-filter').value;

    // Getting the selected status filter value
    const status = document.querySelector('input[name="status"]:checked')?.value; // Optional chaining for safety

    let records = document.getElementById('record-count');

    const filteredData = ncrData.filter(ncr => {
        // Filtering the data based on search by supplier name or item description
        const matchedSearch = ncr.qa.supplier_name.toLowerCase().includes(search)

        // Filtering the data based on date
        const matchedDate = !date || (date === ncr.qa.date);

        // Filtering by status
        const matchedStatus = !status ||
            (status === 'all') ||
            (status === 'completed' && ncr.status === 'completed') ||
            (status === 'incomplete' && ncr.status === 'incomplete');

        return matchedSearch && matchedDate && matchedStatus;
    });

    records.textContent = `Records found: ${filteredData.length}`;
    populateTable(filteredData); // Re-populate table with filtered data
}

// 4. Attaching the events to the filter inputs
document.getElementById('search').addEventListener('input', () => filterNcr(ncrData));
document.getElementById('date-filter').addEventListener('change', () => filterNcr(ncrData));
document.querySelectorAll('input[name="status"]').forEach(input => {
    input.addEventListener('change', () => filterNcr(ncrData));
});
