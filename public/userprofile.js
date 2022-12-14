window.addEventListener('load', function () {
  const name = document.getElementsByClassName('profile-username');
  const email = document.getElementsByClassName('profile-email');
  const amount = document.getElementsByClassName('detail-amount');
  const userTotal = document.getElementsByClassName('detail-amount-user');

  //setUserDetail(name, email, amount, userTotal);
  initailUserTransaction();

  if (localStorage.FBIdToken) {
    // getUserCredentail(localStorage.AutenticatedUser, localStorage.pofile);
    getUserProfile(localStorage.pofile);
    getTransactions(localStorage.pofile);
  } else if (localStorage.user) {
    // getUserCredentail(localStorage.user, localStorage.user);
    getUserProfile(localStorage.user);
    getTransactions(localStorage.user);
  }
});

/*function setUserDetail(name, email, amount, userTotal) {
  const userTotalLabel = document.getElementsByClassName('detail-title-user');
  if (!localStorage.FBIdToken && !localStorage.user) {
    window.location.href = './login.html';
  }
  if (localStorage.FBIdToken && !localStorage.budgets) {
    // const token = localStorage.FBIdToken;
    const userCreadentail = JSON.parse(localStorage.AutenticatedUser);

    getBudgetsTotal(name, email, amount, null, userCreadentail);
  } else if (localStorage.FBIdToken && localStorage.budgets) {
    const userDetail = JSON.parse(localStorage.AutenticatedUser);
    const budgets = JSON.parse(localStorage.budgets);

    name[0].innerHTML = `${userDetail.firstName} ${
      userDetail.lastName ? userDetail.lastName : ''
    }`;
    email[0].innerHTML = `${userDetail.email ? userDetail.email : ''} `;
    amount[0].innerHTML = `${budgets.total} บาท`;
  }
  if (localStorage.user && !localStorage.budgets) {
    getBudgetsTotal(name, email, amount, userTotal, userDetail);
    userTotalLabel[0].classList.add('active');
  } else if (localStorage.user && localStorage.budgets) {
    const userDetail = JSON.parse(localStorage.user);
    const budgets = JSON.parse(localStorage.budgets);

    name[0].innerHTML = `${userDetail.firstName} ${
      userDetail.lastName ? userDetail.lastName : ''
    }`;
    email[0].innerHTML = `${userDetail.email ? userDetail.email : ''} `;
    amount[0].innerHTML = `${budgets.total} บาท`;
    userTotal[0].innerHTML = `${userDetail.amount} บาท`;
    userTotalLabel[0].classList.add('active');
  }
} 

function getBudgetsTotal(name, email, amount, userTotal, userDetail) {
  let budgets = {};
  db.collection('budgets')
    .get()
    .then((data) => {
      // console.log();
      name[0].innerHTML = `${userDetail.firstName} ${
        userDetail.lastName ? userDetail.lastName : ''
      }`;
      email[0].innerHTML = `${userDetail.email ? userDetail.email : ''} `;
      amount[0].innerHTML = `${data.docs[0].data().total} บาท`;

      if (userTotal) {
        userTotal[0].innerHTML = `${userDetail.amount} บาท`;
      }

      budgets = data.docs[0].data();
      budgets.id = data.id;

      localStorage.setItem('budgets', JSON.stringify(budgets));
    });
}*/

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
      checkPayment(transactionsDate);
    })
    .catch((err) => {
      console.error(err);
    });
}

function checkPayment(transaction) {
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
}
function initailUserTransaction() {
  const month = document.getElementsByClassName('month');
  const totalMonth = dayjs(new Date().toISOString()).format('M') * 1;
  for (let i = 1; i <= totalMonth; i++) {
    month[i - 1].innerHTML = 'ไม่มีการชำระ';
    month[i - 1].classList.add('month-hide');
    month[i - 1].classList.add('danger');
  }
}

function setDocumentPaymentMonth(month) {
  let payMonth = document.getElementById(`${month}`);
  payMonth.classList.remove('danger');
  // console.log(month);
  payMonth.innerHTML = 'จ่ายแล้ว';
}
function setDocumentNotPaymentMonth(month) {
  // console.log(month);
  let payMonth = document.getElementById(`${month}`);
  payMonth.innerHTML = 'ไม่มีการชำระ';
  payMonth.classList.add('danger');
}
function logout() {
  firebase.auth().signOut();
  localStorage.clear();
  window.location.href = '/login.html';
}

//list
/*
function listtrasactions() {
  document.getElementsByClassName('user-profile-coatianer')[0].classList.add('hide');
  document.getElementsByClassName('user-profile-coatianer')[0].classList.add('active');
  document.getElementsByClassName('list-menu')[0].classList.remove('hide');
  document.getElementsByClassName('list-menu')[0].classList.remove('active');
} */

