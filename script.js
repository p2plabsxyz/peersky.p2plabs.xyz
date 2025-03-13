// Use the releases endpoint to include pre-releases as needed
const releaseUrl = 'https://api.github.com/repos/p2plabsxyz/peersky-browser/releases';
let releaseData = null;

// Fetch and cache the latest release data (even if it's a pre-release)
async function fetchRelease() {
    if (releaseData) return releaseData;
    try {
        const response = await fetch(releaseUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const releases = await response.json();
        // Try to select the latest stable release; if none exists, pick the first (most recent) release.
        let latest = releases.find(r => r.prerelease === false);
        if (!latest) {
            latest = releases[0];
        }
        releaseData = latest;
        return releaseData;
    } catch (error) {
        console.error('Error fetching release data:', error);
    }
}

// Render download assets for the specified OS ("mac", "linux", "windows")
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
        let filteredAssets = [];
        if (os === 'mac') {
            filteredAssets = releaseData.assets.filter(asset =>
                asset.name.toLowerCase().includes('mac')
            );
        } else if (os === 'linux') {
            filteredAssets = releaseData.assets.filter(asset =>
                asset.name.toLowerCase().includes('linux')
            );
        } else if (os === 'windows') {
            filteredAssets = releaseData.assets.filter(asset =>
                asset.name.toLowerCase().includes('exe')
            );
        }

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
                a.target = '_blank';
                a.classList.add('text-blue-600', 'hover:underline');
                li.appendChild(a);
                ul.appendChild(li);
            });
        }
    }
    details.appendChild(ul);

    if (os === 'mac') {
        const note = document.createElement('p');
        note.innerHTML =
            '⚠️ Open "Settings" → "Security & Privacy" → "Open Anyway" and then <br/>Open Terminal and run: <code>xattr -rd com.apple.quarantine "/Applications/Peersky Browser.app"</code> since we are not yet on the App Store.';
        note.classList.add('text-xs', 'text-gray-600', 'mt-2');
        details.appendChild(note);
    }


    container.appendChild(details);
    details.open = true;
}

// Set up event listeners for each OS button
document.getElementById('btn-mac').addEventListener('click', async () => {
    await fetchRelease();
    renderAssets('mac');
});

document.getElementById('btn-linux').addEventListener('click', async () => {
    await fetchRelease();
    renderAssets('linux');
});

document.getElementById('btn-windows').addEventListener('click', async () => {
    await fetchRelease();
    renderAssets('windows');
});

// Use the same fetchRelease function to update the version display
(async function () {
    const release = await fetchRelease();
    const version = release ? release.tag_name : 'Release info unavailable';
    document.getElementById('latest-release').textContent = version;
})();

// Logo blink animation
const logo = document.querySelector('.logo');
const originalSrc = logo.getAttribute('src');
const hoverSrc = './images/blink.png';

// Blink on page load
setTimeout(() => {
    logo.setAttribute('src', hoverSrc);
    setTimeout(() => {
        logo.setAttribute('src', originalSrc);
    }, 300);
}, 500);

logo.addEventListener('mouseenter', () => {
    logo.setAttribute('src', hoverSrc);
});
logo.addEventListener('mouseleave', () => {
    logo.setAttribute('src', originalSrc);
});