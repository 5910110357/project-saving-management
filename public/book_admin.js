let pageSize = 8;
let currentPage = 1;
let total;
let paginate;

window.addEventListener('load', async function () {
  const name = document.getElementsByClassName('profile-username');
  const email = document.getElementsByClassName('profile-email');
  const amount = document.getElementsByClassName('detail-amount');
  //document.getElementById('form1').addEventListener('input', changeValueSearch);

  //   setUserDetail(name, email, amount);
  // ลำดับของผู้ใช้
  await getTotalBudgetQueue(); //ยอดเงินรวมทั้งหมดเงินกู้
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
          createdAt: doc.data().createdAt,
          amount: doc.data().amount
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
                createdAt: doc.data().createdAt,
                amount: doc.data().amount
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

async function insertTable(users, num) {
  let cell1, cell2, cell3, cell4, cell5, cell6, cell7;
  let row;
  var tbodyRef = document
    .getElementById('myTable')
    .getElementsByTagName('tbody')[0];
  
  for (let i = 0; i < users.length; i++, num++) {
    row = tbodyRef.insertRow(tbodyRef.rows.length);

    cell1 = row.insertCell(0);
    cell2 = row.insertCell(1);
    cell3 = row.insertCell(2);
    cell4 = row.insertCell(3);
    cell5 = row.insertCell(4);
    cell6 = row.insertCell(5);
    cell7 = row.insertCell(6);

    cell1.innerHTML = `${num + 1}`;
    cell2.innerHTML = `${users[i].firstName}`;
    cell3.innerHTML = `${users[i].lastName}`;
    cell4.innerHTML = `${users[i].amount}`;
    cell5.innerHTML = `${dayjs(users[i].createdAt).format('DD/MM/YYYY')}`;
    
    //ปุ่มสำเร็จ
    let btn_success = document.createElement('button')
    btn_success.textContent = "สำเร็จ"
    btn_success.setAttribute('class', 'btn-success')
    btn_success.setAttribute('data-id', users[i].id)
    cell6.appendChild(btn_success)
    btn_success.addEventListener('click', (e)=> {
      let id = e.target.getAttribute('data-id');
      console.log(id);
      //deleteDoc(doc(db, 'queues', id))
      db.collection('queues').doc(id).delete()
        .then(() => {
          alert("ทำรายการสำเร็จ");
          window.location.href = './booK_admin.html'
        })
        .catch((error) => {
          console.error("Error removing document: ", error);
        })
    })

    //ปุ่มcancel
   
      const collections 
      = await db.collection('money_borrow').get();
      let sumAmount = collections.docs.map(doc => doc.data().amount);
      let sumId = collections.docs.map(doc => doc.id);
      
    
    let btn_cancel = document.createElement('button')
    btn_cancel.textContent = "ยกเลิก"
    btn_cancel.setAttribute('class', 'btn-warning')
    btn_cancel.setAttribute('data-id', users[i].id)
    btn_cancel.setAttribute('data-amount', users[i].amount)
    btn_cancel.setAttribute('budgets-amount', sumAmount)
    btn_cancel.setAttribute('budgets-amount-id', sumId)
    cell7.appendChild(btn_cancel)
    btn_cancel.addEventListener('click', (e)=> {
      let id = e.target.getAttribute('data-id');
      console.log(id);

        let data_amount = e.target.getAttribute('data-amount');
        console.log(data_amount);
        let budgets_amount = e.target.getAttribute('budgets-amount');
        console.log(budgets_amount);
        let budgets_amount_id = e.target.getAttribute('budgets-amount-id');
        console.log(budgets_amount_id);
        db.collection('money_borrow').doc(budgets_amount_id)
        .update({
          amount: (data_amount *1) + (budgets_amount * 1),
          date: new Date().toISOString()
        }); 
        db.collection('queues').doc(id).delete()
        .then(() => {
          alert("ยกเลิกรายการสำเร็จ");
          window.location.href = './booK_admin.html'
        })
         //return db.collection('money_borrow').get();
        .catch((error) => {
          console.error("Error removing document: ", error);
        })
     })
    
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
async function getTotalBudgetQueue(){
    const amountTotal = document.getElementsByClassName('detail-amount-total'); //ยอดเงินกู้ทั้งหมด
    const amount = document.getElementsByClassName('detail-amount'); //ยอดเงินกู้คงเหลือ
    //let date = new Date();
    //let year = date.getFullYear();
    //let year = 2019
    try {
      const collections 
      = await db.collection('money_borrow').get();
      let sumTotal = collections.docs.map(doc => doc.data().amount_total);
      let sum = collections.docs.map(doc => doc.data().amount);
        //console.log(collection.data().date.split("T")[0]);
        console.log(sumTotal);
      
        amountTotal[0].innerHTML  = sumTotal + " บาท"
        amount[0].innerHTML  = sum + " บาท"
      //console.log("transactions", collection.docs[0].data());
    } 
    catch (error) {
      console.log(error);
    }
  }