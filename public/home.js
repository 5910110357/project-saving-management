window.addEventListener('load', async function () {
  const name = document.getElementsByClassName('profile-username');
  const email = document.getElementsByClassName('profile-email');
  const amountTotal = document.getElementsByClassName('detail-amount'); //งบประมาณทั้งหมด
  const amountuser = document.getElementsByClassName('detail-amount-user'); //ยอดเงินของคุณ
  const amountMonth = document.getElementsByClassName('detail-amount-month'); //ยอดเงินเดือน
  const amountYear = document.getElementsByClassName('detail-amount-year'); //ยอดเงินปี

  const elements = document.getElementsByClassName('list-menu-img-admin');
  const userMenu = document.getElementsByClassName('list-menu-img-user');
  const changePassword = document.getElementsByClassName('chang_password_new');
  const adminTotalLabel = document.getElementsByClassName('detail-title-title'); //เมนูยอดเงิน แอดมิน
  const userTotalLabel = document.getElementsByClassName('detail-title-user'); //เมนูยอดเงินของคุณ
  const TableBudgets = document.getElementsByClassName('profile-history'); //ตารางงบประมาณ
  const TableUser = document.getElementsByClassName('Profile-User'); //โปรไฟล์user

  if (!localStorage.user && !localStorage.FBIdToken && !localStorage.newUser) {
    window.location.href = './home.html';
    //window.alert('ท่านไม่ใช่เจ้าหน้าที่');
  }
  //user
  if (localStorage.user && !localStorage.budgets) {
    //const userDetail = JSON.parse(localStorage.user);
    TableBudgets[0].classList.add('non-active');
    //NewUser[0].classList.add('non-active');
    changePassword[0].classList.add('non-active');
    getUserProfile(localStorage.user);
    visibleItems(userMenu, 'list-menu-img-user', 'list-menu-img-user-active');
  } else if (localStorage.user && localStorage.budgets) {
    const userDetail = JSON.parse(localStorage.user);
    const budgets = JSON.parse(localStorage.budgets);
    //amountuser[0].innerHTML = `${userDetail.amount} บาท`;
    //userTotalLabel[0].classList.add('active');
    TableBudgets[0].classList.add('non-active');
    changePassword[0].classList.add('non-active');
    getUserProfile(localStorage.user);
    visibleItems(userMenu, 'list-menu-img-user', 'list-menu-img-user-active');
  }
 
  //แอดมิน
  
  if (localStorage.FBIdToken && !localStorage.budgets) {
    const userCreadentail = JSON.parse(localStorage.AutenticatedUser);
    // const decodedToken = parseJwt(token);
    let budgets = {};
    TableUser[0].classList.add('non-active')
    changePassword[0].classList.add('non-active');
    //getBudgetsTotal(name, email, amountTotal, amountMonth, amountYear, userCreadentail);
    //visibleItems(userMenu, 'list-menu-img-user', 'list-menu-img-user-active');
    visibleItems(elements, 'list-menu-img-admin', 'list-menu-img-admin-active');
  } else if (localStorage.FBIdToken && localStorage.budgets) {
    let date = new Date();
    let year = date.getFullYear();
    //console.log(year);
    const userDetail = JSON.parse(localStorage.AutenticatedUser);
    const budgets = JSON.parse(localStorage.budgets);

    name[0].innerHTML = `${userDetail.firstName} ${
      userDetail.lastName ? userDetail.lastName : ''
    }`;
    email[0].innerHTML = `${userDetail.email ? userDetail.email : ''} `;
    //amountTotal[0].innerHTML = `${budgets.year} บาท`;
    TableUser[0].classList.add('non-active')
    changePassword[0].classList.add('non-active');
    //userTotalLabel[0].classList.remove('active');
    //visibleItems(userMenu, 'list-menu-img-user', 'list-menu-img-user-active');
    visibleItems(elements, 'list-menu-img-admin', 'list-menu-img-admin-active');
  
  }
  //new user
  if (localStorage.newUser && !localStorage.budgets) {
    //const userDetail = JSON.parse(localStorage.user);
    TableBudgets[0].classList.add('non-active');
    //TableUser[0].classList.add('non-active')
    getUserProfile(localStorage.newUser);
    visibleItems(changePassword, 'chang_password_new', 'chang_password_new-active');
  } else if (localStorage.newUser && localStorage.budgets) {
    const userDetail = JSON.parse(localStorage.user);
    const budgets = JSON.parse(localStorage.budgets);
    //amountuser[0].innerHTML = `${userDetail.amount} บาท`;
    //userTotalLabel[0].classList.add('active');
    TableBudgets[0].classList.add('non-active');
    //TableUser[0].classList.add('non-active')
    getUserProfile(localStorage.newUser);
    visibleItems(changePassword, 'chang_password_new', 'chang_password_new-active');
  }

  
  await getMonthlyBudgetDeposit() // เงินรวมยอดรายเดือนฝาก
  await getMonthlyBudgetWithdraw() //เงินรวมยอดรายเดือนถอน
  await getMonthlyBudgetBorrow() //เงินรวมยอดรายเดือนกู้
  await getMonthlyBudgetBorrowPay() //เงินรวมยอดรายเดือนชำระเงินกู้
  //await getYearsBudget()  //เงินรวมยอดรายปี
  await getTotalBudget() //ยอดเงินรวมทั้งหมด
});

