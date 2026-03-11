// Import Firebase langsung dari CDN Google (Modular v10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
    getDatabase, ref, set, push, onValue, update, remove, get, onDisconnect 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Konfigurasi Firebase Anda
const firebaseConfig = {
    apiKey: "AIzaSyAgp27hYSZ433dBtrVDwmatt5xCJ6EOt9U",
    authDomain: "cayang.firebaseapp.com",
    projectId: "cayang",
    storageBucket: "cayang.firebasestorage.app",
    messagingSenderId: "960652456673",
    appId: "1:960652456673:web:21f18d74ad28728e187da0",
    measurementId: "G-TCP3QM8EC7"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// State Global
let currentUser = null;
let currentRoomId = null;
let isPlayer1 = false;

// --- ELEMENT DOM & HELPER ---
const showSection = (id) => {
    ['login-section', 'register-section', 'lobby-section', 'game-section'].forEach(sec => {
        document.getElementById(sec).classList.add('hidden-section');
    });
    document.getElementById(id).classList.remove('hidden-section');
};

const showAlert = (msg) => {
    const alertBox = document.getElementById('alert-box');
    document.getElementById('alert-msg').innerText = msg;
    alertBox.classList.remove('hidden-section');
    setTimeout(() => alertBox.classList.add('hidden-section'), 3000);
};

// --- NAVIGASI AUTH (Diperbaiki agar bisa diklik) ---
document.getElementById('link-to-register').addEventListener('click', (e) => {
    e.preventDefault(); 
    showSection('register-section');
});

document.getElementById('link-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('login-section');
});

// --- SISTEM AUTENTIKASI ---
document.getElementById('btn-register').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('reg-name').value;
    const city = document.getElementById('reg-city').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (!name || !city || !email || !password) return showAlert('Semua kolom wajib diisi!');
    if (password !== confirm) return showAlert('Password dan Konfirmasi tidak cocok!');

    const btnReg = document.getElementById('btn-register');
    btnReg.innerText = 'Mendaftar...';
    btnReg.disabled = true;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Simpan data tambahan ke Realtime Database
        await set(ref(db, 'users/' + user.uid), {
            name: name,
            city: city,
            email: email
        });
        
        showAlert('Berhasil mendaftar! Mengalihkan ke halaman login...');
        
        // Kosongkan form setelah berhasil
        document.getElementById('reg-name').value = '';
        document.getElementById('reg-city').value = '';
        document.getElementById('reg-email').value = '';
        document.getElementById('reg-password').value = '';
        document.getElementById('reg-confirm').value = '';
        
        showSection('login-section');
    } catch (error) {
        showAlert('Gagal: ' + error.message);
    } finally {
        btnReg.innerText = 'Daftar';
        btnReg.disabled = false;
    }
});

document.getElementById('btn-login').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) return showAlert('Isi email dan password terlebih dahulu!');

    const btnLogin = document.getElementById('btn-login');
    btnLogin.innerText = 'Loading...';
    btnLogin.disabled = true;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Jika sukses, onAuthStateChanged otomatis memindahkan ke Lobby
    } catch (error) {
        showAlert('Email atau Password salah!');
    } finally {
        btnLogin.innerText = 'Login';
        btnLogin.disabled = false;
    }
});

document.getElementById('btn-logout').addEventListener('click', () => {
    signOut(auth);
});

// --- OBSERVER AUTH ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const snapshot = await get(ref(db, 'users/' + user.uid));
        if (snapshot.exists()) {
            document.getElementById('user-greeting').innerText = `Hai, ${snapshot.val().name}`;
        }
        showSection('lobby-section');
        listenToRooms();
    } else {
        currentUser = null;
        showSection('login-section');
    }
});

// --- SISTEM LOBBY & ROOM (REAL-TIME) ---
function listenToRooms() {
    const roomsRef = ref(db, 'rooms');
    onValue(roomsRef, (snapshot) => {
        const rooms = snapshot.val();
        const roomList = document.getElementById('room-list');
        roomList.innerHTML = ''; 
        
        let hasActiveRooms = false;

        if (rooms) {
            Object.keys(rooms).forEach(roomId => {
                const room = rooms[roomId];
                if (room.status === 'waiting') {
                    hasActiveRooms = true;
                    const btn = document.createElement('button');
                    btn.className = 'w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded flex justify-between items-center border mb-2';
                    btn.innerHTML = `<span class="font-bold">${room.player1.name}'s Room</span> <span class="text-xs bg-indigo-500 text-white px-3 py-1 rounded shadow">Join</span>`;
                    btn.onclick = () => joinRoom(roomId);
                    roomList.appendChild(btn);
                }
            });
        }
        
        if (!hasActiveRooms) {
            roomList.innerHTML = '<p class="text-sm text-gray-500 text-center italic mt-4">Belum ada room tersedia. Buat room barumu!</p>';
        }
    });
}

document.getElementById('btn-create-room').addEventListener('click', async () => {
    if (!currentUser) return;
    
    const snapshot = await get(ref(db, 'users/' + currentUser.uid));
    const userName = snapshot.exists() ? snapshot.val().name : 'Player';

    const roomRef = push(ref(db, 'rooms'));
    currentRoomId = roomRef.key;
    isPlayer1 = true;

    await set(roomRef, {
        status: 'waiting',
        player1: { uid: currentUser.uid, name: userName, choice: '', score: 0 },
        player2: { uid: '', name: 'Menunggu Lawan...', choice: '', score: 0 }
    });

    onDisconnect(roomRef).remove(); // Otomatis hapus room jika P1 terputus (close tab)

    enterGameUI();
});

