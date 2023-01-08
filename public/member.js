let pageSize = 5;
let currentPage = 1;
let total;
let paginate;

window.addEventListener('load', async function () {
  const name = document.getElementsByClassName('profile-username');
  const email = document.getElementsByClassName('profile-email');
  const amountTotal = document.getElementsByClassName('detail-amount'); //งบประมาณทั้งหมด
  document.getElementById('form1').addEventListener('input', changeValueSearch);

  
  setUserDetail(name, email, amountTotal);
  initailUserTable();
  await getMonthlyBudget() // เงินรวมยอดรายเดือน
  await getYearsBudget()  //เงินรวมยอดรายปี
  await getTotalBudget() //ยอดเงินรวมทั้งหมด
});

function changeValueSearch() {
  if (!this.value) {
    clearListElement();
    clearListPaginationElement();
    initailUserTable();
  }
}

function setUserDetail(name, email, amount) {
  if (!localStorage.FBIdToken) {
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
}

function initailUserTable(perPage = 5) {
  let users = [];

  db.collection('users')
    .where('role', '==', 'member')
    .get()
    .then((snap) => {
      total = snap.size;
      paginate = Math.ceil(total / perPage);
      console.log(total);
      createPaginateButton(paginate);

      return db
        .collection('users')
        .where('role', '==', 'member')
        .orderBy('firstName', 'asc')
        .limit(`${perPage}`)
        .get();
    })
    .then((data) => {
      console.log(data.size);
      data.docs.forEach((doc) => {
        users.push({
          id: doc.id,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
          createdAt: doc.data().createdAt,
          amount: doc.data().amount,
          address: doc.data().address,
          telNumber: doc.data().telNumber,
          sex: doc.data().sex,
          dividend: doc.data().dividend
        });
        console.log(users);
      });
      return;
    })
    .then(() => {
      insertTable(users, 0);
    })
    .catch((err) => {
      console.error(err);
    });
}

function createPaginateButton(totalPage) {
  for (let i = 1; i <= totalPage; i++) {
    let el = document.createElement('li');
    let a = document.createElement('a');

    setListElement(el, a, i);
  }
}

function clearListElement() {
  let el = document.getElementById('myTable').getElementsByTagName('tbody')[0];
  el.innerHTML = '';
}

function setListElement(el, a, i) {
  el.classList.add('page-item');
  el.onclick = queryFromFirbaseWithOffset(i);
  a.classList.add('page-link');
  a.innerText = `${i}`;
  a.href = '#';
  el.append(a);
  document.getElementById('pagination').appendChild(el);
}

function clearListPaginationElement() {
  document.getElementById('pagination').innerHTML = '';
}

function queryFromFirbaseWithOffset(i) {
  return function () {
    let indexOf = (i - 1) * pageSize;
    let last;
    let users = [];

    db.collection('users')
      .where('role', '==', 'member')
      .orderBy('firstName', 'asc')
      .get()
      .then((data) => {
        last = data.docs[indexOf];
        return;
      })
      .then(() => {
        db.collection('users')
          .where('role', '==', 'member')
          .orderBy('firstName', 'asc')
          .startAt(last)
          .limit(5)
          .get()
          .then((data) => {
            clearListElement();
            data.docs.forEach((doc) => {
              users.push({
                id: doc.id,
                firstName: doc.data().firstName,
                lastName: doc.data().lastName,
                createdAt: doc.data().createdAt,
                amount: doc.data().amount,
                address: doc.data().address,
                telNumber: doc.data().telNumber,
                sex: doc.data().sex,
                dividend: doc.data().dividend
              });
            });
            return;
          })
          .then(() => {
            insertTable(users, indexOf);
          });
      });
  };
}

function insertTable(users, id) {
  let cell1, cell2, cell3, cell4, cell5, cell6, cell7;
  let row;
  var tbodyRef = document
    .getElementById('myTable')
    .getElementsByTagName('tbody')[0];

  for (let i = 0; i < users.length; i++, id++) {
    let icon = document.createElement('i');
    icon.classList.add('far');
    icon.classList.add('fa-eye');
    row = tbodyRef.insertRow(tbodyRef.rows.length);
    cell1 = row.insertCell(0);
    cell2 = row.insertCell(1);
    cell3 = row.insertCell(2);
    cell4 = row.insertCell(3);
    cell5 = row.insertCell(4);
    cell6 = row.insertCell(5);
    //cell7 = row.insertCell(6);

    cell1.innerHTML = `${id + 1}`;
    cell2.innerHTML = `${users[i].firstName}`;
    cell3.innerHTML = `${users[i].lastName}`;
    cell4.innerHTML = `${users[i].amount}`;
    cell5.innerHTML = `${dayjs(users[i].createdAt).fromNow()}`;
    cell6.append(icon);
    cell6.onclick = getUserProfile(users[i]);
    //cell7.innerHTML = `${users[i].address}`;
  }
}

function getUserProfile(user) {
  const personal_id = document.getElementById('form1');
  return function () {
    localStorage.setItem('pofile', JSON.stringify(user));
    personal_id.value = '';
    window.location.href = '/userProfile.html';
  };
}

function logout() {
  firebase.auth().signOut();
  localStorage.clear();
  window.location.href = '/login.html';
}

function searchByPersonalId() {
  const personal_id = document.getElementById('form1').value;
  let user = [];
  if (!personal_id.trim()) {
    // กรณี ไม่มีการกรอกข้อมูล
    return;
  }
  if (isPersonalNumber(personal_id)) {
    const userDocument = db.doc(`/users/${personal_id}`);
    userDocument
      .get()
      .then((doc) => {
        if (doc.exists) {
          user.push({
            id: doc.id,
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
            createdAt: doc.data().createdAt,
            amount: doc.data().amount,
            address: doc.data().address,
            telNumber: doc.data().telNumber,
            sex: doc.data().sex,
            dividend: doc.data().dividend
          });
        }
        return;
      })
      .then(() => {
        // setListElement();
        clearListElement();
        clearListPaginationElement();
        insertTable(user, 0);
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    console.log('Not valid');
  }
}
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

function listMemberPage() {
  if (localStorage.user) {
    window.location.href = '/userProfile.html';
  } else if (localStorage.FBIdToken) {
    window.location.href = '/member.html';
  }
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

//Budgets
async function getMonthlyBudget() {
  const amountMonth = document.getElementsByClassName('detail-amount-month'); //ยอดเงินเดือน

  const [startOfMonthDate, endOfMonthDate] =  getDate()

  try {
    const collections 
    = await  db.collection('transactions')
               .where("type", "==", "deposited")
               .where("date", ">=", startOfMonthDate )
               .where("date", "<=", endOfMonthDate )
               .get()
    let sum = 0

    for(const collection of collections.docs) {
      sum += collection.data().amount * 1
      //console.log(collection.data().date.split("T")[0]);
      //console.log(sum);
    }
    amountMonth[0].innerHTML  = sum + " บาท"
    //console.log("transactions", collection.docs[0].data());
  } 
  catch (error) {
    console.log(error);
  }

}

function getDate() {

  // Get moth and years
  const dateString = new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" });

  const [month, day, year] = dateString.trim().split(",")[0].split("/")

  const totalDays =  new Date(year, month, 0).getDate()

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
    
    amountYear[0].innerHTML  = sum + " บาท"
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
    amountTotal[0].innerHTML  = sum + " บาท"
  } 
  catch (error) {
    console.log(error);
  }

}