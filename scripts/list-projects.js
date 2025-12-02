const { LinearClient } = require('@linear/sdk');

const client = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });

client.projects().then(p => {
  console.log('Linear Projects:\n');
  p.nodes.forEach(proj => console.log(proj.id, '-', proj.name));
}).catch(err => {
  console.error('Error:', err.message);
});
