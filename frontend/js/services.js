
// Base URL for all API requests
// In production, change this to your live domain e.g. 'https://yoursite.com/api'
const API_URL = 'http://localhost:5555/api' // dont forget to change this later

// ===== PROTECT THE PAGE =====
// Read the token that was saved to localStorage when the user logged in
const token = localStorage.getItem('token')

// If there is no token, the user is not logged in — send them back to the login page
if (!token) {
  window.location.href = 'index.html'
  throw new Error('No token') // stops the rest of the script from running

}

// ===== AUTH HEADER HELPER =====
// Every request to a protected route must include the JWT token in the Authorization header
// This function returns the headers object so we don't repeat it everywhere
function authHeader() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // format required by our authMiddleware.js
  }
}

// ===== LOGOUT =====
// When logout is clicked, remove the token from localStorage and go back to login
// Without the token, the user can no longer make authenticated requests
document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token')
  window.location.href = 'index.html'
})

// ===== GET ALL serviceS =====
async function getservices() {
  // GET /api/services — protected route, needs Authorization header
  const res = await fetch(`${API_URL}/services`, {
    method: 'GET',
    headers: authHeader()
  })

  const services = await res.json()

  if (!res.ok) {
    // If the request failed, show the error in the services container
    document.getElementById('servicesList').textContent = services.message || 'Failed to load services'
    return
  }

  // Pass the services array to the render function to display them on the page
  renderservices(services)
}

// ===== RENDER serviceS TO THE PAGE =====
function renderservices(services) {
  const container = document.getElementById('servicesList')

  // Clear whatever was previously rendered so we don't get duplicates
  container.innerHTML = ''

  if (services.length === 0) {
    container.textContent = 'No services yet. Add one above!'
    return
  }

  // Loop through each service and create HTML elements for it
  services.forEach(service => {
    const div = document.createElement('div')
    div.innerHTML =
                  `<li>
                      <h3>${service.serviceName}</h3> 
                      <strong>    ID:  </strong>   ${service._id}                    
                      <br><strong>    Active: </strong>${service.isActive}
                      <br><strong>    Monthly: </strong>$${service.monthlyPrice}
                      <br><strong>    Annual: </strong>$${service.annualPrice}
                      <br><strong>    Features: </strong>${service.features}
                      <br><strong>    Added by: </strong>${service.addedBy}
                  </li>`
    
    container.appendChild(div)
  })
}

// ===== CREATE A service =====
document.getElementById('addService').addEventListener('click', async (e) => {
  // Prevent page refresh on form submit
  e.preventDefault()
      const serviceName = document.getElementById('serviceName').value;
      const isActive = document.getElementById('isActive').value;
      const annualPrice = document.getElementById('annualPrice').value;
      const monthlyPrice = document.getElementById('monthlyPrice').value;
      const featuresInput = document.getElementById('featuresInput').value;
      const features = featuresInput.split(',').map(f => f.trim())
  // POST /api/services — sends the service text in the request body
  const res = await fetch(`${API_URL}/services`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ serviceName, monthlyPrice: Number(monthlyPrice), annualPrice: Number(annualPrice), isActive: isActive ==='true', features })
  })

  const data = await res.json()

  if (!res.ok) {
    // Show the error (e.g. "Please add a 'text' field")
    document.getElementById('message').style.color = 'red'
    document.getElementById('message').textContent = data.message || 'Failed to create service'
    return
  }

  // Show success message, clear the input, and refresh the services list
  document.getElementById('message').style.color = 'green'
  document.getElementById('message').textContent = 'service created!'
  document.getElementById('serviceText').value = ''
  getservices()
})

// ===== DELETE A service =====
async function deleteservice(id) {
  // Ask the user to confirm before permanently deleting
  const confirmed = confirm('Are you sure you want to delete this service?')
  if (!confirmed) return

  // DELETE /api/services/:id — the id is in the URL, no request body needed
  const res = await fetch(`${API_URL}/services/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  })

  const data = await res.json()

  if (!res.ok) {
    alert(data.message || 'Failed to delete service')
    return
  }

  // Refresh the list so the deleted service disappears
  getservices()
}

// ===== SHOW EDIT FORM =====
// replaced to work with my existing dashboard
document.getElementById('updateBtn').addEventListener('click', () => {
            const id = document.getElementById('updateId').value;
            if (!id) {
                document.getElementById('updateMessage').textContent = 'Service _id is required.';
                return;
            }

            const updates = {};
            const name = document.getElementById('updateName').value;
            const month = document.getElementById('updateMonth').value;
            const year = document.getElementById('updateYear').value;
            const features = document.getElementById('updateFeatures').value;

            const isActive = document.getElementById('updateActive').value;

            if (name) updates.serviceName = name;
            if (month) updates.monthlyPrice = Number(month);
            if (year) updates.annualPrice = Number(year);
            if (features) updates.features = features.split(',').map(f => f.trim());    
            if (isActive !== '') updates.isActive = isActive === 'true';
            if (Object.keys(updates).length === 0) {
                document.getElementById('updateMessage').textContent = 'Provide at least one field to update.';
                return;
            }

            fetch(`${API_URL}/services/${id}`, {
                method: 'PUT',
                headers: authHeader(),
                body: JSON.stringify(updates)
            })
            .then(res => res.json())
            .then(data => {
                document.getElementById('updateMessage').textContent = 'Service updated!';
                document.getElementById('updateId').value = '';
                document.getElementById('updateName').value = '';
                document.getElementById('updateMonth').value = '';
                document.getElementById('updateYear').value = '';
                document.getElementById('updateActive').value = '';
                document.getElementById('updateFeatures').value = '';
                getservices()

            })
            .catch(err => {
                document.getElementById('updateMessage').textContent = 'Error updating service.';
            });
        });


// ===== LOAD serviceS ON PAGE LOAD =====
// Automatically fetch and display all services when dashboard.html is opened
getservices()