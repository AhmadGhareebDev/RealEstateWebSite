const mongoose = require('mongoose');
require('dotenv').config()
const AgentVerification = require('./models/AgentVerification');

const fakeLicenseDB = [
  { licenseNumber: '01987654', state: 'CA', agentName: 'Michael Johnson' },
  { licenseNumber: '8854321',  state: 'NY', agentName: 'Sarah Williams' },
  { licenseNumber: '0678901',  state: 'TX', agentName: 'David Martinez' },
  { licenseNumber: '3344556',  state: 'FL', agentName: 'Jessica Brown' },
  { licenseNumber: '11223344', state: 'IL', agentName: 'Robert Lee' },
  { licenseNumber: '99887766', state: 'GA', agentName: 'Emily Davis' },
  { licenseNumber: '20251117', state: 'CA', agentName: 'Jamal Unes' },  
  { licenseNumber: '55556666', state: 'NY', agentName: 'Ahmed Khan' },
  { licenseNumber: '77778888', state: 'TX', agentName: 'Maria Garcia' },
  { licenseNumber: '99990000', state: 'FL', agentName: 'Chris Wilson' },
  { licenseNumber: 'LC-8921-X', state: 'CALIFORNIA', agentName: 'Alexander Ghareeb' }
];

mongoose.connect(process.env.DATABASE_URL)
  .then(async () => {
    await AgentVerification.deleteMany({});
    await AgentVerification.insertMany(fakeLicenseDB);
    console.log('Fake license DB seeded with 10 realistic records');
    console.log('YOUR test license → Number: 20251117 | State: CA | Name: Jamal Unes');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Seed failed:', err);
    mongoose.connection.close();
  });