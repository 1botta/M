// d:\مشروع جم\config.js

// TODO: الرجاء ملء بيانات مشروعك من Firebase
// هذه هي معلومات الاتصال بقاعدة بياناتك على Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // استبدل هذا بمفتاح API الخاص بك
  authDomain: "bott-b06ab.firebaseapp.com", // استبدل هذا بنطاق المصادقة الخاص بك
  databaseURL: "https://bott-b06ab-default-rtdb.firebaseio.com/", // هذا صحيح بناءً على طلبك
  projectId: "bott-b06ab", // استبدل هذا بمعرف المشروع الخاص بك
  storageBucket: "bott-b06ab.appspot.com", // استبدل هذا بمخزن الملفات الخاص بك
  messagingSenderId: "631034832368", // استبدل هذا بمعرف المرسل الخاص بك
  appId: "1:631034832368:web:1aab4bd163ab610e46a935" // هذا صحيح بناءً على طلبك
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
// إنشاء مرجع لقاعدة البيانات
const database = firebase.database();