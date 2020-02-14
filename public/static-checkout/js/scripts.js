const checkoutButton = document.querySelector('#place-order-button');
const userButton = document.querySelector('.user-button');

userButton.addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelector('.dropdown-menu').classList.toggle('show');
});

window.onclick = function closeMenu(event) {
  if (!event.target.matches('.user-button')) {
    const dropdownMenu = document.getElementsByClassName('dropdown-menu');
    let i;
    for (i = 0; i < dropdownMenu.length; i += 1) {
      const open = dropdownMenu[i];
      if (open.classList.contains('show')) {
        open.classList.remove('show');
      }
    }
  }
};

checkoutButton.addEventListener('click', (event) => {
  event.preventDefault();
  console.log('checkout clicked');
});
