import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import {
  collection,
  getDocs,
  getFirestore,
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';
import { firebaseConfig } from './firebaseConfig.js';

const isKorean = (document.documentElement.lang || '').toLowerCase().startsWith('ko');
const COPY = {
  pinned: isKorean ? '상단 고정' : 'Pinned',
  untitled: isKorean ? '제목 없는 공시' : 'Untitled disclosure',
  loadError: isKorean
    ? '공시를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
    : 'Failed to load disclosures. Please try again.',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const listEl = document.querySelector('[data-disclosure-list]');
const loadingEl = document.querySelector('[data-loading]');
const errorEl = document.querySelector('[data-error]');
const emptyEl = document.querySelector('[data-empty]');
const detailTitleEl = document.querySelector('[data-detail-title]');
const detailBodyEl = document.querySelector('[data-detail-body]');
const detailDateEl = document.querySelector('[data-detail-date]');
const detailPinnedEl = document.querySelector('[data-detail-pinned]');
const detailMetaEl = document.querySelector('[data-detail-meta]');

let disclosures = [];
let activeDisclosureId = null;

function getTimestamp(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (value instanceof Date) return value.getTime();
  if (value.seconds !== undefined) {
    return value.seconds * 1000 + (value.nanoseconds || 0) / 1e6;
  }
  if (value.toDate) {
    return value.toDate().getTime();
  }
  return 0;
}

function formatDate(value) {
  if (!value) return '';
  const asDate =
    typeof value.toDate === 'function'
      ? value.toDate()
      : value instanceof Date
      ? value
      : new Date(value);
  if (Number.isNaN(asDate.getTime())) return '';
  return asDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function setActiveDisclosure(id) {
  activeDisclosureId = id;
  const item = disclosures.find((d) => d.id === id);
  document
    .querySelectorAll('[data-disclosure-id]')
    .forEach((el) => el.setAttribute('data-active', String(el.dataset.disclosureId === id)));
  if (!item) {
    detailTitleEl.hidden = true;
    detailBodyEl.hidden = true;
    detailMetaEl.hidden = true;
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;
  detailTitleEl.textContent = item.title || COPY.untitled;
  detailBodyEl.textContent = item.body || item.content || '';
  detailDateEl.textContent = formatDate(item.publishedAt) || '';
  const isPinned = Boolean(item.pinned);
  detailPinnedEl.hidden = !isPinned;
  detailDateEl.hidden = !detailDateEl.textContent;
  detailMetaEl.hidden = !isPinned && !detailDateEl.textContent;
  detailTitleEl.hidden = false;
  detailBodyEl.hidden = false;
}

function renderList(items) {
  if (!listEl) return;
  listEl.replaceChildren();
  items.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'disclosure-item';
    button.dataset.disclosureId = item.id;
    if (item.id === activeDisclosureId) {
      button.setAttribute('data-active', 'true');
    }

    const title = document.createElement('h3');
    title.textContent = item.title || COPY.untitled;

    const summary = document.createElement('p');
    summary.textContent = item.summary || item.subtitle || '';

    const meta = document.createElement('div');
    meta.className = 'detail-meta';

    if (item.pinned) {
      const pinnedPill = document.createElement('span');
      pinnedPill.className = 'pill pinned';
      pinnedPill.textContent = COPY.pinned;
      meta.appendChild(pinnedPill);
    }

    const date = formatDate(item.publishedAt);
    if (date) {
      const datePill = document.createElement('span');
      datePill.className = 'pill date';
      datePill.textContent = date;
      meta.appendChild(datePill);
    }

    button.append(title, summary, meta);
    listEl.appendChild(button);
  });
  listEl.hidden = items.length === 0;
  if (items.length === 0 && emptyEl) {
    emptyEl.hidden = false;
  }
}

async function loadDisclosures() {
  try {
    if (loadingEl) loadingEl.hidden = false;
    if (errorEl) errorEl.hidden = true;
    const snapshot = await getDocs(collection(db, 'disclosures'));
    disclosures = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    disclosures.sort((a, b) => {
      const pinnedA = a.pinned ? 1 : 0;
      const pinnedB = b.pinned ? 1 : 0;
      if (pinnedA !== pinnedB) return pinnedB - pinnedA;
      return getTimestamp(b.publishedAt) - getTimestamp(a.publishedAt);
    });
    renderList(disclosures);
    if (disclosures.length) {
      setActiveDisclosure(disclosures[0].id);
    } else if (emptyEl) {
      emptyEl.hidden = false;
    }
  } catch (error) {
    console.error(error);
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = COPY.loadError;
    }
  } finally {
    if (loadingEl) loadingEl.hidden = true;
  }
}

if (listEl) {
  listEl.addEventListener('click', (event) => {
    const target = event.target.closest('[data-disclosure-id]');
    if (!target) return;
    const id = target.dataset.disclosureId;
    if (id) setActiveDisclosure(id);
  });
}

loadDisclosures();
