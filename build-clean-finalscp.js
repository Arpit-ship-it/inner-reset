const fs = require('fs');

let html = fs.readFileSync('finalscp.html', 'utf8');

// 1. Ensure BACKEND_URL points dynamically to localhost or production
html = html.replace(
    /const BACKEND_URL = [\s\S]*?;/g,
    `const BACKEND_URL = (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')\n            ? 'https://inner-reset-20-production.up.railway.app'\n            : 'http://localhost:5000';`
);

// 2. Ensure openRegistrationModal and closeRegistrationModal use dynamic element retrieval with display flex important
const openModalReplacement = `        function openRegistrationModal() {
            const modal = document.getElementById('registrationModal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.setProperty('display', 'flex', 'important');
                document.body.style.overflow = 'hidden';
                const nameField = document.getElementById('formNameField');
                if (nameField) nameField.focus();
            }
        }

        function closeRegistrationModal() {
            const modal = document.getElementById('registrationModal');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.setProperty('display', 'none', 'important');
                document.body.style.overflow = 'auto';
            }
        }

        function openRegistrationModalFromHero() {
            const heroPhone = document.getElementById('heroPhoneInput');
            const modalPhone = document.getElementById('modalPhoneField');
            if (heroPhone && heroPhone.value && modalPhone) {
                modalPhone.value = heroPhone.value;
                if (typeof handleHeroVerifyAndStart === 'function') {
                    handleHeroVerifyAndStart();
                } else {
                    openRegistrationModal();
                }
            } else {
                openRegistrationModal();
            }
        }

        window.onclick = function(e) {
            const modal = document.getElementById('registrationModal');
            if (modal && e.target === modal) closeRegistrationModal();
        };

        // 🚀 Floating Subscribe Widget & Universal Click Listener
        document.addEventListener('DOMContentLoaded', () => {
            const affTriggerBtn = document.getElementById('affirmation-trigger-btn');
            if (affTriggerBtn) {
                affTriggerBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openRegistrationModal();
                });
            }
        });`;

html = html.replace(
    /function openRegistrationModal\(\)[\s\S]*?window\.onclick = function\(e\) \{ if \(e\.target == modal\) closeRegistrationModal\(\); \}/g,
    openModalReplacement
);

// 3. Save as clean finalscp.html, index.html, and frontend/index.html
fs.writeFileSync('finalscp.html', html, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');
fs.writeFileSync('frontend/index.html', html, 'utf8');

console.log('✅ Restored clean, perfect finalscp.html, index.html, and frontend/index.html!');
