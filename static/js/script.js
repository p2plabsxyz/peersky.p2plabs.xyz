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

    // --- CAPTCHA Functions ---
    
    // --- Mock CAP for local testing ---
    /*function showCaptcha(url) {
        pendingDownloadUrl = url;
        captchaModal.style.display = "flex";

        // If capInstance already exists, reset it
        if (!capInstance) {
            // Mock CAP object
            capInstance = {
                solve: () => {
                    console.log("Mock CAPTCHA solved!");
                    onVerified();
                },
                reset: () => {
                    console.log("Mock CAPTCHA reset");
                }
            };

            // Create a fake button in the modal to "solve" CAPTCHA
            const mockBtn = document.createElement("button");
            mockBtn.textContent = "I'm Human (Mock)";
            mockBtn.style.padding = "8px 16px";
            mockBtn.style.cursor = "pointer";
            mockBtn.addEventListener("click", () => capInstance.solve());

            // Clear container and add mock button
            capContainer.innerHTML = "";
            capContainer.appendChild(mockBtn);
        } else {
            capInstance.reset();
        }
    }*/

    function showCaptcha(url) {
        pendingDownloadUrl = url;
        if (captchaModal) captchaModal.style.display = "flex";

        if (typeof Cap !== 'undefined') {
            if (!capInstance) {
                capInstance = new Cap({
                    el: "#cap-container",
                    theme: "light",
                    verified: onVerified
                });
            } else {
                capInstance.reset();
            }
        } else {
            console.warn("Cap library not loaded!");
        }
    }

    function onVerified() {
        if (captchaModal) captchaModal.style.display = "none";
        if (pendingDownloadUrl) {
            window.open(pendingDownloadUrl, "_blank");
            pendingDownloadUrl = null;
        }
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
                    const a = document.createElement('a');
                    a.href = asset.browser_download_url;
                    a.textContent = asset.name;
                    a.classList.add('text-blue-600', 'hover:underline');
                    a.style.cursor = 'pointer';

                    // Show CAPTCHA on click
                    a.addEventListener('click', e => {
                        e.preventDefault();
                        showCaptcha(asset.browser_download_url);
                    });

                    li.appendChild(a);
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
