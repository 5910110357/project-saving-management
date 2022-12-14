let pageSize = 8;
let currentPage = 1;
let total;
let paginate;

window.addEventListener('load', function () {
    const name = document.getElementsByClassName('profile-username');
    const email = document.getElementsByClassName('profile-email');
    const amount = document.getElementsByClassName('detail-amount');
    document.getElementById('form1').addEventListener('input', changeValueSearch);
    
  
    setUserDetail(name, email, amount);
    initailUserTable();
  });
  function getProperty() {
    const name = document.getElementsByClassName('profile-username');
    const email = document.getElementsByClassName('profile-email');
    const amount = document.getElementsByClassName('detail-amount');
  
    return { name, email, amount };
  }
  function setUserDetail(name, email, amount) {
    if (!localStorage.FBIdToken) {
      window.location.href = './login.html';
    }
    if (localStorage.AutenticatedUser && localStorage.budgets) {
      const userDetail = JSON.parse(localStorage.AutenticatedUser);
      const budget = JSON.parse(localStorage.budgets);
      name[0].innerHTML = `${userDetail.firstName} ${
        userDetail.lastName ? userDetail.lastName : ''
      }`;
      email[0].innerHTML = `${userDetail.email} `;
      amount[0].innerHTML = `${budget.total} บาท`;
    } else {
      window.location.href = './login.html';
    }
  }
  
  
  function logout() {
    firebase.auth().signOut();
    localStorage.clear();
    window.location.href = '/login.html';
  }
  
  function getUserValueTable() {
    let personal_id = document.getElementById('personal_id').value;
    let firstName = document.getElementById('first_name').value;
    let lastName = document.getElementById('last_name').value;
    let amount = document.getElementById('amount').value;
  
    return { personal_id, firstName, lastName, amount };
  }
  function format(mask, number) {
    var s = '' + number,
      r = '';
    for (var im = 0, is = 0; im < mask.length && is < s.length; im++) {
      r += mask.charAt(im) == 'X' ? s.charAt(is++) : mask.charAt(im);
    }
    return r;
  }
  function submit() {
    let userDetail = getUserValueTable();
    let errors = validation(userDetail);
    let updateData = {};
    let updateTotal = {};
    let date = new Date();
    let year = date.getFullYear();
    //let year = 2021;

  
    if (!errors.valid) {
      let textError = '\n';
      for (const error in errors.errors) {
        textError += errors.errors[error] + '\n';
      }
      window.alert('Error : ' + textError);
      return;
    }
  
    let userData = {};
  
    const newTransaction = {
      personalId: userDetail.personal_id,
      type: 'deposited',
      amount: userDetail.amount * 1,
      date: new Date().toISOString()
    };
  
    const userDocument = db.doc(`/users/${userDetail.personal_id}`);
    const budgetsDoc = db.doc(`/budgets/${year}`);
    const budgetYear = { 
      total: 0 + userDetail.amount * 1,
      updatedAt: new Date().toISOString()
    };
  
    userDocument
      .get()
      .then((data) => {
        if (data.exists) {
          userData = data.data();
          return userDocument.update({
            amount: userData.amount + userDetail.amount * 1,
            dividend: (userData.amount + userDetail.amount* 1) * 0.1 ,
            updatedAt: new Date().toISOString()
          });
        }
        window.alert(`ไม่ปรากฎข้อมูลหมายเลข ${userDetail.personal_id}`);
      })
      .then(() => {
        console.log(year);
        return db.doc(`/budgets/${year}`).get();
      })
      /*.then((doc) => {
          const budgetYear = {
          
          total: 0 + userDetail.amount * 1,
          updatedAt: new Date().toISOString()
        }
          return  db.doc(`/budgets/${year}`).set(budgetYear);
        }
         return;
         
      })*/
      .then((data) => {
        if (data.exists) {
        //userData = data.data();
        return budgetsDoc.update({
          total: data.data().total + userDetail.amount * 1,
          updatedAt: new Date().toISOString()
        });
       } 
       return  db.doc(`/budgets/${year}`).set(budgetYear);
      })
      
      .then(() => {
        return userDocument.get();
      })
      .then((data) => {
        updateData = data.data();
        updateData.id = data.id;
  
        return db.collection('transactions').add(newTransaction);
      })
      .then(() => {
        return budgetsDoc.get();
      })
      .then((data) => {
        updateTotal = data.data();
        updateTotal.id = data.id;
        localStorage.removeItem('budgets');
        localStorage.setItem('budgets', JSON.stringify(updateTotal));
       
      })
      
      .then(() => {
        let element = document.getElementById('table');
        let { name, email, amount } = getProperty();
  
        setUserDetail(name, email, amount);
        element.classList.add('set_table');
  
        // set Value in table
        setTable(updateData);
  
        // Reset fields
        resetFields();
      })
      .then(() => {
        //document.getElementById('personal_id').value = '';
        //document.getElementById('total').value = '';
        clearListElement();
        clearListPaginationElement();
        initailUserTable();
        //setUserOrdernumber();
        return;
      })
      .then(() => {
        window.alert('ทำรายการเรียบร้อย');
      })
      .catch((err) => {
        console.error(err);
      });
  }
  
  function resetFields() {
    let personal_id = document.getElementById('personal_id');
    let firstName = document.getElementById('first_name');
    let lastName = document.getElementById('last_name');
    let amount = document.getElementById('amount');
  
    personal_id.value = '';
    firstName.value = '';
    lastName.value = '';
    amount.value = '';
  }
  
  function setTable(userData) {
    let username = document.getElementById('username');
    username.innerText = `${userData.firstName} ${userData.lastName}`;
  
    let personal_id = document.getElementById('personal_id_table');
    personal_id.innerText = `${userData.id}`;
  
    let amount = document.getElementById('amount_table');
    amount.innerText = userData.amount;
  }
  
  function validation(user) {
    let errors = {};
  
    if (
      isEmpty(user.personal_id) ||
      isEmpty(user.firstName) ||
      isEmpty(user.lastName) ||
      isEmpty(user.amount)
    ) {
      errors.field = 'กรุณากรอกข้อมูล ให้ครบถ้วน';
    } else if (!isPersonalNumber(user.personal_id)) {
      errors.id = 'หมายเลขบัตรประชาชนไม่ถูกต้อง ไม่ถูกต้อง';
    } else if (!isNumber(user.amount)) {
      errors.amount = 'จำนวนเงินฝากไม่ถูกต้อง';
    }
  
    return {
      errors,
      valid: Object.keys(errors).length === 0 ? true : false
    };
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
 
    // Check if sum is not a number
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
    if (number.match(regEx) && number * 1 >= 100) {
      return true;
    } else {
      return false;
    }
  };
  
  const isEmpty = (string) => {
    if (string.trim() === '') {
      return true;
    } else {
      return false;
    }
  };

 // list
 
