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
