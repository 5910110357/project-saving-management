let pageSize = 8;
let currentPage = 1;
let total;
let paginate;
window.addEventListener('load', async function () {

    initailUserTable(localStorage.user);
    await getUserProfile(localStorage.user)
  });
  
  
  function logout() {
    firebase.auth().signOut();
    localStorage.clear();
    window.location.href = '/index.html';
  }

  //home users
async  function getUserProfile(user) {
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


//table
function initailUserTable(user) {
  const pofile = JSON.parse(user);
  let perPage = 8;
  let transactions = [];
  console.log(pofile.id);
  db.collection('transactions')
    .where('personalId', '==', pofile.id)
    .where('type', 'in', ['deposited', 'withdrawn'])
    .get()
    .then((snap) => {
      total = snap.size;
      paginate = Math.ceil(total / perPage);
      //console.log(total);
      createPaginateButton(paginate,pofile);

      return db
        .collection('transactions')
        .where('personalId', '==', pofile.id)
        .where('type', 'in', ['deposited', 'withdrawn'])
        .orderBy('date', 'desc')
        .limit(`${perPage}`)
        .get();
    })
    .then((data) => {
      //console.log(data.size);
      data.docs.forEach((doc) => {
        transactions.push({
          id: doc.id,
          personalId: doc.data().personalId,
          type: doc.data().type,
          amount: doc.data().amount,
          amountWithdrow: doc.data().amount_withdraw,
          amountTotal: doc.data().amount_total,
          date: doc.data().date
        });
      });
      return;
    })
    .then(async () => {
      for (let i = 0; i < transactions.length; i++) {
        //console.log(transactions[i].personalId);
        let user = await db.doc(`users/${transactions[i].personalId}`).get();
        transactions[i].firstName = user.data().firstName;
        transactions[i].lastName = user.data().lastName;
        //console.log(transactions[i].firstName);
      }
    })
    .then(() => {
      insertTable(transactions, 0);
    })
    .catch((err) => {
      console.error(err);
    });
}

function createPaginateButton(totalPage,pofile) {
  for (let i = 1; i <= totalPage; i++) {
    let el = document.createElement('li');
    let a = document.createElement('a');

    setListElement(el, a, i,pofile);
  }
}

function clearListElement() {
  let el = document.getElementById('myTable').getElementsByTagName('tbody')[0];
  el.innerHTML = '';
}

function setListElement(el, a, i,pofile) {
  el.classList.add('page-item');
  el.onclick = queryFromFirbaseWithOffset(i,pofile);
  a.classList.add('page-link');
  a.innerText = `${i}`;
  a.href = '#';
  el.append(a);
  document.getElementById('pagination').appendChild(el);
}

function clearListPaginationElement() {
  document.getElementById('pagination').innerHTML = '';
}

function queryFromFirbaseWithOffset(i,pofile) {
  return function () {
    let indexOf = (i - 1) * pageSize;
    let last;
    let transactions = [];
    let perPage = 8;

    db.collection('transactions')
    .where('personalId', '==', pofile.id)
    .where('type', 'in', ['deposited', 'withdrawn'])
      .orderBy('date', 'desc')
      .get()
      .then((data) => {
        last = data.docs[indexOf];
        return;
      })
      .then(() => {
        db.collection('transactions')
        .where('personalId', '==', pofile.id)
        .where('type', 'in', ['deposited', 'withdrawn'])
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
                amountTotal: doc.data().amount_total,
                date: doc.data().date
              });
            });
            return;
          })
          .then(async () => {
            for (let i = 0; i < transactions.length; i++) {
              //console.log(transactions[i].personalId);
              let user = await db.doc(`users/${transactions[i].personalId.trim()}`).get();
              transactions[i].firstName = user.data().firstName;
              transactions[i].lastName = user.data().lastName;
            }
          })
          .then(async () => {
            for (let i = 0; i < transactions.length; i++) {
              console.log(transactions[i].personalId);
              let usersBorrow = await db.collection('borrows')
              .where('personalId', '==', transactions[i].personalId)
              .get();
              transactions[i].total_amount_pay = usersBorrow.docs.map(doc => doc.data().total_amount_pay);
            }
          })
          .then(() => {
            insertTable(transactions, indexOf);
          });
      });
  };
}

function insertTable(transactions, id) {
  let cell1, cell2, cell3, cell4;
  let row;
  var tbodyRef = document
    .getElementById('myTable')
    .getElementsByTagName('tbody')[0];
  
  for (let i = 0; i < transactions.length; i++, id++) {
    row = tbodyRef.insertRow(tbodyRef.rows.length);
    cell1 = row.insertCell(0);
    cell2 = row.insertCell(1);
    cell3 = row.insertCell(2);
    cell4 = row.insertCell(3);
  
    cell1.innerHTML = `${dayjs(transactions[i].date).format('DD/MM/YYYY')}`;
    if(transactions[i].type == 'deposited') {
      cell2.innerHTML = 'ฝากเงิน';
      //cell2.style.backgroundColor = "lightblue";
      cell3.innerHTML = `${transactions[i].amount}`;
    }
    else if(transactions[i].type == 'withdrawn'){
      cell2.innerHTML = 'ถอนเงิน';
      cell1.style.backgroundColor = "#ffffcc";
      cell2.style.backgroundColor = "#ffffcc";
      cell3.style.backgroundColor = "#ffffcc";
      cell4.style.backgroundColor = "#ffffcc";
      cell3.innerHTML = `${transactions[i].amountWithdrow}`;
    }
    cell4.innerHTML = `${transactions[i].amountTotal}`;
   

  }
}