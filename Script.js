// ---------- Variables ----------
var events = [];                 // list of all events
var regs = [];                   // list of all registrations
var user = null;                 // logged in person (null = nobody)
var nextId = 9;                  // id for the next new event
var editId = 0;                  // 0 = new event, otherwise the event being edited
var currentEvent = 0;            // event whose attendee list is open
var eventFilter = 'upcoming';    // upcoming, recent or all

// ---------- Small functions ----------
function today() {
  return new Date().toISOString().slice(0, 10);     // first 10 letters, like 2026-11-18
}
function dayFromNow(n) {
  return new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);   // 86400000 ms = 1 day
}
function getEvent(id) {
  for (var i = 0; i < events.length; i++) {
    if (events[i].id === id) { return events[i]; }
  }
}
function countRegs(eventId) {      // how many seats are booked
  var count = 0;
  for (var i = 0; i < regs.length; i++) {
    if (regs[i].eventId === eventId) { count++; }
  }
  return count;
}
function isRegistered(eventId) {   // has this student already registered?
  for (var i = 0; i < regs.length; i++) {
    if (regs[i].eventId === eventId && regs[i].reg === user.reg) { return true; }
  }
  return false;
}
function showPage(pageId) {        // hide all pages, then show one
  var pages = document.getElementsByClassName('page');
  for (var i = 0; i < pages.length; i++) { pages[i].style.display = 'none'; }
  document.getElementById(pageId).style.display = 'block';
}
function showPopup(html) {         // popup box on the My Registrations page
  document.getElementById('popup').innerHTML = html + '<p><button class="noprint" onclick="document.getElementById(\'popup\').style.display = \'none\'">Close</button></p>';
  document.getElementById('popup').style.display = 'block';
  window.scrollTo(0, 0);
}

// ---------- Save and load ----------
function saveData() {
  var all = { events: events, regs: regs, nextId: nextId, user: user };
  localStorage.setItem('eventAppData3', JSON.stringify(all));
}
function loadData() {
  var saved = localStorage.getItem('eventAppData3');
  if (saved === null) {
    loadDemoData();
  } else {
    var all = JSON.parse(saved);
    events = all.events;
    regs = all.regs;
    nextId = all.nextId;
    user = all.user;
  }
}
function loadDemoData() {          // events shown the first time the site opens
  events = [
    { id: 1, title: 'Cyber Security Seminar', category: 'Seminar', date: dayFromNow(-3), time: '11:00', venue: 'Block 34, Seminar Hall', capacity: 1000, description: 'Passwords, phishing and safe browsing.' },
    { id: 2, title: 'AI in Education Seminar', category: 'Seminar', date: dayFromNow(6), time: '14:00', venue: 'Main Auditorium', capacity: 1000, description: 'How AI tools are changing studies.' },
    { id: 3, title: 'Intro to Web Development Workshop', category: 'Workshop', date: dayFromNow(1), time: '10:00', venue: 'Block 32, Room 101', capacity: 100, description: 'HTML, CSS and JavaScript basics.' },
    { id: 4, title: 'Python for Beginners Workshop', category: 'Workshop', date: dayFromNow(9), time: '10:00', venue: 'Block 32, Lab 2', capacity: 100, description: 'Write your first Python programs.' },
    { id: 5, title: 'Tech Fest 2026', category: 'Fest', date: dayFromNow(20), time: '09:00', venue: 'Main Ground', capacity: 100, description: 'Projects, robots and coding games.' },
    { id: 6, title: 'Freshers Welcome Fest', category: 'Fest', date: dayFromNow(-5), time: '17:00', venue: 'Main Auditorium', capacity: 100, description: 'A welcome party for the new batch.' },
    { id: 7, title: 'Code Sprint 24-Hour Hackathon', category: 'Hackathon', date: dayFromNow(11), time: '09:00', venue: 'Innovation Lab', capacity: 1000, description: 'Build a project in 24 hours.' },
    { id: 8, title: 'Green Tech Hackathon', category: 'Hackathon', date: dayFromNow(-12), time: '09:00', venue: 'Innovation Lab', capacity: 1000, description: 'Ideas and apps for a cleaner environment.' }
  ];
  regs = [
    { ticket: 'TKT-100001', eventId: 1, name: 'Riya Sharma', reg: '12600001', present: true, rating: 5, comment: 'Very informative.' },
    { ticket: 'TKT-100002', eventId: 1, name: 'Karan Mehta', reg: '12600002', present: true, rating: 4, comment: 'Good examples.' },
    { ticket: 'TKT-100003', eventId: 1, name: 'Neha Verma', reg: '12600003', present: false, rating: 0, comment: '' },
    { ticket: 'TKT-100004', eventId: 6, name: 'Aman Gill', reg: '12600004', present: true, rating: 4, comment: 'Fun event.' },
    { ticket: 'TKT-100005', eventId: 8, name: 'Simran Kaur', reg: '12600005', present: true, rating: 3, comment: 'Needed more time.' },
    { ticket: 'TKT-100006', eventId: 3, name: 'Manpreet Singh', reg: '12600007', present: false, rating: 0, comment: '' }
  ];
}

