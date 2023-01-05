let pageSize = 8;
let currentPage = 1;
let total;
let paginate;

window.addEventListener('load', function () {
  const name = document.getElementsByClassName('profile-username');
  const email = document.getElementsByClassName('profile-email');
  const amount = document.getElementsByClassName('detail-amount');
  //document.getElementById('form1').addEventListener('input', changeValueSearch);

  //   setUserDetail(name, email, amount);
  // ลำดับของผู้ใช้

  initailUserTable();
});
function logout() {
  firebase.auth().signOut();
  localStorage.clear();
  window.location.href = '/login.html';
}
function changeValueSearch() {
  if (!this.value) {
    clearListElement();
    clearListPaginationElement();
    initailUserTable();
  }
}

function setUserOrdernumber() {
  if (localStorage.user) {
    const displayOrder = document.getElementsByClassName('order-number')[0];
    const numberOrder = document.getElementsByClassName('number')[0];
    let orderNumer = 0;
    let exist = false;
    const userOrder = JSON.parse(localStorage.user);

    db.collection('queues')
      .orderBy('createdAt', 'asc')
      .get()
      .then((data) => {
        const { docs } = data;

        for (let i = 0; i < docs.length; i++) {
          orderNumer++;
          if (docs[i].data().userId === userOrder.id) {
            exist = true;
            break;
          }
        }
        if (exist) {
          numberOrder.innerHTML = orderNumer;
          displayOrder.classList.remove('hide');
        }
      });
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

function initailUserTable(perPage = 8) {
  //   let users = [];
  let queues = [];

  //   const ordersCollection = db.collection('users');

  db.collection('queues')
    .get()
    .then((snap) => {
      total = snap.size;
      paginate = Math.ceil(total / perPage);
      // console.log(total);
      createPaginateButton(paginate);

      return db
        .collection('queues')
        .orderBy('createdAt', 'asc')
        .limit(`${perPage}`)
        .get();
    })
    .then((data) => {
      // console.log(data.size);
      data.docs.forEach((doc) => {
        queues.push({
          id: doc.id,
          personalId: doc.data().personalId,
          createdAt: doc.data().createdAt
        });
        // console.log(orders);
      });
      return;
    })
    .then(async () => {
      for (let i = 0; i < queues.length; i++) {
        // console.log(orders[i].userId);
        let user = await db.doc(`users/${queues[i].personalId}`).get();
        queues[i].firstName = user.data().firstName;
        queues[i].lastName = user.data().lastName;
      }
    })
    .then(() => {
      insertTable(queues, 0);
      setUserOrdernumber();
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
    let queues = [];

    db.collection('queues')
      .orderBy('createdAt', 'asc')
      .get()
      .then((data) => {
        last = data.docs[indexOf];
        return;
      })
      .then(() => {
        db.collection('queues')
          .orderBy('createdAt', 'asc')
          .startAt(last)
          .limit(8)
          .get()
          .then((data) => {
            clearListElement();
            data.docs.forEach((doc) => {
              queues.push({
                id: doc.id,
                personalId: doc.data().personalId,
                createdAt: doc.data().createdAt
              });
            });
            return;
          })
          .then(async () => {
            for (let i = 0; i < queues.length; i++) {
              //   console.log(orders[i].userId);
              let user = await db.doc(`users/${queues[i].personalId.trim()}`).get();
              queues[i].firstName = user.data().firstName;
              queues[i].lastName = user.data().lastName;
            }
          })
          .then(() => {
            insertTable(queues, indexOf);
          });
      });
  };
}

function insertTable(users, num) {
  let cell1, cell2, cell3, cell4, cell5;
  let row;
  var tbodyRef = document
    .getElementById('myTable')
    .getElementsByTagName('tbody')[0];
  //let btn = document.createElement('button')
  //btn.textContent="ลบข้อมูล"
 // btn.setAttribute('class', 'btn btn-danger')
  //btn.setAttribute('id',orders.id)
  

  for (let i = 0; i < users.length; i++, num++) {
    // let icon = document.createElement('i');
    // icon.classList.add('far');
    // icon.classList.add('fa-eye');

    row = tbodyRef.insertRow(tbodyRef.rows.length);

    cell1 = row.insertCell(0);
    cell2 = row.insertCell(1);
    cell3 = row.insertCell(2);
    cell4 = row.insertCell(3);
    cell5 = row.insertCell(4);

    cell1.innerHTML = `${num + 1}`;
    cell2.innerHTML = `${users[i].firstName}`;
    cell3.innerHTML = `${users[i].lastName}`;
    cell4.innerHTML = `${dayjs(users[i].createdAt).format('DD/MM/YYYY')}`;
    //cell5.appendChild(btn)
    if (localStorage.user) {
      if (users[i].userId === JSON.parse(localStorage.user).id) {
        row.classList.add('active-user');
      }
    }
  }
}

function searchByPersonalId() {
  const personal_id = document.getElementById('form1').value;
  let user = [];
  if (!personal_id.trim()) {
    // กรณี ไม่มีการกรอกข้อมูล
    return;
  }
  //   console.log(personal_id);
  if (isPersonalNumber(personal_id)) {
    const userDocument = db.doc(`/users/${personal_id}`);
    userDocument
      .get()
      .then((doc) => {
        console.log(doc);
        if (doc.exists) {
          user.push({
            id: doc.id,
            firstName: doc.data().firstName,
            lastName: doc.data().lastName
          });
        }
        // console.log(user);
        return db.collection('queues').where('userId', '==', doc.id).get();
      })
      .then((doc) => {
        console.log(doc);
        if (!doc.empty) {
          const { createdAt } = doc.docs[0].data();
          user[0].createdAt = createdAt;
        } else {
          user = [];
        }
        return;
      })
      .then(() => {
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

function listOrderButton() {
  document.getElementsByClassName('list-menu')[0].classList.remove('hide');
  document.getElementsByClassName('list-menu')[0].classList.remove('active');
  document.getElementsByClassName('order-form')[0].classList.add('hide');
  document.getElementsByClassName('order-form')[0].classList.add('active');
}
function formBotton() {
  document.getElementsByClassName('list-menu')[0].classList.add('hide');
  document.getElementsByClassName('list-menu')[0].classList.add('active');
  document.getElementsByClassName('order-form')[0].classList.remove('hide');
  document.getElementsByClassName('order-form')[0].classList.remove('active');
}
function submit() {
  const personal_id = document.getElementById('personal_id').value;
  const amount = document.getElementById('amount').value;

  if (!isPersonalNumber(personal_id)) {
    window.alert('หมายเลขไม่ถูกต้อง');
    return;
  }
  if (!isNumber(amount)) {
    window.alert('จำนวนเงินไม่ถูกต้อง');
    return;
  }

  if (!localStorage.user) {
    window.alert('ท่านมิใช้ผู้ใช้งานทั่วไป');
    return;
  }

  if (personal_id !== JSON.parse(localStorage.user).id) {
    window.alert('โปรดระบุหมายเลขบัตรเฉพาะของท่าน');
    return;
  }
  db.collection('borrows')
    .where('userId', '==', personal_id)
    .get()
    .then((data) => {
      if (!data.empty) {
        window.alert('ท่านมีรายชื่อของการกู้มาก่อน');
        throw new Error('invalid transaction');
      }
      return db.collection('queues').where('userId', '==', personal_id).get();
    })
    .then((doc) => {
      if (doc.empty) {
        return db.doc(`users/${personal_id}`).get();
      }
      window.alert('มีรายชื่อการขอกู้ยืมก่อนหน้า');
      throw new Error('invalid transaction');
    })
    .then((doc) => {
      if (doc.exists) {
        return db.collection('queues').add({
          personalId: personal_id.trim(),
          createdAt: new Date().toISOString(),
          amount: amount * 1
        });
      }
      throw new Error('invalid transaction');
    })
    .then(() => {
      document.getElementById('personal_id').value = '';
      document.getElementById('amount').value = '';
      clearListElement();
      clearListPaginationElement();
      initailUserTable();
      setUserOrdernumber();
      return;
    })
    .then(() => {
      window.alert('จองเรียบร้อย');
    })
    .catch((err) => {
      console.log(err);
    });
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

const isNumber = (number) => {
  const regEx = /^\d+$/;
  if (number.match(regEx) && number * 1 >= 1000) {
    return true;
  } else {
    return false;
  }
};

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
