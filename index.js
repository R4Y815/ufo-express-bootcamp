import express from 'express';
import methodOverride from 'method-override';
import { add, read, edit, write } from './jsonFileStorage.js';
import { checkNullEntry } from './validation.js';

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

app.get('/shapes', (request, response) => {
  read('data.json', (err, data) => {
    const uniqueShapes = new Set();
    data.sightings.forEach((sighting) => {
      if(sighting.shape !== undefined) {
        uniqueShapes.add(sighting.shape);
        console.log(uniqueShapes);
      }
    });
    response.render('shapeDirectory', { shapes: [...uniqueShapes]});
  });
});

app.get('/shapes/:shape', (request, response) => {
  const { shape } = request.params;
  const { sort } = request.query;
  read('data.json', (err, data) => {
    const sighting = data.sightings.filter((sighting) => sighting.shape === shape);
    /*     if (sort === 'asc') {
      sightings.sort(compareState);
    } else if (sort === 'dsc') {
      sightings.sort((s1,s2) => -1 * compareState(s1, s2));
    } */
    response.render('sightingsByShape', { sighting });
  })
});

app.get('/sighting/:index', (request, response) => {
  read('data.json', (_, data) => {
    const { index } = request.params;
    const content = { index: index, sighting: data.sightings[index] };
    // Return HTML to client, merging "index" template with supplied data.
    response.render('sighting', content);
  });
});

app.put('/sighting/:index', (request, response) => {
  const { index } = request.params;
  console.log('requested params = ', request.params);
  console.log('index =', index);
  const { editedContent } = request.body;
  console.log('request.body', request.body);
  console.log('editedContent =', editedContent);
  read('data.json', (err, data) => {
    /* Replace the data in the object at the given index */
    data.sightings[index] = request.body; /* var['key'][index] another way to access object array */
    write('data.json', data, (err) => {
      read('data.json', (err, data) => {
        const content = { index: index, sighting: data.sightings[index] };
        // Return HTML to client, merging "index" template with supplied data.
        response.render('sighting', content);
      });
    });
  });
});

app.get('/sighting', (request, response) => {
  response.render('newSighting');
});

app.post('/sighting', (request, response) => {
  /* console.log('request.body =', request.body); */
  const formSubmitted = request.body;
  const formData = JSON.parse(JSON.stringify(formSubmitted));
  console.log(formData);
  const checkResult = checkNullEntry(formData);
  console.log('checkResult =', checkResult);
  if (checkResult === 1) {
    add('data.json', 'sightings', request.body, (callBack) => {
      if (callBack) {
        read('data.json', (_, data) => {
          const latestIndex = data.sightings.length - 1;
          response.redirect(301, `http://localhost:${port}/sighting/${latestIndex}`);
        });
        return;
      }
      response.status(500).send('DB write error.');
    });
  } else if (checkResult === 2) {
    console.log(request.url);
    const prevRoute = request.url;
   /*  response.send('Please fill up all fields'); */
    response.redirect(301, `http://localhost:${port}${prevRoute}`);
  }

});

/* app.post('/sighting', (request, response) => {
  add('data.json', 'sightings', request.body, (callBack) => {
    if (callBack) {
      read('data.json', (_, data) => {
        const latestIndex = data.sightings.length - 1;
        response.redirect(301, `http://localhost:${port}/sighting/${latestIndex}`);
      });
      return;
    }
    response.status(500).send('DB write error.');
  });
}); */

app.get('/sighting/:index/edit', (request, response) => {
  /* Retrieve current recipe data and render it */
  read('data.json', (err, jsonData) => {
    const { index } = request.params;
    const content = { index: index, sighting: jsonData.sightings[index] };
    /* pass the sighting Index to the edit form for the PUT request URL */
    response.render('edit', content);
  });
});

app.delete('/sighting/:index', (request, response) => {
  /* Remove element from DB at given index */
  const { index } = request.params;
  read('data.json', (err, data) => {
    data.sightings.splice(index, 1);
    write('data.json', data, (err) => {
      response.redirect(301, `http://localhost:${port}/`);
    });
  });
});




app.listen(port, () => console.log('listening on Port:', port));