// ---------- Login and logout ----------
function login() {
  user = {
    name: document.getElementById('loginName').value,
    reg: document.getElementById('loginReg').value,
    role: document.getElementById('loginRole').value
  };
  saveData();
  showApp();
  return false;       // false stops the page from reloading
}
function logout() {
  user = null;
  saveData();
  showApp();
}
function showApp() {
  if (user === null) {
    document.getElementById('topbar').style.display = 'none';
    showPage('pageLogin');
    document.getElementById('pageLogin').style.display = 'flex';    // flex keeps the form in the center
    return;
  }
  document.getElementById('topbar').style.display = 'grid';
  document.getElementById('welcome').innerHTML = user.name + ' (' + user.role + ')';
  if (user.role === 'organizer') {
    document.getElementById('navOrg').style.display = 'inline';
    document.getElementById('navStudent').style.display = 'none';
    eventFilter = 'all';
  } else {
    document.getElementById('navOrg').style.display = 'none';
    document.getElementById('navStudent').style.display = 'inline';
    eventFilter = 'upcoming';
  }
  showEvents();
}

// ---------- Events page ----------
function showEvents() {
  showPage('pageEvents');
  document.getElementById('eventForm').style.display = 'none';
  var reminders = '';
  if (user.role === 'organizer') {
    document.getElementById('eventsTitle').innerHTML = 'Manage Events';
    document.getElementById('createBtn').style.display = 'inline-block';
  } else {
    document.getElementById('eventsTitle').innerHTML = 'Events';
    document.getElementById('createBtn').style.display = 'none';
    // reminder for registered events in the next 2 days
    for (var i = 0; i < regs.length; i++) {
      if (regs[i].reg === user.reg) {
        var e = getEvent(regs[i].eventId);
        if (e.date >= today() && e.date <= dayFromNow(2)) {
          reminders += '<p class="alert">Reminder: ' + e.title + ' is on ' + e.date + ' at ' + e.time + '.</p>';
        }
      }
    }
  }
  document.getElementById('reminders').innerHTML = reminders;
  setFilter(eventFilter);
}

function setFilter(filter) {
  eventFilter = filter;
  document.getElementById('tabUpcoming').className = '';
  document.getElementById('tabRecent').className = '';
  document.getElementById('tabAll').className = '';
  if (filter === 'upcoming') { document.getElementById('tabUpcoming').className = 'main'; }
  if (filter === 'recent') { document.getElementById('tabRecent').className = 'main'; }
  if (filter === 'all') { document.getElementById('tabAll').className = 'main'; }
  drawEvents();
}

function drawEvents() {
  var html = '';
  for (var i = 0; i < events.length; i++) {
    var e = events[i];
    var show = true;
    if (eventFilter === 'upcoming' && e.date < today()) { show = false; }
    if (eventFilter === 'recent' && e.date >= today()) { show = false; }

    if (show === true) {
      var booked = countRegs(e.id);
      var buttons = '';
      if (user.role === 'organizer') {
        buttons = '<button onclick="showAttendees(' + e.id + ')">Attendees</button> ' +
                  '<button onclick="openEventForm(' + e.id + ')">Edit</button> ' +
                  '<button class="red" onclick="deleteEvent(' + e.id + ')">Delete</button>';
      } else if (isRegistered(e.id)) {
        buttons = '<span class="tag">You are registered</span>';
      } else if (e.date < today()) {
        buttons = '<span class="tag">Event over</span>';
      } else if (booked >= e.capacity) {
        buttons = '<span class="tag">Seats full</span>';
      } else {
        buttons = '<button class="main" onclick="registerEvent(' + e.id + ')">Register</button>';
      }
      html += '<div class="card">' +
        '<span class="tag">' + e.category + '</span>' +
        '<h3>' + e.title + '</h3>' +
        '<p>' + e.description + '</p>' +
        '<p>Date: ' + e.date + ' at ' + e.time + '</p>' +
        '<p>Venue: ' + e.venue + '</p>' +
        '<p>Seats: ' + booked + ' / ' + e.capacity + '</p>' +
        '<p>' + buttons + '</p></div>';
    }
  }
  if (html === '') { html = '<p>No events found.</p>'; }
  document.getElementById('eventList').innerHTML = html;
}

