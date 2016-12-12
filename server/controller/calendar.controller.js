var app = require('../server.js');
// var db = app.get('db');

var event = {
  'summary': 'Google I/O 2015',
  'location': '800 Howard St., San Francisco, CA 94103',
  'description': 'A chance to hear more about Google\'s developer products.',
  'start': {
    'dateTime': '2015-05-28T09:00:00-07:00',
    'timeZone': 'America/Los_Angeles',
  },
  'end': {
    'dateTime': '2015-05-28T17:00:00-07:00',
    'timeZone': 'America/Los_Angeles',
  },
  'recurrence': [
    'RRULE:FREQ=DAILY;COUNT=2'
  ],
  'attendees': [
    {'email': 'lpage@example.com'},
    {'email': 'sbrin@example.com'},
  ],
  'reminders': {
    'useDefault': false,
    'overrides': [
      {'method': 'email', 'minutes': 24 * 60},
      {'method': 'popup', 'minutes': 10},
    ],
  },
};

module.exports = {

    // auth: function(req, res) {
    //     db.find_By_Id([req.session.passport.user.google_id], function(err, user) {
    //         if (err) {
    //             res.status(400).json(err);
    //         } else if (user[0]) {  
    //             res.status(200).json(user[0]);
    //         } else if (user) {
    //             res.status(200).json(user);
    //         }
    //     });
    //     console.log(res);
    // },


    createEvent: function(req, res, next) {
        calendar.events.insert({
            auth: auth,
            calendarId: 'primary',
            resource: event,
        }, function(err, event) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return;
            }
        console.log('Event created: %s', event.htmlLink);
        });
    }
};