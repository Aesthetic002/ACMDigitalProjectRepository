const admin = require("firebase-admin");
const path = require("path");

if (process.argv.length < 3) {
    console.log("Usage: node make-admin.js <email>");
    process.exit(1);
}

const targetEmail = process.argv[2];

async function makeAdmin() {
    try {
        // Initialize Firebase
        const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
        try {
            require.resolve(serviceAccountPath);
        } catch (e) {
            console.error("Error: serviceAccountKey.json not found in backend directory.");
            process.exit(1);
        }

        const serviceAccount = require(serviceAccountPath);

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: `${serviceAccount.project_id}.appspot.com`,
            });
        }

        const db = admin.firestore();
        const auth = admin.auth();

        console.log(`Looking up user: ${targetEmail}...`);

        // Find user by email in Auth
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(targetEmail);
        } catch (e) {
            if (e.code === 'auth/user-not-found') {
                console.error(`User with email ${targetEmail} not found in Firebase Auth.`);
                console.error("Please sign up locally first.");
            } else {
                console.error("Auth Error:", e);
            }
            process.exit(1);
        }

        const uid = userRecord.uid;
        console.log(`Found User UID: ${uid}`);

        // Update Firestore
        const userRef = db.collection("users").doc(uid);
        const doc = await userRef.get();

        if (!doc.exists) {
            console.log("User document not found in Firestore. Creating new admin profile...");
            await userRef.set({
                uid: uid,
                email: targetEmail,
                role: 'admin',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        } else {
            console.log(`Current role: ${doc.data().role}`);
            await userRef.update({
                role: 'admin',
                updatedAt: new Date().toISOString()
            });
        }

        console.log(`\nSUCCESS! ${targetEmail} is now an ADMIN.`);
        process.exit(0);

    } catch (error) {
        console.error("Unexpected Error:", error);
        process.exit(1);
    }
}

makeAdmin();
