document.querySelector('#viewport').addEventListener('change', event => {
  document.querySelector('iframe').style.width = event.target.value;
});
