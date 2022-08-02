module.exports = [
  {
    table: 'USERS',
    schema: [
      { name: 'name', type: 'STRING', mode: 'REQUIRED' },
      { name: 'email', type: 'STRING', mode: 'REQUIRED' },
      { name: 'password', type: 'STRING', mode: 'REQUIRED' },
      { name: 'phone', type: 'STRING', mode: 'REQUIRED' },
      { name: 'date_created', type: 'DATE', mode: 'REQUIRED' }
    ],
  },
  {
    table: 'REMINDERS',
    schema: [
      { name: 'user_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'reminder_type', type: 'STRING', mode: 'REQUIRED' },
      { name: 'date_due', type: 'DATE', mode: 'REQUIRED' },
      { name: 'reminder_date', type: 'DATE', mode: 'REQUIRED' },
      { name: 'repeat', type: 'STRING', mode: 'REQUIRED' },
      { name: 'date_created', type: 'DATE', mode: 'REQUIRED' }
    ]
  }
];