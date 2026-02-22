const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.count()
    .then(function (c) { console.log('Users count:', c); })
    .catch(function (e) { console.log('Error:', e.message); })
    .finally(function () { p['$disconnect'](); });