function openEventForm(id) {       // id = 0 means a new event, otherwise edit that event
  editId = id;
  var e = { title: '', category: 'Seminar', date: '', time: '', venue: '', capacity: '', description: '' };
  document.getElementById('formTitle').innerHTML = 'Create Event';
  if (id !== 0) {
    e = getEvent(id);
    document.getElementById('formTitle').innerHTML = 'Edit Event';
  }
  document.getElementById('evTitle').value = e.title;
  document.getElementById('evCategory').value = e.category;
  document.getElementById('evDate').value = e.date;
  document.getElementById('evTime').value = e.time;
  document.getElementById('evVenue').value = e.venue;
  document.getElementById('evCapacity').value = e.capacity;
  document.getElementById('evDesc').value = e.description;
  document.getElementById('eventForm').style.display = 'block';
  window.scrollTo(0, 0);
}

function saveEvent() {
  var capacity = Number(document.getElementById('evCapacity').value);
  var e;
  if (editId === 0) {              // new event
    e = { id: nextId };
    nextId++;
    events.push(e);
  } else {                         // old event
    if (capacity < countRegs(editId)) {
      alert('Seat limit cannot be less than the seats already booked (' + countRegs(editId) + ').');
      return false;
    }
    e = getEvent(editId);
  }
  e.title = document.getElementById('evTitle').value;
  e.category = document.getElementById('evCategory').value;
  e.date = document.getElementById('evDate').value;
  e.time = document.getElementById('evTime').value;
  e.venue = document.getElementById('evVenue').value;
  e.capacity = capacity;
  e.description = document.getElementById('evDesc').value;
  saveData();
  showEvents();
  return false;
}

function deleteEvent(id) {
  if (confirm('Delete this event and its registrations?') === false) { return; }
  for (var i = events.length - 1; i >= 0; i--) {         // splice removes an item from the list
    if (events[i].id === id) { events.splice(i, 1); }
  }
  for (var j = regs.length - 1; j >= 0; j--) {
    if (regs[j].eventId === id) { regs.splice(j, 1); }
  }
  saveData();
  showEvents();
}

function registerEvent(id) {
  if (countRegs(id) >= getEvent(id).capacity) {
    alert('Seats are full.');
    return;
  }
  regs.push({
    ticket: 'TKT-' + Math.floor(100000 + Math.random() * 900000),      // random 6 digit number
    eventId: id,
    name: user.name,
    reg: user.reg,
    present: false,
    rating: 0,
    comment: ''
  });
  saveData();
  showEvents();
  alert('Registered! Your ticket is in My Registrations.');
}

// ---------- My registrations page ----------
// i is the position of the registration in the regs list
function showMyRegs() {
  showPage('pageMy');
  document.getElementById('popup').style.display = 'none';
  var html = '';
  for (var i = 0; i < regs.length; i++) {
    if (regs[i].reg === user.reg) {
      var r = regs[i];
      var e = getEvent(r.eventId);
      var status = 'Registered';
      if (r.present === true) { status = 'Attended'; }
      else if (e.date < today()) { status = 'Absent'; }

      var buttons = '<button onclick="showTicket(' + i + ')">Ticket and QR</button> ';
      if (r.present === false && e.date >= today()) {
        buttons += '<button class="red" onclick="cancelReg(' + i + ')">Cancel</button>';
      }
      if (r.present === true) {
        buttons += '<button onclick="showCertificate(' + i + ')">Certificate</button> ';
        if (r.rating === 0) {
          buttons += '<button class="main" onclick="showFeedbackForm(' + i + ')">Give feedback</button>';
        }
      }
      html += '<div class="card">' +
        '<span class="tag">' + status + '</span>' +
        '<h3>' + e.title + '</h3>' +
        '<p>' + e.date + ' at ' + e.time + '</p>' +
        '<p>Ticket: ' + r.ticket + '</p>';
      if (r.rating > 0) { html += '<p>Your rating: ' + r.rating + '/5</p>'; }
      html += '<p>' + buttons + '</p></div>';
    }
  }
  if (html === '') { html = '<p>You have not registered for any event yet.</p>'; }
  document.getElementById('myList').innerHTML = html;
}

function cancelReg(i) {
  if (confirm('Cancel this registration?') === true) {
    regs.splice(i, 1);
    saveData();
    showMyRegs();
  }
}

function showTicket(i) {
  var e = getEvent(regs[i].eventId);
  showPopup('<h3>Your ticket</h3><p>' + e.title + '<br>' + e.date + ' at ' + e.time + '</p>' +
    '<div id="qrBox"></div><p>' + regs[i].ticket + '</p>');
  if (typeof QRCode !== 'undefined') {       // check that the QR library loaded
    new QRCode(document.getElementById('qrBox'), regs[i].ticket);
  }
}