function getBudgetsUsers(name, email,  amountuser, userDetail) {
  let budgets = {};
  db.collection('budgets')
    .get()
    .then((data) => {
      // console.log();
      name[0].innerHTML = `${userDetail.firstName} ${
        userDetail.lastName ? userDetail.lastName : ''
      }`;
      email[0].innerHTML = `${userDetail.email ? userDetail.email : ''} `;
      //amount[0].innerHTML = `${data.docs[0].data().total} บาท`;

      if (amountuser) {
        amountuser[0].innerHTML = `${userDetail.amount} บาท`;
      }

      budgets = data.docs[0].data();
      budgets.id = data.id;

      localStorage.setItem('budgets', JSON.stringify(budgets));
    });
}

function getBudgetsTotal(name, email, amountTotal, amountMonth, amountYear, userDetail) {
  let budgets = {};
  db.collection('budgets')
    .get()
    .then((data) => {
      // console.log();
      name[0].innerHTML = `${userDetail.firstName} ${
        userDetail.lastName ? userDetail.lastName : ''
      }`;
      email[0].innerHTML = `${userDetail.email ? userDetail.email : ''} `;
      amountTotal[0].innerHTML = `${data.docs[0].data().total} บาท`;

      /*if (userTotal) {
        userTotal[0].innerHTML = `${userDetail.amount} บาท`;
      } */

      budgets = data.docs[0].data();
      budgets.id = data.id;

      localStorage.setItem('budgets', JSON.stringify(budgets));
    });
}

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}

function logout() {
  firebase.auth().signOut();
  localStorage.clear();
  window.location.href = '/login.html';
}

function hiddenItems(items) {
  for (const item of items) {
    item.classList.add('list-menu-user-hidden');
  }
}

function visibleItems(items, isClassName, className) {
  for (const item of items) {
    if (item.classList.contains(isClassName)) {
      item.classList.add(className);
    }
  }
}

function listMemberPage() {
  if (localStorage.user) {
    window.location.href = '/userProfile.html';
  } else if (localStorage.FBIdToken) {
    window.location.href = '/member.html';
  }
}


async function getMonthlyBudgetDeposit() {
  const [startOfMonthDate, endOfMonthDate] =  getDate()

  try {
    const collections 
    = await  db.collection('transactions')
               .where("type", "==", "deposited")
               .where("date", ">=", startOfMonthDate )
               .where("date", "<=", endOfMonthDate )
               .get()
    let sum = 0
    const amountMonth = document.getElementsByClassName('detail-amount-month-deposit'); //ยอดเงินเดือน
    for(const collection of collections.docs) {
      sum += collection.data().amount * 1
      console.log(collection.data().date.split("T")[0]);
      console.log(sum);
    }
    amountMonth[0].innerHTML  = sum 
    //console.log("transactions", collections.docs[0].data());
  } 
  
  catch (error) {
    console.log(error);
  }
}
async function getMonthlyBudgetWithdraw() {
  const [startOfMonthDate, endOfMonthDate] =  getDate()

  try {
    const collections 
    = await  db.collection('transactions')
               .where("type", "==", "withdrawn")
               .where("date", ">=", startOfMonthDate )
               .where("date", "<=", endOfMonthDate )
               .get()
    let sum = 0
    const amountMonth = document.getElementsByClassName('detail-amount-month-withdraw'); //ยอดเงินเดือนถอน
    for(const collection of collections.docs) {
      sum += collection.data().amount_withdraw * 1
      //console.log(collection.data().date.split("T")[0]);
      //console.log(sum);
    }
    amountMonth[0].innerHTML  = sum 
    //console.log("transactions", collection.docs[0].data());
  } 
  
  catch (error) {
    console.log(error);
  }
}
async function getMonthlyBudgetBorrow() {
  const [startOfMonthDate, endOfMonthDate] =  getDate()

  try {
    const collections 
    = await  db.collection('transactions')
               .where("type", "==", "borrow")
               .where("date", ">=", startOfMonthDate )
               .where("date", "<=", endOfMonthDate )
               .get()
    let sum = 0
    const amountMonth = document.getElementsByClassName('detail-amount-month-borrow'); //ยอดเงินเดือน
    for(const collection of collections.docs) {
      sum += collection.data().amount * 1
      //console.log(collection.data().date.split("T")[0]);
      //console.log(sum);
    }
    amountMonth[0].innerHTML  = sum 
    //console.log("transactions", collections.docs[0].data());
  } 
  
  catch (error) {
    console.log(error);
  }
}
async function getMonthlyBudgetBorrowPay() {
  const [startOfMonthDate, endOfMonthDate] =  getDate()

  try {
    const collections 
    = await  db.collection('transactions')
               .where("type", "==", "borrow_pay")
               .where("date", ">=", startOfMonthDate )
               .where("date", "<=", endOfMonthDate )
               .get()
    let sum = 0
    const amountMonth = document.getElementsByClassName('detail-amount-month-borrwpay'); //ยอดเงินเดือน
    for(const collection of collections.docs) {
      sum += collection.data().amount * 1
      //console.log(collection.data().date.split("T")[0]);
      //console.log(sum);
    }
    amountMonth[0].innerHTML  = sum 
    //console.log("transactions", collections.docs[0].data());
  } 
  
  catch (error) {
    console.log(error);
  }
}
function getDate() {

  // Get moth and years
  const dateString = new Date().toLocaleString("en-AU", { timeZone: "Asia/Bangkok" });

  const [day,month , year] = dateString.trim().split(",")[0].split("/")

  const totalDays =  new Date(year, month, 0).getDate()
  
  //console.log(month);

  return [`${year}-${month}-01`, `${year}-${month}-${totalDays}`]

}

