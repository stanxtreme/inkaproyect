import { db } from "/src/firebase.js";

// Ejemplo: Guardar datos en Firestore
import { collection, addDoc } from "firebase/firestore";

async function saveData(data) {
  try {
    await addDoc(collection(db, "inkafarma_leads"), data);
  } catch (error) {
    console.error("Error al guardar:", error);
  }
}
// Manejo del formulario de registro
function setupFormSubmission(db) {
    const form = document.getElementById('client-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const clientData = {
                name: document.getElementById('name').value,
                lastname: document.getElementById('lastname').value,
                dni: document.getElementById('dni').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                interest: document.getElementById('interest').value,
                timestamp: new Date(),
                source: "Inkafarma Landing Page"
            };

            // Validación básica
            if (!validateForm(clientData)) {
                return;
            }

            // Guardar en Firestore
            await db.collection("inkafarma_leads").add(clientData);
            
            // Mostrar feedback al usuario
            showSuccessMessage();
            form.reset();
            
        } catch (error) {
            console.error("Error al guardar:", error);
            showErrorMessage();
        }
    });
}

// Validación del formulario
function validateForm(data) {
    if (!data.name || !data.lastname || !data.dni || !data.email || !data.phone || !data.interest) {
        alert("Por favor complete todos los campos obligatorios.");
        return false;
    }

    // Validación básica de email
    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
        alert("Por favor ingrese un correo electrónico válido.");
        return false;
    }

    // Validación básica de DNI (8 dígitos)
    if (!/^\d{8}$/.test(data.dni)) {
        alert("El DNI debe tener 8 dígitos.");
        return false;
    }

    return true;
}

// Mensajes de feedback
function showSuccessMessage() {
    alert("¡Gracias por registrarte! Te enviaremos nuestras mejores ofertas.");
    // Alternativa: Mostrar mensaje en el DOM en lugar de alert
    // const successDiv = document.createElement('div');
    // successDiv.className = 'success-message';
    // successDiv.textContent = '¡Gracias por registrarte!';
    // document.querySelector('.lead-form').appendChild(successDiv);
}

function showErrorMessage() {
    alert("Ocurrió un error al procesar tu registro. Por favor intenta nuevamente.");
}

// Trackeo de clics en productos (opcional)
function trackProductClicks(db) {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const productName = card.querySelector('.product-name').textContent;
            const productPrice = card.querySelector('.product-price').textContent;
            
            db.collection("product_clicks").add({
                productName: productName,
                productPrice: productPrice,
                timestamp: new Date()
            }).catch(error => console.error("Error tracking click:", error));
        });
    });
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    try {
        const db = initializeFirebase();
        setupFormSubmission(db);
        trackProductClicks(db);
        
        // Otras inicializaciones pueden ir aquí
    } catch (error) {
        console.error("Error inicializando la aplicación:", error);
    }
});

    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore(app);
    const analytics = firebase.analytics(app);