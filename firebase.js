// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const preMarketCollectionName = "pre-market";
const db = getFirestore(app);
const userCollection = collection(db, "users");
const marketCollection = collection(db, preMarketCollectionName);

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

const updateMarketData = (data) => {
  try {
    return setDoc(doc(db, preMarketCollectionName, formatDateMMDDYYYY()), data);
  } catch (err) {
    console.log(err);
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
const modules = { getRefreshToken, updateMarketData };

module.exports = modules;
