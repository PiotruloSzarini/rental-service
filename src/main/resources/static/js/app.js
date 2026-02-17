let currentUser = { username: 'Gość', role: 'GUEST' };
let currentPage = 0;
let currentSort = 'name';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "flex";
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "none";
}

async function checkLoginStatus() {
    try {
        const res = await fetch('/api/user/me');
        const contentType = res.headers.get("content-type");
        if (!res.ok || (contentType && contentType.indexOf("text/html") !== -1)) {
            throw new Error("Brak autoryzacji");
        }
        currentUser = await res.json();
    } catch (e) {
        console.warn("Tryb gościa lub błąd sesji");
        currentUser = { username: 'Gość', role: 'GUEST' };
    }
    renderAuthUI();
}

function renderAuthUI() {
    const authDisplay = document.getElementById('auth-display');
    if (!authDisplay) return;

    const isAdmin = currentUser.role && currentUser.role.includes("ADMIN");

    if (currentUser.username === "Gość") {
        authDisplay.innerHTML = `
            <button onclick="openModal('loginModal')" class="btn btn-outline">Zaloguj</button>
            <button onclick="openModal('regModal')" class="btn btn-primary">Dołącz</button>
        `;
        document.getElementById('admin-sidebar').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'none';
    } else {
        authDisplay.innerHTML = `
            <span style="font-weight:600">Hi, ${currentUser.username}!</span>
            <a href="/logout" style="color:var(--danger); text-decoration:none; font-weight:800; font-size: 0.8rem; margin-left:10px;">WYLOGUJ</a>
        `;
        if (isAdmin) {
            document.getElementById('admin-sidebar').style.display = 'block';
            document.getElementById('admin-panel').style.display = 'block';
            fetchUsers();
        }
    }
}

async function changeSort() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        currentSort = sortSelect.value;
        currentPage = 0;
        await fetchAssets();
    }
}

async function fetchAssets() {
    try {

        const [assetsRes, historyRes] = await Promise.all([
            fetch(`/api/assets?page=${currentPage}&size=4&sortBy=${currentSort}`),
            fetch('/api/assets/history')
        ]);

        const assetsData = await assetsRes.json();
        const history = await historyRes.json();


        const assets = assetsData.content || [];

        const list = document.getElementById('assets-list');
        if (!list) return;

        const isAdmin = currentUser.role && currentUser.role.includes("ADMIN");
        const isGuest = currentUser.username === "Gość";

        list.innerHTML = assets.map(asset => {
            const currentRental = history.find(h => h.asset && h.asset.id === asset.id && h.returnDate === null);
            const renterName = currentRental ? currentRental.rentedBy : null;
            const isMine = renterName && currentUser.username && renterName.toLowerCase().trim() === currentUser.username.toLowerCase().trim();
            const isFav = favorites.includes(asset.id);

            let actionBtn = "";
            if (asset.available) {
                actionBtn = isGuest ?
                    `<button class="btn btn-outline" style="width:100%; justify-content:center" onclick="openModal('loginModal')">Zaloguj się</button>` :
                    `<button class="btn btn-primary" style="width:100%; justify-content:center" onclick="rentAsset(${asset.id})">WYPOŻYCZ</button>`;
            } else {
                actionBtn = (isAdmin || isMine) ?
                    `<button class="btn" style="width:100%; justify-content:center; background:var(--success); color:white" onclick="returnAsset(${asset.id})">ODBIERZ ZWROT</button>` :
                    `<button class="btn" style="width:100%; justify-content:center; background:#e2e8f0; color:#94a3b8; cursor:not-allowed" disabled>📦 U: ${renterName}</button>`;
            }

            return `
                <div class="asset-card glass-panel">
                    <div style="position: absolute; top: 15px; right: 15px; display: flex; gap: 5px; z-index: 10;">
                        <button onclick="toggleFavorite(${asset.id})" style="background:white; border:none; border-radius:10px; width:35px; height:35px; cursor:pointer;">${isFav ? '⭐' : '☆'}</button>
                        ${isAdmin ? `
                            <button class="delete-btn" style="position:static" onclick="prepareEdit(${asset.id}, '${asset.name}', '${asset.category}', '${asset.imageUrl}')">✏️</button>
                            <button class="delete-btn" style="position:static" onclick="deleteAsset(${asset.id})">🗑️</button>
                        ` : ''}
                    </div>
                    <img src="${asset.imageUrl || 'https://via.placeholder.com/300x200'}" class="asset-image" alt="${asset.name}">
                    <div>
                        <span class="category-badge">${asset.category}</span>
                        <h3 style="margin: 10px 0 5px 0; font-weight:700">${asset.name}</h3>
                        <p style="font-size:0.8rem; opacity:0.6; margin:0">Status: ${asset.available ? '✅ Dostępny' : '🔴 Zajęty'}</p>
                    </div>
                    ${actionBtn}
                </div>
            `;
        }).join('');


        renderPagination(assetsData.totalPages || 1);
        updateMyRentalsUI(history);

    } catch (err) {
        console.error("Błąd w fetchAssets:", err);
    }
}


