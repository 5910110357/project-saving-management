let pageSize = 5;
let currentPage = 1;
let total;
let paginate;

window.addEventListener('load', async function () {
  const name = document.getElementsByClassName('profile-username');
  const email = document.getElementsByClassName('profile-email');
  const amountTotal = document.getElementsByClassName('detail-amount'); //งบประมาณทั้งหมด
  //document.getElementById('form1').addEventListener('input', changeValueSearch);

  
  setUserDetail(name, email);
  //myFunction();
  initailUserTable();
  await getMonthlyBudgetDeposit() // เงินรวมยอดรายเดือนฝาก
  await getMonthlyBudgetWithdraw() //เงินรวมยอดรายเดือนถอน
  await getMonthlyBudgetBorrow() //เงินรวมยอดรายเดือนกู้
  await getMonthlyBudgetBorrowPay() //เงินรวมยอดรายเดือนชำระเงินกู้
  //await getYearsBudget()  //เงินรวมยอดรายปี
  await getTotalBudget() //ยอดเงินรวมทั้งหมด
});

function changeValueSearch() {
  if (!this.value) {
    clearListElement();
    clearListPaginationElement();
    initailUserTable();
  }
}

function setUserDetail(name, email) {
  if (!localStorage.FBIdToken) {
    window.location.href = './login.html';
  }
  if (localStorage.FBIdToken && localStorage.budgets) {
    const userDetail = JSON.parse(localStorage.AutenticatedUser);
    //const budgets = JSON.parse(localStorage.budgets);

    name[0].innerHTML = `${userDetail.firstName} ${
      userDetail.lastName ? userDetail.lastName : ''
    }`;
    email[0].innerHTML = `${userDetail.email ? userDetail.email : ''} `;
    //amount[0].innerHTML = `${budgets.total} บาท`;
    //getBudgetsTotal(name, email, amount, null, userCreadentail);
  } 
}
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
  //console.log(dateString);

  return [`${year}-${month}-01`, `${year}-${month}-${totalDays}`]

}

/*async function getYearsBudget() {
  const amountYear = document.getElementsByClassName('detail-amount-year'); //ยอดเงินปี

  let date = new Date();
  let year = date.getFullYear();
  //let year = 2019
  try {
    const collections = await db.doc(`/budgets/${year}`).get();
    let sum = collections.data().total * 1;
    //console.log(year);
    
      //console.log(collection.data().date.split("T")[0]);
      //console.log(sum);
    
    amountYear[0].innerHTML  = sum
    //console.log("transactions", collection.docs[0].data());
  } 
  catch (error) {
    console.log(error);
  }

}*/

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


