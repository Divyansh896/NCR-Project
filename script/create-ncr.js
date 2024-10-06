document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(sessionStorage.getItem("currentUser"))
    const queryParams = new URLSearchParams(window.location.search)

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          const activeElement = document.activeElement;
          if (activeElement.type === 'radio') {
            activeElement.click(); // Programmatically click the radio button
          }
          if(activeElement.type === 'checkbox'){
            activeElement.click()
          }
        }
      });
      


    // Initialize NCR number based on user role
    let ncrNumber = queryParams.get('ncr_no') // Function to generate the latest NCR number
    console.log(ncrNumber)

    // Only proceed if the user is QA
    if (user.role === 'QA') {
        let currentStep = 0

        updateStatusBar()

        // Remove sections based on user role
        removeSectionsForUser()

        // Handle form elements for QA user
        document.getElementById('ncr-no-generated').value = ncrNumber // Set NCR number in the input field

        // Initialize form steps and elements for QA
        const sections = document.querySelectorAll(".form-section")

        // Update status bar based on current step
        function updateStatusBar() {
            const steps = document.querySelectorAll(".status-bar div")
            steps.forEach((step, index) => {
                step.classList.toggle("active", index === currentStep)
            })

            const leftPosition = currentStep * 33.33
            const width = 100 / steps.length

            document.querySelector('.status-bar').style.setProperty('--underline-left', `${leftPosition}%`)
            document.querySelector('.status-bar').style.setProperty('--underline-width', `${width}%`)
        }

        // Clear fields in a section but keep NCR number and dropdowns intact
        function clearSection(section) {
            const inputsToClear = section.querySelectorAll('input[type="text"], textarea')
            inputsToClear.forEach(input => {
                // Check if the input is not the NCR number field
                if (input.id !== 'ncr-no-generated') {
                    input.value = '' // Clear value
                }
            })

            section.querySelectorAll('.error').forEach(error => error.textContent = '') // Clear error messages
        }

        // Initialize form navigation and submission
        sections[currentStep].classList.add("active")
        updateStatusBar()

        // Add event listeners for navigation buttons
        document.getElementById("next-btn1").addEventListener("click", () => {
            if (validateSection1()) {
                sections[currentStep].classList.remove("active")
                currentStep++
                sections[currentStep].classList.add("active")
                updateStatusBar()
            }
        })

        document.getElementById("next-btn2").addEventListener("click", () => {
            if (validateSection2()) {
                sections[currentStep].classList.remove("active")
                currentStep++
                sections[currentStep].classList.add("active")
                updateStatusBar()
                populateConfirmationData()
            }
        })

        

        document.getElementById("back-btn1").addEventListener("click", () => {
            sections[currentStep].classList.remove("active")
            currentStep--
            sections[currentStep].classList.add("active")
            updateStatusBar()
        })

        document.getElementById("back-btn2").addEventListener("click", () => {
            sections[currentStep].classList.remove("active")
            currentStep--
            sections[currentStep].classList.add("active")
            updateStatusBar()
        })

        // Submit the form and show the confirmation message
        document.getElementById("submit-btn").addEventListener("click", (e) => {
            const check = document.getElementById('confirm-checkbox')
            if (check.checked) {
                sendMail()
                alert("Form submitted")
            } else {
                check.focus()
                check.scrollIntoView({ behavior: "smooth", block: "center" }) // Optional: scroll the checkbox into view
                alert("Please confirm by checking the box before submitting.")
                e.preventDefault()
            }
        })

        // Clear fields in Section 1
        document.getElementById("clear-btn1").addEventListener("click", () => {
            const section1 = document.querySelector('fieldset[aria-labelledby="product-info"]')
            clearSection(section1)
        })

        // Clear fields in Section 2
        document.getElementById("clear-btn2").addEventListener("click", () => {
            const section2 = document.querySelector('fieldset[aria-labelledby="product-desc"]')
            clearSection(section2)
        })

        // Open file dialog for images when the button is clicked
        document.getElementById('add-photo-btn').addEventListener('click', function() {
            document.getElementById('photo-input').click()
        })

        // Open file dialog for videos when the button is clicked
        document.getElementById('add-video-btn').addEventListener('click', function() {
            document.getElementById('video-input').click()
        })

        // Handle file selection for images
        document.getElementById('photo-input').addEventListener('change', function(event) {
            const files = event.target.files
            if (files.length > 0) {
                console.log('Selected photos:', Array.from(files).map(file => file.name))
            }
        })

        // Handle file selection for videos
        document.getElementById('video-input').addEventListener('change', function(event) {
            const files = event.target.files
            if (files.length > 0) {
                console.log('Selected videos:', Array.from(files).map(file => file.name))
            }
        })
        // Validate Section 1
        function validateSection1() {
            let isValid = true

            // Define fields and their corresponding error IDs
            const fields = [
                { id: 'supplier-name', errorId: 'supplier-name-error' },
                { id: 'sales-order-no', errorId: 'sales-order-no-error' },
                { id: 'quantity-received', errorId: 'quantity-received-error' },
                { id: 'quantity-defective', errorId: 'quantity-defective-error' },
                { id: 'product-no', errorId: 'product-no-error' }
            ]

            // Validate each field
            fields.forEach(field => {
                const input = document.getElementById(field.id)
                const errorElement = document.getElementById(field.errorId)

                // Check if the input value is empty or consists of only whitespace
                if (!input.value.trim()) {
                    errorElement.textContent = '*' // Show error if empty
                    isValid = false
                } else {
                    errorElement.textContent = '' // Clear error if valid
                }
            })
            // Additional validation: Check that quantity defective is not greater than quantity received
            const quantityReceived = parseInt(document.getElementById('quantity-received').value, 10)
            const quantityDefective = parseInt(document.getElementById('quantity-defective').value, 10)

            // Check if quantities are valid numbers
            if (!isNaN(quantityReceived) && !isNaN(quantityDefective) && quantityDefective > quantityReceived) {
                const defectiveErrorElement = document.getElementById('quantity-defective-error')
                defectiveErrorElement.textContent = '* Defective quantity cannot be greater than received quantity.' // Show error message
                isValid = false
            } else {
                // Clear error if valid
                document.getElementById('quantity-defective-error').textContent = ''
            }


            // Validate checkboxes
            const checkboxes = document.querySelectorAll('input[type="checkbox"][name="process"]')
            const processError = document.getElementById('process-error')
            if (![...checkboxes].some(checkbox => checkbox.checked)) {
                processError.textContent = '*' // Show error if no checkbox is checked
                isValid = false
            } else {
                processError.textContent = '' // Clear error if valid
            }

            return isValid
        }

        // Validate Section 2
        function validateSection2() {
            let isValid = true

            const fields = [
                { id: 'description-item', errorId: 'description-item-error' },
                { id: 'description-defect', errorId: 'description-defect-error' }
            ]

            fields.forEach(({ id, errorId }) => {
                const field = document.getElementById(id)
                const error = document.getElementById(errorId)
                if (!field.value.trim()) {
                    error.textContent = '*'
                    isValid = false
                } else {
                    error.textContent = ''
                }
            })

            const radioButtons = document.querySelectorAll('input[name="item_marked_nonconforming"]')
            const itemMarkedNonconformingError = document.getElementById('item-marked-nonconforming-error')
            if (![...radioButtons].some(radio => radio.checked)) {
                itemMarkedNonconformingError.textContent = '*'
                isValid = false
            } else {
                itemMarkedNonconformingError.textContent = ''
            }

            return isValid
        }

        function populateConfirmationData() {
            // Get values from Section 1
            const supplierName = document.getElementById('supplier-name').value
            const salesOrderNo = document.getElementById('sales-order-no').value
            const quantityReceived = document.getElementById('quantity-received').value
            const quantityDefective = document.getElementById('quantity-defective').value
            const productNo = document.getElementById('product-no').value

            // Get values from Section 2
            const descriptionItem = document.getElementById('description-item').value
            const descriptionDefect = document.getElementById('description-defect').value

            // Get the non-conforming item marked status
            const nonconformingStatusElement = document.querySelector('input[name=item_marked_nonconforming]:checked').value

            // Populate confirmation section
            document.getElementById('confirm-qa-name').textContent = user.name
            document.getElementById('confirm-date').textContent = new Date().toLocaleDateString()
            document.getElementById('confirm-supplier-name').textContent = supplierName
            document.getElementById('confirm-sales-order-no').textContent = salesOrderNo
            document.getElementById('confirm-quantity-received').textContent = quantityReceived
            document.getElementById('confirm-quantity-defective').textContent = quantityDefective
            document.getElementById('confirm-product-no').textContent = productNo
            document.getElementById('confirm-description-item').textContent = descriptionItem
            document.getElementById('confirm-description-defect').textContent = descriptionDefect
            document.getElementById('confirm-nonconforming-status').textContent = nonconformingStatusElement
        }
    } else {
        // Remove sections based on user role
        removeSectionsForUser()
        const queryParams = new URLSearchParams(window.location.search)

        // Load data for non-QA users
        loadData(queryParams)
    }

    function removeSectionsForUser() {
        const qadropdown = document.getElementById('qa-section')
        const engdropdown = document.getElementById('eng-section')
        const purchdropdown = document.getElementById('purch-section')
        const qaForm = document.getElementById('ncr-form')

        if (user.role === 'QA') {
            qadropdown.remove()
            engdropdown.remove()
            purchdropdown.remove()
        }
        else if (user.role === 'engineer') {
            qaForm.remove()
            engdropdown.remove()
            purchdropdown.remove()
            document.getElementById('underdev').textContent = "Engineer Form is under development."
        } else if (user.role === 'purch') {
            qaForm.remove()
            purchdropdown.remove()
            document.getElementById('underdev').textContent = "Purchasing Form is under development."
        }
    }
    function loadData(params) {
        const elements = [
            'qa-name-d', 'ncr-no-d', 'sales-order-no-d', 'quantity-received-d', 
            'quantity-defective-d', 'qa-date-d', 'supplier-name-d', 
            'product-no-d', 'process-d', 'description-item-d', 
            'description-defect-d', 'item-marked-nonconforming-d'
        ];
    
        const values = [
            params.get('quality_representative_name') || '[QA Name]',
            params.get('ncr_no') || '[NCR No]',
            params.get('sales_order_no') || '[Sales Order No]',
            params.get('quantity_received') || '[Quantity Received]',
            params.get('quantity_defective') || '[Quantity Defective]',
            params.get('date') || '[QA Date]',
            params.get('supplier_name') || '[Supplier Name]',
            params.get('product_no') || '[Product No]',
            params.get('identify_process_applicable') || '[Process]',
            params.get('description_item') || '[Description of Item]',
            params.get('description_of_defect') || '[Description of Defect]',
            params.get('item_marked_nonconforming') || '[Yes/No]'
        ];
    
        elements.forEach((id, index) => {
            const element = document.getElementById(id);
            element.textContent = values[index];
            element.setAttribute('disabled', 'true'); // Disable the element
        });
    }

    function sendMail(){
        const recipient = 'divyansh9030@gmail.com'; // Change to valid recipient's email
            const subject = encodeURIComponent('Request for Engineering Department Details for NCR'); // Subject of the email
            const body = encodeURIComponent(`Dear [Recipient's Name],\n\nI hope this message finds you well.\n\nI am writing to inform you that we have initiated the Non-Conformance Report (NCR) No. ${ncrNumber}. At this stage, we kindly request you to provide the necessary details from the Engineering Department to ensure a comprehensive assessment of the issue.\n\nYour prompt attention to this matter is essential for us to move forward efficiently. Please include any relevant information that could aid in our evaluation and resolution process.\n\nThank you for your cooperation. Should you have any questions or require further clarification, please do not hesitate to reach out.\n\nBest regards,\n\n[Your Name]\n[Your Position]\n[Your Company]\n[Your Contact Information]`);

            // Construct the Gmail compose link
            const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;

            // Open the Gmail compose window
            window.open(gmailLink, '_blank'); // Opens in a new tab
    }
    
})