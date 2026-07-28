import { auth, db } from "./firebase-config.js";
import {

    createUserWithEmailAndPassword,
    signInWithEmailAndPassword

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {

    doc,
    setDoc

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// PASSWORD VALIDATION
function validatePassword(password) {
    const errors = [];
    if (password.length < 10)
        errors.push("• At least 10 characters");
    if (!/[A-Z]/.test(password))
        errors.push("• One uppercase letter");
    if (!/[a-z]/.test(password))
        errors.push("• One lowercase letter");
    if (!/[0-9]/.test(password))
        errors.push("• One number");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
        errors.push("• One special character");
    return errors;
}

// LIVE PASSWORD STRENGTH
const signupPassword =
    document.getElementById("password");
const signupStrength =
    document.getElementById("signupPasswordStrength");
if (signupPassword) {
    signupPassword.addEventListener("input", () => {
        const password = signupPassword.value;
        let score = 0;
        if (password.length >= 10) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
        if (score <= 2) {
            signupStrength.textContent =
                "Password strength: Weak";
            signupStrength.style.color = "#e74c3c";
        }
        else if (score <= 4) {
            signupStrength.textContent =
                "Password strength: Medium";
            signupStrength.style.color = "#f39c12";
        }
        else {
            signupStrength.textContent =
                "Password strength: Strong";
            signupStrength.style.color = "#27ae60";
        }
    });
}

// PASSWORD MATCH CHECK
const confirmPassword =
    document.getElementById("confirmPassword");

const passwordMatch =
    document.getElementById("passwordMatch");

if (signupPassword && confirmPassword) {

    function checkPasswordMatch() {

        if (confirmPassword.value === "") {

            passwordMatch.textContent = "";

            return;

        }

        if (signupPassword.value === confirmPassword.value) {

            passwordMatch.textContent =
                "✓ Passwords match";

            passwordMatch.style.color =
                "#27ae60";
        }
        else {

            passwordMatch.textContent =
                "✗ Passwords do not match";

            passwordMatch.style.color =
                "#e74c3c";

        }

    }

    signupPassword.addEventListener(
        "input",
        checkPasswordMatch
    );

    confirmPassword.addEventListener(
        "input",
        checkPasswordMatch
    );

}

// SIGN UP
const signupBtn =
    document.getElementById("signupBtn");
if (signupBtn) {
    signupBtn.addEventListener(
        "click",
        async () => {
            const name =
                document.getElementById("name").value;
            const email =
                document.getElementById("email").value;
            const password =
                document.getElementById("password").value;
            const confirm =
                document.getElementById("confirmPassword").value;
            if (password !== confirm) {

                alert("Passwords do not match.");

                return;
            }
            const passwordErrors = validatePassword(password);

            if (passwordErrors.length > 0) {

                alert(
                    `Your password is not strong enough.

It must contain:

${passwordErrors.join("\n")}`
                );

                return;

            }
            try {
                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );
                const user =
                    userCredential.user;
                await setDoc(
                    doc(db, "users", user.uid),
                    {
                        name: name,
                        email: email,
                        phone: "",
                        country: "",
                        role: "customer",
                        createdAt: new Date()
                    }
                );
                alert("Account created successfully.");
                const redirect =
                    sessionStorage.getItem("redirectAfterLogin");
                if (redirect) {
                    sessionStorage.removeItem("redirectAfterLogin");
                    window.location.href = redirect;
                } else {
                    window.location.href = "dashboard.html";
                }
            }
            catch (error) {
                alert(error.message);
            }
        });
}



// LOGIN
const loginBtn =
    document.getElementById("loginBtn");
if (loginBtn) {


    loginBtn.addEventListener(
        "click",
        async () => {


            const email =
                document.getElementById("loginEmail").value;


            const password =
                document.getElementById("loginPassword").value;



            try {


                await signInWithEmailAndPassword(

                    auth,
                    email,
                    password

                );



                const redirect =
                    sessionStorage.getItem("redirectAfterLogin");


                if (redirect) {

                    sessionStorage.removeItem(
                        "redirectAfterLogin"
                    );

                    window.location.href = redirect;

                }
                else {

                    window.location.href =
                        "dashboard.html";

                }

            }


            catch (error) {

                alert(error.message);

            }



        });


}


// PASSWORD VISIBILITY
document.querySelectorAll(".toggle-password")
.forEach(toggle => {
    toggle.addEventListener("click", () => {
        const input =
            document.getElementById(toggle.dataset.target);
        if(input.type === "password"){
            input.type = "text";
            toggle.textContent = "🙈";
        }else{
            input.type = "password";
            toggle.textContent = "👁️";
        }
    });
});