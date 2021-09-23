module.exports = {
  generateMessage(username, messageText) {
    return {
      username,
      text: messageText,
      createdAt: new Date().getTime(),
    };
  },
  generateLocationMessage(username, url) {
    return {
      username,
      url,
      createdAt: new Date().getTime(),
    };
  },
};
