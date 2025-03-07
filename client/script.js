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

  // Wait until the DOM is loaded before adding event listeners
  document.addEventListener('DOMContentLoaded', (event) => {
    // Send a message when the send button is clicked
    document.getElementById('sendButton').addEventListener('click', () => {
      const message = document.getElementById('messageInput').value;
      socket.send(JSON.stringify({ type: 'message', message, user: myUser }));
      document.getElementById('messageInput').value = '';
    });
  });

  document.addEventListener('keydown', (event) => {
    // Only send if the typed in key is not a modifier key
    if (event.key.length === 1) {
      socket.send(JSON.stringify({ type: 'typing', user: myUser }));
    }
    // Only send if the typed in key is the enter key
    if (event.key === 'Enter') {
      const message = document.getElementById('messageInput').value;
      socket.send(JSON.stringify({ type: 'message', message, user: myUser }));
      document.getElementById('messageInput').value = '';
    }
  });
})();
