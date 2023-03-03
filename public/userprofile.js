window.addEventListener('load', function () {
  const name = document.getElementsByClassName('profile-username');
  const email = document.getElementsByClassName('profile-email');
  const amount = document.getElementsByClassName('detail-amount');
  const userTotal = document.getElementsByClassName('detail-amount-user');

  //setUserDetail(name, email, amount, userTotal);
  //initailUserTransaction();

  if (localStorage.FBIdToken) {
    // getUserCredentail(localStorage.AutenticatedUser, localStorage.pofile);
    getUserProfile(localStorage.pofile);
    getTransactions(localStorage.pofile);
  } else if (localStorage.user) {
    // getUserCredentail(localStorage.user, localStorage.user);
    getUserProfile(localStorage.user);
    getTransactions(localStorage.user);
    //rePassword(localStorage.user);
  }
});
function random() {
  //generates random id;
  let guid = () => {
  let s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
  }
  //return id of format 'aaaaaaaa'
  let result = s4() + s4();
  return result;
}

console.log(guid());
let password =  guid() ;
return {password};
};
function rePassword(pofile) {
  let randomPassword = random();
  console.log(pofile.id);
  db.doc(`/users/${pofile.id}`).get()
    .then((data) => {
      if(data.exists){
        if (confirm("ยืนยันการรีเซ็ตรหัสผ่านของสมาชิก ") == true) {
          db.doc(`/users/${data.id}`)
          .update({
            otp: randomPassword.password,
            password: ''
         })
         .then(() => {
          window.alert(`รีเซ็ตรหัสผ่านเรียบร้อย   กรุณาแจ้งรหัสผ่านแก่สมาชิก รหัส (${randomPassword.password})`);
            window.location.href = '/member.html';
         })
        } else {
          alert("ยกเลิก")
        }
      }
    })
    .then(() => {
      console.log("success!");
      
      
    })
    .catch((error) => {
      console.error("reset password Profile ", error);
    })
}
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
  document.getElementById('repassword').onclick
      = function() {rePassword(pofile)};
  
}

function format(mask, number) {
  var s = '' + number,
    r = '';
  for (var im = 0, is = 0; im < mask.length && is < s.length; im++) {
    r += mask.charAt(im) == 'X' ? s.charAt(is++) : mask.charAt(im);
  }
  return r;
}

function getTransactions(user) {
  const userProfile = JSON.parse(user);
  const transactions = db.collection('transactions');
  let transactionsDate = [];

  transactions
    .where('personalId', '==', userProfile.id)
    .get()
    .then((data) => {
      dayjs.locale('en');
      // console.log(data.docs[0].data());
      data.docs.forEach((doc) => {
        transactionsDate.push({
          id: doc.id,
          date: dayjs(doc.data().date).format('MMM'),
          type: doc.data().type,
          amount: doc.data().amount
        });
      });

      return;
    })
    .then(() => {
      // console.log(transactionsDate);
      //checkPayment(transactionsDate);
    })
    .catch((err) => {
      console.error(err);
    });
}

/*function checkPayment(transaction) {
  const monthVisible = document.getElementsByClassName('month');
  const months = dayjs(new Date().toISOString()).format('M') * 1;
  console.log(months);
  dayjs.locale('en');

  return new Promise((resolve, reject) => {
    if (transaction.length > 0) {
      console.log(transaction);
      for (let i = 1; i <= 12; i++) {
        //ลูปแรก วน 12 ครั้งเพื่อ check ว่ามีการทำ transaction มั้ย
        if (transaction[i - 1]) {
          for (let month = 1; month <= months; month++) {
            // ลูป วน 12 ครั้ง เพื่อ check transaction แต่ละอันว่า เป็นของเดือนไหน

            // console.log(getMonthFormat(month), transaction[i - 1].date);
            if (transaction[i - 1].date === getMonthFormat(month)) {
              console.log(transaction[i - 1].date, getMonthFormat(month));
              setDocumentPaymentMonth(transaction[i - 1].date);
              break;
            }
          }
        }
      }
      for (let i = 1; i <= months; i++) {
        monthVisible[i - 1].classList.remove('month-hide');
      }

      resolve();
    } else {
      for (let i = 1; i <= months; i++) {
        console.log(`${i}`);
        setDocumentNotPaymentMonth(getMonthFormat(i));
      }
      for (let i = 1; i <= months; i++) {
        monthVisible[i - 1].classList.remove('month-hide');
      }
      reject(new Error('ค้างชำระ'));
    }
  });
}

function getMonthFormat(month) {
  dayjs.locale('en');
  return dayjs(
    `${new Date().getFullYear()}-${month + ''.length > 1 ? month : '0' + month}`
  ).format('MMM');
}*/

function logout() {
  firebase.auth().signOut();
  localStorage.clear();
  window.location.href = '/index.html';
}

//Dropdown
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
function dropdownReport() {
  document.getElementById("myReport").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(e) {
  if (!e.target.matches('.dropdown_report')) {
  var myDropdownReport = document.getElementById("myReport");
    if (myDropdownReport.classList.contains('show')) {
      myDropdownReport.classList.remove('show');
    }
  }
}

