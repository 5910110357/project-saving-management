src= "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js"
src= "https://www.gstatic.com/firebasejs/9.13.0/firebase-firestore.js"
        const firebaseConfig = {
            apiKey: "AIzaSyA0vuCJHYGOpJEqH1PERWHnNEFWmkK2rgw",
            authDomain: "testproject-ff9d6.firebaseapp.com",
            projectId: "testproject-ff9d6",
            storageBucket: "testproject-ff9d6.appspot.com",
            messagingSenderId: "902874923267",
            appId: "1:902874923267:web:5f69187bfae8b50a6e6936",
            measurementId: "G-GMTV6MGHV0"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const  db = getFirestore(app)