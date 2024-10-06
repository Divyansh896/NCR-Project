document.addEventListener("DOMContentLoaded", function () {
    const queryParams = new URLSearchParams(window.location.search)
    const user = JSON.parse(sessionStorage.getItem("currentUser"));

    const currentPage = window.location.pathname // Get current page path
    const isCreateNCRPage = currentPage.includes('create_ncr') // Check if it's the Create NCR page

    // Get all input fields and textareas
    const inputFields = document.querySelectorAll('input, textarea, select')

    if(user.role =='QA' || user.role === 'engineer' || user.role === 'purch'){

        // Disable all input fields on page load
        window.onload = function () {
            inputFields.forEach(field => {
                field.disabled = true // Disable each input field
            })
        }
    }
    // Enable fields when "Edit" button is clicked
    document.querySelector('.edit').addEventListener('click', function () {
        inputFields.forEach(field => {
            field.disabled = false // Enable each input field
        })
    })

    // Select all details elements and toggle their open attribute based on the page
    document.querySelectorAll('details').forEach(details => {
        details.setAttribute('open', !isCreateNCRPage) // Expand if not on Create NCR page
    })

    // Load data into input fields from URL parameters
    loadData()

    function loadData() {
        // Map input field IDs to their respective query parameters
        const fieldsMap = {
            'qa-name': 'quality_representative_name',
            'ncr-no': 'ncr_no',
            'sales-order-no': 'sales_order_no',
            'quantity-received': 'quantity_received',
            'quantity-defective': 'quantity_defective',
            'qa-date': 'date',
            'supplier-name': 'supplier_name',
            'product-no': 'product_no',
            'description-item': 'item_description',
            'description-defect': 'description_of_defect',
            'item-marked-yes': 'item_marked_nonconforming'
        }

        // Populate input fields from the query parameters
        for (const [fieldId, paramName] of Object.entries(fieldsMap)) {
            const field = document.getElementById(fieldId)
            if (field) {
                if (field.type === 'radio') {
                    // Check the radio buttons based on the value from URL
                    const itemMarkedValue = queryParams.get(paramName)
                    document.getElementById(itemMarkedValue === 'yes' ? 'item-marked-yes' : 'item-marked-no').checked = true
                } else {
                    field.value = queryParams.get(paramName) || '' // Fallback to an empty string if no value
                }
            }
        }
    }
    // Get the values from the query string
    const supplierOrRecInsp = queryParams.get('supplier_or_rec_insp'); // true/false
    const wipProductionOrder = queryParams.get('wip_production_order'); // true/false

    // Determine the process based on the query string values
    let selectedProcess = '';

    if (supplierOrRecInsp == true) {
        selectedProcess = 'supplier';
    } else {
        selectedProcess = 'wip';
    }

    // Set the selected value of the select option
    document.getElementById('process').value = selectedProcess; // Set selected value

})