function showFeedbackForm(i) {
  showPopup('<h3>Feedback</h3><form onsubmit="return saveFeedback(' + i + ')">' +
    '<label for="fbRating">Rating (5 is best)</label>' +
    '<select id="fbRating"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select>' +
    '<label for="fbComment">Comment</label>' +
    '<textarea id="fbComment" rows="3"></textarea>' +
    '<button class="main" type="submit">Send</button></form>');
}
function saveFeedback(i) {
  regs[i].rating = Number(document.getElementById('fbRating').value);
  regs[i].comment = document.getElementById('fbComment').value;
  saveData();
  showMyRegs();
  return false;
}

function showCertificate(i) {
  var e = getEvent(regs[i].eventId);
  showPopup('<div class="certificate"><p>Certificate of Participation</p>' +
    '<h2>' + regs[i].name + '</h2><p>Reg. no. ' + regs[i].reg + '</p>' +
    '<p>attended</p><h3>' + e.title + '</h3><p>on ' + e.date + ' at ' + e.venue + '</p></div>' +
    '<p><button class="main noprint" onclick="window.print()">Print</button></p>');
}

// ---------- Attendees page (organizer) ----------
function showAttendees(id) {
  currentEvent = id;
  showPage('pageAttendees');
  var e = getEvent(id);
  var rows = '';
  var total = 0;
  var present = 0;
  for (var i = 0; i < regs.length; i++) {
    if (regs[i].eventId === id) {
      total++;
      var status = 'Not marked';
      var button = 'Mark present';
      if (regs[i].present === true) {
        present++;
        status = 'Present';
        button = 'Undo';
      }
      rows += '<tr><td>' + regs[i].name + '</td><td>' + regs[i].reg + '</td><td>' + regs[i].ticket + '</td><td>' + status +
        '</td><td><button onclick="togglePresent(' + i + ')">' + button + '</button></td></tr>';
    }
  }
  if (rows === '') { rows = '<tr><td colspan="5">No registrations yet.</td></tr>'; }
  document.getElementById('attTitle').innerHTML = e.title;
  document.getElementById('attInfo').innerHTML = total + ' of ' + e.capacity + ' seats booked, ' + present + ' present.';
  document.getElementById('attBody').innerHTML = rows;
}
function togglePresent(i) {        // manual attendance
  if (regs[i].present === true) {
    regs[i].present = false;
  } else {
    regs[i].present = true;
  }
  saveData();
  showAttendees(currentEvent);
}
function scanTicket() {            // attendance using the ticket code (from the QR code)
  var code = document.getElementById('scanCode').value.toUpperCase();
  var found = false;
  for (var i = 0; i < regs.length; i++) {
    if (regs[i].ticket === code && regs[i].eventId === currentEvent) {
      regs[i].present = true;
      found = true;
    }
  }
  if (found === false) { alert('Invalid ticket for this event.'); }
  document.getElementById('scanCode').value = '';
  saveData();
  showAttendees(currentEvent);
  return false;
}

// ---------- Reports page (organizer) ----------
function showReports() {
  showPage('pageReports');
  var rows = '';
  var totalRegs = 0;
  var totalPresent = 0;
  for (var i = 0; i < events.length; i++) {
    var count = 0;
    var present = 0;
    var ratingSum = 0;
    var ratingCount = 0;
    for (var j = 0; j < regs.length; j++) {
      if (regs[j].eventId === events[i].id) {
        count++;
        if (regs[j].present === true) { present++; }
        if (regs[j].rating > 0) {
          ratingSum += regs[j].rating;
          ratingCount++;
        }
      }
    }
    var percent = 0;
    if (count > 0) { percent = Math.round(present / count * 100); }
    var average = '-';
    if (ratingCount > 0) { average = (ratingSum / ratingCount).toFixed(1); }
    totalRegs += count;
    totalPresent += present;
    rows += '<tr><td>' + events[i].title + '</td><td>' + count + ' / ' + events[i].capacity + '</td><td>' + present +
      '</td><td>' + percent + '%</td><td>' + average + '</td></tr>';
  }
  document.getElementById('reportBody').innerHTML = rows;
  document.getElementById('reportTotals').innerHTML = 'Events: ' + events.length + ' | Registrations: ' + totalRegs + ' | Attended: ' + totalPresent;

  var feedback = '';
  for (var k = 0; k < regs.length; k++) {
    if (regs[k].rating > 0) {
      feedback += '<p><b>' + getEvent(regs[k].eventId).title + '</b>: ' + regs[k].rating + '/5. ' + regs[k].comment + '</p>';
    }
  }
  if (feedback === '') { feedback = '<p>No feedback yet.</p>'; }
  document.getElementById('feedbackList').innerHTML = feedback;
}

// ---------- Start ----------
loadData();
showApp();