
const SID4 = '0163'; 
const STORAGE_KEY = `focustasks_${SID4}`;

//escapehtml//
function escapeHtml(s) {

  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

}

function createStore(key) {
  let value = [];

  try {
    const saved = JSON.parse(localStorage.getItem(key));
    value = Array.isArray(saved) ? saved : [];
  } catch {
    value = [];
  }

  const persist = () => localStorage.setItem(key, JSON.stringify(value));

  return {
    add(item) {
      value = [...value, item];
      persist();
      return [...value];
    },
    toggle(id) {
      value = value.map(t => (t.id === id ? { ...t, done: !t.done } : t));
      persist();
      return [...value];
    },
    remove(id) {
      value = value.filter(t => t.id !== id);
      persist();
      return [...value];
    },
    list() {
      return [...value];
    }
  };
}

//elements//
const elements = {
  addForm: document.getElementById('add-form'),
  input: document.getElementById('task-input'),
  error: document.getElementById('error'),
  activeList: document.getElementById('active-list'),
  doneList: document.getElementById('done-list'),
  analytics: document.getElementById('analytics'),
  title: document.getElementById('app-title'),
  lists: document.getElementById('lists'),
};

const store = createStore(STORAGE_KEY);
elements.title.textContent = `FocusTasks ${SID4}`;


function summarize(tasks) {
  const summary = tasks.reduce(
    (acc, t) => {
      t.done ? acc.done++ : acc.active++;
      return acc;
    },
    { active: 0, done: 0 }
  );
  const total = summary.active + summary.done;
  const pct = total ? ((summary.done / total) * 100).toFixed(1) : '0.0';
  return { ...summary, pct };
}


function renderAnalytics() {
  const s = summarize(store.list());
  elements.analytics.textContent = `Active: ${s.active} · Done: ${s.done} · Done %: ${s.pct}%`;
}

function renderLists() {
  const tasks = store.list();

  const active = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  elements.activeList.replaceChildren(...active.map(makeTaskItem));
  elements.doneList.replaceChildren(...done.map(makeTaskItem));
}

//createtask//
function makeTaskItem(t) {
  const li = document.createElement('li');
  li.dataset.id = t.id;

  const titleDiv = document.createElement('div');
  titleDiv.className = 'item-title';
  titleDiv.textContent = t.title; 

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'item-actions';

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'toggle-btn';
  toggleBtn.textContent = t.done ? 'Unfinished' : 'Done';
  toggleBtn.setAttribute('aria-pressed', String(t.done));

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Remove';

  actionsDiv.append(toggleBtn, deleteBtn);
  li.append(titleDiv, actionsDiv);

  return li;
}

//validator//
function validateTitle(raw) {
  return raw && raw.trim().length > 0;
}

//eventlistener//
elements.lists.addEventListener('click', e => {
  const li = e.target.closest('li');
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.classList.contains('toggle-btn')) {
    store.toggle(id);
  } else if (e.target.classList.contains('delete-btn')) {
    store.remove(id);
  } else {
    return;
  }

  renderLists();
  renderAnalytics();
});

elements.addForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = elements.input.value.trim();

  if (!validateTitle(title)) {
    elements.error.textContent = 'Please enter a non-empty task title. This input is invalid.';
    elements.input.focus();
    return;
  }

  elements.error.textContent = '';

  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  store.add({ id, title, done: false });

  elements.input.value = '';
  renderLists();
  renderAnalytics();
});

//init//
renderLists();
renderAnalytics();


