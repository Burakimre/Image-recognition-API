module.exports = {
  'facebookAuth': {
    'clientID': '299246447726023',
    'clientSecret': 'd6fcb261b3630ebdae1151c7116f3fda',
    'callbackURL': 'https://limitless-castle-74181.herokuapp.com/auth/facebook/callback',
    'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
    'profileFields': ['id', 'emails', 'name']
  },
  'googleAuth': {
    'clientID': '693703991493-ai0425ap2ejgnknqjrilonei8aa54klb.apps.googleusercontent.com',
    'clientSecret': 'J2xHjaJ55mdR41GSHpP00Zb4',
    'callbackURL': 'https://limitless-castle-74181.herokuapp.com/auth/google/callback'
  }
}