import { saveLead, loadLeads } from '../firebase';

// Manejo del formulario
document.getElementById("client-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  try {
    // Validación mejorada
    const dni = document.getElementById("dni").value;
    const phone = document.getElementById("phone").value;
    
    if (isNaN(dni)) {
      throw new Error("El DNI debe contener solo números");
    }
    
    if (dni.length !== 8) {
      throw new Error("El DNI debe tener exactamente 8 dígitos");
    }
    
    if (isNaN(phone)) {
      throw new Error("El teléfono debe contener solo números");
    }
    
    if (phone.length !== 9) {
      throw new Error("El teléfono debe tener exactamente 9 dígitos");
    }

    const formData = {
      name: document.getElementById("name").value.trim(),
      lastname: document.getElementById("lastname").value.trim(),
      dni: dni,
      email: document.getElementById("email").value.trim().toLowerCase(),
      phone: phone,
      interest: document.getElementById("interest").value
    };

    // Validación adicional de campos requeridos
    if (!formData.name || !formData.lastname || !formData.email) {
      throw new Error("Todos los campos son obligatorios");
    }

    const result = await saveLead(formData);
    
    if (result.success) {
      // Mostrar modal de confirmación en lugar de alert
      const modal = document.getElementById("confirmation-modal");
      if (modal) {
        modal.style.display = "flex";
      } else {
        alert("¡Registro exitoso! Gracias por participar.");
      }
      
      e.target.reset();
      
      // Recarga los leads si estamos en admin
      if (window.location.pathname.includes("admin")) {
        displayLeads();
      }
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    // Mostrar error específico al usuario
    alert(error.message);
    console.error("Error en el formulario:", error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
});

// Función para mostrar leads en una tabla (para panel admin)
async function displayLeads() {
  const leadsTable = document.getElementById("leads-table");
  if (!leadsTable) return;

  try {
    const leads = await loadLeads();
    
    leadsTable.innerHTML = `
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Nombre</th>
          <th>DNI</th>
          <th>Email</th>
          <th>Teléfono</th>
          <th>Interés</th>
        </tr>
      </thead>
      <tbody>
        ${leads.map(lead => `
          <tr>
            <td>${lead.formattedDate}</td>
            <td>${lead.name} ${lead.lastname}</td>
            <td>${lead.dni}</td>
            <td>${lead.email}</td>
            <td>${lead.phone}</td>
            <td>${lead.interest}</td>
          </tr>
        `).join("")}
      </tbody>
    `;
  } catch (error) {
    console.error("Error al cargar leads:", error);
    leadsTable.innerHTML = `<tr><td colspan="6">Error al cargar los datos: ${error.message}</td></tr>`;
  }
}

// Cargar leads al iniciar si estamos en admin
if (window.location.pathname.includes("admin")) {
  displayLeads();
}