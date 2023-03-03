function login(event) {
    event.preventDefault();
    let userEmail = document.getElementById('email_field').value;
    let userPass = document.getElementById('password_field').value;
    let hashuserPass = 
    CryptoJS.SHA256(userPass)
            .toString(CryptoJS.enc.hex);
    console.log(userPass);
    console.log(hashuserPass);
    const obj = { userEmail, userPass };
    let errors = {};
    let userId;
    let userCredential = {};
  
    errors = errorHandler(obj);
  
    if (!errors.valid) {
      let textError = '\n';
      for (const error in errors.errors) {
        textError += errors.errors[error] + '\n';
      }
      window.alert('Error : ' + textError);
      return;
    }
    if (isEmail(userEmail)) {
      firebase
        .auth()
        .signInWithEmailAndPassword(userEmail, userPass)
        .then((data) => {
          userId = data.user.uid;
          return data.user.getIdToken();
        })
        .then((token) => {
          localStorage.setItem('FBIdToken', token);
  
          return db.collection('users').where('email', '==', userEmail).get();
          // window.location.href = '/signup.html'; // แก้ภายหลัง
        })
        .then((data) => {
          userCredential = data.docs[0].data();
          userCredential.id = data.docs[0].id;
  
          localStorage.setItem(
            'AutenticatedUser',
            JSON.stringify(userCredential)
          );
          if (userCredential.role) {
            window.location.href = '/home.html';
          } else {
            window.location.href = '/404page.html';
          }
        })
        .catch((err) => {
          window.alert('Error: ' + err.message);
        });
    } 
    else {
      //ใหม่แบบมีบังคับเปลี่ยนรหัส
      if (isPersonalNumber(userEmail)) {
        let user = {};
        let newUser = {};
        
        const userData = db.collection('users');
        userData
          .doc(userEmail)
          .get()
          .then((doc) => {
            if (doc.exists) {
              console.log(doc.data().otp);
              const checkOTP = doc.data().otp;
              if(checkOTP){
                console.log(checkOTP);
                console.log(userPass);
                
                userData.where('otp', '==', userPass).get()
                .then((data) => {
                  if (data) {
                    newUser = data.docs[0].data();
                    newUser.id = data.docs[0].id;
                    console.log(newUser.id);
                    //alert('yes');
                    localStorage.setItem('newUser', JSON.stringify(newUser));
                    window.location.href = '/home.html';
                  }
                })
              }
              else{
                return userData.where('password', '==', hashuserPass).get();
              }
            } else {
              window.alert('รหัสผ่านไม่ถูกต้อง');
            }
          })
          .then((data) => {
            if (!data.empty) {
              // console.log(data.docs[0].data());
              user = data.docs[0].data();
              user.id = data.docs[0].id;
              console.log(data.docs[0].id);
              localStorage.setItem('user', JSON.stringify(user));
              window.location.href = '/home.html';
            } else {
              window.alert('รหัสผ่านไม่ถูกต้อง');
            }
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
  }
  
  function errorHandler(user) {
    let errors = {};
    if (user.userEmail.trim() === '') {
      errors.userEmail = 'กรุณากรอก Email';
    }
    if (user.userPass.trim() === '') {
      errors.password = 'กรุณากรอก รหัสผ่าน';
    }
  
    return {
      errors,
      valid: Object.keys(errors).length === 0 ? true : false
    };
  }
  
  const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else {
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
  