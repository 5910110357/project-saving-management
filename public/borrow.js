let pageSize = 8;
let currentPage = 1;
let total;
let paginate;

window.addEventListener('load', async function () {
    
    //setUserDetail(name, email, amountTotal);
    //initailUserTable();
    await getTotalBudgetQueue()
    await getUserProfile();
});

  
  
  function logout() {
    firebase.auth().signOut();
    localStorage.clear();
    window.location.href = '/index.html';
  }
  
 async function getUserProfile() {
  let personal = localStorage.getItem("pofile");
  let personalsId = JSON.parse(personal);
  
  console.log(personalsId);
  document.getElementById('personal_id').value=personalsId;
  await getUserValueTable();
  

}  
async function getUserValueTable() {
    let personal_id = document.getElementById('personal_id').value;
    let firstName = document.getElementById('first_name');
    let lastName = document.getElementById('last_name');
   try{
    let user  
    = await db.collection('users')
              .doc(personal_id)
              .get()
    let dataFirstname = user.data().firstName ;
    let dataLastname = user.data().lastName ;
    console.log(dataFirstname);
    console.log(dataLastname);
    ///////////////////
    let money_loan 
    = await db.collection('queues')
    .where("personalId", "==", personal_id)
    .get()
    let userMoney;
    let dateLoan;
    for(const collection_loan of money_loan.docs) {
      userMoney = collection_loan.data().amount * 1
      dateLoan = collection_loan.data().createdAt
    console.log(dateLoan);
    console.log(userMoney);
  }
    console.log(dataFirstname);
    console.log(dataLastname);
    console.log(userMoney);
    firstName.value = dataFirstname;
    lastName.value = dataLastname;
    let amount = document.getElementById('amount').value = userMoney;
    //amount.value = userMoney;
    let amount_borrow = document.getElementById('amount_borrow').value;
    //amount_borrow.value;
    return { personal_id, amount,amount_borrow,dateLoan,money_loan};
   }
   
   catch (error) {
    console.log(error);
  }
}
  async function submit() {
    let userDetail = await getUserValueTable();
    //let errors = validation(userDetail);
    let updateData = {};
    let updateTotal = {};
    let date = new Date();
    let year = date.getFullYear();
    //let year = 2021;

  
    /*if (!errors.valid) {
      let textError = '\n';
      for (const error in errors.errors) {
        textError += errors.errors[error] + '\n';
      }
      window.alert('Error : ' + textError);
      return;
    }*/
    const newTransaction = {
      personalId: userDetail.personal_id,
      type: 'borrow',
      amount: userDetail.amount_borrow *1,
      amount_total: userDetail.amount_borrow*1 + (userDetail.amount_borrow*0.25) *1,
      date: new Date().toISOString()
    };
   console.log(userDetail);

   const newBorrow = {
    personalId: userDetail.personal_id,
    status: 'active',
    amount_loan: userDetail.amount,
    amount: userDetail.amount_borrow *1,
    amount_payment: userDetail.amount_borrow*1  + (userDetail.amount_borrow*0.25) *1,
    total_amount_pay: userDetail.amount_borrow*1  + (userDetail.amount_borrow*0.25) *1,
    date: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dateLoan: userDetail.dateLoan
    
  };
  //db.collection('transactions').add(newTransaction);
  //db.collection('borrows').add(newBorrow);
  const checkId 
  = await db.collection('borrows')
  .where('personalId', '==', userDetail.personal_id)
  //.where('status', '==', 'active')
  .get()
  let checkIds;
  let checkStatus;
  for(const collection_checkIds of checkId.docs) {
    checkIds = collection_checkIds.data().personalId;
    checkStatus = collection_checkIds.data().status;
  }
  console.log(checkIds);
  if(checkIds == userDetail.personal_id ) {
    if(checkStatus == 'active') {
      console.log(checkStatus);
      alert("ท่านมีรายชื่อในการกู้มาก่อน โปรดตรวจสอบรายการกู้ของท่าน");
    }
    else {
      console.log(checkStatus);
      alert("ปิดบัญชีแล้ว"); //กู้ได้
      db.collection('borrows').add(newBorrow);
      db.collection('transactions').add(newTransaction);
    }
    
  }
  else {
    //alert("ทำรายการได้"); //กู้ได้เลย
    db.collection('borrows').add(newBorrow);
    db.collection('transactions').add(newTransaction);
  }
  console.log(userDetail.personal_id);
  let collection_checkloan;
    for(const collection of userDetail.money_loan.docs) {
      collection_checkloan = collection.id;

    }
  console.log(collection_checkloan);
  
  const updatequeue = db.doc(`/queues/${collection_checkloan}`);
  updatequeue 
    .delete()//ไว้ลบคิว
    /*.then(() => {
      alert("ทำรายการสำเร็จ");
    })*/
    
      .then(() => {
        let element = document.getElementById('table');
        //let { name, email, amount } = getProperty();
  
        //setUserDetail(name, email, amount);
        element.classList.add('set_table');
  
        // set Value in table
        setTable(newBorrow);
        console.log(newBorrow);
        // Reset fields
        resetFields();
      })
      .then(() => {
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
    let amountLoan = document.getElementById('amount');
    let amount = document.getElementById('amount_borrow');
    personal_id.value = '';
    firstName.value = '';
    lastName.value = '';
    amountLoan.value = '';
    amount.value = '';
  }
  
  function setTable(userData) {
    let table = document.getElementById('table');
    let row = table.insertRow(1);
    let row_length = table.rows.length;
    console.log(row_length);
    let date = `${dayjs(userData.date).format('DD/MM/YYYY')}`;
    //let username = `${userData.firstName} ${userData.lastName}`;
    let personal_id = `${userData.personalId}`;
    let amountBorrow = `${userData.amount}`;
    let amountPayment = userData.amount_payment;

    if(row_length > 7) {
      table.deleteRow(7);
    }
      
    let newTable = [date, personal_id, amountBorrow, amountPayment];
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
      isEmpty(user.amount)
    ) {
      errors.field = 'กรุณากรอกข้อมูล ให้ครบถ้วน';
    } 
    else if (!isPersonalNumber(user.personal_id)) {
      errors.id = 'หมายเลขบัตรประชาชนไม่ถูกต้อง ไม่ถูกต้อง';
    } 
    else if (!isNumber(user.amount)) {
      errors.amount = 'จำนวนเงินฝากไม่ถูกต้อง';
    }
  
    return {
      errors,
      valid: Object.keys(errors).length === 0 ? true : false
    };
  }
  
  const isPersonalNumber = (number) => {
    // let digit = number *1
  
    if (number.length != 13) {
      //return false;
      //alert("no");
    }
    let sum = 0, j = 0, check, lastDigit;
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
      return getUserValueTable();
    }
    return false;
  }; 
  
  /*const isNumber = (number) => {
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
  };*/

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
    .where('type', '==', 'borrow')
    .get()
    .then((snap) => {
      total = snap.size;
      paginate = Math.ceil(total / perPage);
      console.log(total);
      createPaginateButton(paginate);

      return db
        .collection('transactions')
        .where('type', '==', 'borrow' )
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
      //insertTable(transactions, 0);
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
  //document.getElementById('pagination').appendChild(el);
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
      .where('type', '==', 'borrow')
      .orderBy('date', 'desc')
      .get()
      .then((data) => {
        last = data.docs[indexOf];
        return;
      })
      .then(() => {
        db.collection('transactions')
          .where('type', '==', 'borrow')
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
  let cell1, cell2, cell3, cell4, cell5, cell6, cell7;
  let row;
  var tbodyRef = document
    .getElementById('myTable')
    .getElementsByTagName('tbody')[0];

  for (let i = 0; i < transactions.length; i++, id++) {
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
    cell2.innerHTML = `${transactions[i].personalId}`;
    cell3.innerHTML = `${transactions[i].firstName}`;
    cell4.innerHTML = `${transactions[i].type}`;
    cell5.innerHTML = `${transactions[i].amount}`;
    cell6.innerHTML = `${dayjs(transactions[i].date).format('DD/MM/YYYY')}`;
   
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
async function getTotalBudgetQueue(){
  const amountTotal = document.getElementsByClassName('detail-amount-total'); //ยอดเงินกู้ทั้งหมด
  const amount = document.getElementsByClassName('detail-amount'); //ยอดเงินกู้คงเหลือ
  //const [startOfMonthDate, endOfMonthDate] =  getDate()
  try {
    const collections 
    = await db.collection('money_borrow')
    .orderBy("date", "desc")
    .get()
    let sumTotal = collections.docs.map(doc => doc.data().amount_total);
    let sum = collections.docs.map(doc => doc.data().amount);
      var n = sumTotal.length;
      
      var sumTotal1 = sumTotal.splice(0, sumTotal.length-(n-1));
      console.log((sumTotal1*1).toLocaleString());
      amountTotal[0].innerHTML  = (sumTotal1*1).toLocaleString();

      var sum1 = sum.splice(0, sum.length-(n-1));
      console.log((sum1*1).toLocaleString());
      amount[0].innerHTML  = (sum1*1).toLocaleString();
  } 
  catch (error) {
    console.log(error);
  }
}

  