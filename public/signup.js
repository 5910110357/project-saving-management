
function signup() {
    let userDetail = getUserValue();
    let errors = validation(userDetail);
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    //let telNumber = document.getElementById('tel_number').value;
    //let uid = firebase.auth().currentUser.uid;
    //let userId;
    //let token;
    if (!errors.valid) {
      let textError = '\n';
      for (const error in errors.errors) {
        textError += errors.errors[error] + '\n';
      }
      window.alert('Error : ' + textError);
      return;
    }
    db.doc(`users/${userDetail.personal_id}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          window.alert('Error : รหัสบัตร มีการเรียกใช้มาก่อน');
        }
        return;
      })
      .then(() => {
        const userCredentials = {
          firstName: userDetail.firstName,
          lastName: userDetail.lastName,
          sex: userDetail.sex,
          address: userDetail.address,
          telNumber: userDetail.telNumber,
          role: 'member',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          amount: 0 * 1,
          amountDeposit: userDetail.amountDeposit,
          email: userDetail.email,
          password: userDetail.password,
          userId:firebase.auth().currentUser.uid,
          dividend: 0 * 1
        };
  
        return db.doc(`/users/${userDetail.personal_id}`).set(userCredentials);
      })
      .then(() => {
        return db.doc(`/users/${userDetail.personal_id}`).get();
      })
      .then((token) => {
        localStorage.setItem('user', JSON.stringify(token));
        window.alert('ลงทะเบียนเรียบร้อย');
        window.location.href = '/home.html';
      })
      firebase.auth().createUserWithEmailAndPassword(email, password)
      .catch((err) => {
        window.alert('Error : ' + err.message);
      });
    console.log(userDetail);
  }
  const isEmpty = (string) => {
    if (string.trim() === '') {
      return true;
    } else {
      return false;
    }
  };
  const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else { 
      return false;
    }
  };
  
  const isTelNumber = (number) => {
    const regEx = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    if (number.match(regEx)) return true;
    else {
      return false;
    }
  };
  
  const isNumber = (number) => {
    const regEx = /^\d+$/;
    if (number.match(regEx) && number * 1 >= 100) {
      return true;
    } else {
      return false;
    }
  };
  
  const isPersonalNumber = (number) => {
    // let digit = number *1
  
    if (number.length > 13) {
      return false;
    }
    let sum = 0,
      j = 0,
      check,
      lastDigit;
  
    for (let i = 13; i >= 2; i--) {
      sum += number[j] * 1 * i;
      j++;
    }
    if (!sum) {
      return false;
    }
  
    check = 11 - (sum % 11);
    lastDigit = check + '';
  
    if (lastDigit[lastDigit.length - 1] === number[number.length - 1]) {
      return true;
    }
    return false;
  };
  
  function getUserValue() {
    let personal_id = document.getElementById('personal_id').value;
    let firstName = document.getElementById('first_name').value;
    let lastName = document.getElementById('last_name').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let sex = document.getElementById('sex').value;
    let address = document.getElementById('address').value;
    let telNumber = document.getElementById('tel_number').value;
    //let amount = document.getElementById('amount').value;
    let amountDeposit = document.getElementById('amountDeposit').value;
  
    return {
      personal_id,
      firstName,
      lastName,
      email,
      password,
      sex,
      address,
      telNumber,
      //amount,
      amountDeposit
    };
  }
  
  
  
  function validation(user) {
    let errors = {};
    if (
      isEmpty(user.personal_id) ||
      isEmpty(user.firstName) ||
      isEmpty(user.lastName) ||
      //isEmpty(user.email) ||
      isEmpty(user.password) ||
      isEmpty(user.sex) ||
      isEmpty(user.address) ||
      isEmpty(user.telNumber) ||
      isEmpty(user.amountDeposit)
    ) {
      errors.field = 'กรุณากรอกข้อมูล ให้ครบถ้วน';
    } else if (!isPersonalNumber(user.personal_id)) {
      errors.id = 'หมายเลขบัตรประชาชนไม่ถูกต้อง ไม่ถูกต้อง';
    } else if (!isTelNumber(user.telNumber)) {
      errors.tel = 'หมายเลขโทรศัพท์ ไม่ถูกต้อง';
    } else if (!isNumber(user.amountDeposit)) {
      errors.amountDeposit = 'จำนวนเงินฝากไม่ถูกต้อง';
    }
  
    return {
      errors,
      valid: Object.keys(errors).length === 0 ? true : false
    };
  }
  