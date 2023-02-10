module.exports = [
  {
    table: 'USERS',
    schema: [
      { name: 'uuid', type: 'STRING', mode: 'REQUIRED' },
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
      { name: 'uuid', type: 'STRING', mode: 'REQUIRED' },
      { name: 'user_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'reminder_type', type: 'STRING', mode: 'REQUIRED' },
      { name: 'date_due', type: 'DATE', mode: 'REQUIRED' },
      { name: 'notify', type: 'STRING', mode: 'REQUIRED' },
      { name: 'alert_days_prior', type: 'INTEGER', mode: 'REQUIRED' },
      { name: 'repeat', type: 'BOOLEAN', mode: 'REQUIRED' },
      { name: 'date_created', type: 'DATE', mode: 'REQUIRED' },
      { name: 'reminder_time', type: 'TIME', mode: 'REQUIRED' },
      { name: 'reminder_message', type: 'STRING', mode: 'REQUIRED' },
      { name: 'terminated', type: 'BOOLEAN', mode: 'REQUIRED' },
      { name: 'job_name', type: 'STRING', mode: 'REQUIRED' },
      { name: 'price', type: 'FLOAT' },
      { name: 'deposit', type: 'BOOLEAN' },
      { name: 'title', type: 'STIRNG', mode: 'REQUIRED' }
    ]
  }
];