const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const user = {
  id: "c2da2812-fd55-4a45-99ec-2c05dbc0b485",
  name: "Samrudhi Divekar",
  email: "samrudhi.divekar24@pccoepune.org",
  password: "$2b$10$RptApY9mMnw3FyGJK3NV9O.pWTmrrQiaYSmdE1IDjwXKNDCE0whKS",
};

async function test() {
    try {
        console.log('Testing password comparison...');
        const match = await bcrypt.compare('Test@123', user.password); // Assuming this is the password
        console.log('Match:', match);

        console.log('Testing JWT signing...');
        const token = jwt.sign(
            { id: user.id, email: user.email, role: 'student' },
            process.env.JWT_SECRET || 'fallback',
            { expiresIn: '7d' }
        );
        console.log('Token generated');
    } catch (err) {
        console.error('ERROR:', err);
    }
}

test();
