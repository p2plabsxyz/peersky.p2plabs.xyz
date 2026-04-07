const releaseUrl =
  "https://api.github.com/repos/p2plabsxyz/peersky-browser/releases";
let releaseData = null;

const MAC_QUARANTINE_CMD =
  'xattr -rd com.apple.quarantine "/Applications/Peersky Browser.app"';

async function writeTextToClipboard(text) {
  if (typeof text !== "string") {
    return false;
  }
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.readOnly = true;
    ta.setAttribute("aria-hidden", "true");
    ta.tabIndex = -1;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

async function fetchRelease() {
  if (releaseData) return releaseData;
  try {
    const response = await fetch(releaseUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const releases = await response.json();
    if (!Array.isArray(releases) || releases.length === 0) {
      throw new Error("Invalid releases payload");
    }
    let latest = releases.find((r) => r.prerelease === false);
    if (!latest) {
      latest = releases[0];
    }
    releaseData = latest;
    return releaseData;
  } catch (error) {
    console.error("Error fetching release data:", error);
  }
}

function isSafeReleaseDownloadUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    const h = u.hostname.toLowerCase();
    return (
      h === "github.com" ||
      h.endsWith(".github.com") ||
      h === "objects.githubusercontent.com" ||
      h.endsWith(".githubusercontent.com")
    );
  } catch {
    return false;
  }
}

function pickMacAssets(assets) {
  return assets.filter((asset) => {
    const n = asset.name.toLowerCase();
    return n.includes("mac") && n.endsWith(".dmg");
  });
}

function pickLinuxAssets(assets) {
  return assets.filter((asset) => {
    const n = asset.name.toLowerCase();
    if (!n.includes("linux")) return false;
    if (n.endsWith(".yml") || n.endsWith(".yaml")) return false;
    return /\.(deb|apk|pacman|appimage)$/i.test(asset.name);
  });
}

function pickWindowsAssets(assets) {
  return assets.filter((asset) => {
    const n = asset.name.toLowerCase();
    return n.endsWith(".exe") && n.includes("setup");
  });
}

function appendDownloadLinks(ul, assets) {
  assets.forEach((asset) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = asset.browser_download_url;
    a.rel = "noopener noreferrer";
    a.textContent = asset.name;
    a.target = "_blank";
    a.classList.add("text-blue-600", "hover:underline");
    li.appendChild(a);
    ul.appendChild(li);
  });
}

