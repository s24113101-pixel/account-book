async function loadData() {

  const res = await fetch("/api/accounts");

  if (res.status === 401) {
    alert("請先登入");
    location.href = "login.html";
    return;
    loadData();
  }

  const data = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(item => {
    list.innerHTML += `
      <li>
        ${item.type} -
        ${item.amount > 0 ? "收入 " + item.amount : "支出 " + Math.abs(item.amount)}元 -
        ${item.note}
        ${item.date || ""}
        <button onclick="del('${item._id}')">刪除</button>
      </li>
    `;
  });

  calc(data);
}

async function add() {

  const category = document.getElementById("category").value;
  const flowType = document.getElementById("flowType").value;
  const amount = Number(document.getElementById("amount").value);
  const note = document.getElementById("note").value;
 

  // 
  let finalAmount = amount;

  if (flowType === "expense") {
    finalAmount = -Math.abs(amount);
  }

  await fetch("/api/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: category,
      amount: finalAmount,
      note,
    })
  });

  
  loadData();
}

async function del(id) {

  await fetch("/api/accounts/" + id, {
    method: "DELETE"
  });

  loadData();
}

async function logout() {

  await fetch("/api/logout", {
    method: "POST"
  });

  location.href = "login.html";
}

loadData();
function calc(data) {
  let income = 0;
  let expense = 0;

  data.forEach(item => {
    if (item.amount > 0) {
      income += Number(item.amount);
    } else {
      expense += Number(item.amount);
    }
  });

  document.getElementById("income").innerText = income;
  document.getElementById("expense").innerText = expense;
  document.getElementById("balance").innerText = income + expense;
}