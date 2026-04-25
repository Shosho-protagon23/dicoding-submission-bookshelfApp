// Key yang digunakan untuk menyimpan data di localStorage
const STORAGE_KEY = 'BOOKSHELF_APP_DATA';

// DATA MANAGEMENT
function getBooks() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * @param {Array} books - Array objek buku yang akan disimpan
 */
function saveBooks(books) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

/**
 * @param {string} title - Judul buku
 * @param {string} author - Penulis buku
 * @param {number} year - Tahun rilis buku
 * @param {boolean} isComplete - Status selesai dibaca
 */

function addBook(title, author, year, isComplete) {
  const books = getBooks();
  const newBook = {
    id: Number(new Date()),
    title,
    author,
    year: Number(year),
    isComplete,
  };
  books.push(newBook);
  saveBooks(books);
}

/**
 * @param {number} id - ID buku yang akan dihapus
 */

function deleteBook(id) {
  const books = getBooks().filter((book) => book.id !== id);
  saveBooks(books);
}

/**
 * @param {number} id - ID buku yang akan dipindahkan
 */

function toggleBookStatus(id) {
  const books = getBooks().map((book) => {
    if (book.id === id) {
      return { ...book, isComplete: !book.isComplete };
    }
    return book;
  });
  saveBooks(books);
}

/**
 * @param {number} id - ID buku yang akan diperbarui
 * @param {string} title - Judul baru
 * @param {string} author - Penulis baru
 * @param {number} year - Tahun baru
 * @param {boolean} isComplete - Status baru
 */

function updateBook(id, title, author, year, isComplete) {
  const books = getBooks().map((book) => {
    if (book.id === id) {
      return { ...book, title, author, year: Number(year), isComplete };
    }
    return book;
  });
  saveBooks(books);
}

// DOM RENDERING
/**
 * @param {Object} book - Objek buku yang akan dirender
 * @returns {HTMLElement} Elemen div berisi data buku
 */

function createBookElement(book) {
  // Kontainer utama buku
  const bookItem = document.createElement('div');
  bookItem.setAttribute('data-bookid', book.id);
  bookItem.setAttribute('data-testid', 'bookItem');
  bookItem.classList.add(book.isComplete ? 'complete' : 'incomplete');

  // Judul buku
  const title = document.createElement('h3');
  title.setAttribute('data-testid', 'bookItemTitle');
  title.textContent = book.title;

  // Penulis buku
  const author = document.createElement('p');
  author.setAttribute('data-testid', 'bookItemAuthor');
  author.textContent = `Penulis: ${book.author}`;

  // Tahun rilis buku
  const year = document.createElement('p');
  year.setAttribute('data-testid', 'bookItemYear');
  year.textContent = `Tahun: ${book.year}`;

  // Tombol aksi
  const actions = document.createElement('div');
  actions.classList.add('book-actions');

  // Tombol pindah rak
  const toggleBtn = document.createElement('button');
  toggleBtn.setAttribute('data-testid', 'bookItemIsCompleteButton');
  toggleBtn.textContent = book.isComplete ? '↩ Belum selesai' : '✓ Selesai dibaca';

  // Tombol hapus
  const deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteBtn.textContent = '✕ Hapus';

  // Tombol edit
  const editBtn = document.createElement('button');
  editBtn.setAttribute('data-testid', 'bookItemEditButton');
  editBtn.textContent = '✎ Edit';

  // Event: pindah rak
  toggleBtn.addEventListener('click', () => {
    toggleBookStatus(book.id);
    renderBooks();
  });

  // Event: hapus buku (dengan konfirmasi)
  deleteBtn.addEventListener('click', () => {
    if (confirm(`Hapus buku "${book.title}"?`)) {
      deleteBook(book.id);
      renderBooks();
    }
  });

  // Event: buka modal edit
  editBtn.addEventListener('click', () => {
    openEditModal(book);
  });

  // Susun elemen
  actions.append(toggleBtn, deleteBtn, editBtn);
  bookItem.append(title, author, year, actions);

  return bookItem;
}

