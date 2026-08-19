/* =========================================
LITTLE MONKS SAFARIS
ABOUT PAGE
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
    SCROLL REVEAL
    ===================================== */

    const revealElements =
        document.querySelectorAll(".reveal");

    const revealObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(element => {

        revealObserver.observe(element);

    });


    /* =====================================
    MOBILE MENU
    ===================================== */

    const menuButton =
        document.getElementById("aboutMenu");

    const navLinks =
        document.querySelector(".about-links");


    if (menuButton && navLinks) {

        menuButton.addEventListener("click", () => {

            navLinks.classList.toggle("mobile-open");

        });

    }


    /* =====================================
    CLOSE MOBILE MENU AFTER CLICK
    ===================================== */

    if (navLinks) {

        navLinks
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener("click", () => {

                    navLinks.classList.remove(
                        "mobile-open"
                    );

                });

            });

    }


    console.log(
        "Little Monks About page loaded."
    );

});