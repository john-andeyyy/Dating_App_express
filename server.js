const express = require('express');
const app = express();
const PORT = 3000;
require('./Configuration/Database');

const cors = require("cors");
app.use(cors());


app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from Express backend!');
});

const AuthRoutes = require('./Routes/UserRoutes');
app.use('/user', AuthRoutes);
const Message = require('./Routes/Message');
app.use('/Msg', Message);
const Matching = require('./Routes/Matching');
app.use('/Matching', Matching);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
