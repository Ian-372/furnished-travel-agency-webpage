import { auth } from "./js/firebase-config.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const form = document.getElementById("loginForm");

const message = document.getElementById("message");

form.addEventListener("submit", async (e)=>{

    e.preventDefault();

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    try{

        await signInWithEmailAndPassword(auth,email,password);

        message.innerHTML="✅ Login Successful";

        setTimeout(()=>{

            window.location="admin.html";

        },1000);

    }

    catch(error){

        console.error(error);

        message.innerHTML="❌ Invalid email or password";

    }

});