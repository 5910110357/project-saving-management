let pageSize = 8;
let currentPage = 1;
let total;
let paginate;

window.addEventListener('load', async function () {
    const name = document.getElementsByClassName('profile-username');
    const email = document.getElementsByClassName('profile-email');
    const amount = document.getElementsByClassName('detail-amount');
    document.getElementById('form1').addEventListener('input', changeValueSearch);

    setUserDetail(name, email, amount);
    initailUserTable();
    await getMonthlyBudgetDeposit() // เงินรวมยอดรายเดือนฝาก
  await getMonthlyBudgetWithdraw() //เงินรวมยอดรายเดือนถอน
  await getMonthlyBudgetBorrow() //เงินรวมยอดรายเดือนกู้
  await getMonthlyBudgetBorrowPay() //เงินรวมยอดรายเดือนชำระเงินกู้
  //await getYearsBudget()  //เงินรวมยอดรายปี
  await getTotalBudget() //ยอดเงินรวมทั้งหมด
  });
  
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
  
  async function  CheckPersonalNumber(event) {
    let personal_id = document.getElementById('personal_id').value;
    if (event.key === "Enter") {
       if(personal_id.length != 13) {
        alert('กรุณากรอกข้อมูลให้ถูกต้อง');
      }
      else if (personal_id.length = 13) {
        await getUserValueTable();
        
     }
    
    }  
  }
  async function getUserValueTable() {
    let personal_id = document.getElementById('personal_id').value;
    let collection = await db.collection('users').doc(personal_id).get();
    if(collection.exists) {
      //console.log("data=", collection.data());
      console.log("name=", collection.data().firstName);  
    }
    //firstName = collection.data().firstName;
    let userDetail = collection.data();
    let firstName = document.getElementById('first_name').value=collection.data().firstName;
    let lastName = document.getElementById('last_name').value=collection.data().lastName;
    let amount = document.getElementById('amount').value=collection.data().amount;
    let amount_withdraw = document.getElementById('amount_withdraw').value;
    let note = document.getElementById('note').value;
    //console.log(firstName);
    //console.log(personal_id);

    return {userDetail, personal_id, firstName, lastName, amount, amount_withdraw, note };
  }
  async function submit() {
    let userDetail = await getUserValueTable();
    let updateData = {};
    let updateTotal = {};
    let date = new Date();
    let year = date.getFullYear();

  
    let userData = {};
    
  
    const newTransaction = {
      personalId: userDetail.personal_id,
      type: 'withdrawn',
      amount_withdraw: userDetail.amount_withdraw * 1,
      amount_total: userDetail.amount*1 - userDetail.userDetail.amount *1,
      date: new Date().toISOString(),
      note: userDetail.note
    };
  
    const userDocument = db.doc(`/users/${userDetail.personal_id}`);
    console.log(userDocument.id);
    const budgetsDoc = db.doc(`/budgets/${year}`);
    const budgetYear = { 
        total: 0 - userDetail.amount_withdraw * 1,
        updatedAt: new Date().toISOString()
    };
  
    userDocument
      .get()
      .then((data) => {
        if (data.exists) {
          userData = data.data();
          if (userData.amount < userDetail.amount_withdraw) {
            window.alert('จำนวนเงินถอน มากกว่าเงินนำฝาก');
            throw 'จำนวนเงินถอน มากกว่าเงินนำฝาก!';
          } else {
            return userDocument.update({
              amount: userData.amount - userDetail.amount_withdraw * 1,
              dividend: (userData.amount - userDetail.amount_withdraw * 1) * 0.1 ,
              updatedAt: new Date().toISOString()
            });
          }
        }
        window.alert(`ไม่ปรากฎข้อมูลหมายเลข ${userDetail.personal_id}`);
      })
      .then(() => {
        console.log(year);
        return db.doc(`/budgets/${year}`).get();
      })
      .then((data) => {
        if (data.exists) {
          return budgetsDoc.update({
            total: data.data().total - userDetail.amount_withdraw * 1,
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
        return;
      })
      .then(() => {
        let element = document.getElementById('table');
        let { name, email, amount } = getProperty();
  
        setUserDetail(name, email, amount);
        element.classList.add('set_table');
  
        // set Value in table
        setTable(updateData, newTransaction);
  
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
  
  function getProperty() {
    const name = document.getElementsByClassName('profile-username');
    const email = document.getElementsByClassName('profile-email');
    const amount = document.getElementsByClassName('detail-amount');
  
    return { name, email, amount };
  }
  
  function setTable(userData, newTransaction) {
    let table = document.getElementById('table');
    let row = table.insertRow(1);
    let row_length = table.rows.length;
    //console.log(row_length);
    let date = `${dayjs(userData.date).format('DD/MM/YYYY')}`;
    let username = `${userData.firstName} ${userData.lastName}`;
    let personal_id = `${userData.id}`;
    let amount_withdraws = table.rows[1].cells[3];
    amount_withdraws = newTransaction.amount_withdraw;
    console.log(amount_withdraws);
    let amount = userData.amount; 

    if(row_length > 5) {
      table.deleteRow(5);
    }
      
    let newTable = [date, username, personal_id, amount_withdraws, amount];
    newTable.forEach((item) => {
      var td = document.createElement("td");
      var text = document.createTextNode(item);
      td.appendChild(text);
      row.appendChild(td);
      
    })
    
  }
  
  function validation(user) {
    let errors = {};
  
    if (
      isEmpty(user.personal_id) ||
      isEmpty(user.firstName) ||
      isEmpty(user.lastName) ||
      isEmpty(user.amount) ||
      isEmpty(user.amount_withdraw) ||
      isEmpty(user.note)
    ) {
      errors.field = 'กรุณากรอกข้อมูล ให้ครบถ้วน';
    } else if (!isPersonalNumber(user.personal_id)) {
      errors.id = 'หมายเลขบัตรประชาชนไม่ถูกต้อง ไม่ถูกต้อง';
    } else if (!isNumber(user.amount_withdraw)) {
      errors.amount_withdraw = 'จำนวนเงินถอนไม่ถูกต้อง';
    }
  
    return {
      errors,
      valid: Object.keys(errors).length === 0 ? true : false
    };
  }
  
  function resetFields() {
    let personal_id = document.getElementById('personal_id');
    let firstName = document.getElementById('first_name');
    let lastName = document.getElementById('last_name');
    let amount = document.getElementById('amount');
    let amount_withdraw = document.getElementById('amount_withdraw');
    let not = document.getElementById('note');
  
    personal_id.value = '';
    firstName.value = '';
    lastName.value = '';
    amount.value = '';
    amount_withdraw.value = '';
    not.value = '';
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
 .where('type', '==', 'withdrawn')
 .get()
 .then((snap) => {
   total = snap.size;
   paginate = Math.ceil(total / perPage);
   console.log(total);
   createPaginateButton(paginate);

   return db
     .collection('transactions')
     .where('type', '==', 'withdrawn')
     .orderBy('date', 'desc')
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

 db.collection('transactions')
   .where('type', '==', 'withdrawn')
   .orderBy('date', 'desc')
   .get()
   .then((data) => {
     last = data.docs[indexOf];
     return;
   })
   .then(() => {
     db.collection('transactions')
       .where('type', '==', 'withdrawn')
       .orderBy('date', 'desc')
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
  let cell1, cell2, cell3, cell4, cell5, cell6;
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
    //cell7 = row.insertCell(6);

    cell1.innerHTML = `${id + 1}`;
    cell2.innerHTML = `${transactions[i].personalId}`;
    cell3.innerHTML = `${transactions[i].firstName}`;
    cell4.innerHTML = `${transactions[i].type}`;
    cell5.innerHTML = `${transactions[i].amount}`;
    cell6.innerHTML = `${dayjs(transactions[i].date).format('DD/MM/YYYY')}`;
    //cell7.innerHTML = 
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
            amount: doc.data().amount
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
    amountMonth[0].innerHTML  = sum.toLocaleString();  
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
    amountMonth[0].innerHTML  = sum.toLocaleString();  
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
    amountMonth[0].innerHTML  = sum.toLocaleString();  
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
    amountMonth[0].innerHTML  = sum.toLocaleString();  
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
    
    amountYear[0].innerHTML  = sum.toLocaleString(); 
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
      //console.log(sum.toLocaleString());
    }
    amountTotal[0].innerHTML  = sum.toLocaleString();  
  } 
  catch (error) {
    console.log(error);
  }

}
