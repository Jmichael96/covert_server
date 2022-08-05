const { isEmpty } = require("jvh-is-empty");

const emailIsValid = (email) => {
  if (
    email
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  ) {
    return true;
  }
  return false;
};

const validatePhone = (phone) => {
  // acceptable criteria
  /* 
  - XXX-XXX-XXXX
  - XXX.XXX.XXXX
  - XXX XXX XXXX  
  - XXXXXXXXXX
  */
  if (phone.match(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)) {
    return true;
  }
  return false;
};

const isValidPassword = (password) => {
  let isValid = true;
  let validationIteration = {
    1: password.length >= 6, // 6 or more characters
    2: /[a-z]/.test(password), // at least one lower case
    3: /[0-9]/.test(password), // at least one number
    4: /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password), // at least one special character
    5: /[A-Z]/.test(password), // at least one uppercase
  };
  for (let val in validationIteration) {
    if (!validationIteration[val]) {
      isValid = false;
      break;
    }
  }
  return isValid;
};

module.exports = {
  validateUser: async (req, res, next) => {
    const { name, email, password, phone } = req.body;
    if (
      !isEmpty(name) &&
      !isEmpty(email) &&
      !isEmpty(password) &&
      !isEmpty(phone)
    ) {
      if (!isValidPassword(password)) {
        return res.status(406).json({
          message: 'Your password does not meet the requirements'
        });
      }
      // if no required fields are empty then make sure email & phone are valid
      if (emailIsValid(email) && validatePhone(phone)) {
        next();
      } else {
        return res.status(406).json({
          message:
            "Please validate that your email or phone number are in the correct format",
        });
      }
    } else {
      return res.status(406).json({
        message:
          "Please validate that all required fields are included in the request body",
      });
    }
  }
};
