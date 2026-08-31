import { auth } from "./js/firebase-config.js";
import { ADMIN_EMAIL, isAdminEmail } from "./js/admin-config.js";

import {
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const form = document.getElementById("loginForm");
const message = document.getElementById("message");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");

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
        if (!isAdminEmail(user.email)) {

            await signOut(auth);

            message.textContent = "Access denied. Sign in with the administrator account.";

            return;

        }

        // Require email verification
        if (!user.emailVerified) {

            await sendEmailVerification(user);

            await signOut(auth);

            message.textContent =
                "A verification email was sent. Verify the administrator account, then log in again.";

            return;

        }

        message.textContent = "Login successful. Opening the dashboard...";

        setTimeout(() => {

            window.location.href = "admin.html";

        }, 1000);

    }

    catch (error) {

        console.error(error);

        message.textContent = error.message;

    }

});

resetPasswordBtn.addEventListener("click", async () => {
    resetPasswordBtn.disabled = true;
    message.textContent = "Sending password reset email...";

    try {
        await sendPasswordResetEmail(auth, ADMIN_EMAIL);
        message.textContent = "Password reset email sent. Check the administrator inbox, including spam.";
    }
    catch (error) {
        console.error(error);
        message.textContent = "We could not send the password reset email. Please try again.";
    }
    finally {
        resetPasswordBtn.disabled = false;
    }
});