function updateMyRentalsUI(history) {
    const panel = document.getElementById('my-rentals-panel');
    const list = document.getElementById('my-rentals-list');

    if (!panel || !list || currentUser.username === 'Gość') {
        if(panel) panel.style.display = 'none';
        return;
    }


    const myCurrentItems = history.filter(h =>
        h.rentedBy === currentUser.username && h.returnDate === null
    );

    if (myCurrentItems.length > 0) {
        panel.style.display = 'block';
        list.innerHTML = myCurrentItems.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.4); padding: 12px; border-radius: 10px; border: 1px solid var(--glass-border);">
                <div>
                    <span style="font-weight: 700;">${item.asset ? item.asset.name : 'Sprzęt'}</span>
                    <div style="font-size: 0.75rem; opacity: 0.7;">Wypożyczono: ${new Date(item.rentalDate).toLocaleString()}</div>
                </div>
                <button class="btn" style="background: #6366f1; color: white; padding: 5px 12px; font-size: 0.8rem;"
                        onclick="returnAsset(${item.asset.id})">
                    Zwróć teraz
                </button>
            </div>
        `).join('');
    } else {
        panel.style.display = 'none';
    }
}

function prepareEdit(id, name, category, imageUrl) {
    let idField = document.getElementById('edit-id');
    if (!idField) {
        idField = document.createElement('input');
        idField.type = 'hidden';
        idField.id = 'edit-id';
        document.querySelector('.form-section').appendChild(idField);
    }


    idField.value = id;
    document.getElementById('newName').value = name;
    document.getElementById('newCategory').value = category;
    document.getElementById('newImageUrl').value = imageUrl;


    const title = document.querySelector('.form-section h3');
    const btn = document.querySelector('.form-section .btn-primary');
    const cancelBtn = document.getElementById('cancel-btn');

    if(title) title.innerText = "📝 Edytuj zasób";
    if(btn) {
        btn.innerText = "Zaktualizuj";
        btn.style.background = "var(--success)";
    }
    if(cancelBtn) cancelBtn.style.display = "inline-flex";

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function addNewAsset() {
    const idField = document.getElementById('edit-id');
    const id = idField ? idField.value : null;

    const name = document.getElementById('newName').value;
    const category = document.getElementById('newCategory').value;
    const imageUrl = document.getElementById('newImageUrl').value;

    if(!name || !category) {
        Swal.fire('Błąd', 'Nazwa i kategoria są wymagane!', 'error');
        return;
    }


    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/assets/${id}` : '/api/assets';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: name,
                category: category,
                imageUrl: imageUrl || 'https://via.placeholder.com/300x200',
                available: true
            })
        });

        if(res.ok) {
            Swal.fire('Sukces!', id ? 'Zaktualizowano dane.' : 'Dodano sprzęt.', 'success');
            resetForm();
            await loadData();
        } else {
            const errorText = await res.text();
            console.error("Błąd serwera:", errorText);
            Swal.fire('Błąd!', 'Serwer nie mógł przetworzyć żądania. Sprawdź konsolę (F12).', 'error');
        }
    } catch (err) {
        console.error("Błąd sieci:", err);
        Swal.fire('Błąd!', 'Brak połączenia z serwerem.', 'error');
    }
}

function resetForm() {
    const idField = document.getElementById('edit-id');
    if(idField) idField.value = '';

    document.getElementById('newName').value = '';
    document.getElementById('newCategory').value = '';
    document.getElementById('newImageUrl').value = '';

    const title = document.querySelector('.form-section h3');
    const btn = document.querySelector('.form-section .btn-primary');
    const cancelBtn = document.getElementById('cancel-btn');

    if(title) title.innerText = "➕ Nowy zasób";
    if(btn) {
        btn.innerText = "Dodaj";
        btn.style.background = "var(--primary)";
    }
    if(cancelBtn) cancelBtn.style.display = "none";
}

