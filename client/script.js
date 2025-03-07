(async () => {
  const myUser = await generateRandomUser();
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
})();
