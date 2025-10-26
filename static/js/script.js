// --- Constants & Variables ---
const releaseUrl = 'https://api.github.com/repos/p2plabsxyz/peersky-browser/releases';
let releaseData = null;

// CAPTCHA variables
let capInstance = null;
let pendingDownloadUrl = null;

document.addEventListener('DOMContentLoaded', () => {
    const captchaModal = document.getElementById("captchaModal");
    const cancelCaptcha = document.getElementById("cancelCaptcha");
    const capContainer = document.getElementById("cap-container");

    function showCaptcha(url) {
        pendingDownloadUrl = url;
        if (captchaModal) captchaModal.style.display = "flex";

        const captchaText = generateCaptcha();
        
        capContainer.innerHTML = `
            <div style="text-align: center;">
                <canvas id="captchaCanvas" width="200" height="60" style="border: 2px solid #ddd; border-radius: 8px; background: #f5f5f5; margin-bottom: 10px;"></canvas>
                <input type="text" id="captchaInput" placeholder="Enter captcha" style="width: 200px; padding: 8px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; margin-bottom: 10px;" />
                <button id="verifyCaptchaBtn" style="width: 200px; padding: 10px; background: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Verify</button>
            </div>
        `;

        drawCaptcha(captchaText);

        document.getElementById("verifyCaptchaBtn").addEventListener("click", async () => {
            const userInput = document.getElementById("captchaInput").value;
            if (userInput === captchaText) {
                await onVerified("mock-token");
            } else {
                alert("CAPTCHA verification failed! Please try again.");
                showCaptcha(url);
            }
        });

        document.getElementById("captchaInput").addEventListener("keypress", async (e) => {
            if (e.key === "Enter") {
                const userInput = document.getElementById("captchaInput").value;
                if (userInput === captchaText) {
                    await onVerified("mock-token");
                } else {
                    alert("CAPTCHA verification failed! Please try again.");
                    showCaptcha(url);
                }
            }
        });
    }

    function generateCaptcha() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return captcha;
    }

    function drawCaptcha(text) {
        const canvas = document.getElementById('captchaCanvas');
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }
        
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        ctx.font = 'bold 32px Arial';
        ctx.textBaseline = 'middle';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const x = 20 + i * 30;
            const y = 30 + (Math.random() - 0.5) * 10;
            const angle = (Math.random() - 0.5) * 0.4;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100})`;
            ctx.fillText(char, 0, 0);
            ctx.restore();
        }
    }

    async function onVerified(captchaToken) {
        if (captchaModal) captchaModal.style.display = "none";
        if (!pendingDownloadUrl) return;

        try {
            const urlParts = pendingDownloadUrl.split('/');
            const requestedFile = urlParts[urlParts.length - 1];
            const tag = urlParts[urlParts.length - 2];

            const response = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    captchaToken,
                    requestedFile,
                    tag
                })
            });

            const data = await response.json();

            if (response.ok && data.downloadUrl) {
                window.open(data.downloadUrl, '_blank');
            } else {
                alert('Download failed: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Download request failed:', err);
            alert('Download failed. Please try again.');
        }

        pendingDownloadUrl = null;
    }

    if (cancelCaptcha) {
        cancelCaptcha.addEventListener("click", () => {
            if (captchaModal) captchaModal.style.display = "none";
            pendingDownloadUrl = null;
        });
    }

    // --- Fetch Release Data ---
    async function fetchRelease() {
        if (releaseData) return releaseData;
        try {
            const response = await fetch(releaseUrl);
            if (!response.ok) throw new Error('Network response was not ok');

            const releases = await response.json();
            let latest = releases.find(r => !r.prerelease) || releases[0];
            releaseData = latest;
            return releaseData;
        } catch (error) {
            console.error('Error fetching release data:', error);
        }
    }

    // --- Render Download Assets ---
    function renderAssets(os) {
        const container = document.getElementById('download-options');
        container.innerHTML = '';

        const details = document.createElement('details');
        details.classList.add('bg-gray-100', 'p-4', 'rounded', 'shadow');

        const summary = document.createElement('summary');
        summary.textContent = `Download Options for ${os.charAt(0).toUpperCase() + os.slice(1)}`;
        summary.classList.add('cursor-pointer', 'font-semibold', 'mb-2');
        details.appendChild(summary);

        const ul = document.createElement('ul');
        ul.classList.add('list-disc', 'ml-6');

        if (!releaseData || !releaseData.assets) {
            const li = document.createElement('li');
            li.textContent = "No release data available.";
            ul.appendChild(li);
        } else {
            let filteredAssets = releaseData.assets.filter(asset => {
                const name = asset.name.toLowerCase();
                return (os === 'mac' && name.includes('mac')) ||
                       (os === 'linux' && name.includes('linux')) ||
                       (os === 'windows' && name.includes('exe'));
            });

            if (filteredAssets.length === 0) {
                const li = document.createElement('li');
                li.textContent = "No downloads available for this OS.";
                ul.appendChild(li);
            } else {
                filteredAssets.forEach(asset => {
                    const li = document.createElement('li');
                    const btn = document.createElement('button');
                    btn.textContent = asset.name;
                    btn.classList.add('text-blue-600', 'hover:underline');
                    btn.style.cursor = 'pointer';

                    // Show CAPTCHA on click
                    btn.addEventListener('click', () => {
                        showCaptcha(asset.browser_download_url);
                    });

                    li.appendChild(btn);
                    ul.appendChild(li);
                });
            }
        }

        details.appendChild(ul);

        // macOS warning
        if (os === 'mac') {
            const note = document.createElement('p');
            note.innerHTML =
                '⚠️ Warning: Since we are not yet on the App Store till stable v1.0.0 release, follow these steps:<br/>- Open Terminal and run: <code style="background-color: #FFF5D2;">xattr -rd com.apple.quarantine \"/Applications/Peersky Browser.app\"</code><br/>- Open "Settings" → "Security & Privacy" → "Open Anyway"';
            note.classList.add('text-xs', 'text-gray-600', 'mt-2');
            details.appendChild(note);
        }

        container.appendChild(details);
        details.open = true;
    }

    // --- OS Button Event Listeners ---
    document.getElementById('btn-mac')?.addEventListener('click', async () => {
        await fetchRelease();
        renderAssets('mac');
    });

    document.getElementById('btn-linux')?.addEventListener('click', async () => {
        await fetchRelease();
        renderAssets('linux');
    });

    document.getElementById('btn-windows')?.addEventListener('click', async () => {
        await fetchRelease();
        renderAssets('windows');
    });

    // --- Display Latest Release Version ---
    (async () => {
        const release = await fetchRelease();
        const version = release ? release.tag_name : 'Release info unavailable';
        const versionEl = document.getElementById('latest-release');
        if (versionEl) versionEl.textContent = version;
    })();

    // --- Logo Blink Animation ---
    const logo = document.querySelector('.logo');
    if (logo) {
        const originalSrc = logo.getAttribute('src');
        const hoverSrc = './images/blink.png';
        setTimeout(() => {
            logo.setAttribute('src', hoverSrc);
            setTimeout(() => logo.setAttribute('src', originalSrc), 300);
        }, 500);
        logo.addEventListener('mouseenter', () => logo.setAttribute('src', hoverSrc));
        logo.addEventListener('mouseleave', () => logo.setAttribute('src', originalSrc));
    }
});
