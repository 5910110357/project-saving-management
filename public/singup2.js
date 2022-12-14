import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getFirestore , collection, getDocs} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-firestore.js";
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
const db = getFirestore(app)

const table = document.getElementById("table")
async function getUsers(db){
    const useCol = collection(db,'users')
    const useSnapshot = getDocs(useCol)
    return useSnapshot
}

function showData(users){
    const row = table.insertRow(-1)
    const nameCol = row.insertCell(0)
    const idCol = row.insertCell(1)
    nameCol.innerHTML = users.data().Name
    idCol.innerHTML = users.data().ID
}
//ดึงกลุ่ม doc
const data = await getUsers(db)
data.forEach(users=>{
    showData(users)
})
