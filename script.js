import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth,onAuthStateChanged,createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, doc, addDoc, collection, getDocs, updateDoc, deleteDoc, query, where} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
// Firebase setup
const firebaseConfig = {
    apiKey: "AIzaSyA2tHWjB2oyYS6bpKBpDRWftS2iMPrBB4E",
    authDomain: "teacher-student-5d985.firebaseapp.com",
    projectId: "teacher-student-5d985",
    storageBucket: "teacher-student-5d985.appspot.com",
    messagingSenderId: "956945265524",
    appId: "1:956945265524:web:53634224cda4db7d78b221"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// Function to handle Sign Up
// Sign Up
document.getElementById('signup-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('user-role').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Add user role to Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            role: role
        });

        alert("User signed up successfully!");
    } catch (error) {
        console.error(error.message);
        document.getElementById('error-message').innerText = error.message;
    }
});

// Login
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Logged in successfully!");
    } catch (error) {
        console.error(error.message);
        document.getElementById('error-message').innerText = error.message;
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('User is signed in:', user);
        // You can display the dashboard for the logged-in user
    } else {
        console.log('No user is signed in.');
        // Redirect to the login screen or hide dashboards
    }
});

document.getElementById('search-teacher-btn').addEventListener('click', async () => {
    const teacherName = document.getElementById('searchTeachers').value;
    const teachersRef = collection(db, "users");
    const q = query(teachersRef, where("role", "==", "teacher"), where("name", "==", teacherName));
    const querySnapshot = await getDocs(q);

    const teacherResults = document.getElementById('teacherResults');
    teacherResults.innerHTML = '';

    querySnapshot.forEach((doc) => {
        const teacher = doc.data();
        const li = document.createElement('li');
        li.textContent = teacher.name + ' - ' + teacher.email;
        teacherResults.appendChild(li);
    });
});
document.getElementById('book-appointment-btn').addEventListener('click', async () => {
    const teacherEmail = document.getElementById('teacheremail').value;
    const appointmentTime = document.getElementById('appointmentTime').value;
    const studentEmail = auth.currentUser.email;

    await addDoc(collection(db, "appointments"), {
        studentEmail: studentEmail,
        teacherEmail: teacherEmail,
        appointmentTime: appointmentTime,
        status: "pending"
    });

    alert('Appointment booked successfully!');
});
document.getElementById('send-message-btn').addEventListener('click', async () => {
    const teacherEmail = document.getElementById('messageTeacherEmail').value;
    const message = document.getElementById('messageInput').value;
    const studentEmail = auth.currentUser.email;

    await addDoc(collection(db, "messages"), {
        from: studentEmail,
        to: teacherEmail,
        message: message,
        timestamp: new Date()
    });

    alert('Message sent successfully!');
});
document.getElementById('set-availability-btn').addEventListener('click', async () => {
    const teacherEmail = auth.currentUser.email;
    const availableTime = document.getElementById('availableTime').value;

    await addDoc(collection(db, "availability"), {
        teacherEmail: teacherEmail,
        availableTime: availableTime
    });

    alert('Availability set successfully!');
});
// Fetch all appointments for the teacher
const teacherEmail = auth.currentUser.email;
const appointmentsRef = collection(db, "appointments");
const q = query(appointmentsRef, where("teacherEmail", "==", teacherEmail), where("status", "==", "pending"));
const querySnapshot = await getDocs(q);

// Display appointments in the UI
const pendingAppointments = document.getElementById('pendingAppointments');
pendingAppointments.innerHTML = '';  // Clear existing list
querySnapshot.forEach((doc) => {
    const appointment = doc.data();
    const li = document.createElement('li');
    
    // Add appointment details and ID
    li.textContent = `Student: ${appointment.studentEmail} | Time: ${appointment.appointmentTime}`;
    
    // Include the appointment ID as an attribute
    li.setAttribute('data-appointment-id', doc.id);
    
    // Append to the list
    pendingAppointments.appendChild(li);
});
// Approve Appointment
document.getElementById('approve-appoinment').addEventListener('click', async () => {
    // Get the clicked list item (appointment)
    const selectedAppointment = document.querySelector('#pendingAppointments li.selected');
    
    if (!selectedAppointment) {
        alert("Please select an appointment to approve.");
        return;
    }

    // Get the appointment ID from the selected list item's data attribute
    const appointmentId = selectedAppointment.getAttribute('data-appointment-id');
    
    // Update the appointment status in Firestore
    const appointmentRef = doc(db, "appointments", appointmentId);
    await setDoc(appointmentRef, { status: "approved" }, { merge: true });

    alert('Appointment approved!');
});
// Add click event to select an appointment
document.getElementById('pendingAppointments').addEventListener('click', (event) => {
    const li = event.target;
    
    // Only select if it's a list item (li)
    if (li.tagName === 'LI') {
       
        li.classList.toggle('selected');
    }
});



document.getElementById('add-teacher-btn').addEventListener('click', async () => {
    const teacherName = document.getElementById('teacherName').value;
    const teacherEmail = document.getElementById('teacherEmail').value;
    const teacherDepartment = document.getElementById('teacherDepartment').value;
    const teacherSubject = document.getElementById('teacherSubject').value;

    const newTeacherRef = doc(db, "users", teacherEmail);
    await setDoc(newTeacherRef, {
        name: teacherName,
        email: teacherEmail,
        department: teacherDepartment,
        subject: teacherSubject,
        role: 'teacher'
    });

    alert('Teacher added successfully!');
});
