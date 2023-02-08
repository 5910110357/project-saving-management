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
    dividend.innerHTML = `${pofile.dividend} บาท`;
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
    window.location.href = '/login.html';
}
  
  //repassword
function rePassword() {
    document.getElementsByClassName('user-profile-coatianer')[0].classList.add('hide');
    document.getElementsByClassName('user-profile-coatianer')[0].classList.add('active');
    document.getElementsByClassName('list-menu')[0].classList.remove('hide');
    document.getElementsByClassName('list-menu')[0].classList.remove('active');
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
    if (localStorage.user) {
      const pofile = JSON.parse(localStorage.user);
      console.log(pofile.password);
      console.log(old_Password);
      let id = pofile.id;
      db.doc(`/users/${id}`).get()
      .then((data) => {
        if(data.exists){
          if(old_Password != pofile.password){
            console.log('รหัสผ่านเก่าไม่ถูกต้อง');
            alert('รหัสผ่านเก่าไม่ถูกต้อง');
          }
          else {
            console.log('yes!');
            console.log(id);
            return  db.doc(`/users/${id}`).update({
              password: new_Password
            })
          }
        }
      })
      .then(() => {
        alert('เปลี่ยนรหัสผ่านสำเร็จ');
        resetFields();
      })  
    }
    
}
function resetFields() {
    let old_Password = document.getElementById('old_password');
    let new_Password = document.getElementById('new_password');
  
    old_Password.value = '';
    new_Password.value = '';
}