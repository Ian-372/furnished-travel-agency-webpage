import { auth } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const dashboardBtn = document.getElementById("dashboardBtn");


if (dashboardBtn) {


    dashboardBtn.addEventListener("click", (e) => {

        e.preventDefault();


        onAuthStateChanged(auth, (user) => {


            if (user) {

                // user is logged in
                window.location.href = "dashboard.html";

            }

            else {

                // visitor
                sessionStorage.setItem(
                    "redirectAfterLogin",
                    "dashboard.html"
                );


                window.location.href = "login.html";

            }


        });


    });


}