async function addNewAsset() {
    const idField = document.getElementById('edit-id');
    const id = idField ? idField.value : null;

    const name = document.getElementById('newName').value;
    const category = document.getElementById('newCategory').value;
    const imageUrl = document.getElementById('newImageUrl').value;

    if(!name || !category) {
        Swal.fire('Błąd', 'Nazwa i kategoria są wymagane!', 'error');
        return;
    }


    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/assets/${id}` : '/api/assets';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: name,
                category: category,
                imageUrl: imageUrl || 'https://via.placeholder.com/300x200',
                available: true
            })
        });

        if(res.ok) {
            Swal.fire('Sukces!', id ? 'Zaktualizowano dane.' : 'Dodano sprzęt.', 'success');
            resetForm();
            await loadData();
        } else {
            const errorText = await res.text();
            console.error("Błąd serwera:", errorText);
            Swal.fire('Błąd!', 'Serwer nie mógł przetworzyć żądania. Sprawdź konsolę (F12).', 'error');
        }
    } catch (err) {
        console.error("Błąd sieci:", err);
        Swal.fire('Błąd!', 'Brak połączenia z serwerem.', 'error');
    }
}

function resetForm() {
    const idField = document.getElementById('edit-id');
    if(idField) idField.value = '';

    document.getElementById('newName').value = '';
    document.getElementById('newCategory').value = '';
    document.getElementById('newImageUrl').value = '';

    const title = document.querySelector('.form-section h3');
    const btn = document.querySelector('.form-section .btn-primary');
    const cancelBtn = document.getElementById('cancel-btn');

    if(title) title.innerText = "➕ Nowy zasób";
    if(btn) {
        btn.innerText = "Dodaj";
        btn.style.background = "var(--primary)";
    }
    if(cancelBtn) cancelBtn.style.display = "none";
}

function toggleFavorite(id) {
    const index = favorites.indexOf(id);
    if (index > -1) favorites.splice(index, 1);
    else favorites.push(id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    fetchAssets();
}

function renderMyRentals(history) {
    const container = document.getElementById('my-rentals-section');
    if (!container || currentUser.username === 'Gość') return;

    const myItems = history.filter(h => h.rentedBy === currentUser.username && h.returnDate === null);

    if (myItems.length === 0) {
        container.innerHTML = '<p style="opacity:0.5; font-size:0.9rem">Nie masz obecnie wypożyczonego sprzętu.</p>';
        return;
    }

    container.innerHTML = myItems.map(h => `
        <div class="glass-panel" style="padding:15px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center">
            <div>
                <div style="font-weight:700">${h.asset ? h.asset.name : 'Sprzęt'}</div>
                <div style="font-size:0.75rem; opacity:0.6">Od: ${new Date(h.rentalDate).toLocaleString()}</div>
            </div>
            <button class="btn" style="background:var(--primary); color:white; padding:5px 15px; font-size:0.8rem" onclick="returnAsset(${h.asset.id})">Zwróć</button>
        </div>
    `).join('');
}

async function deleteAsset(id) {
    if (confirm("Usunąć ten zasób na stałe?")) {
        await fetch(`/api/assets/${id}`, { method: 'DELETE' });
        loadData();
    }
}

async function rentAsset(id) {
    const res = await fetch(`/api/assets/${id}/rent`, { method: 'PATCH' });
    if (res.ok) {
        Swal.fire('Sukces!', 'Sprzęt został wypożyczony', 'success');
        loadData();
    }
}

async function returnAsset(id) {
    const res = await fetch(`/api/assets/${id}/return`, { method: 'PATCH' });
    if (res.ok) {
        Swal.fire('Zwrócono!', 'Sprzęt wrócił do bazy', 'success');
        loadData();
    }
}

async function fetchUsers() {
    if (!currentUser.role || !currentUser.role.includes("ADMIN")) return;
    try {
        const res = await fetch('/api/users');
        const users = await res.json();
        const list = document.getElementById('users-list');
        if (!list) return;

        list.innerHTML = users.map(user => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05)">
                <div>
                    <div style="font-weight:600">${user.username}</div>
                    <div style="font-size:0.7rem; opacity:0.5">${user.role}</div>
                </div>
                <div>
                    <button onclick="toggleAdmin(${user.id}, '${user.role}')" title="Zmień rolę" style="border:none; background:none; cursor:pointer">🔑</button>
                    <button onclick="deleteUser(${user.id})" title="Usuń" style="border:none; background:none; cursor:pointer">❌</button>
                </div>
            </div>
        `).join('');
    } catch (e) { console.error("Błąd fetchUsers:", e); }
}

async function deleteUser(id) {
    if (confirm("Czy na pewno chcesz usunąć tego użytkownika?")) {
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
        loadData();
    }
}

