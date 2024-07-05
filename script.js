console.log("Let's write java script")


let currentItems = []; 
//an empty array 
let totalCost = 0;

async function cuisines() {
    console.log("entered to load cuisines")

    //we wait till the cards are fetched from the folder 
    let menu_cards = await fetch(`/Cards/`)


    // console.log(menu_cards) //we gethttp://127.0.0.1:3000/Cards/

    //read the response body and return it as a string.
    let response = await menu_cards.text();


    let div = document.createElement('div')
    div.innerHTML = response;
    // console.log(div.innerHTML);

    //our cards are in this anchor tags
    let a = div.getElementsByTagName("a");
    // console.log(a);
    //a HTML collection is returned not an array so can't use for method so we can convert it to array

    let arr_cards = Array.from(a);
    // console.log(arr_cards); 
    //now its an array

    //we also need the div in which these cards are needed to be added
    let all_cards = document.querySelector(".all_cards")


    for (let i = 0; i < arr_cards.length; i++) {
        const element = arr_cards[i];
        // console.log(element) 
        // element < a href="\Cards\Greek/">Greek/</a>


        if (element.href.includes('/Cards')) {
            let folder = element.href.split("/").slice(-2)[0]
            //we get[Ggreek',''] hence [0]th index


            let data = await fetch(`/Cards/${folder}/info.json`)
            //console.log(data) //we get the url for the folder 
            let response = await data.json();
            //console.log(response) //we get a object(of js) title and items in the json file

            let card = document.createElement('div');


            //The add method of classList adds the specified class value ('card' in this case) to the element.
            card.classList.add('card');  
            card.dataset.folder = folder;



            card.innerHTML = `
                <img src="/Cards/${folder}/${folder}_cuisine.avif" alt="">
                <div>${response.title}</div>
                <div>${response.description}</div>
            `;
            card.addEventListener('click', () => displayMenuItems(folder));
            all_cards.appendChild(card);
            
            


        }


    }


}
async function displayMenuItems(folder) {
    let data = await fetch(`/Cards/${folder}/info.json`);
    let response = await data.json();

    let all_cards = document.querySelector(".all_cards");
    let menu_items = document.querySelector(".menu_items");
    let back_button = document.querySelector(".back_button");

    all_cards.style.display = "none";
    menu_items.style.display = "grid";
    back_button.style.display = "block";

    menu_items.innerHTML = ""; // Clear previous items

    response.items.forEach(item => {
        let currmenuItem = document.createElement('div');

        //currmenuItem is the div in which we will be adding class menu_item
        currmenuItem.classList.add('menu_item'); 

        //div content is to be filled
        currmenuItem.innerHTML = `
           <img src="${item.image}" alt="${item.name}" >
            <div class="menu_info">
                <div class="menu_content ">
                  <div>${item.name} </div>
                  <div> ${item.price} </div>
                </div >
                <div class="quantity_controls" style="display:none;">
                    <button class="decrease_button">-</button>
                    <span class="quantity">1</span>
                    <button class="increase_button">+</button>
                </div>
                <button class="add_button">Add</button>
            </div>
        `;

        //menu_items contains all the dishes names

        let addButton=currmenuItem.querySelector('.add_button') //all buttons with add_button class
        let quantityControls = currmenuItem.querySelector('.quantity_controls');
        let increaseButton = currmenuItem.querySelector('.increase_button');
        let decreaseButton = currmenuItem.querySelector('.decrease_button');
        let quantityDisplay = currmenuItem.querySelector('.quantity');
        
        //item is the each dish, currmenuItem is the card which has price...
        addButton.addEventListener('click', () => {
            addItem(item);
            addButton.style.display = 'none';
            quantityControls.style.display = 'flex';
        });

        increaseButton.addEventListener('click', () => {
            let quantity = parseInt(quantityDisplay.textContent, 10);
            quantity++;
            quantityDisplay.textContent = quantity;
            updateItem(item, quantity);
        });
        
        decreaseButton.addEventListener('click', () => {
            let quantity = parseInt(quantityDisplay.textContent, 10);
            quantity--;
            if (quantity === 0) {
                quantityControls.style.display = 'none';
                addButton.style.display = 'block';
                removeItem(item);
            } else {
                quantityDisplay.textContent = quantity;
                updateItem(item, quantity);
            }
        });
        menu_items.appendChild(currmenuItem);

        

    });

    
    back_button.onclick = () => {
        all_cards.style.display = "flex";
        menu_items.style.display = "none";
        back_button.style.display = "none";
    };

}
function addItem(item){
    let existingItem = currentItems.find(i => i.name === item.name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        item.quantity = 1;
        currentItems.push(item);
    }
    totalCost += parseFloat(item.price.replace('₹', ''));
    updateItems();
}

function updateItem(item, quantity) {
    let existingItem = currentItems.find(i => i.name === item.name);
    if (existingItem) {
        totalCost += parseFloat(item.price.replace('₹', '')) * (quantity - existingItem.quantity);
        existingItem.quantity = quantity;
    }
    updateItems();
}

function removeItem(item) {
    let existingItem = currentItems.find(i => i.name === item.name);
    if (existingItem) {
        totalCost -= parseFloat(item.price.replace('₹', '')) * existingItem.quantity;
        currentItems = currentItems.filter(i => i.name !== item.name);
    }
    updateItems();
}
function updateItems(){
    let ourlist=document.getElementById('currentItemsList');
    let ourcost=document.getElementById('totalCost');

    //our html for <ul id="currentItemsList"></ul> its ul

    ourlist.innerHTML='';//change the innerhtml
    currentItems.forEach(item=>{
        //currentItems is our array 
        let li=document.createElement('li');
        li.innerHTML=`
            <div class="item_name">${item.name}</div>
            <div class="item_price">${item.price} </div>
            <div>Quantity: ${item.quantity}</div>
        `;
        ourlist.appendChild(li); //li is the variable

    })
    ourcost.textContent=totalCost.toFixed(2);

}
async function SpecialItems() {
    // Fetch the items from the folder
    let response = await fetch('/Specials/specialItems.json');
    let specialItems = await response.json();

    let specialItemsContainer = document.getElementById('specialItemsBox');
    let currentItemIndex = 0;

    function showNextItem() {
        // Remove the active class from all items
        let items = specialItemsContainer.children;
        for (let item of items) {
            item.classList.remove('active');
        }

        // Adding the active class to the current item
        items[currentItemIndex].classList.add('active');

        // Update the current item index
        currentItemIndex = (currentItemIndex + 1) % items.length;
    }

    // NOw and append the items to the container
    specialItems.forEach(item => {
        let specialItemDiv = document.createElement('div');
        specialItemDiv.classList.add('special_item');
        specialItemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <p>${item.name}</p>
            
        `;
        specialItemsContainer.appendChild(specialItemDiv);
    });

    // Show the first item immediately
    showNextItem();

    // Set an interval to show the next item every 1 seconds
    setInterval(showNextItem, 3000);
}

async function main() {
    // we use async as to await the documents to be fetched 
    await cuisines() //we wait till all the cuisines are loaded in the page

    await SpecialItems();

}
main()