/**
 * @param {string} [searchQuery=''] - Kata kunci pencarian judul
 */

function renderBooks(searchQuery = '') {
  const incompleteList = document.getElementById('incompleteBookList');
  const completeList = document.getElementById('completeBookList');

  // Kosongkan rak terlebih dahulu
  incompleteList.innerHTML = '';
  completeList.innerHTML = '';

  // Filter buku berdasarkan pencarian (case-insensitive)
  const books = getBooks().filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const incompleteBooks = books.filter((book) => !book.isComplete);
  const completeBooks = books.filter((book) => book.isComplete);

  // Render rak belum selesai
  if (incompleteBooks.length === 0) {
    incompleteList.innerHTML = '<p class="empty-state">Tidak ada buku di rak ini.</p>';
  } else {
    incompleteBooks.forEach((book) => {
      incompleteList.appendChild(createBookElement(book));
    });
  }

  // Render rak selesai
  if (completeBooks.length === 0) {
    completeList.innerHTML = '<p class="empty-state">Tidak ada buku di rak ini.</p>';
  } else {
    completeBooks.forEach((book) => {
      completeList.appendChild(createBookElement(book));
    });
  }

  // Update jumlah buku di badge
  document.getElementById('incompleteCount').textContent = incompleteBooks.length;
  document.getElementById('completeCount').textContent = completeBooks.length;
}

// MODAL EDIT
/**
 * @param {Object} book - Objek buku yang akan diedit
 */
function openEditModal(book) {
  document.getElementById('editBookId').value = book.id;
  document.getElementById('editBookTitle').value = book.title;
  document.getElementById('editBookAuthor').value = book.author;
  document.getElementById('editBookYear').value = book.year;
  document.getElementById('editBookIsComplete').checked = book.isComplete;

  document.getElementById('editModal').classList.add('active');
}

// Menutup modal edit
function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  // Render buku saat halaman pertama kali dimuat
  renderBooks();

  // Form Tambah Buku Baru
  const bookForm = document.getElementById('bookForm');
  const isCompleteCheckbox = document.getElementById('bookFormIsComplete');
  const submitBtn = document.getElementById('bookFormSubmit');
  const submitBtnSpan = submitBtn.querySelector('span');

  // Update teks tombol submit sesuai status checkbox
  isCompleteCheckbox.addEventListener('change', () => {
    submitBtnSpan.textContent = isCompleteCheckbox.checked
      ? 'Selesai dibaca'
      : 'Belum selesai dibaca';
  });

  bookForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('bookFormTitle').value.trim();
    const author = document.getElementById('bookFormAuthor').value.trim();
    const year = document.getElementById('bookFormYear').value;
    const isComplete = isCompleteCheckbox.checked;

    addBook(title, author, year, isComplete);
    renderBooks();

    // Reset form setelah submit
    bookForm.reset();
    submitBtnSpan.textContent = 'Belum selesai dibaca';
  });

  // Form Pencarian Buku
  const searchForm = document.getElementById('searchBook');

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('searchBookTitle').value.trim();
    renderBooks(query);
  });

  // Reset pencarian jika input dikosongkan
  document.getElementById('searchBookTitle').addEventListener('input', (e) => {
    if (e.target.value === '') {
      renderBooks();
    }
  });

  // Modal Edit Buku
  const editForm = document.getElementById('editForm');

  editForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = Number(document.getElementById('editBookId').value);
    const title = document.getElementById('editBookTitle').value.trim();
    const author = document.getElementById('editBookAuthor').value.trim();
    const year = document.getElementById('editBookYear').value;
    const isComplete = document.getElementById('editBookIsComplete').checked;

    updateBook(id, title, author, year, isComplete);
    closeEditModal();
    renderBooks();
  });

  // Tombol batal di modal
  document.getElementById('cancelEdit').addEventListener('click', closeEditModal);

  // Tutup modal jika klik di luar area modal
  document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('editModal')) {
      closeEditModal();
    }
  });
});