async function toggleAdmin(id, currentRole) {
    const newRole = currentRole.includes('ADMIN') ? 'ROLE_USER' : 'ROLE_ADMIN';
    await fetch(`/api/users/${id}/role`, {
        method: 'PATCH',
        headers: {'Content-Type': 'text/plain'},
        body: newRole
    });
    loadData();
}

async function fetchHistory() {
    try {
        const res = await fetch('/api/assets/history');
        const data = await res.json();
        const table = document.getElementById('history-table');
        if (!table) return;

        table.innerHTML = data.map(h => `
            <tr>
                <td><strong>${h.asset ? h.asset.name : 'Usunięty'}</strong></td>
                <td>👤 ${h.rentedBy}</td>
                <td style="font-size:0.8rem">${new Date(h.rentalDate).toLocaleString()}</td>
                <td>${h.returnDate ? '✅ Zwrócono' : '<span style="color:var(--primary); font-weight:700">⏳ W użyciu</span>'}</td>
            </tr>
        `).join('');
    } catch (e) { console.error("Błąd fetchHistory:", e); }
}

function filterAssets() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const onlyAvailable = document.getElementById('showOnlyAvailable').checked;
    const cards = document.getElementsByClassName('asset-card');

    Array.from(cards).forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        const isAvailable = card.innerText.includes('✅ Dostępny');
        const matchesSearch = title.includes(searchText);
        const matchesAvailable = !onlyAvailable || isAvailable;
        card.style.display = (matchesSearch && matchesAvailable) ? "" : "none";
    });
}

async function register() {
    const username = document.getElementById('reg-user').value;
    const password = document.getElementById('reg-pass').value;
    if(!username || !password) return;

    const res = await fetch('/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
    });
    if(res.ok) {
        Swal.fire('Sukces!', 'Możesz się teraz zalogować', 'success');
        closeModal('regModal');
    }
}

function renderPagination(totalPages) {
    const container = document.getElementById('pagination-container');
    if (!container) return;
    let html = `
        <button class="btn btn-outline" ${currentPage === 0 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">← Poprzednia</button>
        <span style="font-weight: 600; padding: 0 15px;">Strona ${currentPage + 1} z ${totalPages}</span>
        <button class="btn btn-outline" ${currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Następna →</button>
    `;
    container.innerHTML = html;
}

async function changePage(newPage) {
    currentPage = newPage;
    await fetchAssets();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadData() {
    await checkLoginStatus();
    await fetchAssets();
    await fetchHistory();
}
function renderMyRentals(history) {
    const container = document.getElementById('my-rentals-container');
    const list = document.getElementById('my-rentals-list');

    if (currentUser.username === "Gość") {
        container.style.display = "none";
        return;
    }


    const myItems = history.filter(h =>
        h.rentedBy === currentUser.username && h.returnDate === null
    );

    if (myItems.length > 0) {
        container.style.display = "block";
        list.innerHTML = myItems.map(item => `
            <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.5); padding:10px; border-radius:8px;">
                <span><strong>${item.asset ? item.asset.name : 'Sprzęt'}</strong> (od: ${new Date(item.rentalDate).toLocaleDateString()})</span>
                <button class="btn btn-outline" style="padding:5px 10px; font-size:0.7rem;" onclick="returnAsset(${item.asset.id})">Zwróć teraz</button>
            </div>
        `).join('');
    } else {
        container.style.display = "none";
    }
}
function updateMyRentalsUI(history) {
    const panel = document.getElementById('my-rentals-panel');
    const list = document.getElementById('my-rentals-list');

    if (!panel || !list || currentUser.username === 'Gość') {
        if(panel) panel.style.display = 'none';
        return;
    }


    const myCurrentItems = history.filter(h =>
        h.rentedBy === currentUser.username && h.returnDate === null
    );

    if (myCurrentItems.length > 0) {
        panel.style.display = 'block';
        list.innerHTML = myCurrentItems.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.4); padding: 12px; border-radius: 10px;">
                <div>
                    <span style="font-weight: 700;">${item.asset ? item.asset.name : 'Sprzęt'}</span>
                    <div style="font-size: 0.75rem; opacity: 0.7;">Wypożyczono: ${new Date(item.rentalDate).toLocaleString()}</div>
                </div>
                <button class="btn" style="background: #ef4444; color: white; padding: 5px 12px; font-size: 0.8rem;"
                        onclick="returnAsset(${item.asset.id})">
                    Zwróć
                </button>
            </div>
        `).join('');
    } else {
        panel.style.display = 'none';
    }
}
window.onload = loadData;