module.exports = {
  render: () => `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Suit Online Real-time</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            .hidden-section { display: none !important; }
        </style>
    </head>
    <body class="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 min-h-screen font-sans text-gray-800 flex items-center justify-center p-4">
        
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative transition-all duration-300">
            
            <div id="alert-box" class="hidden-section bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4 text-sm text-center">
                <span id="alert-msg"></span>
            </div>

            <div id="login-section" class="p-8">
                <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">Masuk Game</h2>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="login-email" class="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" id="login-password" class="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                    <button id="btn-login" class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-semibold transition">Login</button>
                    <p class="text-sm text-center mt-4">Belum punya akun? <a href="#" id="link-to-register" class="text-indigo-600 font-bold hover:underline">Daftar</a></p>
                </div>
            </div>

            <div id="register-section" class="hidden-section p-8">
                <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Daftar Pengguna Baru</h2>
                <div class="space-y-3">
                    <input type="text" id="reg-name" placeholder="Nama Lengkap" class="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-pink-500">
                    <input type="text" id="reg-city" placeholder="Kota" class="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-pink-500">
                    <input type="email" id="reg-email" placeholder="Email" class="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-pink-500">
                    <input type="password" id="reg-password" placeholder="Password" class="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-pink-500">
                    <input type="password" id="reg-confirm" placeholder="Konfirmasi Password" class="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-pink-500">
                    <button id="btn-register" class="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 font-semibold transition">Daftar</button>
                    <p class="text-sm text-center mt-4">Sudah punya akun? <a href="#" id="link-to-login" class="text-pink-600 font-bold hover:underline">Login</a></p>
                </div>
            </div>

            <div id="lobby-section" class="hidden-section p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-indigo-700" id="user-greeting">Lobby</h2>
                    <button id="btn-logout" class="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Logout</button>
                </div>
                <button id="btn-create-room" class="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-bold mb-6 shadow-md transition">Buat Room Baru</button>
                
                <h3 class="text-lg font-semibold mb-2">Room Aktif:</h3>
                <div id="room-list" class="space-y-2 max-h-60 overflow-y-auto">
                    </div>
            </div>

            <div id="game-section" class="hidden-section p-6 text-center">
                <div class="flex justify-between items-center mb-4">
                    <span id="game-room-id" class="text-xs bg-gray-200 px-2 py-1 rounded font-mono"></span>
                    <button id="btn-leave-room" class="text-sm text-red-500 font-bold hover:underline">Keluar Room</button>
                </div>
                
                <h2 class="text-xl font-bold mb-4" id="game-status">Menunggu lawan...</h2>
                
                <div class="flex justify-around items-center my-8 bg-gray-50 p-4 rounded-xl border">
                    <div class="text-center">
                        <p id="player1-name" class="font-bold text-indigo-600">Player 1</p>
                        <p id="player1-score" class="text-2xl font-black">0</p>
                    </div>
                    <div class="text-2xl font-black text-gray-400">VS</div>
                    <div class="text-center">
                        <p id="player2-name" class="font-bold text-pink-600">Menunggu...</p>
                        <p id="player2-score" class="text-2xl font-black">0</p>
                    </div>
                </div>

                <div id="game-controls" class="hidden-section">
                    <h3 class="font-semibold mb-3">Pilih Senjatamu:</h3>
                    <div class="flex justify-center space-x-4">
                        <button class="btn-suit text-4xl hover:scale-110 transition transform" data-choice="batu">✊</button>
                        <button class="btn-suit text-4xl hover:scale-110 transition transform" data-choice="kertas">✋</button>
                        <button class="btn-suit text-4xl hover:scale-110 transition transform" data-choice="gunting">✌️</button>
                    </div>
                    <p id="your-choice-text" class="mt-4 text-sm font-medium text-gray-500"></p>
                </div>
            </div>
        </div>

        <script type="module" src="/app.js"></script>
    </body>
    </html>
  `
};
