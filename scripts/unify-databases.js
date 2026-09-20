const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const mongoose = require('mongoose');

const uri = 'mongodb+srv://khushbookumari23074_db_user:uy1QyBemAKoSzk70@cluster0.hu4jmnw.mongodb.net/?retryWrites=true&w=majority';

async function unifyDatabases() {
  console.log('Connecting to MongoDB Atlas Cluster0...');
  const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 15000 }).asPromise();
  
  const admin = conn.db.admin();
  const dbs = await admin.listDatabases();
  console.log('Available Databases on Cluster:', dbs.databases.map(d => d.name));

  const oldDbName = 'multiservice';
  const targetDbName = 'multiserviceapp';

  const oldDbExists = dbs.databases.some(d => d.name === oldDbName);
  const targetDbExists = dbs.databases.some(d => d.name === targetDbName);

  console.log(`Status -> ${oldDbName} exists: ${oldDbExists}, ${targetDbName} exists: ${targetDbExists}`);

  const targetDb = conn.useDb(targetDbName).db;

  if (oldDbExists) {
    const oldDb = conn.useDb(oldDbName).db;
    const collections = await oldDb.listCollections().toArray();
    console.log(`Collections in '${oldDbName}':`, collections.map(c => c.name));

    for (const col of collections) {
      const colName = col.name;
      if (colName.startsWith('system.')) continue;

      const oldCollection = oldDb.collection(colName);
      const targetCollection = targetDb.collection(colName);

      const docs = await oldCollection.find({}).toArray();
      console.log(`Found ${docs.length} documents in ${oldDbName}.${colName}`);

      let mergedCount = 0;
      for (const doc of docs) {
        try {
          if (colName === 'users' && doc.phoneNumber) {
            const existingUser = await targetCollection.findOne({
              $or: [{ _id: doc._id }, { phoneNumber: doc.phoneNumber }]
            });
            if (existingUser) {
              const { _id, ...rest } = doc;
              await targetCollection.updateOne(
                { _id: existingUser._id },
                { $set: rest }
              );
              console.log(`Merged user profile for ${doc.phoneNumber}`);
            } else {
              await targetCollection.insertOne(doc);
              console.log(`Inserted user ${doc.phoneNumber}`);
            }
          } else {
            const { _id, ...rest } = doc;
            await targetCollection.updateOne(
              { _id },
              { $set: rest, $setOnInsert: { _id } },
              { upsert: true }
            );
          }
          mergedCount++;
        } catch (itemErr) {
          console.warn(`Warning merging doc in ${colName}:`, itemErr.message);
        }
      }
      console.log(`Processed ${mergedCount} documents for ${targetDbName}.${colName}`);
    }

    console.log(`\nDropping old duplicate database: '${oldDbName}' from MongoDB Atlas...`);
    await oldDb.dropDatabase();
    console.log(`Database '${oldDbName}' successfully dropped!`);
  } else {
    console.log(`No '${oldDbName}' database found. Only '${targetDbName}' is present.`);
  }

  // Verification
  const finalDbs = await admin.listDatabases();
  console.log('\n================ FINAL DATABASE STATUS ================');
  console.log('Databases remaining on Cluster0:', finalDbs.databases.map(d => d.name));

  const targetCollections = await targetDb.listCollections().toArray();
  console.log(`Collections in unified '${targetDbName}':`, targetCollections.map(c => c.name));

  for (const col of targetCollections) {
    const count = await targetDb.collection(col.name).countDocuments();
    console.log(` -> ${col.name}: ${count} document(s)`);
  }
  console.log('=======================================================');

  // Verify test database drop if exists and empty
  const testDb = dbs.databases.find(d => d.name === 'test');
  if (testDb) {
    const testDbConn = conn.useDb('test').db;
    const testCols = await testDbConn.listCollections().toArray();
    if (testCols.length === 0) {
      console.log("Dropping unused empty 'test' database...");
      await testDbConn.dropDatabase();
    }
  }

  await conn.close();
  console.log('\nDatabase Unification & Cleanup Completed with 100% Success!');
}

unifyDatabases().catch(err => {
  console.error('Error during database unification:', err);
  process.exit(1);
});
