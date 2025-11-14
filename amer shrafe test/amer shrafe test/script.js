import { openDB } from './idb.js';

let db;

async function init() {
  db = await openDB();
  await render();
  registerSW();
}

function getStore(mode='readonly') {
  return db.transaction('tasks', mode).objectStore('tasks');
}

async function addTask(title) {
  const store = getStore('readwrite');
  store.add({ title, createdAt: new Date().toISOString() });
}

async function deleteTask(id) {
  getStore('readwrite').delete(id);
}

async function getTasks() {
  return new Promise(res => {
    const req = getStore().getAll();
    req.onsuccess = () => res(req.result || []);
  });
}

async function render() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  const tasks = await getTasks();

  tasks.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));

  for (const t of tasks) {
    const li = document.createElement('li');
    li.textContent = t.title;
    const btn = document.createElement('button');
    btn.textContent = 'X';
    btn.onclick = ()=>{ deleteTask(t.id).then(render); };
    li.appendChild(btn);
    list.appendChild(li);
  }
}

document.getElementById('task-form').onsubmit = async (e)=>{
  e.preventDefault();
  const input = document.getElementById('task-input');
  await addTask(input.value);
  input.value = '';
  render();
};

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }
}

init();
