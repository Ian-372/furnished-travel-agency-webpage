// =========================================
// LITTLE MONKS SAFARIS
// PACKAGE PAGE JAVASCRIPT
// =========================================


// =========================================
// PACKAGE BOOKING BUTTONS
// =========================================

const packageButtons =
    document.querySelectorAll(
        ".book-package, .mini-package a[href='index.html#booking']"
    );


packageButtons.forEach(button => {

    button.addEventListener("click", function () {

        const packageCard =
            this.closest(".full-package, .mini-package");


        if (!packageCard) {

            return;

        }


        const packageNameElement =
            packageCard.querySelector("h2, h3");


        if (!packageNameElement) {

            return;

        }


        const packageName =
            packageNameElement.textContent
                .replace(/\s+/g, " ")
                .trim();


        // Save selected package
        localStorage.setItem(
            "selectedPackage",
            packageName
        );


    });

});


// =========================================
// NAVIGATION ANIMATION
// =========================================

const packageLinks =
    document.querySelectorAll(
        ".package-links a"
    );


packageLinks.forEach(link => {

    link.addEventListener("click", function () {

        // Allow normal navigation
        // while preserving selected package

    });

});


// =========================================
// REVEAL ANIMATION
// =========================================

const revealElements =
    document.querySelectorAll(
        ".full-package, .mini-package, .packages-intro, .custom-content"
    );


const revealObserver =
    new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "visible"
                    );

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


revealElements.forEach(element => {

    revealObserver.observe(element);

});


// =========================================
// PACKAGE IMAGE LOADING
// =========================================

const packageImages =
    document.querySelectorAll(
        ".package-image img, .mini-package img"
    );


packageImages.forEach(image => {

    image.addEventListener("load", function () {

        this.classList.add("loaded");

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