async function getYearsBudget() {
  const amountYear = document.getElementsByClassName('detail-amount-year'); //ยอดเงินปี

  let date = new Date();
  let year = date.getFullYear();
  //let year = 2019
  try {
    const collections = await db.doc(`/budgets/${year}`).get();
    let sum = collections.data().total * 1;
    console.log(year);
    
      //console.log(collection.data().date.split("T")[0]);
      console.log(sum);
    
    amountYear[0].innerHTML  = sum
    //console.log("transactions", collection.docs[0].data());
  } 
  catch (error) {
    console.log(error);
  }

}

async function getTotalBudget() {
  const amountTotal = document.getElementsByClassName('detail-amount'); //ยอดเงินรวมทั้งหมด

  try {
    const collections = await  db.collection('budgets').get()
    let sum = 0

    for(const collection of collections.docs) {
      sum += collection.data().total * 1
      //console.log(sum);
    }
    amountTotal[0].innerHTML  = sum 
  } 
  catch (error) {
    console.log(error);
  }

}

//home users
function getUserProfile(user) {
  const pofile = JSON.parse(user);
  const name = document.getElementById('user-name');
  const personaml_id = document.getElementById('user-personal-number');
  const date = document.getElementById('user-date');
  const amount = document.getElementById('user-amount');
  const address = document.getElementById('user-address');
  const telnumber = document.getElementById('user-telnumber');
  const sex = document.getElementById('user-sex');
  //const dividend = document.getElementById('user-dividend');


  name.innerHTML = `${pofile.firstName} ${pofile.lastName}`;
  personaml_id.innerHTML = `${format('X XXXX XXXXX XX X', pofile.id)}`;
  date.innerHTML = `${dayjs(pofile.createdAt).format('D MMM YYYY')} `;
  amount.innerHTML = `${pofile.amount} บาท`;
  address.innerHTML = `${pofile.address}`;
  telnumber.innerHTML = `${format('XXX-XXX XXXX' , pofile.telNumber)}`;
  sex.innerHTML = `${pofile.sex}`;
  //dividend.innerHTML = `${pofile.dividend} บาท`;
}

function format(mask, number) {
  var s = '' + number,
    r = '';
  for (var im = 0, is = 0; im < mask.length && is < s.length; im++) {
    r += mask.charAt(im) == 'X' ? s.charAt(is++) : mask.charAt(im);
  }
  return r;
}
function rePassword(){
  let old_Password = document.getElementById('old_password').value;
  let new_Password = document.getElementById('new_password').value;
  
  console.log(old_Password);
    if (localStorage.newUser) {
      const pofile = JSON.parse(localStorage.newUser);
      console.log(pofile.password);
      console.log(pofile.otp);
      let id = pofile.id;
      console.log(id);
      let hashPassword = 
      CryptoJS.SHA256(new_Password)
              .toString(CryptoJS.enc.hex);
      db.doc(`/users/${id}`).get()
      .then((data) => {
        if(data.exists){
          if(old_Password != pofile.otp){
            console.log('รหัสผ่านเก่าไม่ถูกต้อง');
            alert('รหัสผ่านเก่าไม่ถูกต้อง');
          }
          else {
            
            console.log('yes!');
            console.log(id);
            return  db.doc(`/users/${id}`).update({
              password: hashPassword,
              otp: ''
            })
          }
        }
      })
      .then(() => {
        alert('เปลี่ยนรหัสผ่านสำเร็จ');
        resetFields();
      })
      .then(() => {
        var hash = CryptoJS.SHA256(new_Password).toString(CryptoJS.enc.hex);
        console.log(new_Password);
        console.log(hash);
        console.log(hashPassword);
        return db.collection('users').where('password', '==', hashPassword).get();
      })
      .then((data) => {
        if (!data.empty) {
          // console.log(data.docs[0].data());
          user = data.docs[0].data();
          user.id = data.docs[0].id;
          console.log(data.docs[0].id);
          localStorage.setItem('user', JSON.stringify(user));
          window.location.href = '/home.html';
        }
      })
    }
    
}
function resetFields() {
    let old_Password = document.getElementById('old_password');
    let new_Password = document.getElementById('new_password');
  
    old_Password.value = '';
    new_Password.value = '';
}

