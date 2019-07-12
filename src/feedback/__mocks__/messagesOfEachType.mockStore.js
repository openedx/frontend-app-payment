module.exports = {
  feedback: {
    byId: {
      2: {
        id: 2,
        code: 'boo',
        userMessage: null,
        data: { needed: 'data' },
        messageType: 'warning',
        fieldName: null,
      },
      3: {
        id: 3,
        code: 'bah',
        userMessage: "Bah!",
        data: null,
        messageType: 'info',
        fieldName: null,
      },
      4: {
        id: 4,
        code: null,
        userMessage: 'Meh!',
        data: { needed: 'data' },
        messageType: 'success',
        fieldName: null,
      },
      5: {
        id: 5,
        code: 'gah_error',
        userMessage: null,
        data: { needed: 'data' },
        messageType: 'error',
        fieldName: 'gah',
      },
      6: {
        id: 6,
        code: null,
        userMessage: 'Debug debug',
        messageType: 'debug',
      },
    },
    orderedIds: [2, 3, 4, 5, 6],
  },
};