//table
function initailUserTable(perPage = 5) {
  let listYear = [];

  db.collection('budgets')
    .get()
    .then((snap) => {
      
      total = snap.size;
      paginate = Math.ceil(total / perPage);
      console.log(total);
      createPaginateButton(paginate);
      
      return db
        .collection('budgets')
        .orderBy('updatedAt', 'desc')
        .limit(`${perPage}`)
        .get();
    })
    .then((data) => {
      console.log(data.size);
      data.docs.forEach((doc) => {
        listYear.push({
          id: doc.id
          
        });
        //console.log(doc.id);
      });
      return;
    })
    .then(() => {
      insertTable(listYear, 0);
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
    let el = document.getElementById('myLinks')
    
    for(let i=0; i<5; i++) {
      let button = el.getElementsByTagName('button')[0];
      button.parentNode.removeChild(button);
    }
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
function queryFromFirbaseWithOffset(i) {
  return function () {
    let indexOf = (i - 1) * pageSize;
    let last;
    let listYear = [];
    db.collection('budgets')
    .orderBy('updatedAt', 'desc')
      .get()
      .then((data) => {
        last = data.docs[indexOf];
        console.log(last);
        return;
      })
      .then(() => {
        db.collection('budgets')
          .orderBy('updatedAt', 'desc')
          .startAt(last)
          .limit(5)
          .get()
          .then((data) => {
            clearListElement();
            data.docs.forEach((doc) => {
              listYear.push({
                id: doc.id
              });
            });
            return;
          })
          .then(() => {
            insertTable(listYear, indexOf);
          });
      });
  };
}

function insertTable(listYear, d) {
  console.log(listYear);
  for (let i = 0; i < listYear.length; i++, d++) {
    let icon = document.createElement('i');
    icon.classList.add('fa');
    icon.classList.add('fa-list-ul');
    const newNode = document.createElement("button");
    newNode.className = 'btnYear';
    const list = document.getElementById('myLinks');
    list.insertBefore(newNode, list.children[-1]);

    // Create a text node:
    const textNode = document.createTextNode(listYear[i].id);
    //console.log(listYear[i].id);
    //console.log(d+1);
    newNode.appendChild(textNode);
    newNode.onclick = function() {getMonthOfYear(listYear[i].id)};
  }
}
async function getMonthOfYear(year) {
  var x = document.getElementById("myLink").classList.toggle("show");
  
  document.getElementById('myYears').innerHTML = year;
  document.getElementById('January').onclick = function() {selectMonth(year,"01")};
  document.getElementById('February').onclick = function() {selectMonth(year, "02")};
  document.getElementById('March').onclick = function() {selectMonth(year, "03")};
  document.getElementById('April').onclick = function() {selectMonth(year, "04")};
  document.getElementById('May').onclick = function() {selectMonth(year, "05")};
  document.getElementById('June').onclick = function() {selectMonth(year, "06")};
  document.getElementById('July').onclick = function() {selectMonth(year, "07")};
  document.getElementById('August').onclick = function() {selectMonth(year, "08")};
  document.getElementById('September').onclick = function() {selectMonth(year, "09")};
  document.getElementById('October').onclick = function() {selectMonth(year, "10")};
  document.getElementById('November').onclick = function() {selectMonth(year, "11")};
  document.getElementById('December').onclick = function() {selectMonth(year, "12")};
     
}

async function selectMonth(year,m) {
  console.log(m);
  console.log(year);
  const months = ["January","February","March",
  "April","May","June","July","August",
  "September","October","November","December"];
  const monthTH = ["มกราคม","กุมภาพันธ์","มีนาคม",
  "เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม",
  "กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  const d = new Date();
  d.setMonth(m-1);
  let month = months[d.getMonth()];
  let monthth = monthTH[d.getMonth()];
  console.log(month);
  console.log(monthth);
  document.getElementById('myYearss').innerHTML = year;
  document.getElementById('myMonth').innerHTML = monthth;
  
  const [startOfMonthDate, endOfMonthDate] =  getSelectMonth(year,m)
  const amount_Deposit = document.getElementsByClassName('totolBudgets_data_deposit'); 
  const amount_Borrow_pay = document.getElementsByClassName('totolBudgets_data_pay');
  const amount_Total = document.getElementsByClassName('totolBudgets_data_total');
  const amount_loanRemain = document.getElementsByClassName('totolBudgets_data_loanRemain');  
  try {
    const collections 
    = await  db.collection('transactions')
               .where("type", "==", "deposited")
               .where("date", ">=", startOfMonthDate )
               .where("date", "<=", endOfMonthDate )
               .get()
    let sumDeposited = 0
    console.log(startOfMonthDate);
    
    for(const collection of collections.docs) {
      sumDeposited += collection.data().amount * 1
      //console.log(collection.data().date.split("T")[0]);
      console.log(collection.data().date)
      console.log(sumDeposited);
    }
    amount_Deposit[0].innerHTML  = sumDeposited;
    const borrow_pay 
    = await  db.collection('transactions')
               .where("type", "==", "borrow_pay")
               .where("date", ">=", startOfMonthDate )
               .where("date", "<=", endOfMonthDate )
               .get()
    let sumBorow_pay = 0
    console.log(startOfMonthDate);
    
    for(const collection_pay of borrow_pay.docs) {
      sumBorow_pay += collection_pay.data().amount * 1
      //console.log(collection.data().date.split("T")[0]);
      console.log(sumBorow_pay);
    }
    const [startDate, endhDate] =  getSelectDate(year,m)
    const amount_loan = await db.collection('money_borrow')
    .where("date", ">=", startDate )
    .where("date", "<=", endhDate )
    .get();
    console.log(startDate);
    let sumLoan = 0
    for(const collection_pay of amount_loan.docs) {
      sumLoan += collection_pay.data().amount * 1
      //console.log(collection.data().date.split("T")[0]);
      console.log(sumLoan);
    }
    amount_Borrow_pay[0].innerHTML  = sumBorow_pay;
    let Total = sumDeposited + sumBorow_pay + sumLoan;
    amount_Total[0].innerHTML = Total;
    document.getElementById('submit').onclick 
    = function() {submit(year, month, Total, sumLoan, m)};
    amount_loanRemain[0].innerHTML = sumLoan;
    
  } 
  
  catch (error) {
    console.log(error);
  }
    
}

 function getSelectMonth(years,m) {
  //console.log(m);
  const date = new Date()
  date.setFullYear(years, m-1, 1);
  
  //console.log(date);
  const dateString = date.toLocaleString("en-AU", { timeZone: "Asia/Bangkok" });

  const [day,month ,year] = dateString.trim().split(",")[0].split("/")

  const totalDays =  new Date(year, month, 0).getDate()
  //console.log(dateString);
  //console.log(totalDays);
  //console.log(m);
  //console.log(years);

  return [`${years}-${month}-01`, `${years}-${month}-${totalDays}`]
}

function getSelectDate(years,m) {
  console.log(m);
  const date = new Date()
  if(m =='01'){
    date.setFullYear(years-0, m-2, 1);
  }
  else {
    date.setFullYear(years, m-2, 1);
  }
  
  
  console.log(date);
  const dateString = date.toLocaleString("en-AU", { timeZone: "Asia/Bangkok" });

  const [day,month ,year] = dateString.trim().split(",")[0].split("/")

  const totalDays =  new Date(year, month, 0).getDate()
  //console.log(dateString);
  //console.log(totalDays);
  //console.log(m);
  //console.log(years);

  return [`${year}-${month}-01`, `${year}-${month}-${totalDays}`]
}

async function submit(year, m, money, sumMoneyLoan, mNum) {
  let amount_loan = document.getElementById('money_loan').value;
  const month = ["January","February","March",
  "April","May","June","July","August","September",
  "October","November","December"];
 //console.log(year);
 console.log(m);
 console.log(mNum);
  const newMoneyBorrow = {
    amount: amount_loan,
    amount_total: amount_loan,
    date: new Date().toISOString()
  };
  const newTransaction = {
    personalId: 'admin',
    type: 'refund',
    amount: sumMoneyLoan * 1,
    date: new Date().toISOString()
  };
  const newTransaction2 = {
    personalId: 'admin',
    type: 'loan',
    amount: amount_loan * 1,
    date: new Date().toISOString()
  };
  const [startOfMonthDate, endOfMonthDate] =  getSelectMonth(year,mNum)
  const today = new Date(); //"July 21, 1983 01:15:00"
  console.log(today);
  let yearToday = today.getFullYear();
  let monthToday = month[today.getMonth()];
  let testyear = 1112;
  const checkDate 
    = await db.collection('money_borrow')
    .where("date", ">=", startOfMonthDate )
    .where("date", "<=", endOfMonthDate )
    .get()
     let checkDate_money_borow ;
    for(const collection_check of checkDate.docs) {
     //console.log(collection_check.id);
     checkDate_money_borow = collection_check.data().date;
    }
    //console.log(checkDate_money_borow);
    //console.log(today.toLocaleString("en-CA"));
      //console.log(startOfMonthDate);
  if(checkDate_money_borow >= startOfMonthDate && checkDate_money_borow <= endOfMonthDate){
    alert("ท่านได้ทำรายการของเดือนนี้ไปแล้ว");
  }
  /*else {
    alert("???");
  }*/
    
  else if(amount_loan > money){
    console.log(money);
    alert("จำนวนเงินไม่ถูกต้อง");
  }
  else if (yearToday != year && monthToday != m){
    alert("ไม่อยู่ในช่วงทำรายการ กรุณาตรวจสอบเดือนและปีให้ถูกต้อง");
  }
  else{
    console.log(yearToday);
    console.log(monthToday);
    db.collection('money_borrow').add(newMoneyBorrow);
    db.collection('transactions').add(newTransaction);
    db.collection('transactions').add(newTransaction2);
    const budgetsDoc = db.doc(`/budgets/${testyear}`);
    budgetsDoc
      .get()
      .then((data) => {
        if (data.exists) {
          //userData = data.data();
          return budgetsDoc.update({
            total: data.data().total + sumMoneyLoan - amount_loan * 1,
            updatedAt: new Date().toISOString()
          });
        }
      })
      .then(() => {
        window.alert('ทำรายการปล่อยกู้เรียบร้อย');
      })
      .catch((err) => {
        console.error(err);
      });
    }
  
}