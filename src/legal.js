/**
 * Legal.js - Manages Privacy Policy and Terms of Service modals.
 */

// HTML content for legal pages
const legalContent = {
    privacy: {
        title: "Privacy Policy",
        content: `
            <div class="legal-section">
                <h3>1. Introduction</h3>
                <p>Welcome to MONARCH SOFTWARES. We respect your privacy and are committed to protecting your personal data. This privacy policy informs you how we handle personal data when you visit our website or get in touch regarding project engagements.</p>
            </div>
            <div class="legal-section">
                <h3>2. The Data We Collect</h3>
                <p>We may collect, use, and process the following contact and technical information:</p>
                <ul>
                    <li><strong>Contact Information:</strong> Your name, company name, email address, phone number, and project details provided in forms.</li>
                    <li><strong>Technical Telemetry:</strong> Anonymized browser type, general geography, referral source, and device parameters to ensure reliable rendering.</li>
                </ul>
            </div>
            <div class="legal-section">
                <h3>3. How We Use Your Data</h3>
                <p>We use your information exclusively to:</p>
                <ul>
                    <li>Evaluate project scope and respond to inquiries with technical architectures and cost estimates.</li>
                    <li>Coordinate client sprint milestones and deliver custom software services.</li>
                    <li>We never sell, rent, or trade your personal data to third parties for marketing.</li>
                </ul>
            </div>
            <div class="legal-section">
                <h3>4. Data Security</h3>
                <p>We implement standard organizational and technical security measures to prevent unauthorized disclosure, alteration, or destruction of your information.</p>
            </div>
            <div class="legal-section">
                <h3>5. Contact Details</h3>
                <p>If you have questions about this policy or your personal data, reach us at <a href="mailto:contact@monarchsoftwares.com">contact@monarchsoftwares.com</a> or +91 6385753874.</p>
            </div>
        `
    },
    terms: {
        title: "Terms of Service",
        content: `
            <div class="legal-section">
                <h3>1. Engagement Terms</h3>
                <p>By accessing the website at <a href="https://monarchsoftwares.com">monarchsoftwares.com</a>, you agree to be bound by these terms of service, applicable laws, and regulations.</p>
            </div>
            <div class="legal-section">
                <h3>2. Professional Services & IP</h3>
                <p>All custom software architectures, codebases, and digital assets developed under contract belong 100% to our clients upon fulfillment of contract milestones. Informational materials published on this website are protected by copyright.</p>
            </div>
            <div class="legal-section">
                <h3>3. Disclaimer</h3>
                <p>Informational content and demonstration features on this website are provided on an 'as is' basis. While we maintain rigorous engineering standards, warranties regarding third-party platforms are governed by respective client agreements.</p>
            </div>
            <div class="legal-section">
                <h3>4. Governing Law</h3>
                <p>These terms and conditions are governed by and construed in accordance with the laws of India, with jurisdiction in Coimbatore, Tamil Nadu.</p>
            </div>
        `
    }
};

/**
 * Initializes the legal modal structure and sets up event listeners for triggers.
 */
export function initLegalModals() {
    const modalHTML = `
        <div id="legal-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-hidden="true">
            <div class="modal-container">
                <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; border-bottom:1px solid var(--border-light); padding-bottom:1rem;">
                    <h2 id="modal-title" style="font-size:1.4rem; font-weight:600; color:var(--text-primary); margin:0;"></h2>
                    <button id="modal-close" class="modal-close-btn" aria-label="Close modal" style="font-size:1.5rem; cursor:pointer; line-height:1; color:var(--text-secondary);">&times;</button>
                </div>
                <div id="modal-content" class="modal-body" style="font-size:0.95rem; line-height:1.7; color:var(--text-secondary);"></div>
                <div class="modal-footer" style="margin-top:2rem; padding-top:1rem; border-top:1px solid var(--border-light); display:flex; justify-content:flex-end;">
                    <button class="btn btn-outline close-footer-btn" style="padding:0.6rem 1.5rem;">Close</button>
                </div>
            </div>
        </div>
    `;

    if (!document.getElementById('legal-modal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const modal = document.getElementById('legal-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-content');
    const closeBtn = document.getElementById('modal-close');
    const footCloseBtn = modal.querySelector('.close-footer-btn');

    const openModal = (type) => {
        const data = legalContent[type];
        if (!data) return;

        title.innerText = data.title;
        body.innerHTML = data.content;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    document.addEventListener('click', (e) => {
        const privTrigger = e.target.closest('.privacy-trigger, #open-privacy-link');
        const termsTrigger = e.target.closest('.terms-trigger, #open-terms-link');
        if (privTrigger) {
            e.preventDefault();
            openModal('privacy');
        } else if (termsTrigger) {
            e.preventDefault();
            openModal('terms');
        }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (footCloseBtn) footCloseBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
}
