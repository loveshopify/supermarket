// $(document).ready(function(){
//   var current_location = window.location.href;
//   if (window.location.href.indexOf("account/login") > -1) {
//       $(".logout-wrapper").css("display", "block");
//   }
//   console.log(current_location);
//   alert();
// });
$(document).ready(function(){
  
//   $("#gorgias-web-messenger-container").contents().find("#messenger-button").attr("left","20px");
//   console.log($("#gorgias-web-messenger-container").contents().find("#messenger-button"));
  
//   $('iframe').load( function() {
//      $('#gorgias-web-messenger-container').contents().find("head")
//      .append($("<style type='text/css'>  #messenger-button{left:20px} </style>"));
//   });
//   var head = jQuery("#gorgias-web-messenger-container").contents().find("head");
//   var css = '<style type="text/css">' +
//             '#messenger-button{left:20px}; ' +
//             '</style>';
//   jQuery(head).append(css);
//   console.log($('iframe').find("head"));
  $(".change-password").click(function(){
    localStorage.setItem('is_change', true);
    window.location.href = '/account/logout';
  });
  
  var template_class = $("body").attr('class');
  if(template_class == "template-index"){
    if(localStorage.getItem('is_change') == "true"){
      window.location.href = '/account';
    }
  }
  
  var template_class = $("body").attr('class');
  if (window.location.href.indexOf("account/login") > -1) {
    if(localStorage.getItem('is_change') == "true"){
      $("#forgot_password").trigger('click'); 
      localStorage.setItem('is_change', false);
    }
  }
  $("#continue-shopping").click(function(e){
    e.preventDefault();
    history.back();
  });
});