window.addEventListener('load', function () {
  
    if (localStorage.FBIdToken) {
      // getUserCredentail(localStorage.AutenticatedUser, localStorage.pofile);
      getUserProfile(localStorage.pofile);
      //getTransactions(localStorage.pofile);
    } else if (localStorage.user) {
      // getUserCredentail(localStorage.user, localStorage.user);
      getUserProfile(localStorage.user);
      
    }
});
  
function getUserProfile(user) {
    const pofile = JSON.parse(user);
    console.log(pofile);
    const name = document.getElementById('user-name');
    const personaml_id = document.getElementById('user-personal-number');
    const date = document.getElementById('user-date');
    const amount = document.getElementById('user-amount');
    const address = document.getElementById('user-address');
    const telnumber = document.getElementById('user-telnumber');
    const sex = document.getElementById('user-sex');
    const dividend = document.getElementById('user-dividend');
  
  
    name.innerHTML = `${pofile.firstName} ${pofile.lastName}`;
    personaml_id.innerHTML = `${format('X XXXX XXXXX XX X', pofile.id)}`;
    date.innerHTML = `${dayjs(pofile.createdAt).format('D MMM YYYY')} `;
    amount.innerHTML = `${pofile.amount} บาท`;
    address.innerHTML = `${pofile.address}`;
    telnumber.innerHTML = `${format('XXX-XXX XXXX' , pofile.telNumber)}`;
    sex.innerHTML = `${pofile.sex}`;
    //dividend.innerHTML = `${pofile.dividend} บาท`;
    //return {user, name, pofile};
}
  
function format(mask, number) {
    var s = '' + number,
      r = '';
    for (var im = 0, is = 0; im < mask.length && is < s.length; im++) {
      r += mask.charAt(im) == 'X' ? s.charAt(is++) : mask.charAt(im);
    }
    return r;
}
function logout() {
    firebase.auth().signOut();
    localStorage.clear();
    window.location.href = '/index.html';
}
  
  //repassword
function rePassword() {
  if (confirm("ระบบจะออกจากระบบ หลังจากเปลี่ยนรหัสผ่านสำเสร็จ") == true) {
    document.getElementsByClassName('user-profile-coatianer')[0].classList.add('hide');
    document.getElementsByClassName('user-profile-coatianer')[0].classList.add('active');
    document.getElementsByClassName('list-menu')[0].classList.remove('hide');
    document.getElementsByClassName('list-menu')[0].classList.remove('active');
  } else {
    console.log("ไม่แก้ไข");
  }
} 
//ediProfile
function editProfile() {
  if (confirm("ระบบจะออกจากระบบ หลังจากแก้ไขข้อมูลสำเสร็จ") == true) {
    document.getElementsByClassName('user-profile-coatianer')[0].classList.add('hide');
    document.getElementsByClassName('user-profile-coatianer')[0].classList.add('active');
    document.getElementsByClassName('edit')[0].classList.remove('hide');
    document.getElementsByClassName('edit')[0].classList.remove('active');
    if(localStorage.user) {
      getUserValueTable(localStorage.user);
    }

  } else {
    console.log("ไม่แก้ไข");
  }
  
}  
function dropdown() {
    document.getElementById("myTransaction").classList.toggle("show");
}
  
  // Close the dropdown if the user clicks outside of it
window.onclick = function(e) {
    if (!e.target.matches('.dropdown')) {
    var myDropdown = document.getElementById("myTransaction");
      if (myDropdown.classList.contains('show')) {
        myDropdown.classList.remove('show');
      }
    }
}  
/*function getUserValueTable(user){
    const pofile = JSON.parse(user);
    let old_Password = document.getElementById('old_password').value = pofile.password;
    console.log(pofile.password);
    let new_Password = document.getElementById('new_password').value;
    return {old_Password, new_Password};
}*/
function submit(){
    let old_Password = document.getElementById('old_password').value;
    let new_Password = document.getElementById('new_password').value;
    let hashuserPass = 
    CryptoJS.SHA256(old_Password)
            .toString(CryptoJS.enc.hex);
    console.log(hashuserPass);
    let newPassHash =
    CryptoJS.SHA256(new_Password)
            .toString(CryptoJS.enc.hex);
    console.log(newPassHash);
    if (localStorage.user) {
      const pofile = JSON.parse(localStorage.user);
      console.log(pofile.password);
      console.log(old_Password);
      let id = pofile.id;
      let user = db.doc(`/users/${id}`);
      user
      .get()
      .then((data) => {
        if(data.exists){
          if(hashuserPass != pofile.password){
            console.log('รหัสผ่านเก่าไม่ถูกต้อง');
            alert('รหัสผ่านเก่าไม่ถูกต้อง');
          }
          else{
            console.log('yes!');
            console.log(data.id);
            user.update({
              password: newPassHash,
            })
            .then(() => {
              alert("yes!");
              localStorage.clear();
              return location.href = '/login.html';
            })
            
          }
          
        }
      })
      .then(() => {
        resetFields();
      })
      .catch((error) => {
        console.error("rePassword Profile ", error);
      })  
    }
    
}
function resetFields() {
    let old_Password = document.getElementById('old_password');
    let new_Password = document.getElementById('new_password');
  
    old_Password.value = '';
    new_Password.value = '';
}

function getUserValueTable() {
  if(localStorage.user) {
    const pofile = JSON.parse(localStorage.user);
    let personal_id  = pofile.id;
    let firstName = document.getElementById('first_name').defaultValue  = pofile.firstName;
    let lastName = document.getElementById('last_name').defaultValue = pofile.lastName;
    let defaulLastName = lastName;
    console.log(defaulLastName);
    let address = document.getElementById('address').defaultValue  = pofile.address;
    let telNumber = document.getElementById('telNumber').defaultValue  = pofile.telNumber;
    return {personal_id,lastName, defaulLastName};
  }
}
async function edited() {
  let userDetail =  getUserValueTable();
  console.log(userDetail.personal_id);
  console.log(userDetail.defaulLastName);
  //let personal_id = document.getElementById('personal_id').value ;
  let c_firstName = document.getElementById('first_name').value;
  let c_lastName = document.getElementById('last_name').value;
  let c_address = document.getElementById('address').value ;
  let c_telNumber = document.getElementById('telNumber').value ;
  //let defaultVal = userDetail.lastName.defaultValue;
  //let currentVal = lastName.value;
  //let cfirstName = firstName.value;
  db.doc(`/users/${userDetail.personal_id}`).get()
    .then((data) => {
      if(data.exists){
        //let id = data.id;
        //console.log(id);
        console.log(c_firstName);
        if (confirm("ยืนยันการแก้ไข ") == true) {
          db.doc(`/users/${data.id}`)
          .update({
            //id: personal_id,
            firstName: c_firstName,
            lastName: c_lastName,
            address: c_address,
            telNumber: c_telNumber
         })
         .then(() => {
            window.location.href = '/login.html';
         })
        } else {
          alert("ยกเลิก")
        }
        
        //}
      }
    })
    .then(() => {
      console.log("success!");
      
      
    })
    .catch((error) => {
      console.error("edited Profile ", error);
    })
}