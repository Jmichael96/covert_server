module.exports = [
  {
    table: 'USERS',
    schema: 'name:string, email:string, password:string, phone:string, date_created:date'
  },
  {
    table: 'REMINDERS',
    schema: 'user_id:string, type:string, date_due:date, reminder_date:date, repeat:string, date_created:date'
  }
];