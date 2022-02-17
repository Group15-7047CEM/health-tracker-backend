# Health Tracker app (Group 15 - 7047 CEM)

Group project.

## Deployment

- Set ENV to Heroku: `heroku config:set $(cat .env | sed '/^$/d; /#[[:print:]]*$/d')`