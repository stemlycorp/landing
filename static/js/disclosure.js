import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import {
  collection,
  getDocs,
  getFirestore,
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';
import { firebaseConfig } from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const langFromAttr = (document.documentElement.getAttribute('lang') || '').toLowerCase();
const langFromData =
  (document.documentElement.dataset?.lang || document.body?.dataset?.lang || '').toLowerCase();
const pathIsKorean = /\/ko(\/|$)/.test(window.location.pathname);
const isKorean = pathIsKorean || langFromAttr.startsWith('ko') || langFromData.startsWith('ko');
const COPY = {
  pinned: isKorean ? '상단 고정' : 'Pinned',
  untitled: isKorean ? '제목 없는 공시' : 'Untitled disclosure',
  loadError: isKorean
    ? '공시를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
    : 'Failed to load disclosures. Please try again.',
};

let disclosures = [];
let activeDisclosureId = null;
let listEl = null;
let loadingEl = null;
let emptyIndicatorEl = null;
let errorEl = null;
let detailTitleEl = null;
let detailBodyEl = null;
let detailDateEl = null;
let detailPinnedEl = null;
let detailMetaEl = null;
let detailEmptyEl = null;

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
    if (detailTitleEl) detailTitleEl.hidden = true;
    if (detailBodyEl) detailBodyEl.hidden = true;
    if (detailMetaEl) detailMetaEl.hidden = true;
    if (detailEmptyEl) detailEmptyEl.hidden = false;
    return;
  }
  if (detailEmptyEl) detailEmptyEl.hidden = true;
  if (detailTitleEl) detailTitleEl.textContent = item.title || COPY.untitled;
  if (detailBodyEl) detailBodyEl.textContent = item.body || item.content || '';
  if (detailDateEl) detailDateEl.textContent = formatDate(item.publishedAt) || '';
  const isPinned = Boolean(item.pinned);
  if (detailPinnedEl) detailPinnedEl.hidden = !isPinned;
  if (detailDateEl) {
    const hasDate = Boolean(detailDateEl.textContent);
    detailDateEl.hidden = !hasDate;
    if (detailMetaEl) detailMetaEl.hidden = !isPinned && !hasDate;
  } else if (detailMetaEl) {
    detailMetaEl.hidden = !isPinned;
  }
  if (detailTitleEl) detailTitleEl.hidden = false;
  if (detailBodyEl) detailBodyEl.hidden = false;
}

function renderList(items) {
  const MAX_ITEMS = 10;
  const limitedItems = items.slice(0, MAX_ITEMS);
  if (!listEl) return;
  listEl.innerHTML = '';
  limitedItems.forEach((item) => {
    const li = document.createElement('li');
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
    li.appendChild(button);
    listEl.appendChild(li);
  });
  listEl.style.display = items.length ? '' : 'none';
  if (emptyIndicatorEl) emptyIndicatorEl.style.display = items.length ? 'none' : 'block';
}

async function loadDisclosures() {
  try {
    if (loadingEl) loadingEl.style.display = 'block';
    if (emptyIndicatorEl) emptyIndicatorEl.style.display = 'none';
    if (errorEl) errorEl.hidden = true;
    const snapshot = await getDocs(collection(db, 'disclosures'));
    disclosures = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    disclosures.sort((a, b) => {
      const pinnedA = a.pinned ? 1 : 0;
      const pinnedB = b.pinned ? 1 : 0;
      if (pinnedA !== pinnedB) return pinnedB - pinnedA;
      return getTimestamp(b.publishedAt) - getTimestamp(a.publishedAt);
    });
    if (listEl) listEl.innerHTML = '';
    if (!disclosures.length) {
      if (listEl) listEl.style.display = 'none';
      setActiveDisclosure(null);
      if (emptyIndicatorEl) emptyIndicatorEl.style.display = 'block';
      return;
    }
    renderList(disclosures);
    setActiveDisclosure(disclosures[0].id);
  } catch (error) {
    console.error(error);
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = COPY.loadError;
    }
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  listEl = document.getElementById('disclosure-list');
  loadingEl = document.getElementById('loading-indicator');
  emptyIndicatorEl = document.getElementById('empty-indicator');
  errorEl = document.querySelector('[data-error]');
  detailTitleEl = document.querySelector('[data-detail-title]');
  detailBodyEl = document.querySelector('[data-detail-body]');
  detailDateEl = document.querySelector('[data-detail-date]');
  detailPinnedEl = document.querySelector('[data-detail-pinned]');
  detailMetaEl = document.querySelector('[data-detail-meta]');
  detailEmptyEl = document.querySelector('[data-empty]');

  if (listEl) {
    listEl.addEventListener('click', (event) => {
      const target = event.target.closest('[data-disclosure-id]');
      if (!target) return;
      const id = target.dataset.disclosureId;
      if (id) setActiveDisclosure(id);
    });
  }

  loadDisclosures();
});
