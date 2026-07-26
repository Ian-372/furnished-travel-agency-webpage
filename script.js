/* ==========================================
   LITTLE MONKS SAFARIS
   PREMIUM INTERACTIVE JAVASCRIPT
========================================== */



// ===============================
// PAGE LOADER
// ===============================


window.addEventListener("load", () => {

    const loader = document.querySelector(".page-loader");

    if (!loader) return;

    setTimeout(() => {

        loader.style.opacity = "0";
        loader.style.transition = "1s ease";

        setTimeout(() => {
            loader.style.display = "none";
        }, 1000);

    }, 2200);

});









// ===============================
// MOBILE MENU
// ===============================


const menuBtn =
    document.querySelector(".menu-btn");


const navLinks =
    document.querySelector(".nav-links");



if (menuBtn) {


    menuBtn.addEventListener("click", () => {


        navLinks.classList.toggle("active");


    });


}






// close mobile menu after clicking


document.querySelectorAll(".nav-links a")
    .forEach(link => {


        link.addEventListener("click", () => {


            navLinks.classList.remove("active");


        });


    });










// ===============================
// NAVBAR SCROLL EFFECT
// ===============================


const header =
    document.querySelector(".header");



window.addEventListener("scroll", () => {


    if (window.scrollY > 80) {


        header.style.background =
            "rgba(5,8,7,0.85)";


        header.style.backdropFilter =
            "blur(20px)";


        header.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.3)";



    }

    else {


        header.style.background =
            "transparent";


        header.style.boxShadow =
            "none";


    }



});










// ===============================
// PREMIUM SCROLL REVEAL
// ===============================


const reveals =
    document.querySelectorAll(".reveal");



const revealObserver =
    new IntersectionObserver(
        (entries) => {


            entries.forEach(entry => {


                if (entry.isIntersecting) {


                    entry.target.classList.add("active");


                    revealObserver.unobserve(entry.target);


                }



            });



        },
        {

            threshold: 0.10

        }

    );





reveals.forEach((element, index) => {


    element.style.transitionDelay =
        `${index * 0.08}s`;



    revealObserver.observe(element);



});









// ===============================
// CARD STAGGER EFFECT
// ===============================


const grids =
    document.querySelectorAll(
        ".services-grid, .packages-grid, .destination-grid, .fleet-grid"
    );



grids.forEach(grid => {


    const cards =
        grid.children;



    Array.from(cards)
        .forEach((card, index) => {


            card.style.transitionDelay =
                `${index * 120}ms`;



        });



});









// ===============================
// HERO PARALLAX
// ===============================


const heroImage =
    document.querySelector(".hero-background");



window.addEventListener("scroll", () => {


    if (heroImage) {


        let scroll =
            window.scrollY;



        heroImage.style.transform =
            `scale(1.1) translateY(${scroll * 0.15}px)`;



    }



});









// ===============================
// ACTIVE NAVIGATION
// ===============================


const sections =
    document.querySelectorAll("section");


const links =
    document.querySelectorAll(".nav-links a");



window.addEventListener("scroll", () => {


    let current = "";



    sections.forEach(section => {


        let top =
            section.offsetTop - 200;



        if (scrollY >= top) {


            current =
                section.getAttribute("id");


        }



    });



    links.forEach(link => {


        link.style.color = "";


        if (
            link.getAttribute("href")
            ===
            "#" + current
        ) {


            link.style.color =
                "#c9a227";


        }



    });



});









// ===============================
// BUTTON RIPPLE EFFECT
// ===============================


const buttons =
    document.querySelectorAll(
        ".primary-btn, .secondary-btn, button"
    );



buttons.forEach(button => {


    button.addEventListener(
        "mouseenter",
        () => {


            button.style.transform =
                "translateY(-5px)";



        });




    button.addEventListener(
        "mouseleave",
        () => {


            button.style.transform =
                "translateY(0)";


        });


});









// ===============================
// IMAGE REVEAL
// ===============================


const images =
    document.querySelectorAll(
        ".service-image img, .destination-card img, .vehicle-image img"
    );



const imageObserver =
    new IntersectionObserver(
        (entries) => {


            entries.forEach(entry => {


                if (entry.isIntersecting) {


                    entry.target.style.opacity = "1";


                    entry.target.style.transform =
                        "scale(1)";


                }



            });


        },
        {
            threshold: .2
        }
    );



images.forEach(img => {


    img.style.opacity = "0";


    img.style.transform = "scale(1.1)";


    img.style.transition =
        "1.1s ease";



    imageObserver.observe(img);



});