let pageSize = 5;
let currentPage = 1;
let total;
let paginate;
var totalShow = 0;
let perPage = 8;
const monthTH = ["มกราคม","กุมภาพันธ์","มีนาคม",
  "เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม",
  "กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const monthEN = ["January","February","March",
  "April","May","June","July","August",
  "September","October","November","December"];

window.addEventListener('load', async function () {
  const name = document.getElementsByClassName('profile-username');
  const email = document.getElementsByClassName('profile-email');
  const amountTotal = document.getElementsByClassName('detail-amount'); //งบประมาณทั้งหมด
  //document.getElementById('form1').addEventListener('input', changeValueSearch);

  
  setUserDetail(name, email, amountTotal);
  initailUserTable();
  // initailYearTable();
  await getMonthlyBudgetDeposit() // เงินรวมยอดรายเดือนฝาก
  await getMonthlyBudgetWithdraw() //เงินรวมยอดรายเดือนถอน
  await getMonthlyBudgetBorrow() //เงินรวมยอดรายเดือนกู้
  await getMonthlyBudgetBorrowPay() //เงินรวมยอดรายเดือนชำระเงินกู้
  //await getYearsBudget()  //เงินรวมยอดรายปี
  await getTotalBudget() //ยอดเงินรวมทั้งหมด
 ///
});

//เดิม
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
    amountMonth[0].innerHTML  = sum.toLocaleString() ; 
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


