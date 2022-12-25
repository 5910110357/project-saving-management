window.addEventListener('load', async function () {
  const name = document.getElementsByClassName('profile-username');
  const email = document.getElementsByClassName('profile-email');
  const amountTotal = document.getElementsByClassName('detail-amount'); //งบประมาณทั้งหมด
  const amountuser = document.getElementsByClassName('detail-amount-user'); //ยอดเงินของคุณ
  const amountMonth = document.getElementsByClassName('detail-amount-month'); //ยอดเงินเดือน
  const amountYear = document.getElementsByClassName('detail-amount-year'); //ยอดเงินปี

  const elements = document.getElementsByClassName('list-menu-img-admin');
  const userMenu = document.getElementsByClassName('list-menu-img-user');
  const adminTotalLabel = document.getElementsByClassName('detail-title'); //เมนูยอดเงิน แอดมิน
  const userTotalLabel = document.getElementsByClassName('detail-title-user'); //เมนูยอดเงินของคุณ

  if (!localStorage.user && !localStorage.FBIdToken) {
    window.location.href = './home.html';
    //window.alert('ท่านไม่ใช่เจ้าหน้าที่');
  }
  //user
  if (localStorage.user && !localStorage.budgets) {
    const userDetail = JSON.parse(localStorage.user);

    getBudgetsUsers(name, email,  amountuser, userDetail);
    userTotalLabel[0].classList.add('active');

    visibleItems(userMenu, 'list-menu-img-user', 'list-menu-img-user-active');
  } else if (localStorage.user && localStorage.budgets) {
    const userDetail = JSON.parse(localStorage.user);
    const budgets = JSON.parse(localStorage.budgets);

    name[0].innerHTML = `${userDetail.firstName} ${
      userDetail.lastName ? userDetail.lastName : ''
    }`;
    email[0].innerHTML = `${userDetail.email ? userDetail.email : ''} `;
    //amount[0].innerHTML = `${budgets.total} บาท`;
    amountuser[0].innerHTML = `${userDetail.amount} บาท`;
    userTotalLabel[0].classList.add('active');
    visibleItems(userMenu, 'list-menu-img-user', 'list-menu-img-user-active');
  }
 
  //แอดมิน
  
  if (localStorage.FBIdToken && !localStorage.budgets) {
    // const token = localStorage.FBIdToken;
    const userCreadentail = JSON.parse(localStorage.AutenticatedUser);
    // const decodedToken = parseJwt(token);
    let budgets = {};

    getBudgetsTotal(name, email, amountTotal, amountMonth, amountYear, userCreadentail);

    visibleItems(userMenu, 'list-menu-img-user', 'list-menu-img-user-active');
    visibleItems(elements, 'list-menu-img-admin', 'list-menu-img-admin-active');
    visibleItems(adminTotalLabel, 'detail-title','detail-title-active');
  } else if (localStorage.FBIdToken && localStorage.budgets) {
    let date = new Date();
    let year = date.getFullYear();
    //console.log(year);
    const userDetail = JSON.parse(localStorage.AutenticatedUser);
    const budgets = JSON.parse(localStorage.budgets);

    name[0].innerHTML = `${userDetail.firstName} ${
      userDetail.lastName ? userDetail.lastName : ''
    }`;
    email[0].innerHTML = `${userDetail.email ? userDetail.email : ''} `;
    amountTotal[0].innerHTML = `${budgets.year} บาท`;

    visibleItems(userMenu, 'list-menu-img-user', 'list-menu-img-user-active');
    visibleItems(elements, 'list-menu-img-admin', 'list-menu-img-admin-active');
  }

  
  await getMonthlyBudget() // เงินรวมยอดรายเดือน
  await getYearsBudget()  //เงินรวมยอดรายปี
  await getTotalBudget() //ยอดเงินรวมทั้งหมด
});

function getBudgetsUsers(name, email,  amountuser, userDetail) {
  let budgets = {};
  db.collection('budgets')
    .get()
    .then((data) => {
      // console.log();
      name[0].innerHTML = `${userDetail.firstName} ${
        userDetail.lastName ? userDetail.lastName : ''
      }`;
      email[0].innerHTML = `${userDetail.email ? userDetail.email : ''} `;
      //amount[0].innerHTML = `${data.docs[0].data().total} บาท`;

      if (amountuser) {
        amountuser[0].innerHTML = `${userDetail.amount} บาท`;
      }

      budgets = data.docs[0].data();
      budgets.id = data.id;

      localStorage.setItem('budgets', JSON.stringify(budgets));
    });
}

function getBudgetsTotal(name, email, amountTotal, amountMonth, amountYear, userDetail) {
  let budgets = {};
  db.collection('budgets')
    .get()
    .then((data) => {
      // console.log();
      name[0].innerHTML = `${userDetail.firstName} ${
        userDetail.lastName ? userDetail.lastName : ''
      }`;
      email[0].innerHTML = `${userDetail.email ? userDetail.email : ''} `;
      amountTotal[0].innerHTML = `${data.docs[0].data().total} บาท`;

      /*if (userTotal) {
        userTotal[0].innerHTML = `${userDetail.amount} บาท`;
      } */

      budgets = data.docs[0].data();
      budgets.id = data.id;

      localStorage.setItem('budgets', JSON.stringify(budgets));
    });
}

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}

function logout() {
  firebase.auth().signOut();
  localStorage.clear();
  window.location.href = '/login.html';
}

function hiddenItems(items) {
  for (const item of items) {
    item.classList.add('list-menu-user-hidden');
  }
}

function visibleItems(items, isClassName, className) {
  for (const item of items) {
    if (item.classList.contains(isClassName)) {
      item.classList.add(className);
    }
  }
}

function listMemberPage() {
  if (localStorage.user) {
    window.location.href = '/userProfile.html';
  } else if (localStorage.FBIdToken) {
    window.location.href = '/member.html';
  }
}


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