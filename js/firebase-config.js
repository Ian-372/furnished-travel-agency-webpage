// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ===============================
// FIREBASE CONFIG
// ===============================

const firebaseConfig = {

    apiKey: "AIzaSyAC6EG9N4vERYW3S5zVljY0rzYjKXbIYus",

    authDomain: "little-monks-safaris.firebaseapp.com",

    projectId: "little-monks-safaris",

    storageBucket: "little-monks-safaris.firebasestorage.app",

    messagingSenderId: "72057241879",

    appId: "1:72057241879:web:8ef16cbcfc63633a6a3752",

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth(app);

// Export so other files can use them
export { db, auth };