async function joinRoom(roomId) {
    const snapshot = await get(ref(db, 'users/' + currentUser.uid));
    const userName = snapshot.exists() ? snapshot.val().name : 'Player';
    currentRoomId = roomId;
    isPlayer1 = false;

    await update(ref(db, `rooms/${roomId}`), {
        status: 'playing',
        'player2/uid': currentUser.uid,
        'player2/name': userName,
        'player2/choice': '',
        'player2/score': 0
    });

    enterGameUI();
}

document.getElementById('btn-leave-room').addEventListener('click', async () => {
    if (currentRoomId) {
        if (isPlayer1) {
            await remove(ref(db, `rooms/${currentRoomId}`)); // Hapus seluruh room jika P1 keluar
        } else {
            await update(ref(db, `rooms/${currentRoomId}`), {
                status: 'waiting',
                'player2/uid': '',
                'player2/name': 'Menunggu Lawan...',
                'player2/choice': '',
                'player2/score': 0
            });
        }
        currentRoomId = null;
        showSection('lobby-section');
    }
});

// --- SISTEM GAME (SUIT) ---
function enterGameUI() {
    showSection('game-section');
    document.getElementById('game-room-id').innerText = `Room ID: ${currentRoomId.slice(-6)}`;
    
    const roomRef = ref(db, `rooms/${currentRoomId}`);
    onValue(roomRef, (snapshot) => {
        const room = snapshot.val();
        
        if (!room) { // Jika room dihapus oleh P1
            if (currentRoomId) { 
                currentRoomId = null;
                showSection('lobby-section');
                showAlert('Host telah membubarkan room.');
            }
            return;
        }

        // Update UI Nama & Skor
        document.getElementById('player1-name').innerText = room.player1.name;
        document.getElementById('player1-score').innerText = room.player1.score;
        document.getElementById('player2-name').innerText = room.player2.name;
        document.getElementById('player2-score').innerText = room.player2.score;

        if (room.status === 'waiting') {
            document.getElementById('game-status').innerText = '⏳ Menunggu lawan join...';
            document.getElementById('game-status').className = 'text-xl font-bold mb-4 text-orange-500';
            document.getElementById('game-controls').classList.add('hidden-section');
        } else if (room.status === 'playing') {
            // Cek apakah pemain sudah memilih
            const myChoice = isPlayer1 ? room.player1.choice : room.player2.choice;
            
            if (!myChoice) {
                document.getElementById('game-status').innerText = '🎮 Game Dimulai! Pilih senjatamu.';
                document.getElementById('game-status').className = 'text-xl font-bold mb-4 text-green-600';
                document.getElementById('game-controls').classList.remove('hidden-section');
            } else {
                document.getElementById('game-status').innerText = 'Tunggu lawanmu memilih...';
                document.getElementById('game-status').className = 'text-xl font-bold mb-4 text-gray-500';
            }

            // Evaluasi jika keduanya sudah memilih
            if (room.player1.choice && room.player2.choice) {
                document.getElementById('game-controls').classList.add('hidden-section');
                evaluateGame(room);
            }
        }
    });
}

// Logika Pemilihan Tombol Suit
document.querySelectorAll('.btn-suit').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const choice = e.target.getAttribute('data-choice');
        const playerPath = isPlayer1 ? 'player1' : 'player2';
        
        document.getElementById('your-choice-text').innerText = `Pilihanmu: ${choice.toUpperCase()}`;
        document.getElementById('game-controls').classList.add('hidden-section'); // Sembunyikan tombol agar tidak di-spam
        
        await update(ref(db, `rooms/${currentRoomId}`), {
            [`${playerPath}/choice`]: choice
        });
    });
});

// Logika Pemenang
function evaluateGame(room) {
    const c1 = room.player1.choice;
    const c2 = room.player2.choice;
    let winner = 'draw';

    // Aturan Suit (Batu mengalahkan Gunting, Gunting mengalahkan Kertas, Kertas mengalahkan Batu)
    if ((c1 === 'batu' && c2 === 'gunting') || 
        (c1 === 'gunting' && c2 === 'kertas') || 
        (c1 === 'kertas' && c2 === 'batu')) {
        winner = 'p1';
    } else if (c1 !== c2) {
        winner = 'p2';
    }

    let statusElement = document.getElementById('game-status');
    let statusText = `P1 (${c1}) vs P2 (${c2})<br>`;
    
    if (winner === 'draw') {
        statusText += "SERI! 🤝";
        statusElement.className = 'text-xl font-bold mb-4 text-yellow-500';
    } else if ((winner === 'p1' && isPlayer1) || (winner === 'p2' && !isPlayer1)) {
        statusText += "KAMU MENANG! 🎉";
        statusElement.className = 'text-xl font-bold mb-4 text-indigo-600';
    } else {
        statusText += "KAMU KALAH! 😢";
        statusElement.className = 'text-xl font-bold mb-4 text-red-500';
    }

    statusElement.innerHTML = statusText;

    // Player 1 bertugas mereset ronde dan menambah skor agar tidak terjadi eksekusi ganda di database
    if (isPlayer1) {
        setTimeout(async () => {
            let newScore1 = room.player1.score;
            let newScore2 = room.player2.score;
            
            if (winner === 'p1') newScore1++;
            if (winner === 'p2') newScore2++;

            await update(ref(db, `rooms/${currentRoomId}`), {
                'player1/score': newScore1,
                'player2/score': newScore2,
                'player1/choice': '',
                'player2/choice': ''
            });
            document.getElementById('your-choice-text').innerText = '';
        }, 3500); // Tunggu 3.5 detik sebelum ronde baru
    } else {
        // Player 2 hanya mereset teks di layarnya sendiri
        setTimeout(() => {
            document.getElementById('your-choice-text').innerText = '';
        }, 3500);
    }
}
