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
  //initailUserTable();
  await getTotalBudgetQueue(); //ยอดเงินรวมทั้งหมดเงินกู้
  if(localStorage.user) {
    await getUserProfile(localStorage.user);
    await getUserValueTable(localStorage.user);

  }
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


function listOrderButton() {
  document.getElementsByClassName('list-menu')[0].classList.remove('hide');
  document.getElementsByClassName('list-menu')[0].classList.remove('active');
  document.getElementsByClassName('order-form')[0].classList.add('hide');
  document.getElementsByClassName('order-form')[0].classList.add('active');
}
async function formBotton() {
  document.getElementsByClassName('list-menu')[0].classList.add('hide');
  document.getElementsByClassName('list-menu')[0].classList.add('active');
  document.getElementsByClassName('order-form')[0].classList.remove('hide');
  document.getElementsByClassName('order-form')[0].classList.remove('active');
  //await getUserValueTable();
}
async function getUserValueTable() {
  if(localStorage.user) {
    const pofile = JSON.parse(localStorage.user);
    const personal_id = document.getElementById('personal_id').value = pofile.id;
    console.log(personal_id);
    const firstName = document.getElementById('first_name').value = pofile.firstName;
    const lastName = document.getElementById('last_name').value = pofile.lastName;
    const amount = document.getElementById('amount').value;
    return {personal_id, firstName, lastName, amount};
  }
  
}
async function submit() {
  let userDetail = await getUserValueTable();
  const budgetQ = db.collection('money_borrow');
  console.log(userDetail);

  const newQueues = db.collection('queues');
  if (!isPersonalNumber(userDetail.personal_id)) {
    window.alert('หมายเลขไม่ถูกต้อง');
    return;
  }
  if (!isNumber(userDetail.amount)) {
    window.alert('จำนวนเงินไม่ถูกต้อง');
    return;
  }

  if (!localStorage.user) {
    window.alert('ท่านมิใช้ผู้ใช้งานทั่วไป');
    return;
  }

  if (userDetail. personal_id !== JSON.parse(localStorage.user).id) {
    window.alert('โปรดระบุหมายเลขบัตรเฉพาะของท่าน');
    return;
  }
  
  db.collection('borrows')
    .where('userId', '==', userDetail.personal_id)
    .get()
    .then((data) => {
      if (!data.empty) {
        window.alert('ท่านมีรายชื่อของการกู้มาก่อน');
        throw new Error('invalid transaction');
      }
      return db.collection('queues').where('personalId', '==', userDetail.personal_id).get();
    })
    .then((doc) => {
      if (doc.empty) {
        //window.alert('ท่านได้ทำการจองคิวไปแล้ว กรุณาเช็คที่คิวของท่าน');
        return db.doc(`users/${userDetail.personal_id}`).get();
      }
      else {
        window.alert('ท่านได้ทำการจองคิวไปแล้ว กรุณาเช็คที่คิวของท่าน');
        throw new Error('invalid transaction');
      } 
    })
    .then(() => {
      return budgetQ.get();
    })
     //return db.collection('money_borrow').get();
    .then((data) => {
        //console.log(budgetQ.data());
        return budgetQ.doc(data.docs[0].id).update({
          amount: data.docs[0].data().amount - userDetail.amount * 1,
          date: new Date().toISOString()
        });
    })
    
    .then(() => {
        return newQueues.add({
          personalId: userDetail.personal_id.trim(),
          createdAt: new Date().toISOString(),
          amount: userDetail.amount * 1
        });
    })
   
    .then(() => {
      //document.getElementById('personal_id').value = '';
      document.getElementById('amount').value = '';
      //clearListElement();
      //clearListPaginationElement();
      //initailUserTable();
      setUserOrdernumber();
      return;
    })
    .then(() => {
      if(localStorage.user) {
      window.alert('จองเรียบร้อย');
        listOrderButton()
        getUserProfile(localStorage.user)
        window.location.href = './booK_a_loan.html'
      }
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
  if (number.match(regEx) && number * 1 >= 500) {
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


//งบประมาณ
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

function getUserProfile(user) {
  const pofile = JSON.parse(user);
  const name = document.getElementById('user-name');
  const personal_id = document.getElementById('user-personal-number');
  const telnumber = document.getElementById('user-telnumber');

  name.innerHTML = `${pofile.firstName} ${pofile.lastName}`;
  personal_id.innerHTML = `${format('X XXXX XXXXX XX X', pofile.id)}`;
  telnumber.innerHTML = `${format('XXX-XXX XXXX' , pofile.telNumber)}`;
  myFunctionQueue(pofile.id);
  setUserOrdernumber(localStorage.user)
  
}

function format(mask, number) {
  var s = '' + number,
    r = '';
  for (var im = 0, is = 0; im < mask.length && is < s.length; im++) {
    r += mask.charAt(im) == 'X' ? s.charAt(is++) : mask.charAt(im);
  }
  return r;
}

function myFunctionQueue(personal_id){
  console.log(personal_id);
  db.collection('queues')
    .where('personalId', '==', personal_id)
    .get()
    .then((snap) => {
      total = snap.size;
      console.log(total);

      return db.collection('queues')
              .where('personalId', '==', personal_id)
              .get();
    })
    .then((data) => {
      data.forEach((doc) => {
        console.log(doc.data().amount);
        const data_queue = doc.data();
        const queue = document.getElementById('user-queue');
        queue.innerHTML = data_queue.amount + '  บาท';
        const queue_date = document.getElementById('user-queue-date');
        queue_date.innerHTML = dayjs(data_queue.createdAt).format('D MMM YYYY');
      })  
    })
}
function setUserOrdernumber(user) {
  if (localStorage.user) {
    const numberOrder = document.getElementsByClassName('number')[0];
    const cancel = document.getElementsByClassName('fa-trash')[0];
    const btn = document.getElementsByClassName('cancel_btn')[0];
    const num = document.getElementsByClassName('order-number')[0];
    const user_queue = document.getElementsByClassName('user-queue')[0];
    const user_queue_date = document.getElementsByClassName('user-queue-date')[0];
    const button = document.getElementsByName('btn-menu-order')[0];
    let orderNumer = 0;
    let exist = false;
    const userOrder = JSON.parse(localStorage.user);

    db.collection('queues')
      .orderBy('createdAt', 'asc')
      .get()
      .then((data) => {
        const { docs } = data;
        console.log({ docs });
        for (let i = 0; i < docs.length; i++) {
          orderNumer++;
          if (docs[i].data().personalId === userOrder.id) {
            exist = true;
            
            break;
          }
        }
        if (exist) {
          numberOrder.innerHTML = orderNumer;
          cancel.classList.remove('hide');
          btn.classList.remove('hide');
          num.classList.remove('hide');
          user_queue.classList.add('hide');
          user_queue_date.classList.add('hide');
          button.classList.add('hide');
        }
      });
  }
}

async function cancel() {
  if (localStorage.user) {
    const user = JSON.parse(localStorage.user);
  
    const ids = await db.collection('queues').where('personalId', '==', user.id).get();
    for(const collectionids of ids.docs) {
      console.log(collectionids.data().amount);
      //console.log(sum);
      amountids = collectionids.data().amount;
    }
    
    const userQueue = await db.collection('money_borrow').get();
    for(const collectionuserQueue of userQueue.docs) {
      console.log(collectionuserQueue.data().amount);
      //console.log(sum);
      amountQueue = collectionuserQueue.data().amount;
      console.log(amountQueue);
      console.log(amountids);
      db.collection('money_borrow').doc(collectionuserQueue.id)
        .update({
          amount: amountids + amountQueue * 1,
          date: new Date().toISOString()
        }); 
    }
    for(const collectionids of ids.docs) {
      console.log(collectionids.data().amount);
      //console.log(sum);
      amountids = collectionids.data().amount;
      db.collection('queues').doc(collectionids.id).delete()
        .then(() => {
          alert("ลบสำเร็จ");
          window.location.href = './booK_a_loan.html'
        })
         //return db.collection('money_borrow').get();
        .catch((error) => {
          console.error("Error removing document: ", error);
        })
      }
      

     /*try{
      const ids = await db.collection('queues')
                  .where('personalId', '==', user.id)
                  .get();
      for(const collection of ids.docs) {
        console.log(collection.id);

        db.collection('queues').doc(collection.id).delete()
        .then(() => {
          alert("ลบสำเร็จ");
          window.location.href = './booK_a_loan.html'
        })
         //return db.collection('money_borrow').get();
        .catch((error) => {
          console.error("Error removing document: ", error);
        })
      }
     }
     catch (error) {
      console.log(error);
    }*/
      
     
  }
}