function listtrasactions() {
     document.getElementsByClassName('content')[0].classList.add('hide');
     document.getElementsByClassName('content')[0].classList.add('active');
     document.getElementsByClassName('list-menu')[0].classList.remove('hide');
     document.getElementsByClassName('list-menu')[0].classList.remove('active');
} 
function changeValueSearch() {
    if (!this.value) {
      clearListElement();
      clearListPaginationElement();
      initailUserTable();
    }
}

function initailUserTable(perPage = 8) {
  let transactions = [];

  db.collection('transactions')
    .where('type', '==', 'deposited')
    .get()
    .then((snap) => {
      total = snap.size;
      paginate = Math.ceil(total / perPage);
      console.log(total);
      createPaginateButton(paginate);

      return db
        .collection('transactions')
        .where('type', '==', 'deposited')
        .orderBy('date', 'asc')
        .limit(`${perPage}`)
        .get();
    })
    .then((data) => {
      console.log(data.size);
      data.docs.forEach((doc) => {
        transactions.push({
          id: doc.id,
          personalId: doc.data().personalId,
          type: doc.data().type,
          amount: doc.data().amount,
          date: doc.data().date
        });
      });
      return;
    })
    .then(async () => {
      for (let i = 0; i < transactions.length; i++) {
        console.log(transactions[i].personalId);
        let user = await db.doc(`users/${transactions[i].personalId}`).get();
        transactions[i].firstName = user.data().firstName;
        transactions[i].lastName = user.data().lastName;
      }
    })
    .then(() => {
      insertTable(transactions, 0);
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
    let transactions = [];
    let perPage = 8;

    db.collection('transactions')
      .where('type', '==', 'deposited')
      .orderBy('date', 'asc')
      .get()
      .then((data) => {
        last = data.docs[indexOf];
        return;
      })
      .then(() => {
        db.collection('transactions')
          .where('type', '==', 'deposited')
          .orderBy('date', 'asc')
          .startAt(last)
          .limit(8)
          .get()
          .then((data) => {
            clearListElement();
            data.docs.forEach((doc) => {
              transactions.push({
                id: doc.id,
                personalId: doc.data().personalId,
                type: doc.data().type,
                amount: doc.data().amount,
                date: doc.data().date
              });
            });
            return;
          })
          .then(async () => {
            for (let i = 0; i < transactions.length; i++) {
              console.log(transactions[i].personalId);
              let user = await db.doc(`users/${transactions[i].personalId.trim()}`).get();
              transactions[i].firstName = user.data().firstName;
              transactions[i].lastName = user.data().lastName;
            }
          })
          .then(() => {
            insertTable(transactions, indexOf);
          });
      });
  };
}

function insertTable(transactions, id) {
  let cell1, cell2, cell3, cell4, cell5, cell6, cell7;
  let row;
  var tbodyRef = document
    .getElementById('myTable')
    .getElementsByTagName('tbody')[0];

  for (let i = 0; i < transactions.length; i++, id++) {
    /*let icon = document.createElement('i');
    icon.classList.add('far');
    icon.classList.add('fa-eye'); */
    row = tbodyRef.insertRow(tbodyRef.rows.length);
    cell1 = row.insertCell(0);
    cell2 = row.insertCell(1);
    cell3 = row.insertCell(2);
    cell4 = row.insertCell(3);
    cell5 = row.insertCell(4);
    cell6 = row.insertCell(5);
    cell7 = row.insertCell(6);

    cell1.innerHTML = `${id + 1}`;
    cell2.innerHTML = `${transactions[i].personalId}`;
    cell3.innerHTML = `${transactions[i].firstName}`;
    cell4.innerHTML = `${transactions[i].lastName}`;
    cell5.innerHTML = `${transactions[i].type}`;
    cell6.innerHTML = `${transactions[i].amount}`;
    cell7.innerHTML = `${dayjs(transactions[i].date).format('DD/MM/YYYY')}`;
    //cell6.append(icon);
    //cell6.onclick = getUserProfile(users[i]);

  }
}

function searchByPersonalId() {
  const personal_id = document.getElementById('form1').value;
  let user = [];
  if (!personal_id.trim()) {
    // กรณี ไม่มีการกรอกข้อมูล
    return;
  }
  if (isPersonalNumber(personal_id)) {
    const userDocument = db.doc(`/transaction/${personal_id}`);
    userDocument
      .get()
      .then((doc) => {
        if (doc.exists) {
          user.push({
            id: doc.id,
              personalId: doc.data().personalId,
              type: doc.data().type,
              amount: doc.data().amount,
              date: doc.data().date
          });
        }
        return;
      })
      .then(() => {
        clearListElement();
        clearListPaginationElement();
        insertTable(user[0]);
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    console.log('Not valid');
  }
}

  