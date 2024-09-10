document.addEventListener('DOMContentLoaded', function () {

const submitForm = document.querySelector("#createUser");

function createUser() {
  const username = submitForm.username.value;
 console.log("username = " + username);
};

console.log("HERE");

submitForm.addEventListener('submit', (ev) => {
  createUser();
  ev.preventdefault();
});

});
