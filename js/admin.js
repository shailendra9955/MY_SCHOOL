(function () {
  'use strict';

  const STORAGE_KEY = 'mcs_students_v1';
  const $ = (id) => document.getElementById(id);
  const qs = (selector, root = document) => root.querySelector(selector);

  document.addEventListener('DOMContentLoaded', () => {
    setupAdminNavigation();
    if ($('studentsTable')) setupStudentsPage();
  });

  function setupAdminNavigation() {
    const button = qs('[data-admin-menu]');
    const nav = qs('.admin-nav');
    if (button && nav) button.addEventListener('click', () => nav.classList.toggle('open'));
    const current = location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.admin-nav a').forEach(a => {
      if (a.getAttribute('href') === current) a.classList.add('active');
    });
  }

  function setupStudentsPage() {
    const form = $('studentForm');
    const modal = $('studentModal');

    $('addStudentBtn').addEventListener('click', () => openStudentModal());
    document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', closeStudentModal));
    modal.addEventListener('click', e => { if (e.target === modal) closeStudentModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeStudentModal(); });
    form.addEventListener('submit', saveStudent);

    ['studentSearch', 'classFilter', 'sectionFilter', 'statusFilter'].forEach(id => {
      $(id).addEventListener(id === 'studentSearch' ? 'input' : 'change', renderStudents);
    });
    $('exportStudentsBtn').addEventListener('click', exportStudentsCsv);
    $('studentsBody').addEventListener('click', handleStudentAction);

    renderStudents();
  }

  function getStudents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const records = raw ? JSON.parse(raw) : [];
      return Array.isArray(records) ? records : [];
    } catch (error) {
      console.error('Unable to read student records', error);
      return [];
    }
  }

  function saveStudents(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function makeStudentId(records) {
    const max = records.reduce((highest, student) => {
      const match = String(student.student_id || '').match(/^STU(\d+)$/i);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    return `STU${String(max + 1).padStart(5, '0')}`;
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function setupFilters(records) {
    fillFilter('classFilter', unique(records.map(s => s.class_id).filter(Boolean)));
    fillFilter('sectionFilter', unique(records.map(s => s.section_id).filter(Boolean)));
  }

  function fillFilter(id, values) {
    const select = $(id);
    const selected = select.value;
    const label = id === 'classFilter' ? 'All Classes' : 'All Sections';
    select.innerHTML = `<option value="">${label}</option>` + values.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
    if (values.includes(selected)) select.value = selected;
  }

  function unique(values) { return [...new Set(values)]; }

  function filteredStudents() {
    const query = $('studentSearch').value.trim().toLowerCase();
    const classValue = $('classFilter').value;
    const sectionValue = $('sectionFilter').value;
    const status = $('statusFilter').value;
    return getStudents().filter(s => {
      const haystack = [s.student_id, s.admission_no, s.roll_no, s.full_name, s.first_name, s.last_name, s.phone, s.email].join(' ').toLowerCase();
      return (!query || haystack.includes(query)) &&
        (!classValue || s.class_id === classValue) &&
        (!sectionValue || s.section_id === sectionValue) &&
        (status === 'all' || (s.status || 'active') === status);
    }).sort((a, b) => String(a.full_name).localeCompare(String(b.full_name)));
  }

  function renderStudents() {
    const all = getStudents();
    setupFilters(all);
    const visible = filteredStudents();
    const body = $('studentsBody');
    body.innerHTML = visible.map(student => `
      <tr>
        <td><div class="student-cell">${student.photo_url ? `<img src="${escapeAttribute(student.photo_url)}" alt="" class="student-avatar" onerror="this.style.display='none'">` : '<div class="student-avatar avatar-placeholder">' + escapeHtml(initials(student.full_name)) + '</div>'}<div><strong>${escapeHtml(student.full_name || 'Unnamed')}</strong><small>${escapeHtml(student.student_id || '')}</small></div></div></td>
        <td>${escapeHtml(student.admission_no || '—')}</td>
        <td>${escapeHtml(student.class_id || '—')}</td>
        <td>${escapeHtml(student.section_id || '—')}</td>
        <td>${escapeHtml(student.phone || '—')}</td>
        <td><span class="status-badge ${student.status === 'inactive' ? 'status-inactive' : 'status-active'}">${student.status === 'inactive' ? 'Inactive' : 'Active'}</span></td>
        <td><div class="row-actions"><button class="btn btn-small btn-light" data-action="edit" data-id="${escapeAttribute(student.student_id)}">Edit</button>${student.status === 'inactive' ? `<button class="btn btn-small btn-success" data-action="restore" data-id="${escapeAttribute(student.student_id)}">Restore</button>` : `<button class="btn btn-small btn-warning" data-action="deactivate" data-id="${escapeAttribute(student.student_id)}">Deactivate</button>`}<button class="btn btn-small btn-danger-outline" data-action="delete" data-id="${escapeAttribute(student.student_id)}">Delete</button></div></td>
      </tr>`).join('');

    $('emptyStudents').hidden = visible.length !== 0;
    $('studentsTable').querySelector('thead').style.display = visible.length ? '' : 'none';
    updateSummary(all);
  }

  function updateSummary(records) {
    $('totalStudents').textContent = records.length;
    $('activeStudents').textContent = records.filter(s => s.status !== 'inactive').length;
    $('inactiveStudents').textContent = records.filter(s => s.status === 'inactive').length;
    $('classCount').textContent = unique(records.map(s => s.class_id).filter(Boolean)).length;
  }

  function openStudentModal(student) {
    $('studentForm').reset();
    $('studentId').value = '';
    $('recordStatus').value = 'active';
    $('admissionDate').value = today();
    $('studentModalTitle').textContent = student ? 'Edit Student' : 'Add Student';
    $('formError').textContent = '';
    if (student) {
      const map = {
        studentId: 'student_id', admissionNo: 'admission_no', rollNo: 'roll_no', firstName: 'first_name', lastName: 'last_name',
        dateOfBirth: 'date_of_birth', gender: 'gender', classId: 'class_id', sectionId: 'section_id', parentId: 'parent_id',
        admissionDate: 'admission_date', phone: 'phone', email: 'email', address: 'address', city: 'city', state: 'state',
        pincode: 'pincode', bloodGroup: 'blood_group', photoUrl: 'photo_url', username: 'username', recordStatus: 'status'
      };
      Object.keys(map).forEach(id => { $(id).value = student[map[id]] || ''; });
    }
    $('studentModal').hidden = false;
    document.body.classList.add('modal-open');
    setTimeout(() => $('firstName').focus(), 50);
  }

  function closeStudentModal() {
    $('studentModal').hidden = true;
    document.body.classList.remove('modal-open');
  }

  function formData() {
    const firstName = $('firstName').value.trim();
    const lastName = $('lastName').value.trim();
    return {
      student_id: $('studentId').value.trim(), admission_no: $('admissionNo').value.trim(), roll_no: $('rollNo').value.trim(),
      first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}`.trim(), date_of_birth: $('dateOfBirth').value,
      gender: $('gender').value, class_id: $('classId').value.trim(), section_id: $('sectionId').value.trim(), parent_id: $('parentId').value.trim(),
      admission_date: $('admissionDate').value, phone: $('phone').value.trim(), email: $('email').value.trim(), address: $('address').value.trim(),
      city: $('city').value.trim(), state: $('state').value.trim(), pincode: $('pincode').value.trim(), blood_group: $('bloodGroup').value,
      photo_url: $('photoUrl').value.trim(), username: $('username').value.trim(), status: $('recordStatus').value
    };
  }

  function validate(student, records) {
    if (!student.admission_no || !student.first_name || !student.class_id || !student.section_id) return 'Admission No., First Name, Class and Section are required.';
    if (student.email && !/^\S+@\S+\.\S+$/.test(student.email)) return 'Please enter a valid email address.';
    const duplicate = records.find(s => s.admission_no.toLowerCase() === student.admission_no.toLowerCase() && s.student_id !== student.student_id);
    if (duplicate) return `Admission No. ${student.admission_no} is already used by ${duplicate.full_name}.`;
    return '';
  }

  function saveStudent(event) {
    event.preventDefault();
    const records = getStudents();
    const student = formData();
    const error = validate(student, records);
    $('formError').textContent = error;
    if (error) return;

    const now = new Date().toISOString();
    if (student.student_id) {
      const index = records.findIndex(s => s.student_id === student.student_id);
      if (index < 0) return showToast('Student record no longer exists.', 'error');
      student.created_at = records[index].created_at || now;
      student.updated_at = now;
      records[index] = student;
      showToast('Student updated successfully.');
    } else {
      student.student_id = makeStudentId(records);
      student.created_at = now;
      student.updated_at = now;
      records.push(student);
      showToast(`Student added successfully (${student.student_id}).`);
    }
    saveStudents(records);
    closeStudentModal();
    renderStudents();
  }

  function handleStudentAction(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = button.dataset.id;
    const records = getStudents();
    const index = records.findIndex(s => s.student_id === id);
    if (index < 0) return showToast('Student record not found.', 'error');
    const student = records[index];

    if (button.dataset.action === 'edit') return openStudentModal(student);
    if (button.dataset.action === 'deactivate') {
      if (!confirm(`Deactivate ${student.full_name}? The record will remain available and can be restored.`)) return;
      student.status = 'inactive'; student.updated_at = new Date().toISOString(); saveStudents(records); renderStudents(); return showToast('Student deactivated.');
    }
    if (button.dataset.action === 'restore') {
      student.status = 'active'; student.updated_at = new Date().toISOString(); saveStudents(records); renderStudents(); return showToast('Student restored.');
    }
    if (button.dataset.action === 'delete') {
      if (!confirm(`Permanently delete ${student.full_name}? This cannot be undone.`)) return;
      records.splice(index, 1); saveStudents(records); renderStudents(); return showToast('Student permanently deleted.');
    }
  }

  function exportStudentsCsv() {
    const records = filteredStudents();
    if (!records.length) return showToast('There are no student records to export.', 'error');
    const columns = ['student_id','admission_no','roll_no','first_name','last_name','full_name','date_of_birth','gender','class_id','section_id','parent_id','admission_date','phone','email','address','city','state','pincode','blood_group','photo_url','username','status','created_at','updated_at'];
    const csv = [columns.join(','), ...records.map(s => columns.map(c => csvCell(s[c])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `modern-convent-school-students-${today()}.csv`; a.click(); URL.revokeObjectURL(url);
    showToast('CSV exported.');
  }

  function csvCell(value) { return `"${String(value ?? '').replaceAll('"', '""')}"`; }
  function initials(name) { return String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase(); }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function escapeAttribute(value) { return escapeHtml(value); }
  function showToast(message, type = 'success') {
    const toast = $('toast'); toast.textContent = message; toast.className = `toast show ${type}`;
    clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2800);
  }
})();
