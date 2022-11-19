let API = "http://localhost:8007/posts";

let search = document.querySelector(".search-box");
document.querySelector("#search-icon").onclick = () => {
  search.classList.toggle("active");
};

let header = document.querySelector("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("shadow", window.scrollY > 0);
});

let navbar = document.querySelector(".navbar");
document.querySelector("#menu-icon").onclick = () => {
  navbar.classList.toggle("active");
  search.classList.remove("active");
};

window.onscroll = () => {
  search.classList.remove("active");
  navbar.classList.remove("active");
};

let registr = document.querySelector("#registr");
// registr.addEventListener("click", function {

// })

// ----------------------------
//! CRUD

let inp = document.querySelector(".inp");
let title = document.querySelector("#title");
let price = document.querySelector("#price");
let descr = document.querySelector("#descr");
let image = document.querySelector("#image");
let btnAdd = document.querySelector("#btn-add");

//? Инпуты из модалки
let editTitle = document.querySelector("#edit-title");
let editPrice = document.querySelector("#edit-price");
let editDescr = document.querySelector("#edit-descr");
let editImage = document.querySelector("#edit-image");
let editSaveBtn = document.querySelector("#btn-save-edit");
let exampleModal = document.querySelector("#exampleModal");

//? Pagination
let currentPage = 1;
let pageTotalCount = 1;
let paginationList = document.querySelector(".pagination-list");
let prev = document.querySelector(".prev");
let next = document.querySelector(".next");

//? SEARCH
let searchInp = document.querySelector("#search");
let searchVal = "";

//? Блок куда добавляется
let list = document.querySelector("#products-list");

//! ADD - Обработчик событий на добавление
btnAdd.addEventListener("click", async function () {
  //Собираем объект для добавления в дб.жсон
  let obj = {
    title: title.value,
    price: price.value,
    descr: descr.value,
    image: image.value,
  };

  // Проверим - создается ли он
  console.log(obj);

  if (
    !obj.title.trim() ||
    !obj.price.trim() ||
    !obj.descr.trim() ||
    !obj.image.trim()
    // trim указывает и удаляет пробелы
  ) {
    alert("Заполните все поля!");
    return;
  }
  //! Запрос на добавления

  await fetch(API, {
    //fetch  Имеет параметр get
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "Content-type": "application/json",
    },
  });
  title.value = "";
  price.value = "";
  descr.value = "";
  image.value = "";

  render();
});
//! отображение из json-server
async function render() {
  // функция render рисует карточки
  let products = await fetch(
    `${API}?q=${searchVal}&_page=${currentPage}&_limit=3` //вытени данные из серчвал и позв
  )
    .then((res) => res.json()) // json позволяет  обработать последний промис
    .catch((err) => console.log(err)); // ОТловим ошибку
  drawPaginationButtons();

  console.log(products);
  list.innerHTML = "";
  products.forEach((element) => {
    console.log(element);
    let newElem = document.createElement("div");
    newElem.id = element.id;
    newElem.innerHTML = `
    <div class="card m-5" style="width: 18rem;">
    <img src=${element.image} class="card-img-top" alt="...">
    <div class="card-body">
      <h5 class="card-title">${element.title}</h5>
      <p class="card-text">${element.descr}</p>
      <p class="card-text">$ ${element.price}</p>
      <a href="#" id=${element.id} class="btn btn-danger btn-delete">DELETE</a>
      <a href="#" data-bs-toggle="modal" data-bs-target="#exampleModal" id=${element.id} class="btn btn-dark btn-edit">EDIT</a>
      <a href="#" id=${element.id} class="btn btn-warning btn-cart">🛒</a>
    </div>
  </div>`;
    list.prepend(newElem);
  });
}
render();

//! Удаление продукта
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-delete")) {
    let id = e.target.id;
    await fetch(`${API}/${id}`, {
      method: "DELETE",
    });
    render(); //Асинхронная
  }
});

