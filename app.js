const express = require('express');
const path = require('path');
const app = express();


app.set("view engine", "ejs");
app.use(express.json());
app.set("views", path.join(__dirname, "views"));

// Static Files
app.use(express.static('public'));

// Routes
app.use('/', require('./server/routes/exchange'))

// Handle 404
app.get('*', (req, res) => {
    res.status(404).render('404');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
})