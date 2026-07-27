import { auth, db } from "./firebase-config.js";
import {

    createUserWithEmailAndPassword,
    signInWithEmailAndPassword

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


import {

    doc,
    setDoc

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



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



            try {


                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );



                const user =
                    userCredential.user;
                import {
                    sendEmailVerification
                } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
                await sendEmailVerification(user);



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