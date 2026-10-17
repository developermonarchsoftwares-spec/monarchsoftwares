import { createRoot } from 'react-dom/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { SentIcon } from '@hugeicons/core-free-icons';
import SlingButton from './sling/SlingButton.jsx';

/**
 * Contact / inquiry form - replaces the "Send Inquiry →" button with the React Bits <SlingButton />
 * (official source in src/sling/). The form itself is plain HTML; its existing submit handler in
 * src/main.js (validation, loading / success / error states) stays the single submission path:
 * tapping or releasing the sling calls form.requestSubmit(), which fires that same handler.
 * The label keeps the id `submit-btn`, so main.js still shows "Sending Inquiry..." / "Inquiry Sent ✓" in it.
 */
const mount = document.getElementById('sling-send-root');

if (mount) {
    const form = mount.closest('form');

    const sendInquiry = () => {
        if (!form) return;
        const label = document.getElementById('submit-btn');
        if (label && /Sending/i.test(label.textContent || '')) return; // a send is already in progress
        form.requestSubmit();
    };

    createRoot(mount).render(
        <div className="sling-track">
            <span id="submit-btn" className="sling-track__label" data-label="Send Inquiry →">
                Send Inquiry →
            </span>
            <SlingButton
                onSend={sendInquiry}
                ariaLabel="Send inquiry"
                padColor="#f5f5f5"
                iconColor="#18181b"
                accentColor="#f5f5f5"
                wellColor="#27272a"
                bandColor="#52525b"
                size={38}
                strokeWidth={2.5}
                armAt={32}
                maxPull={120}
                launchSpeed={2600}
                recoil={0.2}
                flight={120}
                particles={14}
                spread={60}
                axis="any"
                tapSends
            >
                <HugeiconsIcon icon={SentIcon} size={16} strokeWidth={2} />
            </SlingButton>
        </div>
    );
}
