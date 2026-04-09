// Import the functions you need from the SDKs you need
const { initializeApp, getApps, getApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  limit,
  and,
  where,
  orderBy,
  setDoc,
} = require("firebase/firestore");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyCto_EYrJvArNFtVcEmcTsk4-qeCvIcm1E",
  authDomain: "flyy-bb9e7.firebaseapp.com",
  projectId: "flyy-bb9e7",
  storageBucket: "flyy-bb9e7.appspot.com",
  messagingSenderId: "274474888053",
  appId: "1:274474888053:web:8ecc2142171cb9fdb2013c",
  measurementId: "G-4Z80XD30JL",
};

const firebaseConfigCandles = {
  apiKey: "AIzaSyARSxjNxLc_Z5Znb3QmLGLqdRzQnzqNEZk",
  authDomain: "punaro-13d3f.firebaseapp.com",
  projectId: "punaro-13d3f",
  storageBucket: "punaro-13d3f.firebasestorage.app",
  messagingSenderId: "730341124995",
  appId: "1:730341124995:web:241cc76d9f1d666d2164b6",
  measurementId: "G-X2ZWTMZFCH",
};

// Initialize Firebase safely (avoid duplicate-app on hot reload / multiple imports)
const app = getApps().some((a) => a.name === "[DEFAULT]")
  ? getApp()
  : initializeApp(firebaseConfig);
const preMarketCollectionName = "pre-market";
const db = getFirestore(app);
const userCollection = collection(db, "users");
const marketCollection = collection(db, preMarketCollectionName);

const appCandles = getApps().some((a) => a.name === "candles")
  ? getApp("candles")
  : initializeApp(firebaseConfigCandles, "candles");
const dbCandles = getFirestore(appCandles);
const minuteCandlesCollectionName = "pre-market-candles";

function formatDateMMDDYYYY() {
  const date = new Date();
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${mm}-${dd}-${yyyy}`;
}

const getRefreshToken = () => {
  const queryD = doc(db, `pre-market/token`);
  return getDoc(queryD);
};

const getAccessToken = () => {
  const queryD = doc(db, `upstox-token/analytics`);
  return getDoc(queryD);
};
const updateMarketData = (data) => {
  try {
    return setDoc(doc(db, preMarketCollectionName, formatDateMMDDYYYY()), data);
  } catch (err) {
    console.log(err);
  }
};

// Persist 1-minute OHLC candles under:
// pre-market/<MM-DD-YYYY>/minuteCandles/<symbol>_<minuteKey>
const saveMinuteCandles = async (candles) => {
  if (candles.length === 0) return;
  try {
    return setDoc(
      doc(dbCandles, minuteCandlesCollectionName, formatDateMMDDYYYY()),
      { candles },
    );
  } catch (err) {
    console.log("eeeee", err);
  }
};

// export const getUserWithEmail = (email) => {
//   const queryD = query(userCollection, where("email", "==", email));
//   return getDocs(queryD);
// };

// export const addUser = (user) => {
//   return addDoc(userCollection, user);
// };

// export const updateInvoice = (id, data) => {
//   const invioceDoc = doc(db, `invoice/${id}`);
//   return updateDoc(invioceDoc, data);
// };

// export const deleteInvoice = (id) => {
//   const invioceDoc = doc(db, `invoice/${id}`);
//   return deleteDoc(invioceDoc);
// };

// export const getInvoice = (id) => {
//   const invioceDoc = doc(db, `invoice/${id}`);
//   return getDoc(invioceDoc);
// };

// export const getUser = (username, password) => {
//   const q = query(
//     userCollection,
//     and(where("username", "==", username), where("password", "==", password))
//   );
//   return getDocs(q);
// };
const modules = {
  getRefreshToken,
  getAccessToken,
  updateMarketData,
  saveMinuteCandles,
};

module.exports = modules;
