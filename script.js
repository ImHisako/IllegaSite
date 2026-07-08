const header = document.querySelector("[data-header]");

const syncHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 18);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

document.querySelectorAll(".faq-list details").forEach(item => {
    item.addEventListener("toggle", () => {
        if (!item.open) return;

        document.querySelectorAll(".faq-list details").forEach(other => {
            if (other !== item) other.removeAttribute("open");
        });
    });
});

const downloadModal = document.querySelector("[data-download-modal]");
const downloadClose = document.querySelector("[data-download-close]");
const latestInstallerLink = document.querySelector("[data-latest-installer-link]");
const downloadStatus = document.querySelector("[data-download-status]");
const fallbackInstaller = {
    name: "Equilotl.exe",
    url: "https://github.com/ImHisako/IllegalcordInstaller/releases/download/v1.6/Equilotl.exe",
    tag: "v1.6"
};
let latestInstallerPromise;

const setInstaller = installer => {
    if (latestInstallerLink) {
        latestInstallerLink.href = installer.url;
        latestInstallerLink.textContent = installer.name;
    }

    if (downloadStatus) {
        downloadStatus.textContent = `Selected installer: ${installer.name} from ${installer.tag}.`;
    }
};

const loadLatestInstaller = async () => {
    if (latestInstallerPromise) return latestInstallerPromise;

    latestInstallerPromise = fetch("https://api.github.com/repos/ImHisako/IllegalcordInstaller/releases/latest", {
        headers: { Accept: "application/vnd.github+json" }
    })
        .then(response => {
            if (!response.ok) throw new Error("GitHub release lookup failed");
            return response.json();
        })
        .then(release => {
            const assets = Array.isArray(release.assets) ? release.assets : [];
            const installerAsset =
                assets.find(asset => /^Equilotl\.exe$/i.test(asset.name))
                ?? assets.find(asset => /\.exe$/i.test(asset.name));

            if (!installerAsset?.browser_download_url) {
                throw new Error("No Windows installer asset found");
            }

            return {
                name: installerAsset.name,
                url: installerAsset.browser_download_url,
                tag: release.tag_name || release.name || "latest release"
            };
        })
        .catch(() => fallbackInstaller);

    return latestInstallerPromise;
};

const openDownloadModal = () => {
    if (!downloadModal) return;
    downloadModal.hidden = false;
    downloadClose?.focus();

    if (downloadStatus) downloadStatus.textContent = "Checking latest installer...";
    void loadLatestInstaller().then(setInstaller);
};

const closeDownloadModal = () => {
    if (!downloadModal) return;
    downloadModal.hidden = true;
};

document.querySelectorAll("[data-download-trigger]").forEach(trigger => {
    trigger.addEventListener("click", event => {
        event.preventDefault();
        openDownloadModal();
    });
});

downloadClose?.addEventListener("click", closeDownloadModal);

downloadModal?.addEventListener("click", event => {
    if (event.target === downloadModal) closeDownloadModal();
});

window.addEventListener("keydown", event => {
    if (event.key === "Escape") closeDownloadModal();
});

const canAnimateCursor =
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches
    && window.matchMedia("(pointer: fine)").matches;

let lastStarAt = 0;
let activeStars = 0;
const starColors = ["#c7ff41", "#55e6ff", "#ffffff", "#ff6aa7"];

const createCursorStar = event => {
    if (!canAnimateCursor || event.pointerType === "touch") return;

    const now = performance.now();
    if (now - lastStarAt < 38 || activeStars > 42) return;
    lastStarAt = now;
    activeStars++;

    const star = document.createElement("span");
    const size = Math.round(7 + Math.random() * 7);
    const drift = Math.round((Math.random() - 0.5) * 44);
    const fall = Math.round(28 + Math.random() * 54);
    const color = starColors[Math.floor(Math.random() * starColors.length)];

    star.className = "cursor-star";
    star.style.setProperty("--star-x", `${event.clientX}px`);
    star.style.setProperty("--star-y", `${event.clientY}px`);
    star.style.setProperty("--star-size", `${size}px`);
    star.style.setProperty("--star-drift", `${drift}px`);
    star.style.setProperty("--star-fall", `${fall}px`);
    star.style.setProperty("--star-rot", `${Math.round(Math.random() * 180)}deg`);
    star.style.setProperty("--star-color", color);

    document.body.append(star);

    star.addEventListener("animationend", () => {
        star.remove();
        activeStars = Math.max(0, activeStars - 1);
    }, { once: true });
};

window.addEventListener("pointermove", createCursorStar, { passive: true });
