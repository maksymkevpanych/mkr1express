const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');

const app = express();
const PORT = 3000;


mongoose.connect('mongodb://localhost/triangleCalculator', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static('public'));

const RequestSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  inputData: {
    type: Object,
    required: true,
  },
  result: {
    type: Number,
    required: true,
  },
});

const Request = mongoose.model('Request', RequestSchema);


app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


app.use(express.json());


function validateInput(req, res, next) {
  const schema = Joi.object({
    x1: Joi.number().required(),
    y1: Joi.number().required(),
    x2: Joi.number().required(),
    y2: Joi.number().required(),
    x3: Joi.number().required(),
    y3: Joi.number().required(),
    n: Joi.number().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  next();
}


app.post('/calculatePerimeter', validateInput, (req, res) => {
  const { x1, y1, x2, y2, x3, y3 } = req.body;

  const side1 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const side2 = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2));
  const side3 = Math.sqrt(Math.pow(x1 - x3, 2) + Math.pow(y1 - y3, 2));

  const perimeter = side1 + side2 + side3;

  
  const request = new Request({
    inputData: req.body,
    result: perimeter,
  });
  request.save();

  res.json({ perimeter });
});

app.get('/results', async (req, res) => {
    try {
      const requests = await Request.find({});
      res.json(requests);
    } catch (error) {
      console.error('Error fetching results:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
app.post('/calculateExpression', validateInput, (req, res) => {
    const { n } = req.body;
  
    let sum1 = 0;
    let sum2 = 0;
  
   
    for (let i = 1; i <= n; i++) {
      sum1 += Math.pow(2 * i, 2);
    }
  
    
    for (let i = 1; i <= n; i++) {
      sum2 += Math.pow((2 * i) + 1, 3);
    }
  
    const result = sum1 + sum2;
  
    
    const request = new Request({
      inputData: req.body,
      result: result,
    });
    request.save();
  
    res.json({ result });
  });
  


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