function renderAssets(os) {
  const container = document.getElementById("download-options");
  if (!container) {
    return;
  }
  container.innerHTML = "";

  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = `Download Options for ${os.charAt(0).toUpperCase() + os.slice(1)}`;
  summary.classList.add("cursor-pointer", "font-semibold", "mb-2");
  details.appendChild(summary);

  const panel = document.createElement("div");
  panel.classList.add("bg-gray-100", "p-4", "rounded", "shadow");

  const ul = document.createElement("ul");
  ul.classList.add("list-disc", "ml-6");

  if (!releaseData || !releaseData.assets) {
    const li = document.createElement("li");
    li.textContent = "No release data available.";
    ul.appendChild(li);
  } else {
    let filteredAssets = [];
    if (os === "mac") {
      filteredAssets = pickMacAssets(releaseData.assets);
    } else if (os === "linux") {
      filteredAssets = pickLinuxAssets(releaseData.assets);
    } else if (os === "windows") {
      filteredAssets = pickWindowsAssets(releaseData.assets);
    }
    filteredAssets = filteredAssets.filter((a) =>
      isSafeReleaseDownloadUrl(a.browser_download_url),
    );

    if (filteredAssets.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No downloads available for this OS.";
      ul.appendChild(li);
    } else if (os === "mac") {
      const armAssets = filteredAssets.filter((a) =>
        a.name.toLowerCase().includes("arm64"),
      );
      const intelAssets = filteredAssets.filter((a) =>
        a.name.toLowerCase().includes("x64"),
      );
      const otherMac = filteredAssets.filter((a) => {
        const n = a.name.toLowerCase();
        return !n.includes("arm64") && !n.includes("x64");
      });

      const addMacSection = (title, assets) => {
        if (assets.length === 0) return;
        const label = document.createElement("li");
        label.textContent = title;
        label.classList.add(
          "mt-2",
          "font-semibold",
          "text-gray-700",
          "list-none",
        );
        ul.appendChild(label);
        appendDownloadLinks(ul, assets);
      };

      addMacSection("Apple Silicon (M series) – arm64", armAssets);
      addMacSection("Intel Mac – x64", intelAssets);
      addMacSection("macOS", otherMac);
    } else {
      appendDownloadLinks(ul, filteredAssets);
    }
  }
  panel.appendChild(ul);

  if (os === "mac") {
    const note = document.createElement("p");
    note.classList.add("text-xs", "text-gray-600", "mt-4");
    note.appendChild(
      document.createTextNode(
        "❗️Important: Since we are not yet on the App Store till stable v1.0.0 release, before opening the app:",
      ),
    );
    note.appendChild(document.createElement("br"));
    note.appendChild(document.createTextNode("- Open Terminal and run: "));
    const cmdCode = document.createElement("code");
    cmdCode.textContent = MAC_QUARANTINE_CMD;
    cmdCode.style.backgroundColor = "#FFF5D2";
    note.appendChild(cmdCode);
    const copyCmdBtn = document.createElement("button");
    copyCmdBtn.type = "button";
    copyCmdBtn.textContent = "Copy command";
    copyCmdBtn.classList.add(
      "ml-2",
      "mb-1",
      "px-2",
      "py-1",
      "text-xs",
      "rounded",
      "border",
      "border-gray-400",
      "bg-white",
      "text-gray-800",
      "shadow-sm",
      "hover:bg-gray-50",
      "align-middle",
    );
    copyCmdBtn.setAttribute(
      "aria-label",
      "Copy quarantine removal command to clipboard",
    );
    let copyLabelTimer = null;
    copyCmdBtn.addEventListener("click", async () => {
      const ok = await writeTextToClipboard(MAC_QUARANTINE_CMD);
      if (copyLabelTimer) {
        clearTimeout(copyLabelTimer);
      }
      copyCmdBtn.textContent = ok ? "Copied" : "Failed";
      copyLabelTimer = setTimeout(() => {
        copyCmdBtn.textContent = "Copy command";
        copyLabelTimer = null;
      }, 2000);
    });
    note.appendChild(copyCmdBtn);
    note.appendChild(document.createElement("br"));
    note.appendChild(
      document.createTextNode(
        "- Or on older macOS: System Preferences → Security & Privacy → Open Anyway",
      ),
    );
    panel.appendChild(note);
  }

  details.appendChild(panel);

  if (releaseData && typeof releaseData.tag_name === "string") {
    const tag = releaseData.tag_name;
    const releasePageUrl = `https://github.com/p2plabsxyz/peersky-browser/releases/tag/${encodeURIComponent(tag)}`;
    try {
      const u = new URL(releasePageUrl);
      if (
        u.protocol === "https:" &&
        u.hostname === "github.com" &&
        u.pathname.startsWith(
          "/p2plabsxyz/peersky-browser/releases/tag/",
        )
      ) {
        const releaseFooter = document.createElement("p");
        releaseFooter.classList.add(
          "text-xs",
          "text-gray-600",
          "mt-2",
          "break-all",
        );
        releaseFooter.appendChild(
          document.createTextNode("Check full release: "),
        );
        const releaseLink = document.createElement("a");
        releaseLink.href = releasePageUrl;
        releaseLink.textContent = releasePageUrl;
        releaseLink.target = "_blank";
        releaseLink.rel = "noopener noreferrer";
        releaseLink.classList.add("text-blue-600", "hover:underline");
        releaseFooter.appendChild(releaseLink);
        details.appendChild(releaseFooter);
      }
    } catch {
      /* ignore tag */
    }
  }

  container.appendChild(details);
  details.open = true;
}

document.getElementById("btn-mac").addEventListener("click", async () => {
  await fetchRelease();
  renderAssets("mac");
});

document.getElementById("btn-linux").addEventListener("click", async () => {
  await fetchRelease();
  renderAssets("linux");
});

document.getElementById("btn-windows").addEventListener("click", async () => {
  await fetchRelease();
  renderAssets("windows");
});

(async function () {
  const release = await fetchRelease();
  const version = release ? release.tag_name : "Release info unavailable";
  document.getElementById("latest-release").textContent = version;
})();

const logo = document.querySelector(".logo");
const originalSrc = logo.getAttribute("src");
const hoverSrc = "./images/blink.png";

setTimeout(() => {
  logo.setAttribute("src", hoverSrc);
  setTimeout(() => {
    logo.setAttribute("src", originalSrc);
  }, 300);
}, 500);

logo.addEventListener("mouseenter", () => {
  logo.setAttribute("src", hoverSrc);
});
logo.addEventListener("mouseleave", () => {
  logo.setAttribute("src", originalSrc);
});
