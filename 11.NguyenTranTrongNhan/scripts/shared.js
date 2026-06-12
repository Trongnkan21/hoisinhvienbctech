/* =====================================================
   shared.js — Visitor Counter, Scroll-to-Top, Chatbot
   ===================================================== */

/* --- JQUERY VISITOR COUNTER ------------------------
   Dùng sessionStorage d? phân bi?t "online" gi? l?p
   Trong th?c t? hãy thay b?ng API server-side
   --------------------------------------------------- */
$(function () {
  // Simulate: luu total visits vào localStorage
  var totalVisits = parseInt(localStorage.getItem('hsv_total') || '12480');
  var todayVisits = parseInt(localStorage.getItem('hsv_today') || '234');
  var onlineCount  = Math.floor(Math.random() * 18) + 8; // 8–25

  // M?i l?n load = +1 total, +1 today
  if (!sessionStorage.getItem('hsv_counted')) {
    totalVisits++;
    todayVisits++;
    sessionStorage.setItem('hsv_counted', '1');
    localStorage.setItem('hsv_total', totalVisits);
    localStorage.setItem('hsv_today', todayVisits);
  }

  // C?p nh?t DOM
  $('#counterTotal').text(totalVisits.toLocaleString('vi-VN'));
  $('#counterToday').text(todayVisits.toLocaleString('vi-VN'));
  $('#counterOnline').text(onlineCount);

  // Ð?m ngu?c gi? l?p online (dao d?ng +/-1 m?i 7s)
  setInterval(function () {
    var delta = Math.random() < .5 ? 1 : -1;
    onlineCount = Math.max(3, Math.min(40, onlineCount + delta));
    $('#counterOnline').text(onlineCount);
  }, 7000);
});

/* --- SCROLL TO TOP -------------------------------- */
$(function () {
  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 300) {
      $('#scrollTop').addClass('visible');
    } else {
      $('#scrollTop').removeClass('visible');
    }
  });
  $('#scrollTop').on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 420, 'swing');
  });
});

/* --- CHATBOT -------------------------------------- */
$(function () {
  var chatOpen = false;

  // Toggle
  $('#chatBtn').on('click', function () {
    chatOpen = !chatOpen;
    if (chatOpen) {
      $('#chatBox').addClass('open');
      scrollChat();
    } else {
      $('#chatBox').removeClass('open');
    }
  });
  $('#chatCloseBtn').on('click', function () {
    chatOpen = false;
    $('#chatBox').removeClass('open');
  });

  // Knowledge base — câu tr? l?i t? d?ng
  var kb = [
    {
      keys: ['h?c phí', 'hoc phi', 'dóng ti?n', 'ti?n h?c'],
      ans: 'H?c phí n?p theo t?ng h?c k? qua c?ng thanh toán c?a nhà tru?ng. B?n có th? xem chi ti?t t?i phòng K? ho?ch – Tài chính ho?c website chính th?c c?a tru?ng. Có câu h?i khác không b?n?'
    },
    {
      keys: ['h?c b?ng', 'hoc bong', 'scholarship'],
      ans: 'Nhà tru?ng có h?c b?ng khuy?n khích h?c t?p (di?m TB = 3.2/4, di?m rèn luy?n T?t) và h?c b?ng h? tr? h? nghèo/c?n nghèo. H? so n?p d?u m?i h?c k? t?i phòng Công tác SV.'
    },
    {
      keys: ['di?m rèn luy?n', 'ren luyen', 'di?m rl'],
      ans: 'Ði?m rèn luy?n dánh giá theo 5 tiêu chí: H?c t?p (30d), Ch?p hành n?i quy (25d), Ho?t d?ng XH (20d), Ý th?c công dân (15d), Công tác Ðoàn H?i (10d). Tra c?u t?i m?c "Ði?m rèn luy?n" trên trang này.'
    },
    {
      keys: ['th?c t?p', 'viec lam', 'vi?c làm', 'tuy?n d?ng'],
      ans: 'H?i SV có hon 45 doanh nghi?p d?i tác thu?ng xuyên tuy?n th?c t?p sinh và nhân viên chính th?c. Xem chi ti?t t?i m?c "H? tr? vi?c làm" ho?c liên h? email vieclamhsv@bctech.edu.vn.'
    },
    {
      keys: ['dang ký', 'dk môn', 'dang kí h?c ph?n'],
      ans: 'Ðang ký h?c ph?n qua c?ng dào t?o trong th?i gian m? dang ký. N?u g?p khó khan, liên h? phòng Ðào t?o ho?c h?i thêm t?i m?c "H?i và dáp" trên trang này nhé!'
    },
    {
      keys: ['liên h?', 'lien he', 'd?a ch?', 'email', 'phone', 'di?n tho?i'],
      ans: 'H?i Sinh Viên BCTech:\n?? hoisinhvien@bctech.edu.vn\n?? 0254 xxx xxxx\n?? Bà R?a Vung Tàu\nTh?i gian làm vi?c: T2–T6, 8:00–17:00.'
    },
    {
      keys: ['xin chào', 'hello', 'hi ', 'chào', 'chao'],
      ans: 'Xin chào! Mình là tr? lý H?i SV BCTech ?? B?n c?n h? tr? gì hôm nay? B?n có th? h?i v?: h?c phí, h?c b?ng, di?m rèn luy?n, vi?c làm, v.v.'
    },
    {
      keys: ['c?m on', 'thank', 'ok', 'du?c r?i'],
      ans: 'R?t vui khi du?c h? tr? b?n! ?? N?u còn câu h?i nào khác, c? nh?n cho mình nhé!'
    }
  ];

  function getReply(msg) {
    var lower = msg.toLowerCase();
    for (var i = 0; i < kb.length; i++) {
      for (var j = 0; j < kb[i].keys.length; j++) {
        if (lower.indexOf(kb[i].keys[j]) !== -1) {
          return kb[i].ans;
        }
      }
    }
    return 'C?m on b?n dã nh?n tin! Câu h?i c?a b?n s? du?c chuy?n d?n Ban h? tr?. Trong khi dó, b?n có th? th? các g?i ý bên du?i ho?c g?i email t?i hoisinhvien@bctech.edu.vn d? du?c h? tr? nhanh hon nhé!';
  }

  function now() {
    return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  function appendMsg(text, side) {
    var html = '<div class="msg ' + side + '">' +
      '<div class="msg-bubble">' + text.replace(/\n/g, '<br>') + '</div>' +
      '<div class="msg-time">' + now() + '</div>' +
    '</div>';
    $('#chatBody').append(html);
    scrollChat();
  }

  function showTyping() {
    var html = '<div class="chat-typing" id="typingIndicator">' +
      '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>' +
    '</div>';
    $('#chatBody').append(html);
    scrollChat();
  }

  function sendMsg() {
    var val = $('#chatInput').val().trim();
    if (!val) return;
    $('#chatInput').val('');
    appendMsg(val, 'user');
    showTyping();
    setTimeout(function () {
      $('#typingIndicator').remove();
      appendMsg(getReply(val), 'bot');
    }, 900 + Math.random() * 600);
  }

  $('#chatSend').on('click', sendMsg);
  $('#chatInput').on('keydown', function (e) {
    if (e.key === 'Enter') sendMsg();
  });

  // Quick reply buttons
  $(document).on('click', '.quick-btn', function () {
    $('#chatInput').val($(this).text());
    sendMsg();
  });

  function scrollChat() {
    var body = document.getElementById('chatBody');
    if (body) body.scrollTop = body.scrollHeight;
  }
});