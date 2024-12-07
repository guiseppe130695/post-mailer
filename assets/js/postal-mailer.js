document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('postal-mailer-button');
    const popup = document.getElementById('postal-mailer-popup');
    const closeBtn = document.querySelector('.postal-mailer-close');
    const backBtn = document.querySelector('.postal-mailer-back');
    const nextBtn = document.querySelector('.postal-mailer-next');
    const steps = document.querySelectorAll('.postal-mailer-step');
    const stepDots = document.querySelectorAll('.step');
    const loadTemplateBtn = document.getElementById('load-template');
    
    let currentStep = 1;
    const COST_PER_LETTER = 1.16;

    const DEFAULT_TEMPLATE = `Madame, Monsieur,

Je vous contacte concernant une information importante relative à votre propriété.

Cordialement,
[Votre nom]`;
    
    // Get selected properties from localStorage
    function getSelectedProperties() {
        try {
            return JSON.parse(localStorage.getItem('selectedProperties')) || [];
        } catch (error) {
            console.error('Error parsing selectedProperties:', error);
            return [];
        }
    }
    
    // Update notification count
    function updateCount() {
        const properties = getSelectedProperties();
        const countElement = document.getElementById('postal-mailer-count');
        
        if (properties.length > 0) {
            countElement.style.display = 'block';
            countElement.textContent = properties.length;
        } else {
            countElement.style.display = 'none';
        }
    }
    
    // Format address
    function formatAddress(recipient) {
        const parts = [];
        if (recipient.denomination) parts.push(recipient.denomination);
        if (recipient.address) parts.push(recipient.address);
        if (recipient.postal && recipient.city) {
            parts.push(`${recipient.postal} ${recipient.city}`);
        }
        return parts.join('\n');
    }

    // Get status class
    function getStatusClass(status) {
        return status === 'Non Envoyé' ? 'status-non-envoye' : '';
    }
    
    // Populate recipients list
    function populateRecipients() {
        const list = document.querySelector('.recipients-list');
        list.innerHTML = '';
        
        const properties = getSelectedProperties();
        
        if (properties.length > 0) {
            properties.forEach(recipient => {
                const div = document.createElement('div');
                div.className = 'recipient-item';
                div.innerHTML = `
                    <div class="recipient-name">${recipient.name}</div>
                    <div class="recipient-details">
                        ${recipient.denomination ? `<div>${recipient.denomination}</div>` : ''}
                        <div>${recipient.address}</div>
                        <div>${recipient.postal} ${recipient.city}</div>
                    </div>
                    <span class="recipient-status ${getStatusClass(recipient.status)}">
                        ${recipient.status || 'Non Envoyé'}
                    </span>
                `;
                list.appendChild(div);
            });
            
            // Update cost summary
            document.getElementById('recipient-count').textContent = properties.length;
            document.getElementById('total-cost').textContent = 
                (properties.length * COST_PER_LETTER).toFixed(2) + '€';
        } else {
            list.innerHTML = '<div class="no-recipients">Aucun destinataire sélectionné</div>';
        }
    }
    
    // Show specific step
    function showStep(step) {
        steps.forEach((s, index) => {
            s.style.display = index + 1 === step ? 'block' : 'none';
        });
        
        stepDots.forEach((dot, index) => {
            dot.classList.toggle('active', index + 1 <= step);
        });
        
        backBtn.disabled = step === 1;
        nextBtn.textContent = step === 3 ? 'Envoyer' : 'Suivant';
        
        currentStep = step;
    }
    
    // Load template
    function loadTemplate() {
        const messageArea = document.getElementById('postal-message');
        messageArea.value = DEFAULT_TEMPLATE;
    }
    
    // Handle form submission
    function handleSubmit() {
        const properties = getSelectedProperties();
        const message = document.getElementById('postal-message').value;
        const totalCost = properties.length * COST_PER_LETTER;
        
        const data = {
            recipients: properties,
            message: message,
            totalCost: totalCost
        };
        
        fetch(postalMailerData.ajaxurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': postalMailerData.nonce
            },
            body: JSON.stringify({
                action: 'postal_mailer_submit',
                nonce: postalMailerData.nonce,
                ...data
            })
        })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                alert(response.data.message);
                popup.style.display = 'none';
                showStep(1);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Une erreur est survenue. Veuillez réessayer.');
        });
    }
    
    // Event Listeners
    button.addEventListener('click', () => {
        popup.style.display = 'flex';
        populateRecipients();
        showStep(1);
    });
    
    closeBtn.addEventListener('click', () => {
        popup.style.display = 'none';
        showStep(1);
    });
    
    backBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            showStep(currentStep - 1);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentStep === 3) {
            handleSubmit();
        } else {
            showStep(currentStep + 1);
        }
    });

    loadTemplateBtn.addEventListener('click', loadTemplate);
    
    // Initial setup
    updateCount();
    
    // Listen for storage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'selectedProperties') {
            updateCount();
            if (popup.style.display === 'flex') {
                populateRecipients();
            }
        }
    });
});