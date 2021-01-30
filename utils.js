const validator = (condition,condition_value,value) => {
  condition.toLowerCase();
  switch(condition){
    case "eq":
      return condition_value === value;
    case "neq":
      return condition_value !== value;
    case "gt":
      return condition_value < value;
    case "gte":
      return value >= condition_value;
    case "contains":
      if(typeof condition_value !== "string") return  false;
      return value.includes(condition_value);
    default : return false
  }
}

module.exports = {validator};