async function getTotalBudget() {
  const amountTotal = document.getElementsByClassName('detail-amount'); //ยอดเงินรวมทั้งหมด

  try {
    const collections = await  db.collection('budgets').get()
    let sum = 0

    for(const collection of collections.docs) {
      sum += collection.data().total * 1
      //console.log(sum);
    }
    amountTotal[0].innerHTML  = sum.toLocaleString(); 
  } 
  catch (error) {
    console.log(error);
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

//selectyear
async function initailUserTable(perPage = 5) {
  let listYear = [];
  console.log(listYear);
  db.collection('budgets')
    .get()
    .then((snap) => {
      total = snap.size;
      paginate = Math.ceil(total / perPage);
      console.log(listYear);
  
      return db
        .collection('budgets')
        .orderBy('updatedAt', 'desc')
        .get();
    })
    .then((data) => {
      console.log(data.size);
      data.docs.forEach((doc) => {
        listYear.push({
          id: doc.id
          
        });
      });
      return listYear;
    })
    .then(() => {
      Paginate(listYear);
    })
    .catch((err) => {
      console.error(err);
    });
  }

function logout() {
  firebase.auth().signOut();
  localStorage.clear();
  window.location.href = '/index.html';
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
function Paginate(totalYear){ 
    let maxPages = totalYear;
   
    changePage(1, maxPages);
    
    document.getElementById('btn_next').onclick 
           = function() {nextPage(maxPages)};
    document.getElementById('btn_prev').onclick 
           = function() {prevPage(maxPages)};
  }
  var current_page = 1;
var records_per_page = 4;

function prevPage(maxPages)
{
    if (current_page > 1) {
        current_page--;
        changePage(current_page, maxPages);
    }
}

async function nextPage(maxPages)
{
  let numPage = Math.ceil(maxPages.length / records_per_page);
    if (current_page < numPage) {
        current_page++;
        changePage(current_page, maxPages);
    }
}

function changePage(page, maxPages)
{
  let numPage = Math.ceil(maxPages.length / records_per_page);
    var btn_next = document.getElementById("btn_next");
    var btn_prev = document.getElementById("btn_prev");
    var listing_table = document.getElementById("listingTable");
    var page_span = document.getElementById("page");

    // Validate page
    if (page < 1) page = 1;
    if (page > numPage) page = numPage;

    listing_table.innerHTML = "";
    //newNode.innerHTML = '';
    for (let i = (page-1) * records_per_page; i < (page * records_per_page); i++) {
        console.log(page * records_per_page);
        const newNode = document.createElement("button");
        newNode.className = 'btnYear';
        
      const list = document.getElementById('listingTable');
      list.insertBefore(newNode, list.children[-1]);
  
      // Create a text node:
      const textNode = document.createTextNode(maxPages[i].id);

      newNode.appendChild(textNode);
      newNode.onclick = function() {getMonthOfYear(maxPages[i].id)};
    }
    //page_span.innerHTML = page;

    if (page == 1) {
        btn_prev.style.visibility = "hidden";
    } else {
        btn_prev.style.visibility = "visible";
    }

    if (page == numPage) {
        btn_next.style.visibility = "hidden";
    } else {
        btn_next.style.visibility = "visible";
    }
    
}
async function getMonthOfYear(year) {
  var x = document.getElementById("myLink").classList.toggle("show");
  console.log(year);
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
  
  
  const d = new Date();
  d.setMonth(m-1);
  let month = monthEN[d.getMonth()];
  let monthth = monthTH[d.getMonth()];
  console.log(month);
  console.log(monthth);
  document.getElementById('myYearss').innerHTML = year;
  document.getElementById('myMonth').innerHTML = monthth;
  clearTable();


  const [startOfMonthDate, endOfMonthDate] =  getSelectMonth(year,m)
  let transactions = [];
  db.collection('transactions')
    .where('type', '==', 'borrow_pay')
    .where("date", ">=", startOfMonthDate )
    .where("date", "<=", endOfMonthDate )
    .get()
    .then((snap) => {
      total = snap.size;
      paginate = Math.ceil(total / perPage);
      console.log(total);
      createPaginateButton(paginate,year,m);

      return db
        .collection('transactions')
        .where('type', '==', 'borrow_pay')
        .where("date", ">=", startOfMonthDate )
        .where("date", "<=", endOfMonthDate )
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
          amountWithdrow: doc.data().amount_withdraw,
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
 function getSelectMonth(years,m) {
  //console.log(m);
  const date = new Date()
  date.setFullYear(years, m-1, 1);
  
  console.log(date);
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
function clearTable() {
  let table = document.getElementById('myTable').getElementsByTagName('tbody')[0];
  table.innerHTML = '';
  let page = document.getElementById('pagination');
  page.innerHTML = '';
}
function createPaginateButton(totalPage,year,m) {
  for (let i = 1; i <= totalPage; i++) {
    let el = document.createElement('li');
    let a = document.createElement('a');

    setListElement(el, a, i,year,m);
  }
}

function clearListElement() {
  let el = document.getElementById('myTable').getElementsByTagName('tbody')[0];
  el.innerHTML = '';
}

function setListElement(el, a, i,year,m) {
  el.classList.add('page-item');
  el.onclick = queryFromFirbaseWithOffset(i,year,m);
  a.classList.add('page-link');
  a.innerText = `${i}`;
  a.href = '#';
  el.append(a);
  document.getElementById('pagination').appendChild(el);
}

function clearListPaginationElement() {
  document.getElementById('pagination').innerHTML = '';
}

function queryFromFirbaseWithOffset(i,year,m) {
  return function () {
    let indexOf = (i - 1) * pageSize;
    let last;
    let transactions = [];
    let perPage = 8;
    const [startOfMonthDate, endOfMonthDate] =  getSelectMonth(year,m)
    console.log(year,m);
    db.collection('transactions')
    .where('type', '==', 'borrow_pay')
    .where("date", ">=", startOfMonthDate )
    .where("date", "<=", endOfMonthDate )
      .orderBy('date', 'desc')
      .get()
      .then((data) => {
        last = data.docs[indexOf];
        return;
      })
      .then(() => {
        db.collection('transactions')
        .where('type', '==', 'borrow_pay')
        .where("date", ">=", startOfMonthDate )
        .where("date", "<=", endOfMonthDate )
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
                amountWithdrow: doc.data().amount_withdraw,
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
              console.log(transactions[i].firstName);
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
    //cell6 = row.insertCell(5);
    //cell7 = row.insertCell(6);

    cell1.innerHTML = `${dayjs(transactions[i].date).format('DD/MM/YYYY')}`;
    cell2.innerHTML = `${transactions[i].personalId}`;
    cell3.innerHTML = `${transactions[i].firstName}`;
    if(transactions[i].type == 'borrow_pay'){
        cell4.innerHTML = 'ชำระเงินกู้'
    }
    cell5.innerHTML = `${transactions[i].amount}`;

  }
}
