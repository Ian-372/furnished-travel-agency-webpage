// =========================================
// LITTLE MONKS SAFARIS
// SERVICES PAGE JAVASCRIPT
// =========================================


// =========================================
// REVEAL ANIMATIONS
// =========================================

const revealElements =
    document.querySelectorAll(".reveal");


const revealObserver =
    new IntersectionObserver(

        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    revealObserver.unobserve(
                        entry.target
                    );

                }

            });

        },

        {
            threshold: 0.12
        }

    );


revealElements.forEach((element) => {

    revealObserver.observe(element);

});



// =========================================
// MOBILE NAVIGATION
// =========================================

const menuButton =
    document.querySelector(".services-menu-btn");


const navigation =
    document.querySelector(".services-links");


if (menuButton && navigation) {

    menuButton.addEventListener("click", () => {

        navigation.classList.toggle("mobile-open");

    });

}



// =========================================
// CLOSE MOBILE MENU AFTER CLICK
// =========================================

const navigationLinks =
    document.querySelectorAll(
        ".services-links a"
    );


navigationLinks.forEach((link) => {

    link.addEventListener("click", () => {

        navigation.classList.remove(
            "mobile-open"
        );

    });

});



// =========================================
// SERVICE BOOKING TRACKING
// =========================================

const serviceButtons =
    document.querySelectorAll(
        ".service-btn"
    );


serviceButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const url =
            new URL(
                button.href,
                window.location.origin
            );


        const service =
            url.searchParams.get("service");


        if (service) {

            localStorage.setItem(
                "selectedService",
                service
            );

        }

    });

});



// =========================================
// CURRENT YEAR
// =========================================

const copyright =
    document.querySelector(".copyright");


if (copyright) {

    copyright.textContent =
        `© ${new Date().getFullYear()} Little Monks Safaris. All Rights Reserved.`;

}