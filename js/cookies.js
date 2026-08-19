document.addEventListener("DOMContentLoaded", () => {

    const banner = document.getElementById("cookieConsent");
    const acceptBtn = document.getElementById("acceptCookies");
    const essentialBtn = document.getElementById("essentialCookies");

    if (!banner) return;

    const consent = localStorage.getItem("littleMonksCookieConsent");

    // Already made a choice
    if (consent) {
        return;
    }

    // Show banner
    setTimeout(() => {
        banner.classList.add("show");
    }, 500);

    function saveConsent(type) {

        localStorage.setItem(
            "littleMonksCookieConsent",
            type
        );

        banner.classList.remove("show");
    }

    acceptBtn?.addEventListener("click", () => {
        saveConsent("all");
    });

    essentialBtn?.addEventListener("click", () => {
        saveConsent("essential");
    });

});