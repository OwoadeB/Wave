
const { name } = require('./constants');
const {validator} = require('./utils');
const express = require('express')

const app = express()
app.use(express.json())


const PORT = process.env.PORT || 5678;

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON payload passed.",
      status: "error",
      data: null,
    });
  }

  next();
});

app.get('/', (req, res) => {
  res.json(name);
})


app.post('/validate-rule' , (req,res) => {
  const body = req.body; 
  const {rule, data} = body;
  const bodyFields = ["rule","data"];
  const ruleFields = ["field","condition","condition_value"];
  const dataField = rule.field;
  const condition = rule.condition;
  const condition_value = rule.condition_value;

  if(!rule && !data ) {
    return res.status(400).json({
      message: "rule and data field are required.",
      status: "error",
      data: null
    })
  }

  for (const field of bodyFields) {
    if(!body[`${field}`]){
      return res.status(400).json({
        message: `${field} is required.`,
        status: "error",
        data: null
      })
    }

    if(field == "rule"){
      if(typeof body[`${field}`] !== "object"){
        return res.status(400).json({
          message: `${field} should be an object.`,
          status: "error",
          data: null
        })
      }
    }

    if(field == "data"){
      // an array is of type object.
      let dataTypes = ["object","string"]
      if(!dataTypes.includes(typeof body[`${field}`])){
        return res.status(400).json({
          message: `${field} should be an object or string.`,
          status: "error",
          data: null
        })
      }
    }
  }

  for (const field of ruleFields){
    if(!rule[`${field}`]){
      return res.status(400).json({
        message: `field ${field} is missing from rule.`,
        status: "error",
        data: null
      })
    }
  }

  // handle multilevel fields (e.g parent.child....)
  let value = data; 
  const fieldMap = dataField.split(".");
  try {
    for (const val of fieldMap) {
      value = value[val]
    }
  } catch (e) {
    value = undefined;
  } 


  if(!value && typeof data === "object"){
    return res.status(400).json({
      message: `field ${dataField} is missing from data.`,
      status: "error",
      data: null
    })
  }

  if(!validator(condition,condition_value,value)){
    return res.status(400).json({
      message: `field ${dataField} failed validation.`,
      status: "error",
      data: {
        validation: {
          error: true,
          field: dataField,
          field_value: value,
          condition,
          condition_value
        },
      },
    })
  }
  return res.status(200).json({
    message: `field ${dataField} succesfully validated.`,
    status: "success",
    data: {
      validation: {
        error: false,
        field: dataField,
        field_value: value,
        condition,
        condition_value
      }
    }
  })

})

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`)
});