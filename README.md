# Academic Event Registration System

CSE326 Internet Programming, CA1 Project | Team A2O Solutions

**Live website:** https://aaradhy-singh.github.io/Academic-Event-Registration-System/

## Problem
Seminars, workshops and fests are often managed with manual registration and
attendance sheets. This website lets organisers publish events and lets students
register, attend and give feedback.

## Team
| Name | Registration No. | Contribution |
|------|------------------|--------------|
| Aaradhy Singh | 12611560 | (write what you did) |
| (Ansh Kashyap) | 12610944 | (write what they did) |
| (Om Baranwal) | 12612192 | (write what they did) |

## Features
- Organiser: create, edit and delete events with a seat limit
- Student: browse upcoming, recent and all events and register
- Seat limit: registration closes when the seats are full
- Attendee list for every event
- Attendance by ticket code (QR code) or by a manual button
- Reminder banner for events in the next 2 days
- Feedback (rating and comment) after attending
- Certificate of participation and a Registered / Attended / Absent status
- Reports: registrations, attendance %, average rating and feedback

## How to test
1. Open the website and sign in as a **Student** (any name, any 8-digit number).
2. Register for an event and open **My Registrations** to see the ticket and QR code.
3. Log out and sign in as an **Organizer**. Open the event's **Attendees** page
   and type the ticket code to mark the student present.
4. Log back in as the same student to give feedback and open the certificate.
5. As the organizer, open **Reports**.

## Technologies
HTML, CSS, JavaScript, browser localStorage, and the qrcodejs library for QR codes.

## Limitations
- Data is saved only in the browser being used, as the site has no backend server.
- The sign-in is a demo and is not secure.
- Reminders show on the page and are not sent by email or SMS.
- The QR code holds the ticket code. The organizer types or scans it into a box,
  and there is no camera scanning.
