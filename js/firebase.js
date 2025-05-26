import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";


// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDr-0LP9HAPu4XVAoYfIOwPRHkKPY6t7MA",
  authDomain: "inkafarm4proyect.firebaseapp.com",
  databaseURL: "https://inkafarm4proyect-default-rtdb.firebaseio.com",
  projectId: "inkafarm4proyect",
  storageBucket: "inkafarm4proyect.appspot.com",
  messagingSenderId: "753045189136",
  appId: "1:753045189136:web:fd0a795ace6a2c78cd9095"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const LEADS_COLLECTION = "inkafarma_leads";

// Validaciones
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateLeadData(data) {
  if (!data.name || !data.lastname) throw new Error("Nombre y apellido son obligatorios");
  if (isNaN(data.dni) || data.dni.toString().length !== 8) throw new Error("DNI debe tener 8 dígitos numéricos");
  if (isNaN(data.phone) || data.phone.toString().length !== 9) throw new Error("Teléfono debe tener 9 dígitos numéricos");
  if (!validateEmail(data.email)) throw new Error("Por favor ingrese un email válido");
}

// Obtener IP
async function fetchIPAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (err) {
    console.warn("No se pudo obtener IP:", err);
    return "Desconocida";
  }
}

// Verifica duplicados
async function checkDuplicateLead(dni) {
  const q = query(collection(db, LEADS_COLLECTION), where("dni", "==", Number(dni)));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

// Guardar lead
export async function saveLead(data) {
  try {
    // Sanitizar entradas
    data.name = data.name.trim();
    data.lastname = data.lastname.trim();
    data.email = data.email.trim().toLowerCase();

    validateLeadData(data);

    const isDuplicate = await checkDuplicateLead(data.dni);
    if (isDuplicate) {
      throw new Error("Ya existe un registro con este DNI");
    }

    const docRef = await addDoc(collection(db, LEADS_COLLECTION), {
      name: data.name,
      lastname: data.lastname,
      dni: parseInt(data.dni, 10),
      email: data.email,
      phone: parseInt(data.phone, 10),
      interest: data.interest || "No especificado",
      timestamp: new Date(),
      ipAddress: await fetchIPAddress()
    });

    console.log("Lead guardado con ID:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error al guardar lead:", error);
    return { success: false, error: error.message };
  }
}

// Leer leads
export async function loadLeads() {
  try {
    const querySnapshot = await getDocs(collection(db, LEADS_COLLECTION));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        formattedDate: data.timestamp?.toDate?.().toLocaleString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) || "Sin fecha"
      };
    });
  } catch (error) {
    console.error("Error al cargar leads:", error);
    return [];
  }
}


export const auth = getAuth();

// Función para login (en un archivo o script aparte)
export async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Función para cerrar sesión
export async function logout() {
  await signOut(auth);
}

// Escuchar estado de usuario
export function onAuthChange(callback) {
  onAuthStateChanged(auth, user => callback(user));
}

