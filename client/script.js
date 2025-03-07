(async () => {
  const myUser = await generateRandomUser();
  const themeToggle = document.getElementById('themeToggle');
  const chatContainer = document.getElementById('chatContainer');
  const messages = document.getElementById('messages');

  function setTheme(mode) {
    document.body.classList.toggle('dark', mode === 'dark');
    document.body.classList.toggle('light', mode === 'light');
    chatContainer.classList.toggle('dark:bg-gray-800', mode === 'dark');
    chatContainer.classList.toggle('bg-white', mode === 'light');
    messages.classList.toggle('dark:bg-gray-900', mode === 'dark');
    messages.classList.toggle('bg-gray-100', mode === 'light');
    localStorage.setItem('theme', mode);
    themeToggle.textContent = mode === 'dark' ? '☀️' : '🌙';
  }

  const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
  });

  let activeUsers = [];
  let typingUsers = [];

  const socket = new WebSocket(generateBackendUrl());
  socket.addEventListener('open', () => {
    console.log('WebSocket connected!');
    socket.send(JSON.stringify({ type: 'newUser', user: myUser }));
  });

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    console.log('WebSocket message:', message);
    switch (message.type) {
      case 'message':
        const messageElement = generateMessage(message, myUser);
        document.getElementById('messages').appendChild(messageElement);
        setTimeout(() => {
          messageElement.classList.add('opacity-100');
        }, 100);
        break;
      case 'activeUsers':
        activeUsers = message.users;
        displayActiveUsersCount(activeUsers);
        break;
      case 'typing':
        typingUsers = message.users;
        updateTypingIndicator();
        break;
      default:
        break;
    }
  });

  socket.addEventListener('close', (event) => {
    console.log('WebSocket closed.');
  });

  socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
  });

  // Funktion zum Anzeigen der Anzahl der aktiven Nutzer
  const displayActiveUsersCount = (users) => {
    const activeUsersCount = document.getElementById('activeUsersCount');
    activeUsersCount.textContent = users.length; // Die Anzahl der aktiven Nutzer anzeigen
  };

  // Funktion zum Aktualisieren des Typing-Indikators
  const updateTypingIndicator = () => {
    const typingIndicator = document.getElementById('typingIndicator');
    const typingUsersList = document.getElementById('typingUsersList');

    if (typingUsers.length > 0) {
      // Zeige nur die Namen der Nutzer, die gerade tippen
      const userNames = typingUsers.map(user => user.name).join(', ');
      typingUsersList.textContent = userNames; // Namen der Nutzer anzeigen
      typingIndicator.classList.remove('hidden');
    } else {
      // Verstecke den Indikator, wenn niemand tippt
      typingIndicator.classList.add('hidden');
    }
  };

  // Warten, bis das DOM geladen ist, bevor Event-Listener hinzugefügt werden
  document.addEventListener('DOMContentLoaded', (event) => {
    // Send a message when the send button is clicked
    document.getElementById('sendButton').addEventListener('click', () => {
      const message = document.getElementById('messageInput').value;
      socket.send(JSON.stringify({ type: 'message', message, user: myUser }));
      document.getElementById('messageInput').value = '';
    });
  });

  document.addEventListener('keydown', (event) => {
    // Nur senden, wenn die gedrückte Taste keine Modifikatortaste ist
    if (event.key.length === 1) {
      socket.send(JSON.stringify({ type: 'typing', user: myUser }));
    }
    // Nur senden, wenn die gedrückte Taste die Enter-Taste ist
    if (event.key === 'Enter') {
      const message = document.getElementById('messageInput').value;
      socket.send(JSON.stringify({ type: 'message', message, user: myUser }));
      document.getElementById('messageInput').value = '';
    }
  });

  document.addEventListener('keyup', (event) => {
    if (event.key.length === 1 || event.key === 'Enter') {
      socket.send(JSON.stringify({ type: 'typing', user: null })); // Stop typing indication
    }
  });
})();