//! EDIT Редактирование продукта
//? Открываем модалку и делаем запрос на id  и заполняем поля в модалке
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-edit")) {
    let id = e.target.id;
    fetch(`${API}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        editTitle.value = data.title;
        editPrice.value = data.price;
        editDescr.value = data.descr;
        editImage.value = data.image;
        editSaveBtn.setAttribute("id", data.id);
      });
  }
});

editSaveBtn.addEventListener("click", function (e) {
  let id = this.id;
  let title = editTitle.value;
  let price = editPrice.value;
  let descr = editDescr.value;
  let image = editImage.value;

  if (!title || !descr || !image || !price) {
    return;
  }
  let editProduct = {
    title: title,
    price: price,
    descr: descr,
    image: image,
  };
  saveEdit(editProduct, id);
});

//! функция запроса для сохранения
function saveEdit(editedProduct, id) {
  fetch(`${API}/${id}`, {
    method: "PATCH", //Patch обновляет
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(editedProduct),
  }).then(() => {
    render();
  });
  let modal = bootstrap.Modal.getInstance(exampleModal);
  modal.hide();
}

// todo PAGINATION // выводит на странице по 3 элемента
function drawPaginationButtons() {
  fetch(`${API}?q=${searchVal}`)
    .then((res) => res.json())
    .then((data) => {
      pageTotalCount = Math.ceil(data.length / 3); //* ceil - округляет
      // общее количество продуктов делим на кол-во продуктов которые отображаются на одной странице
      //pageTotalCount = кол-во страниц
      paginationList.innerHTML = "";
      for (let i = 1; i <= pageTotalCount; i++) {
        // создаем кнопки с цифрами
        if (currentPage == i) {
          let page1 = document.createElement("li");
          page1.innerHTML = `<li class="page-item active">
          <a class="page-link page_number" href="#">${i}</a>
      </li>
  `;
          paginationList.append(page1); //прибавляет к существ странице аpend
        } else {
          let page2 = document.createElement("li");
          page2.innerHTML = `<li class="page-item ">
          <a class="page-link page_number" href="#">${i}</a>
      </li>
  `;
          paginationList.append(page2);
        }
      }

      if (currentPage == 1) {
        prev.classList.add("disabled");
      } else {
        prev.classList.remove("disabled");
      }

      if (currentPage == pageTotalCount) {
        next.classList.add("disabled");
      } else {
        next.classList.remove("disabled");
      }
    });
}

prev.addEventListener("click", () => {
  if (currentPage <= 1) {
    return;
  }
  currentPage--;
  render();
});

next.addEventListener("click", () => {
  if (currentPage >= pageTotalCount) {
    return;
  }
  currentPage++;
  render();
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("page_number")) {
    //таргет указывает то место куда мы кликнули
    currentPage = e.target.innerText;
    render();
  }
});

//! SEARCH
searchInp.addEventListener("input", () => {
  searchVal = searchInp.value; //Записывает значение поисковика в переменную searchVal
  currentPage = 1;
  render();
});

//TODO -----------CART-------------
let modalCart = document.querySelector(".modal-cart");
let cartBtn = document.querySelector(".btn-cart");

function getDataFromLs() {
  if (!localStorage.getItem("products")) {
    localStorage.setItem("products", "[]");
  }
  let data = JSON.parse(localStorage.getItem("products"));
  return data;
}
getDataFromLs();
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-cart")) {
    let id = e.target.id;
    setCart(id);
  }
});

async function setCart(id) {
  await fetch(`${API}/${id}`)
    .then((res) => res.json())
    .then((data) => {
      let products = getDataFromLs();
      products.push(data);
      // console.log(products);
      localStorage.setItem("products", JSON.stringify(products));
    });
}

cartBtn.addEventListener("click", function () {
  let products = getDataFromLs();
  let newElem = document.createElement("table");
  let newBox = document.createElement("div");
  newBox.innerHTML += `
  <img
            src="https://cdn.shopify.com/s/files/1/0554/6301/8688/products/RUDYSUMMER-24.jpg?v=1651499192"
            alt=""
          />
          <h3>Mayork</h3>
          <div class="content">
            <span>$98</span>
            <a href="#" class="btn-cart">Add to cart</a>
          </div>`;
  newElem.innerHTML += `
    <thead>
    <tr>
      <th>Image</th>
      <th>Title </th>
      <th>Price</th>
      <th>Descr</th>
    </tr>
  </thead>`;
  modalCart.append(newBox);
  products.forEach((e) => {
    let elem = drawItemLS(e);
    newElem.innerHTML += elem;
  });
  modalCart.append(newElem);
});

function drawItemLS(obj) {
  return `
  <tr>
      <th><img src=${obj.image} widht="100px" height="100px" /></th>
    </tr>
    <tr>
      <th>${obj.title}</th>
    </tr>
    <tr>
      <th>${obj.price}</th>
    </tr>
    <tr>
      <th>${obj.descr}</th>
    </tr>
    
      <button class="btn btn-danger btn-del" type="button" id=${obj.id}>
        Delete
      </button>`;
}
