module.exports = {
  feedback: {
    byId: {
      2: {
        id: 2,
        code: 'boo',
        message: null,
        data: { needed: 'data' },
        severity: 'warning',
        fieldName: null,
      },
      3: {
        id: 3,
        code: 'bah',
        message: "Bah!",
        data: null,
        severity: 'info',
        fieldName: null,
      },
      4: {
        id: 4,
        code: null,
        message: 'Meh!',
        data: { needed: 'data' },
        severity: 'success',
        fieldName: null,
      },
      5: {
        id: 5,
        code: 'gah_error',
        message: null,
        data: { needed: 'data' },
        severity: 'danger',
        fieldName: 'gah',
      },
    },
    orderedIds: [2, 3, 4, 5],
  },
};
