document.addEventListener("DOMContentLoaded", () => {
    // 1. Create and inject style
    const style = document.createElement('style');
    style.innerHTML = `
        #supportModal .support-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            opacity: 0;
            transition: opacity 0.25s ease;
            pointer-events: none;
        }
        #supportModal.active .support-modal-overlay {
            opacity: 1;
            pointer-events: auto;
        }
        #supportModal .support-modal-content {
            background-color: #ffffff;
            border-radius: 16px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border: 1px solid #e2e8f0;
            overflow: hidden;
            transform: scale(0.95);
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        #supportModal.active .support-modal-content {
            transform: scale(1);
        }
        #supportModal .support-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid #e2e8f0;
        }
        #supportModal .support-modal-header h3 {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
            font-family: 'Outfit', sans-serif;
        }
        #supportModal .support-modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #64748b;
            transition: color 0.15s ease;
            padding: 0;
            line-height: 1;
        }
        #supportModal .support-modal-close:hover {
            color: #0f172a;
        }
        #supportModal .support-modal-body {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        #supportModal .support-modal-body p {
            color: #64748b;
            font-size: 14px;
            margin: 0 0 8px 0;
            line-height: 1.5;
            text-align: center;
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
        #supportModal .support-option-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 14px;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            width: 100%;
            box-sizing: border-box;
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
        #supportModal .btn-call {
            background-color: #22c55e;
            color: white;
            border: none;
        }
        #supportModal .btn-call:hover {
            background-color: #16a34a;
            transform: translateY(-1px);
        }
        #supportModal .btn-chat {
            background-color: white;
            border: 1px solid #e2e8f0;
            color: #0f172a;
        }
        #supportModal .btn-chat:hover {
            background-color: #f8fafc;
            border-color: #cbd5e1;
            transform: translateY(-1px);
        }
    `;
    document.head.appendChild(style);

    // 2. Create and inject Modal HTML container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'supportModal';
    modalContainer.innerHTML = `
        <div class="support-modal-overlay">
            <div class="support-modal-content">
                <div class="support-modal-header">
                    <h3>Contact Support</h3>
                    <button class="support-modal-close" id="btnCloseSupport">&times;</button>
                </div>
                <div class="support-modal-body">
                    <p>How would you like to connect with our support helpdesk?</p>
                    <button class="support-option-btn btn-call disabled" disabled style="cursor: not-allowed; opacity: 0.5; pointer-events: none;">
                        <i class="fa-solid fa-phone"></i> Call Us (Unavailable)
                    </button>
                    <button id="btnChatOption" class="support-option-btn btn-chat disabled" disabled style="cursor: not-allowed; opacity: 0.5; pointer-events: none;">
                        <i class="fa-solid fa-comments" style="color: #94a3b8;"></i> Chat Us (Unavailable)
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);

    // 3. Set up event listeners
    const modal = document.getElementById('supportModal');
    const closeBtn = document.getElementById('btnCloseSupport');
    const overlay = modal.querySelector('.support-modal-overlay');
    const chatBtn = document.getElementById('btnChatOption');

    const showModal = () => {
        modal.classList.add('active');
    };

    const hideModal = () => {
        modal.classList.remove('active');
    };

    closeBtn.addEventListener('click', hideModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideModal();
    });

    chatBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    // 4. Intercept all contact support button clicks
    const setupButton = () => {
        const supportBtn = document.getElementById('btnContactSupport');
        if (supportBtn) {
            // Clone to remove previous listeners
            const clonedBtn = supportBtn.cloneNode(true);
            supportBtn.parentNode.replaceChild(clonedBtn, supportBtn);
            clonedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showModal();
            });
        }
    };

    // Run setup
    setupButton();

    // Re-run setup on dynamic updates if any
    const observer = new MutationObserver(() => {
        const supportBtn = document.getElementById('btnContactSupport');
        if (supportBtn && !supportBtn.onclick && !supportBtn.dataset.hasSupportListener) {
            supportBtn.dataset.hasSupportListener = 'true';
            setupButton();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
});
