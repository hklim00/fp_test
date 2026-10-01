(function () {
  'use strict';

  var frame = document.querySelector('.native-frame');
  var time = document.querySelector('.native-time');
  var toast = document.querySelector('.native-toast');
  var toastTimer;
  var params = new URLSearchParams(window.location.search);
  var requestedPage = params.get('page');
  var allowedPage = /^[a-z0-9_-]+\.html$/i;

  if (requestedPage && allowedPage.test(requestedPage)) {
    frame.src = requestedPage;
  }

  function updateTime() {
    time.textContent = new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('show');
    }, 1800);
  }

  function runAction(action) {
    if (action === 'back') {
      try {
        frame.contentWindow.history.back();
      } catch (error) {
        showToast('이전 화면이 없습니다.');
      }
      return;
    }

    if (action === 'home') {
      frame.src = 'fp_home.html';
      return;
    }

    if (action === 'reload') {
      frame.contentWindow.location.reload();
      return;
    }

    if (action === 'close') {
      showToast('실제 앱에서는 웹뷰가 닫히는 영역입니다.');
    }
  }

  document.querySelector('.native-appbar').addEventListener('click', function (event) {
    var button = event.target.closest('[data-native-action]');
    if (button) runAction(button.dataset.nativeAction);
  });

  updateTime();
  window.setInterval(updateTime, 30000);
})();
