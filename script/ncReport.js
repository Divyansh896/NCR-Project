document.addEventListener("DOMContentLoaded", function () {
    const queryParams = new URLSearchParams(window.location.search);
    const user = JSON.parse(sessionStorage.getItem("currentUser"));

    const currentPage = window.location.pathname; // Get current page path
    const isCreateNCRPage = currentPage.includes('create_ncr'); // Check if it's the Create NCR page

    // Get all input fields and textareas
    const inputFields = document.querySelectorAll('input, textarea, select');

    // Function to disable all fields
    const disableFields = () => {
        inputFields.forEach(field => {
            field.disabled = true; // Disable each input field
        });
    };

    // Function to enable fields based on user role
    const enableFieldsForRole = (role) => {
        if (role === 'QA') {
            document.querySelectorAll('.qa-editable').forEach(field => {
                field.disabled = false; // Enable QA editable fields
            });
        } else if (role === 'engineer') {
            document.querySelectorAll('.eng-editable').forEach(field => {
                field.disabled = false; // Enable Engineering editable fields
            });
        } else if (role === 'purch') {
            document.querySelectorAll('.purch-editable').forEach(field => {
                field.disabled = false; // Enable Purchasing editable fields
            });
        }
        
        // Enable radio buttons
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.disabled = false; // Enable all radio buttons
        });
    };

    // On page load, disable fields based on user role
    disableFields();

    // Enable fields when "Edit" button is clicked
    document.querySelector('.edit').addEventListener('click', function () {
        enableFieldsForRole(user.role);
    });

    // Save changes when "Save" button is clicked
    document.querySelector('#purch-save').addEventListener('click', function () {
        // Implement your save logic here, like sending the data to the server
        alert('Changes saved!'); // Example feedback message

        // Optionally, disable fields again after saving
        disableFields();
    });

    // Select all details elements and toggle their open attribute based on the page
    document.querySelectorAll('details').forEach(details => {
        details.setAttribute('open', !isCreateNCRPage); // Expand if not on Create NCR page
    });

    // Load data into input fields from URL parameters
    loadData();

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
            'item-marked-yes': 'item_marked_nonconforming',
            'disposition-details': 'disposition_details'
        };

        // Populate input fields from the query parameters
        for (const [fieldId, paramName] of Object.entries(fieldsMap)) {
           const field = document.getElementById(fieldId);
            if (field) {
                if (field.type === 'radio') {
                    // Set the radio button checked state based on the value from URL
                    const itemMarkedValue = queryParams.get(paramName);
                    if (itemMarkedValue === 'yes') {
                        document.getElementById('item-marked-yes').checked = true;
                    } else if (itemMarkedValue === 'no') {
                        document.getElementById('item-marked-no').checked = true;
                    }
                } else {
                    field.value = queryParams.get(paramName) || ''; // Fallback to an empty string if no value
                }
            }
        }
    }

    // Get the values from the query string
    const supplierOrRecInsp = queryParams.get('supplier_or_rec_insp'); // true/false
    const wipProductionOrder = queryParams.get('wip_production_order'); // true/false

    // Determine the process based on the query string values
    let selectedProcess = '';

    if (supplierOrRecInsp === 'true') {
        selectedProcess = 'supplier';
    } else {
        selectedProcess = 'wip';
    }

    // Set the selected value of the select option
    document.getElementById('process').value = selectedProcess; // Set selected value
});
