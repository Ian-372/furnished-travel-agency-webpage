import { auth } from "./js/firebase-config.js";

import {
    signInWithEmailAndPassword,
    sendEmailVerification,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const ADMIN_EMAIL = "ianmutuli36@gmail.com";

const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {

        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        // Only the admin account is allowed
        if (user.email !== ADMIN_EMAIL) {

            await signOut(auth);

            message.innerHTML = "❌ Access denied.";

            return;

        }

        // Require email verification
        if (!user.emailVerified) {

            await sendEmailVerification(user);

            await signOut(auth);

            message.innerHTML =
                "📧 Verification email sent. Please verify your email, then log in again.";

            return;

        }

        message.innerHTML = "✅ Login Successful";

        setTimeout(() => {

            window.location.href = "admin.html";

        }, 1000);

    }

    catch (error) {

        console.error(error);

        message.innerHTML = error.message;

    }

});