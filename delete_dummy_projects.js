const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'data', 'db.json');

try {
  let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  let originalCount = db.projects.length;

  const titlesToRemove = [
    "Environmental Monitoring System Using IOT and Machine Learning Models",
    "SMART ENERGY MONITORING SYSTEM FOR HOUSEHOLD APPLIANCES",
    "An AI-Driven Recommendation System for Formative Assessment Tools in Engineering",
    "AI/ML-Based Accessibility & Assistive Technology for Inclusive Healthcare",
    "Machine Learning Based Severity Classification of Sickle Cell Disease Patients using Clinical Da"
  ];

  db.projects = db.projects.filter(p => {
    // Check if the project title starts with any of the titles to remove
    // (useful for the last one which might be truncated)
    const matches = titlesToRemove.some(t => p.title.toLowerCase().startsWith(t.toLowerCase()));
    if (matches) {
      console.log('Removed:', p.title);
      return false; // exclude from array
    }
    return true; // keep in array
  });

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`Deleted ${originalCount - db.projects.length} projects.`);

} catch (err) {
  console.error("Error:", err);
}
