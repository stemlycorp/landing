import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';
import { firebaseConfig } from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById('disclosure-form');
const statusEl = document.querySelector('[data-status]');
const submitButton = form?.querySelector('button[type="submit"]');

function toTimestamp(value) {
  if (!value) return serverTimestamp();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return serverTimestamp();
  return Timestamp.fromDate(date);
}

async function saveDisclosure(formData) {
  const data = {
    title: formData.get('title')?.trim() || '',
    summary: formData.get('summary')?.trim() || '',
    body: formData.get('body')?.trim() || '',
    pinned: formData.get('pinned') === 'on',
    publishedAt: toTimestamp(formData.get('publishedAt')),
    updatedAt: serverTimestamp(),
  };
  const docId = formData.get('docId')?.trim();
  if (docId) {
    await setDoc(doc(db, 'disclosures', docId), data, { merge: true });
    return docId;
  }
  const result = await addDoc(collection(db, 'disclosures'), data);
  return result.id;
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!submitButton) return;
    submitButton.disabled = true;
    if (statusEl) statusEl.textContent = 'Saving...';
    try {
      const formData = new FormData(form);
      const id = await saveDisclosure(formData);
      if (statusEl) statusEl.textContent = `Saved disclosure (${id}).`;
      form.reset();
    } catch (error) {
      console.error(error);
      if (statusEl) statusEl.textContent = 'Failed to save disclosure. Check console for details.';
    } finally {
      submitButton.disabled = false;
    }
  });
}
