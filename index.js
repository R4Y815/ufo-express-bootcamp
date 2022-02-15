import express from 'express';
import methodOverride from 'method-override';
import { add, read } from './jsonFileStorage.js';

const app = express();
const port = 3050;

/* Override POST requests with query param ?_method=PUT to be PUT requests */
app.use(methodOverride('_method'));

app.use(express.urlencoded({ extended: false }));

/* tells express how to serve static files and from 'public folder' */
app.use(express.static('public'));
// Set view engine
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  read('data.json', (err, data) => {
    /* create variable to accessible object array in data.json file */
    const sighting = data.sightings;
    /* return html to client, displaying summarised sightings with info from the saved data array */
    response.render('home', { sighting });
  });
});

app.get('/sighting/:index', (request, response) => {
  read('data.json', (_, data) => {
    const { index } = request.params;
    const content = { index, sighting: data.sightings[index] }; /* what is this? object? array? */
    // Return HTML to client, merging "index" template with supplied data.
    response.render('sighting', content);
  });
});

app.get('/sightingNeo/:index', (request, response) => {
  read('data.json', (_, data) => {
    const { index } = request.params;
    console.log(index);
    const content = data.sightings;
    /* pass the sighting Index to the edit form for the PUT request URL */
    console.log(content);

    response.render('sightingNeo', { content });
  });
});
app.get('sighting/:index/edit', (request, response) => {
  /* Retrieve current recipe data and render it */
  read('data.json', (err, jsonData) => {
    const { index } = request.params;
    const sighting = jsonData.sightings[index];
    /* pass the sighting Index to the edit form for the PUT request URL */
    sighting.index = index;
    const ejsData = { sighting };
    response.render('edit', ejsData);
  });
});

app.get('/sighting', (request, response) => {
  response.render('newSighting');
});

app.post('/sighting', (request, response) => {
  add('data.json', 'sightings', request.body, (callBack) => {
    if (callBack) {
    /* redirect to newly created sighting entry with proper status code? */
    /* try to reverse this and see if it works */
      read('data.json', (_, data) => {
        const latestIndex = data.sightings.length - 1;
        response.redirect(301, `http://localhost:${port}/sighting/${latestIndex}`);
      });
      return;
    }
    response.status(500).send('DB write error.');
  });
});

app.listen(port, () => console.log('listening on Port:', port));
